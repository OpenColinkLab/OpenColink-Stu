/******************************************************************************
 * uart_led —— 用 UART 命令控制 PL 侧 led_ctl
 *
 *   硬件：PS7 + AXI GPIO(0x41200000) + led_ctl(ctrl[31:0] -> led[1:0])
 *   UART：MIO24/25，BSP 里只有一个 uartps 实例，规范名 XPAR_XUARTPS_0_DEVICE_ID
 *         （它等于 XPAR_PS7_UART_1_DEVICE_ID）
 *
 *   ctrl[31]    : 1 = 使能
 *   ctrl[30:28] : 模式 0=轮流 1=反向轮流 2=交替闪 3=单灯
 *   ctrl[27:0]  : 分频，1Hz 用 50000000
 *
 *   命令：
 *     led <0-3>   设置模式
 *     led off     全灭
 ******************************************************************************/
#include <stdio.h>
#include <string.h>

#include "platform.h"
#include "xparameters.h"
#include "xil_printf.h"
#include "xil_types.h"
#include "xuartps.h"
#include "shell.h"

/* ============ 地址与常量 ============ */
#define LED_REG            (*(volatile u32 *)(XPAR_AXI_GPIO_0_BASEADDR))
#define SHELL_BUFFER_SIZE  512
#define LED_DIV_1HZ        50000000u        /* 100MHz / 2 / 1Hz */

/* ============ 全局变量（回调要用，必须是文件作用域） ============ */
static XUartPs s_uart;
Shell          shell;
static char    shellBuffer[SHELL_BUFFER_SIZE];

/* ============ UART -> shell 的读回调 ============ */
static signed short shellRead(char *data, unsigned short len)
{
    (void)len;                              /* shell 每次只取 1 字节 */
    if (XUartPs_IsReceiveData(s_uart.Config.BaseAddress)) {
        data[0] = (char)XUartPs_ReadReg(s_uart.Config.BaseAddress,
                                        XUARTPS_FIFO_OFFSET);
        return 1;                           /* 读到 1 个字节 */
    }
    return 0;                               /* 暂时没有数据 */
}

/* ============ shell -> UART 的写回调 ============ */
static signed short shellWrite(char *data, unsigned short len)
{
    unsigned short i;
    for (i = 0; i < len; i++) {
        while (XUartPs_IsTransmitFull(s_uart.Config.BaseAddress)) {
            /* 等发送 FIFO 有空位，否则会丢字符 */
        }
        XUartPs_WriteReg(s_uart.Config.BaseAddress,
                         XUARTPS_FIFO_OFFSET, data[i]);
    }
    return (signed short)len;
}

/* ============ 命令：led ============ */
static int funcLed(int argc, char *argv[])
{
    int mode;
    u32 ctrl;

    if (argc == 2 && strcmp(argv[1], "off") == 0) {
        LED_REG = 0;                        /* bit31=0 -> 全灭 */
        shellPrint(shellGetCurrent(), "led off\r\n");
        return 0;
    }

    if (argc != 2 || sscanf(argv[1], "%d", &mode) != 1 || mode < 0 || mode > 3) {
        shellPrint(shellGetCurrent(), "usage: led <0-3> | led off\r\n");
        shellPrint(shellGetCurrent(), "  0=轮流 1=反向 2=交替闪 3=单灯\r\n");
        return -1;
    }

    /* 三个字段拼成一个控制字，一次性写入 */
    ctrl = (1u << 31)                             /* bit31    使能 */
         | (((u32)mode & 0x7u) << 28)             /* [30:28]  模式 */
         | (LED_DIV_1HZ & 0x0FFFFFFFu);           /* [27:0]   分频 */

    LED_REG = ctrl;
    shellPrint(shellGetCurrent(), "led mode=%d ctrl=0x%x\r\n", mode, ctrl);
    return 0;
}

/* ============ 命令注册（必须在函数外） ============ */
SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0) | SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN) | SHELL_CMD_DISABLE_RETURN,
    led, funcLed, set led mode 0-3 or off);

/* ============ main ============ */
int main(void)
{
    XUartPs_Config *cfg;

    init_platform();

    /* ---- UART 初始化 ---- */
    cfg = XUartPs_LookupConfig(XPAR_XUARTPS_0_DEVICE_ID);
    if (cfg == NULL) {
        return -1;
    }
    XUartPs_CfgInitialize(&s_uart, cfg, cfg->BaseAddress);
    XUartPs_SetBaudRate(&s_uart, 115200);

    /* ---- shell 初始化 ---- */
    shell.read  = shellRead;
    shell.write = shellWrite;
    shellInit(&shell, shellBuffer, sizeof(shellBuffer));

    /* ---- 开机先灭，避免上电状态不确定 ---- */
    LED_REG = 0;

    shellWriteString(&shell, "\r\nletter shell 3.2.4 ready\r\n");
    shellWriteString(&shell, "type 'help' to list commands\r\n");

    /* SHELL_TASK_WHILE = 1，shellTask 内部自带死循环，不会返回 */
    while (1) {
        shellTask(&shell);
    }

    return 0;
}
