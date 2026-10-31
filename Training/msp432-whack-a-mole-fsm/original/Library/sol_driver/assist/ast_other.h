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
 * @LastEditTime: 2021-09-20 13:55:38
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_Ast\Inc\oth_ast.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __OTH_AST_H
#define __OTH_AST_H

	#ifdef __cplusplus
	extern "C"{
	#endif
/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
	#include "env_info.h"
	#include "sol_define.h"


/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					#ifdef OTH_MOD
\*-------------------------------------------------------*/
        #ifndef OTH_MOD
            //格式化OTH信息宏定义
            #define USER_OTH(format, ...)      printf("oth:" format "\r\n",##__VA_ARGS__)
            
            //表匹配
            extern uint16_t SOL_Match_Table(uint32_t x_num, 
                                    uint32_t y_num, 
                                    uint32_t z_num, 
                                    const uint32_t * match_arr, 
                                    uint32_t start_addr,
									const uint32_t * table
									);
            extern void SOL_8To16_Change(const uint8_t * arr2change, uint16_t * arr_aft_change, uint16_t dat_num);
            extern void SOL_8To32_Change(const uint8_t * arr2change, uint32_t * arr_aft_change, uint16_t dat_num);
            extern void SOL_16To32_Change(const uint16_t * arr2change, uint32_t * arr_aft_change, uint16_t dat_num);

        #endif

	#ifdef __cplusplus
	}
	#endif
#endif
