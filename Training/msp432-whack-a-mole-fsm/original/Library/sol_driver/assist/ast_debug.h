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
 * @LastEditTime: 2021-09-20 13:55:01
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_Ast\Inc\dbg_ast.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __DBG_AST_H
#define __DBG_AST_H

	#ifdef __cplusplus
	extern "C"{
	#endif

	#include "env_info.h"
	#include "sol_define.h"

        static uint8_t RUN_ONCE = 1;	//单次运行标志

        #ifdef DBG_MOD
            #define DBG_STR_LEN_MAX 50		//不建议改大,应尽量少在函数内申请数组
            
            //格式化DBG信息宏定义
            #define USER_DBG(format, ...)     printf("dbg:" format "\r\n",##__VA_ARGS__)

            //指针缓冲区观察宏定义
            #define DBG_U8_WATCH(WATCH, PDATA, LENG) \
                uint8_t (*(WATCH))[(LENG)] = (uint8_t (*)[(LENG)])(PDATA)
            #define DBG_U8_BREAK(WATCH)  (*(WATCH))[0] = (*(WATCH))[0]//一般断点设在此处,可查看u8缓冲区

            #define DBG_U16_WATCH(WATCH, PDATA, LENG) \
                uint16_t (*(WATCH))[(LENG)] = (uint16_t (*)[(LENG)])(PDATA)
            #define DBG_U16_BREAK(WATCH)  (*(WATCH))[0] = (*(WATCH))[0]//一般断点设在此处,可查看u16缓冲区

            #define DBG_U32_WATCH(WATCH, PDATA, LENG) \
                uint32_t (*(WATCH))[(LENG)] = (uint32_t (*)[(LENG)])(PDATA)
            #define DBG_U32_BREAK(WATCH)  (*(WATCH))[0] = (*(WATCH))[0]//一般断点设在此处,可查看u32缓冲区

			#ifdef STM32_HAL_PLATFORM
                #define DBG_UART huart1
				//字符串发送函数
				extern void Dbg_StrSend(UART_HandleTypeDef * usart_dev,const char* str);
				//WIN10串口调试助手Pro 绘线函数
				extern void Dbg_Plot_U8(UART_HandleTypeDef * usart_dev, char* line_name, const uint8_t* dat,uint16_t dat_len);
				extern void Dbg_Plot_U16(UART_HandleTypeDef * usart_dev, char* line_name, const uint16_t* dat,uint16_t dat_len);
				extern void Dbg_Plot_U32(UART_HandleTypeDef * usart_dev, char* line_name, const uint32_t* dat,uint16_t dat_len);
			#endif
			#ifdef MSP432_SDK_PLATFORM
                #define DBG_UART EUSCI_A0_BASE
				//字符串发送函数       
                extern void Dbg_StrSend(uint32_t moduleInstance, const char* str);
				//WIN10串口调试助手Pro 绘线函数
                extern void Dbg_Plot_U8(uint32_t moduleInstance, char* line_name, const uint8_t* dat,uint16_t dat_len);
                extern void Dbg_Plot_U16 (uint32_t moduleInstance, char* line_name, const uint16_t* dat,uint16_t dat_len);
                extern void Dbg_Plot_U32(uint32_t moduleInstance, char* line_name, const uint32_t* dat,uint16_t dat_len);
			#endif

				//向上初始化数组函数
				extern void Dbg_Up_Init_U8(uint8_t * arr, uint16_t len);
				extern void Dbg_Up_Init_U16(uint16_t * arr, uint16_t len);
				extern void Dbg_Up_Init_U32(uint32_t * arr, uint16_t len);

        #endif

	#ifdef __cplusplus
	}
	#endif
#endif


/*---------------DBG TXT Helper------------------*/


/***************************************************************
* 名    称:格式化串口输出调试函数
* 功    能:插入串口输出信息
* 逻辑说明:/
* 额外说明:使用方法:
****************************************************************/
/*
#ifdef DBG_MOD
    USER_DBG("dbg_test! %d",u8_test_arr[15]);
#endif
*/




/***************************************************************
* 名    称:指针观察函数
* 功    能:观察uint8_t类型缓冲区
* 逻辑说明:定义了指向元素的指针,防止被编译器优化,如果是L_0优化
          则DBG_Ux_BREAK也可以省略
* 额外说明:使用方法:

uint8_t * arr;//待观察指针
......
#ifdef DBG_MOD
	DBG_U8_WATCH(arr_w,arr,100);//观察数目为100个
    DBG_U8_BREAK(arr_w);//一般断点设在此处,观察arr_w可查看u8缓冲区
#endif

****************************************************************/
/*

#ifdef DBG_MOD
    DBG_U8_WATCH(_w,,);
    DBG_U8_BREAK(_w);//一般断点设在此处,可查看u8缓冲区
#endif

*/
