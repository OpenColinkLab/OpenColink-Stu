#ifndef __LED_H__
#define __LED_H__

#include "xparameters.h"
#include "xil_types.h"

#define LED_CTRL_REG    (*(volatile u32 *)(XPAR_AXI_GPIO_0_BASEADDR))

#define LED_MODE_MIN    0
#define LED_MODE_MAX    5



int Led_SetMode(int f_mode);
int Led_GetMode(void);

#endif
