//------------------------------------------------------------------
// Organization : XDU
// Engineer     : 
// E-mail       : 
// Cnblogs      : 
//------------------------------------------------------------------
// Create Date  : 2026-11-06 22:30:00
// File Name    : led_drv.h
// Module Name  : led_shell
// Target Devices: XC7Z010
// Tool Versions: Vivado 2018.3 + SDK
//------------------------------------------------------------------
// Versions | Modify
//------------------------------------------------------------------
// v-alpha  | 26-11-06  初版：AXI GPIO 红灯驱动
// v-alpha  | 26-11-07  规范修订：补 doxygen 注释与修订记录
//------------------------------------------------------------------
// Description:
//   AXI GPIO 红灯驱动接口。基地址来自 xparameters.h，寄存器偏移按
//   AXI GPIO 固定布局定义，供 shell 命令层直接调用。
//------------------------------------------------------------------
#ifndef LED_DRV_H_PROJECT
#define LED_DRV_H_PROJECT

//------------------ Include ------------------//
#include "xparameters.h"
#include "xil_types.h"

#ifdef __cplusplus
extern "C" {
#endif

//------------------ Reg Define ---------------//

/** AXI GPIO 基地址，由 BD 的 Address Editor 自动生成 */
#define LED_DRV_GPIO_BASEADDR      (XPAR_AXI_GPIO_0_BASEADDR)

/** GPIO_DATA 寄存器偏移 */
#define LED_DRV_REG_DATA_OFFSET    (0x00U)

/** GPIO_TRI 寄存器偏移 */
#define LED_DRV_REG_TRI_OFFSET     (0x04U)

/** 目标状态：灭 */
#define LED_DRV_STATE_OFF          (0U)

/** 目标状态：亮 */
#define LED_DRV_STATE_ON           (1U)


//------------------ Enum/Union/Struct --------//

//------------------ Referential function definition ----//
/**
 * @brief   LED 驱动初始化，默认进入灭状态
 * @return  None
 * @note    需在 AXI GPIO 所在 BD 完成比特流下载后调用
 */
void led_drv_init(void);

/**
 * @brief   设置红灯状态
 * @param   f_value
 *          有效参数：
 *          - \b LED_DRV_STATE_OFF    灭
 *          - \b LED_DRV_STATE_ON     亮
 * @return  None
 * @note    写 GPIO_DATA 低 1 位，方向寄存器在 PL 侧已固化为输出
 */
void led_drv_set(u8 f_value);

#ifdef __cplusplus
}
#endif

#endif /* LED_DRV_H_PROJECT */
