#include "led.h"

static int ledMode = 0;

int Led_SetMode(int mode)
{
    if ((mode < LED_MODE_MIN) || (mode > LED_MODE_MAX)) 
	{
        return -1;
    }
    ledMode = mode;
    LED_CTRL_REG = (u32)mode;     
    return 0;
}


int Led_GetMode(void)
{
    return ledMode;
}
