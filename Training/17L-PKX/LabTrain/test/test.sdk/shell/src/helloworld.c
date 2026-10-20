/******************************************************************************
*
* Copyright (C) 2009 - 2014 Xilinx, Inc.  All rights reserved.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* Use of the Software is limited solely to applications:
* (a) running on a Xilinx device, or
* (b) that interact with a Xilinx device through a bus or interconnect.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
* XILINX  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF
* OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
* Except as contained in this notice, the name of the Xilinx shall not be used
* in advertising or otherwise to promote the sale, use or other dealings in
* this Software without prior written authorization from Xilinx.
*
******************************************************************************/

/*
 * helloworld.c: simple test application
 *
 * This application configures UART 16550 to baud rate 9600.
 * PS7 UART (Zynq) is not initialized by this application, since
 * bootrom/bsp configures it to baud rate 115200
 *
 * ------------------------------------------------
 * | UART TYPE   BAUD RATE                        |
 * ------------------------------------------------
 *   uartns550   9600
 *   uartlite    Configurable only in HW design
 *   ps7_uart    115200 (configured by bootrom/bsp)
 */

#include <stdio.h>
#include "platform.h"
#include "xil_printf.h"
#include "xparameters.h"
#include "xuartps.h"
#include "xil_printf.h"
#include "xtime_l.h"

#include "shell.h"

#define LED_REG   (*(volatile u32 *)(XPAR_AXI_GPIO_0_BASEADDR))   /* 0x41200000 */

static XUartPs s_uart;

static signed short shellRead(char *data, unsigned short len)
{
    (void)len;                                  /* 每次只取 1 个字节 */
    if (XUartPs_IsReceiveData(s_uart.Config.BaseAddress)) {
        data[0] = (char)XUartPs_ReadReg(s_uart.Config.BaseAddress,
                                       XUARTPS_FIFO_OFFSET);
        return 1;
    }
    return 0;                                   /* 暂时没数据 */
}

static signed short shellWrite(char *data, unsigned short len)
{
    unsigned short i;
    for (i = 0; i < len; i++) {
        while (XUartPs_IsTransmitFull(s_uart.Config.BaseAddress)) {
            /* 等发送 FIFO 有空位 */
        }
        XUartPs_WriteReg(s_uart.Config.BaseAddress,
                         XUARTPS_FIFO_OFFSET, data[i]);
    }
    return (signed short)len;
}

int shellGetTick(void)
{
    XTime t;
    XTime_GetTime(&t);
    return (int)(t / (COUNTS_PER_SECOND / 1000));
}

static int funcLed(int argc, char *argv[])
{
    int mode;

    if (argc != 2 || sscanf(argv[1], "%d", &mode) != 1 || mode < 0 || mode > 5) {
        shellPrint(shellGetCurrent(), "usage: led <0-5>\r\n");
        shellPrint(shellGetCurrent(), "  0=off 1=blink1s 2=blink2s 3/4/5=dim1/2/3\r\n");
        return -1;
    }

    LED_REG = (u32)mode;                        /* 写 AXI GPIO → PL 的 led_ctl */
    shellPrint(shellGetCurrent(), "led mode = %d\r\n", mode);
    return 0;
}

SHELL_EXPORT_CMD(
    SHELL_CMD_PERMISSION(0) | SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN) | SHELL_CMD_DISABLE_RETURN,
    led, funcLed, set led mode 0-5);

Shell       shell;
static char shellBuffer[512];

int main()
{
    init_platform();
    XUartPs_Config *cfg;
    cfg = XUartPs_LookupConfig(XPAR_XUARTPS_0_DEVICE_ID);
        if (cfg == NULL) {
            return -1;
        }
        XUartPs_CfgInitialize(&s_uart, cfg, cfg->BaseAddress);
        XUartPs_SetBaudRate(&s_uart, 115200);

     shell.read  = shellRead;
     shell.write = shellWrite;
     shellInit(&shell, shellBuffer, sizeof(shellBuffer));

            shellWriteString(&shell, "\r\nletter shell 3.2.4 ready\r\n");

     while (1) {
    	 	 	 shellTask(&shell);                      /* SHELL_TASK_WHILE=0，跑一遍就返回 */
      }


    return 0;
}
