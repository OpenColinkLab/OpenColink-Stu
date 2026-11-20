/******************************************************************************
 * 任务 4：PS 通过 AXI-Lite 写入 PL 寄存器，用串口命令改变 LED 行为
 *
 * 按 OpenColink 规培教材 3.1 / 3.5 / 3.6 / 3.8 的要求组织：
 *
 *   用户在电脑串口助手输入命令
 *     -> letter-shell 3.2.4 解析命令      (src/shell/)
 *       -> LED 驱动写 AXI-Lite 寄存器     (本文件的 led 驱动层)
 *         -> PL 端 led_ctl 状态机解释控制字
 *           -> 端口 led_red -> 板载红灯 W14 呈现常亮 / 闪烁
 *
 * 硬件通路：
 *   ARM Cortex-A9 -> M_AXI_GP0 -> AXI Interconnect -> axi_gpio_0 @0x41200000
 *                 -> gpio_io_o[31:0] -> led_ctl.ctrl -> led -> led_red -> W14
 *
 * 板上有两路灯，分工不同，看灯就能判断故障在哪一层：
 *   红灯 W14  完全由 PS 经 AXI 控制，灯不动 = AXI 通路或地址有问题
 *   绿灯 W13  由 led_blink 纯 PL 逻辑自闪，不经过 CPU
 *             绿闪而红不动 -> PL 配置成功，问题在 PS 侧（ELF 没跑 / 地址错）
 *             两灯都不亮   -> 比特流没下去，或者板子没跑起来
 *
 * 串口：UART1 @0xE0001000，MIO24/25，115200 8N1
 * 注意：EBAZ4205 的 LED 是灌电流接法，led_ctl 内部已取反，C 里写 1 就是亮
 ******************************************************************************/

#include "xparameters.h"
#include "xgpio.h"
#include "xil_io.h"
#include "shell_port.h"

/* ======================= 硬件地址 ======================= */
#define GPIO_DEVICE_ID   XPAR_AXI_GPIO_0_DEVICE_ID
#define GPIO_BASE        XPAR_AXI_GPIO_0_BASEADDR
#define GPIO_CHANNEL     1              /* AXI GPIO 通道 1 */

#define REG_GPIO_DATA    0x00           /* 数据寄存器 */
#define REG_GPIO_TRI     0x04           /* 方向寄存器：0 = 输出 */

/* ======================= 控制字位域 =======================
 * 和 src/led_ctl.v 里的拆位必须完全一致，改一边就要改另一边
 *   bit[0]    EN
 *   bit[2:1]  MODE    0 常亮 / 1 闪烁（2、3 保留）
 *   bit[15:8] PERIOD  1..255
 * ========================================================= */
#define CTRL_EN          (1u << 0)
#define CTRL_MODE(m)     (((u32)(m) & 0x3u) << 1)
#define CTRL_PERIOD(ms)  (((u32)(ms) & 0xFFu) << 8)

#define MODE_ON          0
#define MODE_BLINK       1

#define PERIOD_DEF       250            /* 闪烁默认半周期 250ms -> 2Hz */

/* ======================= 全局状态 ======================= */
static XGpio Gpio;
static u32   g_ctrl = 0;                /* 影子寄存器：当前控制字 */

/* ======================= LED 驱动层 =======================
 * 这一层是 shell 和 AXI-Lite 之间的唯一接口：
 * 上层只说"我要什么行为"，这里负责把它翻译成 32 位控制字并写下去
 * ======================================================= */
static void led_commit(void)
{
    XGpio_DiscreteWrite(&Gpio, GPIO_CHANNEL, g_ctrl);
}

static u32 led_readback(void)
{
    return XGpio_DiscreteRead(&Gpio, GPIO_CHANNEL);
}

static const char *mode_name(u32 m)
{
    switch (m) {
        case MODE_ON:     return "steady";
        case MODE_BLINK:  return "blink";
        default:          return "? (reserved)";
    }
}

