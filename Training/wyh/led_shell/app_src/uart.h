/* uart.h - PS UART1 接口，UART1 在 BD 里配到 MIO24/25 */
#ifndef __UART_H__
#define __UART_H__

#include "xparameters.h"

#define UART_BAUDRATE   115200U
#define UART_DEVICE_ID  XPAR_XUARTPS_0_DEVICE_ID

int  Uart_Init(void);
void Uart_PutChar(char f_ch);
void Uart_PutString(const char *f_str);
int  Uart_GetChar(void);      /* 无数据返回 -1 */

#endif /* __UART_H__ */
