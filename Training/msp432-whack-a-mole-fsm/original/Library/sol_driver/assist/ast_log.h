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
 * @Date: 2021-09-14 14:22:15
 * @LastEditTime: 2021-09-16 20:39:39
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Ast\Inc\inf_ast.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __INF_AST_H
#define __INF_AST_H
   
	#ifdef __cplusplus
	extern "C"{
	#endif

        #include "stdio.h"
        #include "string.h"
		#include "env_inf.h"
        #include "gen_def.h"
        #include "gen_io.h"

        //#include "main.h"
        //#include "usart.h"

        #ifdef INF_MOD
            //格式化INF信息宏定义
            #define USER_INF(format, ...)     printf("inf:" format "\r\n",##__VA_ARGS__)
            //定位信息
            #define HERE_INF() printf("File:%s\nFunc:%s\nLine:%s\n",__FILE__, __FUNCTION__, __LINE__)
			//用户编辑信息
			#define USER_EDIT_INF()   printf("\nChip: STM32F407\n");\
									  printf("Lib: STM32_HAL_PLATFORM\n");\
									  printf("Lang: __C_ONLY\n");\
									  printf("Speed: STM32_168MHZ\n");\
									  \
									  printf("Used mod:\n");\
									  printf("	DBG_MOD\n");\
									  printf("	INF_MOD\n");\
									  printf("	ERR_MOD\n");\
									  printf("	OTH_MOD\n");\
									  printf("\n");\
									  printf("\n")
        #endif

	#ifdef __cplusplus
	}
	#endif
#endif
/***************************************************************
* 名    称:格式化串口输出调试函数
* 功    能:插入串口输出信息
* 逻辑说明:/
* 额外说明:使用方法:
****************************************************************/
/*
#ifdef INF_MOD
    USER_INF("inf_test! %d",u8_test_arr[15]);
#endif
*/