static void led_status(void)
{
    u32 rb  = led_readback();
    u32 p   = (g_ctrl >> 8) & 0xFFu;
    u32 eff = (p == 0) ? 1u : p;        /* led_ctl 内部把 period=0 兜成 1 */

    shellPrint(&shell, "  ctrl      : 0x%08x\r\n", (unsigned)g_ctrl);
    shellPrint(&shell, "  readback  : 0x%08x  %s\r\n",
               (unsigned)rb, (rb == g_ctrl) ? "OK (bus is alive)" : "MISMATCH");
    shellPrint(&shell, "  en        : %u\r\n", (unsigned)(g_ctrl & 1u));
    shellPrint(&shell, "  mode      : %s\r\n", mode_name((g_ctrl >> 1) & 0x3u));
    shellPrint(&shell, "  period    : %u ms%s\r\n", (unsigned)eff,
               (p == 0) ? "  (0 clamped to 1 in PL)" : "");
}

/* ======================= 小工具 ======================= */
/* 不用 atoi，自己解析，顺便支持 0x 前缀 */
static int str_to_int(const char *s, int *out)
{
    int v = 0, base = 10, neg = 0, n = 0;

    if (s == 0 || *s == 0) return -1;
    if (*s == '-') { neg = 1; s++; }
    if (s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) { base = 16; s += 2; }

    while (*s) {
        int d;
        char c = *s;

        if (c >= '0' && c <= '9')      d = c - '0';
        else if (c >= 'a' && c <= 'f') d = c - 'a' + 10;
        else if (c >= 'A' && c <= 'F') d = c - 'A' + 10;
        else return -1;

        if (d >= base) return -1;
        v = v * base + d;
        n++;
        s++;
    }

    if (n == 0) return -1;
    *out = neg ? -v : v;
    return 0;
}

static int str_eq(const char *a, const char *b)
{
    while (*a && *b) {
        if (*a != *b) return 0;
        a++; b++;
    }
    return (*a == 0) && (*b == 0);
}

/* ======================= shell 命令 ======================= */

/* ---------------- reg ---------------- */
static int cmdReg(int argc, char *argv[])
{
    u32 data, tri;

    (void)argc; (void)argv;

    data = Xil_In32(GPIO_BASE + REG_GPIO_DATA);
    tri  = Xil_In32(GPIO_BASE + REG_GPIO_TRI);

    shellPrint(&shell, "  GPIO base : 0x%08x\r\n", (unsigned)GPIO_BASE);
    shellPrint(&shell, "  DATA [%02x]: 0x%08x\r\n", REG_GPIO_DATA, (unsigned)data);
    shellPrint(&shell, "  TRI  [%02x]: 0x%08x  (0 = output)\r\n",
               REG_GPIO_TRI, (unsigned)tri);
    return 0;
}

/* ---------------- led ---------------- */
static int cmdLed(int argc, char *argv[])
{
    const char *sub;
    int val;

    if (argc < 2) {
        led_status();
        return 0;
    }

    sub = argv[1];

    if (str_eq(sub, "status")) {
        led_status();
        return 0;
    }

    if (str_eq(sub, "on")) {
        g_ctrl = CTRL_EN | CTRL_MODE(MODE_ON)
               | CTRL_PERIOD((g_ctrl >> 8) & 0xFF);
        led_commit();
        shellWriteString(&shell, "  led -> steady on\r\n");
        led_status();
        return 0;
    }

    if (str_eq(sub, "off")) {
        g_ctrl = 0;
        led_commit();
        shellWriteString(&shell, "  led -> off\r\n");
        return 0;
    }

    if (str_eq(sub, "blink")) {
        val = PERIOD_DEF;
        if (argc >= 3 && str_to_int(argv[2], &val) != 0) {
            shellWriteString(&shell, "  usage: led blink <half_period_ms 1..255>\r\n");
            return -1;
        }
        if (val < 1)   val = 1;
        if (val > 255) val = 255;

        g_ctrl = CTRL_EN | CTRL_MODE(MODE_BLINK) | CTRL_PERIOD(val);
        led_commit();

        shellPrint(&shell, "  led -> blink, half period %d ms (about %d Hz)\r\n",
                   val, 500 / val);
        return 0;
    }

    if (str_eq(sub, "raw")) {
        if (argc < 3 || str_to_int(argv[2], &val) != 0) {
            shellWriteString(&shell, "  usage: led raw 0x0000fa01\r\n");
            return -1;
        }
        g_ctrl = (u32)val;
        led_commit();
        shellPrint(&shell, "  led -> raw 0x%08x\r\n", (unsigned)g_ctrl);
        if (((g_ctrl >> 1) & 0x3u) >= 2u) {
            shellWriteString(&shell, "  note: mode 2/3 is reserved -> LED stays OFF\r\n");
        }
        led_status();
        return 0;
    }

    shellWriteString(&shell, "  unknown sub command, try: led on|off|blink|status|raw\r\n");
    return -1;
}

