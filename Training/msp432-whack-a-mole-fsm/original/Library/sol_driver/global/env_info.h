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
 * @LastEditTime: 2021-09-16 19:41:17
 * @LastEditors: Chsier
 * @Description: 环境变量设置文件夹
 * @Version: v_alpha
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Gen\Inc\env_inf.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __ENV_INF_H
#define __ENV_INF_H

    #include "stdint.h"
	
//Platform
	//#define STM32_HAL_PLATFORM
	//#define STM32_LL_PLATFORM
	//#define STM32_STD_PLATFORM
	//#define MSP430_USER_PLATFORM
	//#define MSP432_USER_PLATFORM
	#define MSP432_SDK_PLATFORM

//Chip Inf:
//If ur chip is F103, define STM32F103, others just like so on
	//#define STM32F103
	//#define STM32F407
	//#define STM32F429
	//#define STM32H743
	//#define MSP430F5529
	//#define MSP430G2553
	#define MSP432401R
	//#define MSP432401Y

//Language: ASM or C or (C & C++), just for people to read
	//#define __ASM_ONLY
	//#define __ASM_C_ONLY
	//#define __ASM_C_CPP_ONLY
	#define __C_ONLY
	//#define __C_CPP_ONLY
	//#define __CPP_ONLY

//Compiler:
//#define (__CC_ARM)

//Chip Speed:
    //#define STM32_72MHZ
	//#define STM32_84MHZ
	//#define STM32_168MHZ
    //#define STM32_200MHZ
    //#define STM32_400MHZ
    //#define STM32_480MHZ
	
	//#define MSP432_3MHZ
	#define MSP432_48MHZ

//DEBUG_MOD
	//#define DBG_MOD
	//#define INF_MOD
	//#define ERR_MOD
	//#define OTH_MOD


//Device On_Off

	//SPI
	//#define SPI_HW_USED

#endif
