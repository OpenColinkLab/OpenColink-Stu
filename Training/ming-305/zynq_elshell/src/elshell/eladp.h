//头文件保护
#ifndef __ELADP_H_PROTECT
#define __ELADP_H_PROTECT

#include <stdlib.h>
#include "xparameters.h"
#include "xuartps_hw.h"

//内存api
#define eladp_elcalloc(f_num,f_size) calloc((f_num),(f_size))
#define eladp_elfree(f_ptr) free((f_ptr))

//串口
#define eladp_elputc(f_char) XUartPs_SendByte(XPAR_PS7_UART_1_BASEADDR, (f_char))
#define eladp_elgetc()       ((char)XUartPs_RecvByte(XPAR_PS7_UART_1_BASEADDR))

//临界区组
#define eladp_elcrtsec_start(f_secName) do { } while (0)
#define eladp_elcrtsec_end(f_secName)   do { } while (0)

//对齐组
#define __eladp_align(bytes) __attribute__((aligned(bytes)))

#endif // endif __ELADP_H_PROTECT
