/* cmd.c - 自定义命令：led / status / hello / demo
 * 切词、参数个数、历史、补全由 letter-shell 负责，这里只写命令体。 */
#include "cmd.h"
#include "shell.h"
#include "shell_port.h"
#include "led.h"
#include "helloworld.h"
#include "uart.h"
#include "xil_types.h"

/* demo 每个动作的持续时间，任务书要求 10 s */
#define CMD_DEMO_STEP_MS    10000

/* demo 的动作顺序：1s 闪 -> 2s 闪 -> 明亮 -> 中亮 -> 暗 -> 关灯 */
static const int fg_demoMode[6] = { 1, 2, 5, 4, 3, 0 };

static const char *fg_demoName[6] = {
    "blink 1 s",
    "blink 2 s",
    "PWM brightness 3/3 (bright)",
    "PWM brightness 2/3 (mid)",
    "PWM brightness 1/3 (dim)",
    "off"
};

/* 只接受纯十进制，避免 atoi 把 "abc" 当成 0 */
static int Cmd_StrToInt(const char *f_str, int *f_out)
{
    const char *tp_ptr = f_str;
    int tp_value = 0;

    if ((tp_ptr == 0) || (*tp_ptr == '\0')) {
        return -1;
    }
    while (*tp_ptr != '\0') {
        if ((*tp_ptr < '0') || (*tp_ptr > '9')) {
            return -1;
        }
        tp_value = tp_value * 10 + (int)(*tp_ptr - '0');
        tp_ptr++;
    }
    *f_out = tp_value;
    return 0;
}

static void Cmd_LedUsage(void)
{
    shellPrint(shellGetCurrent(),
               "usage: led <0-5>\r\n"
               "  0 = off\r\n"
               "  1 = blink 1 s period\r\n"
               "  2 = blink 2 s period\r\n"
               "  3 = PWM 1/3  brightness\r\n"
               "  4 = PWM 2/3  brightness\r\n"
               "  5 = PWM 3/3  brightness\r\n");
}

int Cmd_Led(int f_argc, char *f_argv[])
{
    int tp_mode = 0;

    if (f_argc != 2) {
        Cmd_LedUsage();
        return -1;
    }
    if (Cmd_StrToInt(f_argv[1], &tp_mode) != 0) {
        shellPrint(shellGetCurrent(), "led: '%s' is not a decimal number\r\n", f_argv[1]);
        return -1;
    }

    if (Led_SetMode(tp_mode) != 0) {
        shellPrint(shellGetCurrent(), "led: mode %d is out of range\r\n", tp_mode);
        return -1;
    }
    shellPrint(shellGetCurrent(), "led mode = %d\r\n", Led_GetMode());
    return 0;
}

int Cmd_Status(int f_argc, char *f_argv[])
{
    (void)f_argc;
    (void)f_argv;

    shellPrint(shellGetCurrent(), "mode      : %d\r\n", Led_GetMode());
    shellPrint(shellGetCurrent(), "ctrl reg  : 0x%08x (AXI GPIO read back)\r\n",
               (unsigned int)LED_CTRL_REG);
    shellPrint(shellGetCurrent(), "uart      : PS UART1, 115200 8N1\r\n");
    shellPrint(shellGetCurrent(), "pl clock  : 50 MHz (FCLK_CLK0)\r\n");
    return 0;
}

int Cmd_Hello(int f_argc, char *f_argv[])
{
    (void)f_argc;
    (void)f_argv;

    Hello_World_Print();
    return 0;
}

int Cmd_Demo(int f_argc, char *f_argv[])
{
    int tp_ix;
    int tp_ret = 0;

    (void)f_argc;
    (void)f_argv;

    shellPrint(shellGetCurrent(), "demo: 6 steps x %d s, press 'q' to stop\r\n",
               CMD_DEMO_STEP_MS / 1000);

    for (tp_ix = 0; tp_ix < 6; tp_ix++) {
        (void)Led_SetMode(fg_demoMode[tp_ix]);
        shellPrint(shellGetCurrent(), "  [%d/6] %-28s %2d s\r\n",
                   tp_ix + 1, fg_demoName[tp_ix], CMD_DEMO_STEP_MS / 1000);

        if (Shell_PortDelayMs(CMD_DEMO_STEP_MS) != 0) {
            shellPrint(shellGetCurrent(), "demo: stopped by user\r\n");
            tp_ret = -1;
            break;
        }
    }

    shellPrint(shellGetCurrent(), "demo: done, LED off\r\n");
    (void)Led_SetMode(0);
    return tp_ret;
}

/* 命令注册：属性、命令名、函数、help 说明（说明里不能有逗号） */
SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0)|SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN)|SHELL_CMD_DISABLE_RETURN,
    led, Cmd_Led, set LED action: 0=off 1/2=blink 1s/2s 3/4/5=PWM);

SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0)|SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN)|SHELL_CMD_DISABLE_RETURN,
    status, Cmd_Status, show current LED mode and AXI GPIO value);

SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0)|SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN)|SHELL_CMD_DISABLE_RETURN,
    hello, Cmd_Hello, print Hello World (prerequisite task));

SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0)|SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN)|SHELL_CMD_DISABLE_RETURN,
    demo, Cmd_Demo, auto demo: 6 modes 10 s each);
