/* 通过 AXI GPIO 寄存器控制 LED */
#include "led.h"

/* 最近一次设置的模式，给 status命令读 */
static int fg_ledMode = 0;

int Led_SetMode(int f_mode)
{
    if ((f_mode < LED_MODE_MIN) || (f_mode > LED_MODE_MAX)) {
        return -1;
    }
    fg_ledMode = f_mode;
    LED_CTRL_REG = (u32)f_mode;
    return 0;
}

int Led_GetMode(void)
{
    return fg_ledMode;
}
