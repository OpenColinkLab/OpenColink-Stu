/* PS 侧入口：UART1 上跑 letter-shell，命令经 AXI GPIO 控制 PL 的 LED */
#include "platform.h"
#include "uart.h"
#include "led.h"
#include "helloworld.h"
#include "shell.h"
#include "shell_port.h"

static void Main_PrintBanner(void)
{
    Uart_PutString("\r\n@@@@ Led_Shell : letter-shell 3.2.4 port @@@@\r\n");
    Uart_PutString("  UART1 MIO24/MIO25  115200 8N1\r\n");
    Uart_PutString("  PL  : Led_Driver state machine + 1 kHz PWM\r\n");
    Uart_PutString("  cmd : help / hello / led <0-5> / status / demo\r\n");
    Uart_PutString("  tip : Tab completes, Up/Down = history\r\n");
}

int main(void)
{
    init_platform();

    if (Uart_Init() != 0) {
        return -1;
    }

    (void)Led_SetMode(0);

    Main_PrintBanner();
    Hello_World_Print();

    if (Shell_PortInit() != 0) {
        Uart_PutString("\r\nshell init failed!\r\n");
        return -1;
    }

    for (;;) {

        shellTask(Shell_PortGetInstance());
    }
}
