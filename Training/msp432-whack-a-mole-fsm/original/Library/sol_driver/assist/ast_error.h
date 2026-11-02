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
 * @LastEditTime: 2021-09-20 13:55:16
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_Ast\Inc\err_ast.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __ERR_AST_H
#define __ERR_AST_H

	#ifdef __cplusplus
	extern "C"{
	#endif

	#include "env_info.h"
	#include "sol_define.h"
	
        #ifdef ERR_MOD
            //格式化ERR信息宏定义
            #define USER_ERR(format,...)   printf("err:" format "\r\n",##__VA_ARGS__)
			//错误跳转宏
			#define Error(err_code) printf("ERR_CODE: %s\r\n",#err_code);	\
									printf("Position: %s\n"					\
											"         %s\n"					\
											"         %d\r",__FILE__, __FUNCTION__, __LINE__);\
									Error_Forever(err_code)
			extern void Error_Forever(uint16_t err_code);			
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
#ifdef ERR_MOD
    USER_ERR("err_test! %d",u8_test_arr[15]);
#endif
*/