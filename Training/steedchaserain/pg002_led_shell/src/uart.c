#include "xil_types.h"
#include "xuartps.h"
#include "uart.h"

static XUartPs fg_uart;

int Uart_Init(void)
{
    XUartPs_Config *cfg;

    cfg = XUartPs_LookupConfig(UART_DEVICE_ID);
    if (cfg == 0) 
	{
        return -1;
    }

    if (XUartPs_CfgInitialize(&fg_uart,cfg,cfg->BaseAddress) != XST_SUCCESS)
    {
        return -1;
    }

    XUartPs_SetBaudRate(&fg_uart, UART_BAUDRATE);
    return 0;
}


void Uart_PutChar(char ch)
{
    /* 等 TX FIFO 不满 */
    while(XUartPs_IsTransmitFull(fg_uart.Config.BaseAddress))
    {
    	
	}
    /*  FIFO */
    XUartPs_WriteReg(fg_uart.Config.BaseAddress, XUARTPS_FIFO_OFFSET, (u8)ch);
}


void Uart_PutString(const char *str)
{
    /* 循环到 '\0'，逐个 Uart_PutChar */
    while (*str!='\0')
    {
    	Uart_PutChar(*str);
    	str++;
	}
}


int Uart_GetChar(void)
{
    /* 有数据：读 FIFO，返回 0-255 */
    if(XUartPs_IsReceiveData(fg_uart.Config.BaseAddress)!=0)
    {
    	return (int)(XUartPs_ReadReg(fg_uart.Config.BaseAddress,XUARTPS_FIFO_OFFSET) & 0xFFU);
	}
	/* 没数据：返回 -1 */
	else
	{
		return -1;
	}
}




