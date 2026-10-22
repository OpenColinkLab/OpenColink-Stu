/**
 * @file  main.c
 * @brief PS side of the project: a small shell on UART1 that changes the LED
 *        action by writing the AXI GPIO register.
 *
 *        Flow:  UART1 -> line buffer -> Cmd_Execute() -> Led_SetMode()
 *               -> AXI GPIO -> PL Led_Driver -> W14
 */
#include "platform.h"
#include "uart.h"
#include "cmd.h"
#include "led.h"
#include "helloworld.h"

#define MAIN_LINE_MAX   64

/* line buffer of the shell */
static char fg_lineBuffer[MAIN_LINE_MAX];
static int  fg_lineLen = 0;

/**
 * @brief  Print the shell prompt
 */
static void Main_Prompt(void)
{
    Uart_PutString("\r\nled> ");
}

int main(void)
{
    int tp_ch;

    init_platform();

    if (Uart_Init() != 0) {
        Uart_PutString("\r\nUART init failed!\r\n");
        return -1;
    }

    Led_SetMode(0);

    Uart_PutString("\r\n==========================================\r\n");
    Uart_PutString("  Led_Shell : PS + PL LED driver\r\n");
    Uart_PutString("  type 'help' to list commands\r\n");
    Uart_PutString("==========================================\r\n");

    /* prerequisite task : Hello World */
    Hello_World_Print();

    Main_Prompt();

    for (;;) {
        tp_ch = Uart_GetChar();
        if (tp_ch < 0) {
            continue;
        }

        if ((tp_ch == '\r') || (tp_ch == '\n')) {
            /* end of line: execute the command */
            if (fg_lineLen > 0) {
                fg_lineBuffer[fg_lineLen] = '\0';
                Uart_PutString("\r\n");
                Cmd_Execute(fg_lineBuffer);
                fg_lineLen = 0;
            }
            Main_Prompt();
        } else if ((tp_ch == 0x08) || (tp_ch == 0x7F)) {
            /* backspace / delete: remove the last character */
            if (fg_lineLen > 0) {
                fg_lineLen--;
                Uart_PutString("\b \b");
            }
        } else if (fg_lineLen < (MAIN_LINE_MAX - 1)) {
            /* normal character: echo and store */
            fg_lineBuffer[fg_lineLen] = (char)tp_ch;
            fg_lineLen++;
            Uart_PutChar((char)tp_ch);
        } else {
            /* line buffer full, ignore the character */
        }
    }

    return 0;
}
