//------------------------------------------------------------------
// Organization : XDU
// Engineer     : 
// E-mail       : 
// Cnblogs      : 
//------------------------------------------------------------------
// Create Date  : 2026-11-07 22:00:00
// File Name    : shell_port.c
// Module Name  : led_shell
// Target Devices: XC7Z010
// Tool Versions: Vivado 2018.3 + SDK
//------------------------------------------------------------------
// Versions | Modify
//------------------------------------------------------------------
// v-alpha  | 26-11-07  初版：UART1 读写回调 + 裸机 shell 循环
// v-alpha  | 26-11-08  改用 XUartPs 驱动（BSP），避免裸寄存器 SR 状态异常
// v-alpha  | 26-11-09  功能验证通过，移除诊断打印，保留干净输出
//------------------------------------------------------------------
// Description:
//   letter-shell 移植层实现。使用 BSP 的 XUartPs 驱动收发数据：
//   write 调用 XUartPs_Send（内部处理 FIFO，不依赖 TXEMPTY 位），
//   read 调用 XUartPs_Recv（非阻塞轮询）。
//   注意：Zynq 上 UART1 被 BSP 注册为 XUARTPS_0（唯一实例）。
//------------------------------------------------------------------

//------------------ Include ------------------//
#include "xparameters.h"
#include "xil_types.h"
#include "xuartps.h"
#include "xtime_l.h"
#include "shell_port.h"

#ifdef __cplusplus
extern "C" {
#endif

//------------------ Static variable ----------//
/** shell 对象 */
Shell g_shell;
/** shell 输入缓冲区 */
static char fg_shellBuffer_r32[SHELL_PORT_BUFFER_SIZE];
/** UART1 驱动实例 */
static XUartPs fg_uart_r32;

//------------------ Static function body -----//

/**
 * @brief   shell 写回调：阻塞写 UART1
 * @param   f_data 数据指针
 * @param   f_len  数据长度
 * @return  实际写入长度
 * @note    XUartPs_Send 内部处理 FIFO，不依赖 TXEMPTY 位
 */
signed short shell_port_write(char *f_data, unsigned short f_len)
{
    /* 函数内逻辑 */
    XUartPs_Send(&fg_uart_r32, (u8 *)f_data, (u32)f_len);

    /* 返回 */
    return (signed short)f_len;
}

/**
 * @brief   shell 读回调：非阻塞轮询 UART1
 * @param   f_data 数据指针
 * @param   f_len  期望读取长度
 * @return  实际读取的字节数；0 表示当前无数据
 */
signed short shell_port_read(char *f_data, unsigned short f_len)
{
    /* 函数内逻辑 */
    return (signed short)XUartPs_Recv(&fg_uart_r32, (u8 *)f_data, (u32)f_len);
}

//------------------ External function body ----//

/**
 * @brief   shell 适配层初始化
 * @return  0 成功，-1 失败
 */
int shell_port_init(void)
{
    /* 变量定义 */
    XUartPs_Config *tp_cfg = NULL;

    /* 函数内逻辑 */
    tp_cfg = XUartPs_LookupConfig(XPAR_XUARTPS_0_DEVICE_ID);
    if (tp_cfg == NULL) {
        return -1;
    }
    (void)XUartPs_CfgInitialize(&fg_uart_r32, tp_cfg, tp_cfg->BaseAddress);
    (void)XUartPs_SetBaudRate(&fg_uart_r32, 115200U);
    XUartPs_SetOperMode(&fg_uart_r32, XUARTPS_OPER_MODE_NORMAL);

    g_shell.write  = shell_port_write;
    g_shell.read   = shell_port_read;

    shellInit(&g_shell, fg_shellBuffer_r32, SHELL_PORT_BUFFER_SIZE);

    /* 返回 */
    return 0;
}

/**
 * @brief   获取 shell 实例
 */
Shell *shell_port_get_instance(void)
{
    return &g_shell;
}

/**
 * @brief   毫秒级 tick（Cortex-A9 全局定时器）
 */
int shell_get_tick_ms(void)
{
    /* 变量定义 */
    XTime tp_now = 0U;

    /* 函数内逻辑 */
    XTime_GetTime(&tp_now);

    /* 返回 */
    return (int)(tp_now / (COUNTS_PER_SECOND / 1000U));
}

/**
 * @brief   shell 主循环（备用）
 */
void shell_task_loop(void)
{
    /* 函数内逻辑 */
    for (;;) {
        shellTask(&g_shell);
    }
}

#ifdef __cplusplus
}
#endif
