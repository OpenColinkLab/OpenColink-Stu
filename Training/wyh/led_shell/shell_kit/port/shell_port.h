/* shell_port.h - letter-shell 移植层接口 */
#ifndef __SHELL_PORT_H__
#define __SHELL_PORT_H__

#include "shell.h"

/* 512 字节会被切成历史条数+1 份，单条命令约 56 字节 */
#define SHELL_PORT_BUFFER_SIZE  512U

int Shell_PortInit(void);

/* shellGetCurrent() 只在命令执行期间有效，主循环里拿到的是 NULL，所以直接给实例 */
Shell *Shell_PortGetInstance(void);

signed short Shell_PortRead(char *f_data, unsigned short f_len);
signed short Shell_PortWrite(char *f_data, unsigned short f_len);

int Shell_GetTickMs(void);
int Shell_PortDelayMs(int f_ms);

#endif /* __SHELL_PORT_H__ */
