#include "xparameters.h"
#include "xil_printf.h"
#include "xuartps.h"
#include "xuartps_hw.h"

#include "elshell/elshell.h"
#include "led_cmd.h"
#include "ledr_cmd.h"
#include "help_cmd.h"
#include "echo_cmd.h"
#include "fadd_cmd.h"

#define UART_BAUD_RATE (115200U)

static int Uart_Init(void);

static int Uart_Init(void)
{
    XUartPs tp_uart = {0};
    XUartPs_Config *tp_uartCfg_ptr = NULL;

    tp_uartCfg_ptr = XUartPs_LookupConfig(XPAR_PS7_UART_1_DEVICE_ID);
    if (tp_uartCfg_ptr == NULL)
    {
        return XST_FAILURE;
    }

    if (XUartPs_CfgInitialize(&tp_uart, tp_uartCfg_ptr, tp_uartCfg_ptr->BaseAddress) != XST_SUCCESS)
    {
        return XST_FAILURE;
    }

    return XUartPs_SetBaudRate(&tp_uart, UART_BAUD_RATE);
}

int main(void)
{
    if (Uart_Init() != XST_SUCCESS)
    {
        return XST_FAILURE;
    }

    if (ELShell_Init() != e_el_eok)
    {
        xil_printf("ELShell init failed\r\n");
        return XST_FAILURE;
    }

    if (Led_Cmd_Init() != e_el_eok)
    {
        xil_printf("led command register failed\r\n");
        return XST_FAILURE;
    }

    if (Ledr_Cmd_Init() != e_el_eok)
    {
        xil_printf("ledr command register failed\r\n");
        return XST_FAILURE;
    }

    if (Help_Cmd_Init() != e_el_eok)
    {
        xil_printf("help command register failed\r\n");
        return XST_FAILURE;
    }

    if (Echo_Cmd_Init() != e_el_eok)
    {
        xil_printf("echo command register failed\r\n");
        return XST_FAILURE;
    }

    if (Fadd_Cmd_Init() != e_el_eok)
    {
        xil_printf("fadd command register failed\r\n");
        return XST_FAILURE;
    }
    xil_printf("ELShell ready. Try: /led -d32 3 <Enter>\r\n");

    while (1)
    {
        while (XUartPs_IsReceiveData(XPAR_PS7_UART_1_BASEADDR))
        {
            ELShell_Recv_Enq((char)XUartPs_RecvByte(XPAR_PS7_UART_1_BASEADDR));
        }

        ELShell_Dispatch();
    }

    return XST_SUCCESS;
}
