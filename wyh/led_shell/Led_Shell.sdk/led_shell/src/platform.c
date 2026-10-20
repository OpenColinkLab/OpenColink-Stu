/**
 * @file  platform.c
 * @brief Board bring-up hooks.
 * @note  On Zynq the DDR and the PS clocks are configured by ps7_init (called
 *        by the debugger before the application is downloaded), the BSP does
 *        the UART setup, so nothing else has to be done here.
 */
#include "platform.h"

void init_platform(void)
{
    /* nothing to do on Zynq for this project */
}

void cleanup_platform(void)
{
    /* nothing to do on Zynq for this project */
}
