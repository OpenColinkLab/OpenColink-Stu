/***
 *                                                                                    
 *     @@@@@@@ @@@  @@@  @@@@@@ @@@ @@@@@@@@ @@@@@@@     @@@@@@@@ @@@@@@  @@@@@@@     
 *    !@@      @@!  @@@ !@@     @@! @@!      @@!  @@@    @@!     @@!  @@@ @@!  @@@    
 *    !@!      @!@!@!@!  !@@!!  !!@ @!!!:!   @!@!!@!     @!!!:!  @!@  !@! @!@!!@!     
 *    :!!      !!:  !!!     !:! !!: !!:      !!: :!!     !!:     !!:  !!! !!: :!!     
 *     :: :: :  :   : : ::.: :  :   : :: ::   :   : :     :       : :. :   :   : :    
 *                                                                                    
 *                                                                                    
 *     @@@@@@  @@@@@@  @@@          @@@@@@@  @@@@@@@  @@@ @@@  @@@ @@@@@@@@ @@@@@@@   
 *    !@@     @@!  @@@ @@!          @@!  @@@ @@!  @@@ @@! @@!  @@@ @@!      @@!  @@@  
 *     !@@!!  @!@  !@! @!! @!@!@!@! @!@  !@! @!@!!@!  !!@ @!@  !@! @!!!:!   @!@!!@!   
 *        !:! !!:  !!! !!:          !!:  !!! !!: :!!  !!:  !: .:!  !!:      !!: :!!   
 *    ::.: :   : :. :  : ::.: :     :: :  :   :   : : :      ::    : :: ::   :   : :  
 *
 * @Author: Chsier
 * @Date: 2021-09-17 17:47:35
 * @LastEditTime: 2021-09-20 13:56:31
 * @LastEditors: Chsier
 * @Description: UART\FLASH\HMI_PACK相关
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_432\Inc\buf_sup.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __BUF_SUP_H
#define __BUF_SUP_H			//Prevent redefinition

	#ifdef USER_FUN			//User function macro definition
		#undef USER_FUN
	#endif
	//#define USER_FUN

	#ifdef __cplusplus
	extern "C"{
	#endif					//Compatible C++
	
/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
	
	#include "env_info.h"
	#include "sol_define.h"
	
#ifdef STM32_HAL_PLATFORM	
#endif
#ifdef MSP432_SDK_PLATFORM
#endif
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
	//串口缓冲区
	#define UART_BUF_SIZE 128
	//HMI包格式	
	#define HMI_PACK_HEAD_LEN 1		//包头长度(暂时无用)
	#define HMI_PACK_TAIL_LEN 3		//包尾长度(暂时无用)
	#define HMI_PACK_LEN 12			//包长

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
//接收完成标志
extern bool_t uart_rx_cmp_flag_0;
extern bool_t uart_rx_cmp_flag_1;
extern bool_t uart_rx_cmp_flag_2;
extern bool_t uart_rx_cmp_flag_3;
//串口缓冲区
extern uint8_t uart_buf_0 [UART_BUF_SIZE];
extern uint8_t uart_buf_1 [UART_BUF_SIZE];
extern uint8_t uart_buf_2 [UART_BUF_SIZE];
extern uint8_t uart_buf_3 [UART_BUF_SIZE];
//串口缓冲区指针
extern uint8_t * uart_buf_0_p;
extern uint8_t * uart_buf_1_p;
extern uint8_t * uart_buf_2_p;
extern uint8_t * uart_buf_3_p;
//串口缓冲区溢出计数
extern uint16_t uart_buf_0_cnt;
extern uint16_t uart_buf_1_cnt;
extern uint16_t uart_buf_2_cnt;
extern uint16_t uart_buf_3_cnt;
//规定每次串口收发的字节数变量
extern uint16_t uart_byte_limit;

/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
	#ifdef __cplusplus		//Compatible C++
	}
	#endif
#endif
