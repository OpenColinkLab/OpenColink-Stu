/******************************************************************************
 * shell_port.h —— letter-shell 3.2.4 在 Zynq-7000 上的移植层
 *
 * 这一层只干两件事：
 *   1. 把 UART1 的收发包装成 letter-shell 要求的函数原型
 *   2. 提供 shell 对象和行缓冲
 *
 * 命令本身写在 main.c 里，用 SHELL_EXPORT_CMD 导出，不需要在这里注册。
 ******************************************************************************/

#ifndef __SHELL_PORT_H__
#define __SHELL_PORT_H__

#include "shell.h"

#define SHELL_BUFFER_SIZE   512

extern Shell shell;
extern char  shellBuffer[SHELL_BUFFER_SIZE];

void shellPortInit(void);

#endif /* __SHELL_PORT_H__ */
