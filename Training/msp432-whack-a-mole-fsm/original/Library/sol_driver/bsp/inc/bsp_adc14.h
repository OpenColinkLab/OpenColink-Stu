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
 * @LastEditTime: 2021-09-16 15:28:52
 * @LastEditors: Chsier
 * @Description: SOL_ADC14支持文件
 * @Version: v_alpha
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_432\Inc\adc14_sup.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明出处
 */

#ifndef __ADC14_SUP_H
#define __ADC14_SUP_H			//Prevent redefinition

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
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
	#define ADC_TRIGGER_TA0_C1		ADC_TRIGGER_SOURCE1
	#define ADC_TRIGGER_TA0_C2		ADC_TRIGGER_SOURCE2
	#define ADC_TRIGGER_TA1_C1		ADC_TRIGGER_SOURCE3
	#define ADC_TRIGGER_TA1_C2		ADC_TRIGGER_SOURCE4
	#define ADC_TRIGGER_TA2_C1		ADC_TRIGGER_SOURCE5
	#define ADC_TRIGGER_TA2_C2		ADC_TRIGGER_SOURCE6
	#define ADC_TRIGGER_TA3_C1		ADC_TRIGGER_SOURCE7


	#define FREQ_10K_CONST 10000	//以10KHz采样,每周期15个点为基准,对应的48M TA3比较值为 384-1
	//频率匹配常数
	#define FREQ_MATCH_CONST /* 384 */ 350 * FREQ_10K_CONST 	//只支持MSP432 ADC14 TA3_CCR1触发


#ifdef USER_FUN
#endif

/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
/**
 * @brief ADC14计时器触发匹配采样频率
 * @note 
 * input	:/
 *      @param timer
 *      - \b TIMER_A3_BASE 432默认
 *      @param freq
 * @note 
 * output   :/
		@return None
 * change   :/
 * other_dis:/
 * platform :432sdk(Only now)
 * istested :N
 */
extern void SOL_ADC14_MatchFreq(uint32_t timer,uint32_t freq);

#ifdef USER_FUN
#endif

	#ifdef __cplusplus		//Compatible C++
	}
	#endif
#endif


/*-------------------------------------------------------*\
					Example TXT Helper
\*-------------------------------------------------------*/

/* Documents for direct replication */

/*
* name:/
* des:/
* how2use:/
* other:/
*/
/*
...
*/