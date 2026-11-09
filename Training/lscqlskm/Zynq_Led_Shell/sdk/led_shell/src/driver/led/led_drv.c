//------------------------------------------------------------------
// Organization : XDU
// Engineer     : 
// E-mail       : 
// Cnblogs      : 
//------------------------------------------------------------------
// Create Date  : 2026-11-06 22:30:00
// File Name    : led_drv.c
// Module Name  : led_shell
// Target Devices: XC7Z010
// Tool Versions: Vivado 2018.3 + SDK
//------------------------------------------------------------------
// Versions | Modify
//------------------------------------------------------------------
// v-alpha  | 26-11-06  初版：通过 AXI GPIO 写 PL 控制寄存器
// v-alpha  | 26-11-07  规范修订：本地日志开关默认关闭
// v-alpha  | 26-11-09  功能验证通过，移除回读诊断打印
//------------------------------------------------------------------
// Description:
//   通过 AXI GPIO 写 PL 端控制寄存器控制红灯。所有寄存器访问集中在本
//   文件，shell 命令层只调用 led_drv_set()，便于后续替换实现。
//------------------------------------------------------------------

//------------------ Include ------------------//
#include "xil_io.h"
#include "led_drv.h"

#ifdef __cplusplus
extern "C" {
#endif

//------------------ Private Define -----------//

/** 本地日志开关，仅在本文件生效；0 关闭，1 需 BSP 已链接 print 库 */
#define LED_DRV_LOCAL_LOG_EN       (0U)

#if (LED_DRV_LOCAL_LOG_EN == 1U)
  #include "xil_printf.h"
  #define LED_DRV_PRINTF(...)      xil_printf(__VA_ARGS__)
#else
  #define LED_DRV_PRINTF(...)
#endif

//------------------ Static function declaration -----------//

//------------------ Static function body -----//

/**
 * @brief   LED 驱动初始化，默认进入灭状态
 * @return  None
 * @note    上电默认灭，与 BD 复位后 PL 默认 ctrl=0 的行为一致
 */
void led_drv_init(void)
{
    led_drv_set(LED_DRV_STATE_OFF);   /* 上电默认灭 */
}

/**
 * @brief   设置红灯状态
 * @param   f_value
 *          有效参数：
 *          - \b LED_DRV_STATE_OFF    灭
 *          - \b LED_DRV_STATE_ON     亮
 * @return  None
 * @note    只写 GPIO_DATA 低 1 位，方向寄存器在 PL 侧已是输出
 */
void led_drv_set(u8 f_value)
{
    /* 变量定义 */
    u32 tp_value = 0U;

    /* 函数内逻辑 */
    tp_value = (f_value == LED_DRV_STATE_ON) ? 1U : 0U;
    Xil_Out32(LED_DRV_GPIO_BASEADDR + LED_DRV_REG_DATA_OFFSET, tp_value);

    /* 返回与错误处理 */
    LED_DRV_PRINTF("[drv] set = %u\r\n", (unsigned int)tp_value);
    return;
}

//------------------ 本地 undef ---------------//
#undef LED_DRV_PRINTF

#ifdef __cplusplus
}
#endif
