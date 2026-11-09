//------------------------------------------------------------------
// Organization : XDU
// Engineer     : 
// E-mail       : 
// Cnblogs      : 
//------------------------------------------------------------------
// Create Date  : 2026-11-06 22:30:00
// File Name    : main.c
// Module Name  : led_shell
// Target Devices: XC7Z010
// Tool Versions: Vivado 2018.3 + SDK
//------------------------------------------------------------------
// Versions | Modify
//------------------------------------------------------------------
// v-alpha  | 26-11-06  初版：1s 交替控制 PL 红灯
// v-alpha  | 26-11-07  接入 letter-shell，改为 shell 主循环
// v-alpha  | 26-11-08  增加初始化阶段打印，便于定位卡点
// v-alpha  | 26-11-09  功能验证通过，移除诊断打印，保留干净输出
//------------------------------------------------------------------
// Description:
//   led_shell 入口。初始化 LED 驱动与 letter-shell，随后进入 shell 轮询
//   循环；命令通过 UART1 交互。
//------------------------------------------------------------------

//------------------ Include ------------------//
#include "xil_types.h"
#include "xil_io.h"
#include "shell.h"
#include "shell_port.h"
#include "led_drv.h"

#ifdef __cplusplus
extern "C" {
#endif

//------------------ External function body ----//

/**
 * @brief   程序入口
 * @return  正常不返回（shell 死循环）；初始化失败返回 -1
 * @note    Run Configurations 中需勾选 Program FPGA 与 Reset entire system
 */
int main(void)
{
    /* 函数内逻辑 */
    led_drv_init();

    if (shell_port_init() != 0) {
        return -1;
    }

    for (;;) {
        shellTask(shell_port_get_instance());
    }

    /* 返回与错误处理 */
    return 0;
}

#ifdef __cplusplus
}
#endif