/* ======================= 命令导出 =======================
 * letter-shell 3.2.4 的核心机制：下面每条宏展开后是一个带
 * __attribute__((section("shellCommand"))) 属性的常量结构体，
 * 链接器把所有同名段排到一起，shellInit 拿 _shell_command_start /
 * _shell_command_end 两个符号算出命令表。
 *
 * 加命令只要在这个文件（或任何 .c）里多写一行宏，
 * 不用改数组、不用改初始化函数、不用动别人。
 *
 * 注意：_desc 会被 # 转成字符串，所以描述里不能出现逗号。
 * ======================================================= */
SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0)|SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN)|SHELL_CMD_DISABLE_RETURN,
    led, cmdLed, led on|off|blink <ms>|status|raw <hex>  -- control PL led via AXI-Lite);

SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0)|SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN)|SHELL_CMD_DISABLE_RETURN,
    reg, cmdReg, dump AXI GPIO DATA / TRI registers);

/* 默认用户。shellInit 内部会 shellSeekCommand(SHELL_DEFAULT_USER) 并把结果
 * 直接解引用，找不到就是空指针调用 —— 所以这条必须导出，密码留空。 */
SHELL_EXPORT_USER(SHELL_CMD_PERMISSION(0), letter, , default user);

/* ======================= main ======================= */
int main(void)
{
    int st;

    /* ---- 1. UART + shell 读写函数 ---- */
    shellPortInit();

    /* ---- 2. AXI GPIO（PS 访问 PL 寄存器的入口） ---- */
    st = XGpio_Initialize(&Gpio, GPIO_DEVICE_ID);
    if (st == XST_SUCCESS) {
        XGpio_SetDataDirection(&Gpio, GPIO_CHANNEL, 0x0);   /* 32 位全部当输出 */
    }

    /* ---- 3. 上电默认：灯灭，控制字清零 ---- */
    g_ctrl = 0;
    if (st == XST_SUCCESS) {
        led_commit();
    }

    /* ---- 4. 横幅，然后 shell 启动（shellInit 会打提示符） ---- */
    shellWriteString(&shell, "\r\n");
    shellWriteString(&shell, "==================================================\r\n");
    shellWriteString(&shell, " Task 4 : PS -> AXI-Lite -> PL ctrl reg -> LED\r\n");
    shellWriteString(&shell, " Board  : EBAZ4205 / XC7Z010\r\n");
    shellPrint(&shell, " GPIO   : 0x%08x   UART: 0xE0001000  115200 8N1\r\n",
               (unsigned)GPIO_BASE);
    shellWriteString(&shell, " Shell  : letter-shell " SHELL_VERSION "\r\n");
    shellWriteString(&shell, "==================================================\r\n");

    shellInit(&shell, shellBuffer, SHELL_BUFFER_SIZE);

    if (st != XST_SUCCESS) {
        shellPrint(&shell, "[ERR] XGpio_Initialize failed, st=%d\r\n", st);
        shellWriteString(&shell, "      check XPAR_AXI_GPIO_0_* in xparameters.h\r\n");
    } else {
        led_status();
    }

    /* ---- 5. 主循环：shellTask 内部调 shell->read 取字符 ---- */
    for (;;) {
        shellTask(&shell);
    }

    return XST_SUCCESS;
}
