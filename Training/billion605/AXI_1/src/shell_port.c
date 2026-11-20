/******************************************************************************
 * shell_port.c —— letter-shell 3.2.4 移植到 Zynq-7000 PS (Cortex-A9 / standalone)
 *
 * letter-shell 3.1 之后的读写函数原型（和 3.0 的单字符版不同）：
 *
 *   signed short (*read) (char *data, unsigned short len);  返回实际读到的字节数
 *   signed short (*write)(char *data, unsigned short len);  返回实际写出的字节数
 *
 * 注意 read 是"要多少给多少，有多少给多少"：没数据就返回 0，
 * shellTask 看到返回值不等于 1 就跳过这一轮，不会阻塞主循环。
 *
 * 串口：UART1 @0xE0001000，MIO24/25，115200 8N1
 ******************************************************************************/

#include "shell_port.h"
#include "xparameters.h"
#include "xuartps.h"
#include "xuartps_hw.h"
#include "xil_io.h"

Shell shell;
char  shellBuffer[SHELL_BUFFER_SIZE];

static XUartPs Uart;
static u32     uartBase;

/* 串口助手默认发 CR+LF。letter-shell 里 CR 和 LF 都能触发回车，
 * 不拦一下会一条命令执行两次、多打一个提示符。这里只放 CR 进去。 */
static int lastWasCr = 0;

/* --------------------------------------------------------------------------
 * 写：逐字节塞进 TX FIFO。XUartPs_SendByte 内部已经处理 FIFO 满的等待。
 * ------------------------------------------------------------------------ */
static signed short shellPortWrite(char *data, unsigned short len)
{
    unsigned short i;

    for (i = 0; i < len; i++) {
        XUartPs_SendByte(uartBase, (u8)data[i]);
    }
    return (signed short)len;
}

/* --------------------------------------------------------------------------
 * 读：非阻塞。RX FIFO 空就立刻返回 0。
 * ------------------------------------------------------------------------ */
static signed short shellPortRead(char *data, unsigned short len)
{
    unsigned short i = 0;

    while (i < len) {
        int c;

        /* RXEMPTY = 1 表示 FIFO 空，没有数据 */
        if (Xil_In32(uartBase + XUARTPS_SR_OFFSET) & XUARTPS_SR_RXEMPTY) {
            break;
        }

        c = (int)XUartPs_RecvByte(uartBase);

        if (c == '\n' && lastWasCr) {
            lastWasCr = 0;
            continue;               /* 吞掉 CRLF 里的 LF */
        }
        lastWasCr = (c == '\r');

        data[i++] = (char)c;
    }

    return (signed short)i;
}

/* --------------------------------------------------------------------------
 * 初始化：UART 起来，挂上读写函数。
 * shellInit 由 main 调用，因为要先打印自己的横幅再出提示符。
 * ------------------------------------------------------------------------ */
void shellPortInit(void)
{
    XUartPs_Config *cfg;

    cfg = XUartPs_LookupConfig(XPAR_XUARTPS_0_DEVICE_ID);
    if (cfg != NULL) {
        XUartPs_CfgInitialize(&Uart, cfg, cfg->BaseAddress);
        uartBase = cfg->BaseAddress;
    }

    shell.write = shellPortWrite;
    shell.read  = shellPortRead;
}
