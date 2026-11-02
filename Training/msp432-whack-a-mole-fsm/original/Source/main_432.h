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
 * @Date: 2021-09-19 17:55:01
 * @LastEditTime: 2021-09-19 20:39:30
 * @LastEditors: Chsier
 * @Description: 仅用于main.c和project.h
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Source\main.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __MAIN_432_H
#define __MAIN_432_H			//Prevent redefinition

	#ifdef USER_FUN			//User function macro definition
		#undef USER_FUN
	#endif
	//#define USER_FUN

	#ifdef __cplusplus
	extern "C"{
	#endif					//Compatible C++
	
	#include "stdint.h"
/*-------------------------------------------------------*\
					 Token Timer
\*-------------------------------------------------------*/
	#define MKEY_FRESH_TIME 5
/*-------------------------------------------------------*\
					 Global Ver
\*-------------------------------------------------------*/
/*------------------------*\
	    About_FSM
\*------------------------*/

/*------------------------*\
	 About_Hamster&PWM
\*------------------------*/

/*------------------------*\
	    Timer_Token
\*------------------------*/
	extern uint16_t mkey_fresh_token;		//MKEY令牌
	extern uint16_t g_hamsterWaitToken;		//打地鼠令牌

    //MKEY相关
    extern uint16_t mkey_val;    
    extern uint8_t mkey_val_last;
    extern uint8_t mkey_val_now;
	extern uint8_t  is_button_fresh;		//按键命令被刷新

	#ifdef __cplusplus		//Compatible C++
	}
	#endif
#endif
