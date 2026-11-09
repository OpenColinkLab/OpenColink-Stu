#ifndef __UART_H__
#define __UART_H__

#include "xparameters.h"

#define UART_BAUDRATE   115200U
#define UART_DEVICE_ID  XPAR_XUARTPS_0_DEVICE_ID

int  Uart_Init(void);
void Uart_PutChar(char ch);
void Uart_PutString(const char *str);
int  Uart_GetChar(void);

#endif
