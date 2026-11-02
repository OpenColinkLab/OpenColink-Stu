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
 * @Date: 2022-04-23 12:38:08
 * @LastEditTime: 2022-04-24 21:09:16
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\bsp\src\bsp_timerA.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "bsp_timerA.h"
#include "driverlib.h"
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/

/*
* fun_name :Timer_A_getTAxIV
* describe :获取TimerA_TAIV寄存器值用以判断CCR中断和溢出中断
* input	   :TIMER_Ax_BASE
* output   :TAxIV指针指向的值
* other_dis:
	判断后使用以下函数来清除中断标志位
    //清除溢出标志位
    //MAP_Timer_A_clearInterruptFlag(TIMER_A0_BASE);
    //清除捕获比较中断标志位
    MAP_Timer_A_clearCaptureCompareInterrupt(TIMER_A0_BASE,
                                             TIMER_A_CAPTURECOMPARE_REGISTER_1);
* platform :432sdk
* tested   :N
*/

/* uint16_t Timer_A_getTAxIV(uint32_t timer)
{
	switch (timer)
	{
	case TIMER_A0_BASE:
			return TA0IV;
		break;
	case TIMER_A1_BASE:
			return TA1IV;
		break;
	case TIMER_A2_BASE:
			return TA2IV;
		break;
	case TIMER_A3_BASE:
			return TA3IV;
		break;	
	default: 
			return (0);
		break;
	}
} */ //直接赋值就好了

/*
* fun_name :Timer_A_clearTAxR
* describe :清零TimerA_TAxR寄存器计数值
* input	   :TIMER_Ax_BASE
* change   :Timer_Ax Counter Register
* platform :432sdk
* tested   :N
*/
void Timer_A_clearTAxR(uint32_t timer)
{
	switch (timer)
	{
	case TIMER_A0_BASE:
			TA0R = 0;return;
		break;
	case TIMER_A1_BASE:
			TA1R = 0;return;
			break;
	case TIMER_A2_BASE:
			TA2R = 0;return;
		break;
	case TIMER_A3_BASE:
			TA3R = 0;return;
		break;	
	default: 
			return;
		break;
	}
}

/*
* fun_name :Timer_A_clearCCRx
* describe :清零TAxCCRx寄存器计数值
* input	   :TIMER_Ax_BASE 
			TIMER_A_CAPTURECOMPARE_REGISTER_x
* change   :TA0CCR0
* platform :432sdk
* tested   :N
*/
void Timer_A_clearCCRx(uint32_t timer, uint_fast16_t captureCompareRegister)
{
	if(timer == TIMER_A0_BASE){
		switch (captureCompareRegister)
		{
			case TIMER_A_CAPTURECOMPARE_REGISTER_0:
					TA0CCR0 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_1:
					TA0CCR1 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_2:
					TA0CCR2 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_3:
					TA0CCR3 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_4:
					TA0CCR4 = 0;return;
				break;				
			default:
					return;
				break;
		}
	}
	if(timer == TIMER_A1_BASE){
		switch (captureCompareRegister)
		{
			case TIMER_A_CAPTURECOMPARE_REGISTER_0:
					TA1CCR0 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_1:
					TA1CCR1 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_2:
					TA1CCR2 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_3:
					TA1CCR3 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_4:
					TA1CCR4 = 0;
				break;				
			default:
					return;
				break;
		}
	}
	if(timer == TIMER_A2_BASE){
		switch (captureCompareRegister)
		{
			case TIMER_A_CAPTURECOMPARE_REGISTER_0:
					TA2CCR0 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_1:
					TA2CCR1 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_2:
					TA2CCR2 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_3:
					TA2CCR3 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_4:
					TA2CCR4 = 0;return;
				break;			
			default:
					return;
				break;
		}
	}
	if(timer == TIMER_A3_BASE){
		switch (captureCompareRegister)
		{
			case TIMER_A_CAPTURECOMPARE_REGISTER_0:
					TA3CCR0 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_1:
					TA3CCR1 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_2:
					TA3CCR2 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_3:
					TA3CCR3 = 0;return;
				break;
			case TIMER_A_CAPTURECOMPARE_REGISTER_4:
					TA3CCR4 = 0;return;
				break;			
			default:
					return;
				break;
		}
	}
	

}

/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif
