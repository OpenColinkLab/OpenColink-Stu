/**
 * @file  uart.h
 * @brief PS UART1 interface, used by the shell for input and output.
 * @note  The UART is configured by the BSP (PS7 block design: UART1 on MIO24/25).
 */
#ifndef __UART_H__
#define __UART_H__

#include "xparameters.h"

#define UART_BAUDRATE   115200U
#define UART_DEVICE_ID  XPAR_XUARTPS_0_DEVICE_ID

/**
 * @brief  Initialise the PS UART
 * @return 0 on success, -1 on failure
 */
int  Uart_Init(void);

/**
 * @brief  Send one character (blocking until the TX FIFO has room)
 * @param  f_ch  character to send
 */
void Uart_PutChar(char f_ch);

/**
 * @brief  Send a zero terminated string
 * @param  f_str  string to send
 */
void Uart_PutString(const char *f_str);

/**
 * @brief  Read one character from the RX FIFO
 * @return the received character, or -1 when no data is available
 */
int  Uart_GetChar(void);

#endif /* __UART_H__ */
