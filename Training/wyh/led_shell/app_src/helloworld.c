/*前置任务 1.1：串口输出 Hello World */
#include "helloworld.h"
#include "uart.h"

void Hello_World_Print(void)
{
    Uart_PutString("\r\nHello World from Zynq PS (UART1, 115200 8N1)\r\n");
}
