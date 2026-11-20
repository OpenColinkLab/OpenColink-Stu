#ifndef __SHELL_H
#define __SHELL_H

/* 一条命令的处理函数：argc/argv 和 main() 的约定一样 */
typedef void (*cmd_fn)(int argc, char **argv);

/* 命令表里的一行 */
typedef struct
{
    const char *name;   /* 命令名，例如 "led" */
    cmd_fn      fn;     /* 该命令对应的函数 */
    const char *help;   /* 帮助文字 */
} Command;

/* main.c 里已经实现的串口发送 */
void UART_Send(const char *s);

/* 解析并执行一行命令。
 * 返回 1：已处理（包括空行）
 * 返回 0：不认识，由 main.c 回 ERR,1 */
int Shell_Exec(char *line);

#endif /* __SHELL_H */
