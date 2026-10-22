/**
 * @file  led.c
 * @brief LED control through the AXI GPIO register.
 */
#include "led.h"

/* last mode, used by the status command */
static int fg_ledMode = 0;

/**
 * @brief  Set the LED action
 * @param  f_mode  0 = off, 1 = blink 1 s, 2 = blink 2 s,
 *                 3/4/5 = PWM brightness level 1/2/3
 * @return 0 on success, -1 when the mode is out of range
 */
int Led_SetMode(int f_mode)
{
    if ((f_mode < LED_MODE_MIN) || (f_mode > LED_MODE_MAX)) {
        return -1;
    }
    fg_ledMode = f_mode;
    LED_CTRL_REG = (u32)f_mode;     /* write the AXI GPIO output register */
    return 0;
}

/**
 * @brief  Read back the last mode written by Led_SetMode
 * @return the current mode (0 - 5)
 */
int Led_GetMode(void)
{
    return fg_ledMode;
}
