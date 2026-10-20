/**
 * @file  led.h
 * @brief LED control through the AXI GPIO register.
 * @note  The AXI GPIO base address comes from the BSP (xparameters.h), the
 *        GPIO is configured as a 4-bit all-output port inside the block design.
 */
#ifndef __LED_H__
#define __LED_H__

#include "xparameters.h"
#include "xil_types.h"

#define LED_CTRL_REG    (*(volatile u32 *)(XPAR_AXI_GPIO_0_BASEADDR))

#define LED_MODE_MIN    0
#define LED_MODE_MAX    5

/**
 * @brief  Set the LED action
 * @param  f_mode  0 = off, 1 = blink 1 s, 2 = blink 2 s,
 *                 3/4/5 = PWM brightness level 1/2/3
 * @return 0 on success, -1 when the mode is out of range
 */
int Led_SetMode(int f_mode);

/**
 * @brief  Read back the last mode written by Led_SetMode
 * @return the current mode (0 - 5)
 */
int Led_GetMode(void);

#endif /* __LED_H__ */
