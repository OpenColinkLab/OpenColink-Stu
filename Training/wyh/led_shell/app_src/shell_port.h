/* letter-shell 移植层接口 */
#ifndef __SHELL_PORT_H__
#define __SHELL_PORT_H__

#include "shell.h"

#define SHELL_PORT_BUFFER_SIZE  512U

int Shell_PortInit(void);

/* shellGetCurrent() 只在命令执行期间有效 */
Shell *Shell_PortGetInstance(void);

signed short Shell_PortRead(char *f_data, unsigned short f_len);
signed short Shell_PortWrite(char *f_data, unsigned short f_len);

int Shell_GetTickMs(void);
int Shell_PortDelayMs(int f_ms);

#endif
