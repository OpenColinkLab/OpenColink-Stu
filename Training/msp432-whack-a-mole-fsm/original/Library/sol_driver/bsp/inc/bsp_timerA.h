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
 * @LastEditTime: 2021-09-20 13:58:01
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_432\Inc\timerA_sup.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */


#ifndef __TIMERA_SUP_H
#define __TIMERA_SUP_H			//Prevent redefinition

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
					Extern From .C
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
#define TAx_NOIFG	  		0x00	//技术参考手册p801
#define TAxCCR1_CCIFG 		0x02		
#define TAxCCR2_CCIFG 		0x04
#define TAxCCR3_CCIFG 		0x06
#define TAxCCR4_CCIFG 		0x08
#define TAxCCR5_CCIFG 		0x0a
#define TAxCCR6_CCIFG 		0x0c
#define TAxCTL_TAIFG  		0x0e

#define SOL_Timer_A_getTAxIV(timer) Timer_A_getTAxIV(timer)
#define SOL_Timer_A_clearTAxR(timer) Timer_A_clearTAxR(timer)
#define SOL_Timer_A_clearCCRx(timer,captureCompareRegister); Timer_A_clearCCRx(timer,captureCompareRegister);

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
	ENUM(FREQ_STATUS){
		FREQ_IDLE,
		FREQ_VAL_GET
	};


#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
	//获取TimerA_TAIV寄存器值用以判断CCR中断和溢出中断
    extern uint16_t Timer_A_getTAxIV(uint32_t timer);
	//清零TimerA_TAxR寄存器计数值
	extern void Timer_A_clearTAxR(uint32_t timer);
	//清零TAxCCRx寄存器计数值
	extern void Timer_A_clearCCRx(uint32_t timer, uint_fast16_t captureCompareRegister);
	//获取TA0_CCR2的频率值
	extern float Get_TA0CCR2_Freq();
	//改变计时器A3周期和比较值(这里周期 = 比较值),用于改变ADC采样率
	extern void Timer_A3_Change_Trigger(uint16_t op_num);
	//TA3强制拉高ADC采样率
	extern void Timer_A3_Force_High_S_Rate(void);
	#ifdef __cplusplus		//Compatible C++
	}
	#endif
#endif


/*-------------------------------------------------------*\
					Example TXT Helper
\*-------------------------------------------------------*/

/*Quick use of documents for direct replication*/

/*
* name:/
* des:/
* how2use:/
* other:/
*/
/*
...
*/