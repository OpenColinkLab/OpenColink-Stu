/**
 * @file  uart.c
 * @brief PS UART1 driver in polled mode (no interrupt, no OS).
 */
#include "xil_types.h"
#include "xuartps.h"
#include "uart.h"

/* file scope UART instance */
static XUartPs fg_uart;

/**
 * @brief  Initialise the PS UART
 *         The base address is taken from the BSP instead of being hard coded,
 *         so the driver keeps working when the PS7 design is changed.
 * @return 0 on success, -1 on failure
 */
int Uart_Init(void)
{
    XUartPs_Config *tp_cfg;

    tp_cfg = XUartPs_LookupConfig(UART_DEVICE_ID);
    if (tp_cfg == NULL) {
        return -1;
    }
    if (XUartPs_CfgInitialize(&fg_uart, tp_cfg, tp_cfg->BaseAddress) != XST_SUCCESS) {
        return -1;
    }
    XUartPs_SetBaudRate(&fg_uart, UART_BAUDRATE);
    return 0;
}

/**
 * @brief  Send one character, wait while the TX FIFO is full
 * @param  f_ch  character to send
 */
void Uart_PutChar(char f_ch)
{
    while (XUartPs_IsTransmitFull(fg_uart.Config.BaseAddress)) {
        /* wait for the TX FIFO */
    }
    XUartPs_WriteReg(fg_uart.Config.BaseAddress, XUARTPS_FIFO_OFFSET,
                     (u8)f_ch);
}

/**
 * @brief  Send a zero terminated string
 * @param  f_str  string to send
 */
void Uart_PutString(const char *f_str)
{
    const char *tp_ptr = f_str;

    while (*tp_ptr != '\0') {
        Uart_PutChar(*tp_ptr);
        tp_ptr++;
    }
}

/**
 * @brief  Read one character from the RX FIFO
 * @return the received character, or -1 when the FIFO is empty
 */
int Uart_GetChar(void)
{
    if (XUartPs_IsReceiveData(fg_uart.Config.BaseAddress)) {
        return (int)(XUartPs_ReadReg(fg_uart.Config.BaseAddress,
                                     XUARTPS_FIFO_OFFSET) & 0xFFU);
    }
    return -1;
}
