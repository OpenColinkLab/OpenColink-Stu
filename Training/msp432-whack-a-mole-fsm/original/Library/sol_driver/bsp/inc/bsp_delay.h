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
 * @LastEditTime: 2021-09-16 19:32:32
 * @LastEditors: Chsier
 * @Description: 全局延时函数头文件
 * @Version: v_alpha
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Gen\Inc\gen_delay.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef BSP_DELAY_H_PROTECT
#define BSP_DELAY_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
	#include "env_info.h"
	#include "sol_define.h"

	#ifdef __cplusplus
	extern "C"{
	#endif					//Compatible C++
	
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
/* 1 * time 约等于 83.4ns (168M VeryHigh_Speed) 测试平台:STM32F407VET6 ST官方一代黑色板*/
		#ifdef STM32_480MHZ	
			#define SOL_Delay_1us() SOL_Delay(3)
			#define SOL_Delay_5us() SOL_Delay(16)
			#define SOL_Delay_10us() SOL_Delay(43)
			#define SOL_Delay_20us() SOL_Delay(86)
			#define SOL_Delay_50us() SOL_Delay(216)
			#define SOL_Delay_100us() SOL_Delay(432)
			#define SOL_Delay_500us() SOL_Delay(2248)
        #endif
		#ifdef STM32_168MHZ	
			#define SOL_Delay_1us() SOL_Delay(8)
			#define SOL_Delay_5us() SOL_Delay(56)
			#define SOL_Delay_10us() SOL_Delay(116)
			#define SOL_Delay_20us() SOL_Delay(235)
			#define SOL_Delay_50us() SOL_Delay(595)
			#define SOL_Delay_100us() SOL_Delay(1194)
			#define SOL_Delay_500us() SOL_Delay(6000)
			#define SOL_Delay_1000us() SOL_Delay(12000)
        #endif
		#ifdef MSP432_3MHZ
			#define SOL_Delay_1us() SOL_Delay()
			#define SOL_Delay_5us() SOL_Delay()
			#define SOL_Delay_10us() SOL_Delay()
			#define SOL_Delay_20us() SOL_Delay()
			#define SOL_Delay_50us() SOL_Delay()
			#define SOL_Delay_100us() SOL_Delay()
			#define SOL_Delay_500us() SOL_Delay()
			#define SOL_Delay_1000us() SOL_Delay()			
		#endif
		#ifdef MSP432_48MHZ
			#define SOL_Delay_1us() SOL_Delay(6)
			#define SOL_Delay_5us() SOL_Delay(30)
			#define SOL_Delay_10us() SOL_Delay(60)
			#define SOL_Delay_20us() SOL_Delay(120)
			#define SOL_Delay_50us() SOL_Delay(300)
			#define SOL_Delay_100us() SOL_Delay(600)
			#define SOL_Delay_500us() SOL_Delay(3000)
			#define SOL_Delay_1000us() SOL_Delay(6000)
			#define SOL_Delay_15ms() SOL_Delay(90000)
		#endif

    #define SOL_MAX_DELAY 0xFFFFFFFFU
/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
    //SOL延时频率
    ENUM(SOL_DelayFreq){
        SOL_TICK_FREQ_10HZ     = 100U,
        SOL_TICK_FREQ_100HZ    = 10U,
        SOL_TICK_FREQ_1KHZ     = 1U,
        SOL_TICK_FREQ_DEFAULT  = SOL_TICK_FREQ_1KHZ
    };
/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			   Support pointer definition
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
extern volatile uint32_t solDelaymsCnt;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
//SOL延时函数
	extern void SOL_Delay(volatile uint32_t time);
    extern void SOL_Delayms(volatile uint32_t ms);
    extern uint32_t SOL_GetTick(void);
//SOL瞬时延时函数
	extern void SOL_Pause(void);


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