/* 移植层：行缓冲、UART 收发、毫秒计时 */
#include "shell.h"
#include "shell_port.h"
#include "uart.h"
#include "xtime_l.h"

static Shell fg_shell;
static char fg_shellBuffer[SHELL_PORT_BUFFER_SIZE];

/* 命令表按 sizeof(ShellCommand) 步进遍历，结构体大小必须是 4 的倍数 */
typedef char ShellPort_SizeCheck[((sizeof(ShellCommand) % 4U) == 0U) ? 1 : -1];

/* 读钩子：把 FIFO 里已有的字节全部取走，没数据就返回 0，不能死等 */
signed short Shell_PortRead(char *f_data, unsigned short f_len)
{
    unsigned short tp_count = 0;
    int tp_ch;

    while (tp_count < f_len) {
        tp_ch = Uart_GetChar();
        if (tp_ch < 0) {
            break;
        }
        f_data[tp_count] = (char)tp_ch;
        tp_count++;
    }
    return (signed short)tp_count;
}

/* 写钩子 */
signed short Shell_PortWrite(char *f_data, unsigned short f_len)
{
    unsigned short tp_ix;

    for (tp_ix = 0; tp_ix < f_len; tp_ix++) {
        Uart_PutChar(f_data[tp_ix]);
    }
    return (signed short)f_len;
}

/* 毫秒计数，取 XTime 低 32 位，约 49 天回绕 */
int Shell_GetTickMs(void)
{
    XTime tp_now;

    XTime_GetTime(&tp_now);
    return (int)(tp_now / (COUNTS_PER_SECOND / 1000U));
}

/* 毫秒延时，期间收到 'q' 返回 -1 */
int Shell_PortDelayMs(int f_ms)
{
    int tp_start = Shell_GetTickMs();
    int tp_ch;

    while ((Shell_GetTickMs() - tp_start) < f_ms) {
        tp_ch = Uart_GetChar();
        if ((tp_ch == 'q') || (tp_ch == 'Q')) {
            return -1;
        }
    }
    return 0;
}

int Shell_PortInit(void)
{
    fg_shell.read  = Shell_PortRead;
    fg_shell.write = Shell_PortWrite;

    shellInit(&fg_shell, fg_shellBuffer, (unsigned short)SHELL_PORT_BUFFER_SIZE);
    return 0;
}

Shell *Shell_PortGetInstance(void)
{
    return &fg_shell;
}
