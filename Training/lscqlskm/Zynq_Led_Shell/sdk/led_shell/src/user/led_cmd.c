//------------------------------------------------------------------
// Organization : XDU
// Engineer     : 
// E-mail       : 
// Cnblogs      : 
//------------------------------------------------------------------
// Create Date  : 2026-11-07 22:00:00
// File Name    : led_cmd.c
// Module Name  : led_shell
// Target Devices: XC7Z010
// Tool Versions: Vivado 2018.3 + SDK
//------------------------------------------------------------------
// Versions | Modify
//------------------------------------------------------------------
// v-alpha  | 26-11-07  初版：led on / led off 命令
//------------------------------------------------------------------
// Description:
//   letter-shell 命令层。把 led_drv_set() 包装成 shell 命令，
//   通过 SHELL_EXPORT_CMD 导出到 shellCommand 段。
//------------------------------------------------------------------

//------------------ Include ------------------//
#include "xil_types.h"
#include "shell.h"
#include "led_drv.h"

#ifdef __cplusplus
extern "C" {
#endif

//------------------ External function body ----//
/**
 * @brief   led 命令：控制板载红灯
 * @param   f_argc 参数个数（含命令名）
 * @param   f_argv 参数数组
 * @return  0 成功，-1 参数错误
 * @note    用法：led on / led off
 */
int led_cmd(int f_argc, char *f_argv[])
{
    /* 变量定义 */
    int tp_ret = 0;

    /* 函数内逻辑 */
    if (f_argc != 2) {
        shellPrint(shellGetCurrent(), "usage: led on|off\r\n");
        tp_ret = -1;
    }
    else if ((f_argv[1][0] == 'o') && (f_argv[1][1] == 'n')) {
        led_drv_set(LED_DRV_STATE_ON);
        shellPrint(shellGetCurrent(), "LED ON\r\n");
        tp_ret = 0;
    }
    else if ((f_argv[1][0] == 'o') && (f_argv[1][1] == 'f')) {
        led_drv_set(LED_DRV_STATE_OFF);
        shellPrint(shellGetCurrent(), "LED OFF\r\n");
        tp_ret = 0;
    }
    else {
        shellPrint(shellGetCurrent(), "unknown param: %s\r\n", f_argv[1]);
        tp_ret = -1;
    }

    /* 返回与错误处理 */
    return tp_ret;
}

SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0) | SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN),
    led,
    led_cmd,
    LED control (usage: led on|off)
);

#ifdef __cplusplus
}
#endif
