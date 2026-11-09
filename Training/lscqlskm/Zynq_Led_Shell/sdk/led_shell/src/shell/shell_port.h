//------------------------------------------------------------------
// Organization : XDU
// Engineer     : 
// E-mail       : 
// Cnblogs      : 
//------------------------------------------------------------------
// Create Date  : 2026-11-07 22:00:00
// File Name    : shell_port.h
// Module Name  : led_shell
// Target Devices: XC7Z010
// Tool Versions: Vivado 2018.3 + SDK
//------------------------------------------------------------------
// Versions | Modify
//------------------------------------------------------------------
// v-alpha  | 26-11-07  初版：letter-shell 3.2.4 在 Zynq 裸机上的适配接口
// v-alpha  | 26-11-08  增加实例获取与 tick 接口，初始化返回 int
//------------------------------------------------------------------
// Description:
//   letter-shell 移植层接口。提供 UART1 读写回调、shell 初始化与实例获取，
//   裸机模式下由 main() 轮询 shellTask()。
//------------------------------------------------------------------
#ifndef SHELL_PORT_H_PROJECT
#define SHELL_PORT_H_PROJECT

//------------------ Include ------------------//
#include "shell.h"

#ifdef __cplusplus
extern "C" {
#endif

//------------------ Global Define ------------//

/** shell 命令缓冲区大小 */
#define SHELL_PORT_BUFFER_SIZE      (512U)

//------------------ Referential function definition ----//

/**
 * @brief   shell 适配层初始化：绑定串口回调并初始化 shell 引擎
 * @return  0 成功，-1 失败
 * @note    不重复初始化 UART，ps7_init 已完成串口配置
 */
int shell_port_init(void);

/**
 * @brief   获取 shell 实例，供 main() 的 shellTask 轮询使用
 * @return  Shell 指针
 * @note    替代直接访问全局实例，便于后续替换为多 shell
 */
Shell *shell_port_get_instance(void);

/**
 * @brief   毫秒级 tick（Cortex-A9 全局定时器）
 * @return  毫秒计数
 * @note    绑定 SHELL_GET_TICK() 使用
 */
int shell_get_tick_ms(void);

#ifdef __cplusplus
}
#endif

#endif /* SHELL_PORT_H_PROJECT */
