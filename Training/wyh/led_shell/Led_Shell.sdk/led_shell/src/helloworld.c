/**
 * @file  helloworld.c
 * @brief Prerequisite task (PG002 1.1): Hello World output on the PS UART.
 *
 *        This is the same thing the Xilinx "Hello World" template does, but
 *        here it is part of the Led_Shell application so the prerequisite task
 *        and the training task can be demonstrated with one bitstream + one elf.
 */
#include "helloworld.h"
#include "uart.h"

/**
 * @brief  Print the Hello World banner on UART1
 */
void Hello_World_Print(void)
{
    Uart_PutString("\r\nHello World from Zynq PS (UART1, 115200 8N1)\r\n");
}
