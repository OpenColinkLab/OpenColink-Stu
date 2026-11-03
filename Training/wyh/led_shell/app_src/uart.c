/* PS UART1 轮询收发，不开中断 */
#include "xil_types.h"
#include "xuartps.h"
#include "uart.h"

static XUartPs fg_uart;

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

void Uart_PutChar(char f_ch)
{
    while (XUartPs_IsTransmitFull(fg_uart.Config.BaseAddress)) {
        /* 等发送 FIFO 有空位 */
    }
    XUartPs_WriteReg(fg_uart.Config.BaseAddress, XUARTPS_FIFO_OFFSET,
                     (u8)f_ch);
}

void Uart_PutString(const char *f_str)
{
    const char *tp_ptr = f_str;

    while (*tp_ptr != '\0') {
        Uart_PutChar(*tp_ptr);
        tp_ptr++;
    }
}

/* 无数据返回 -1 */
int Uart_GetChar(void)
{
    if (XUartPs_IsReceiveData(fg_uart.Config.BaseAddress)) {
        return (int)(XUartPs_ReadReg(fg_uart.Config.BaseAddress,
                                     XUARTPS_FIFO_OFFSET) & 0xFFU);
    }
    return -1;
}
