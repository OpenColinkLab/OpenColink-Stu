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
 * @Date: 2021-10-24 19:33:34
 * @LastEditTime: 2021-11-03 12:22:56
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Dev_Test_A\Library\driver_sol\User_Dev\Inc\beep.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */


#ifndef __BEEP_H
#define __BEEP_H			//Prevent redefinition

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
	#include "bsp_gpio.h"
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
#define BEEP_FREQ_DEF 1000
#define BEEP_TIME_DEF 1500

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/
	DEV(Beep){
		
		//Object Port & Pin
		GPIO_Port beep_port;
		GPIO_Pin  beep_pin;		
		
		//Basic function pointer in struct
		//(User_Change)
		//delay
	  	void (* Beep_Delay) (volatile uint32_t time);
	  	//tog_pin
	  	void (* Beep_Tog_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
		
	};


#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			   Support pointer definition
\*-------------------------------------------------------*/
//(User_Change)
/*It is mainly used for the declaration in init function, 
  and then the function pointer in the structure can be 
  assigned*/
  
	//Basic function pointer
	//delay
	typedef void (* Beep_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* Beep_Tog_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
extern _DEV(Beep) beep_used;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/

/**
 * @brief Beep初始化
 * @note 
 * input	:/
 *      @param dev  设备
 *      @param tog_pin  翻转管脚
 *      @param delay 延时函数
 * @note 
 * output   :/
		@return None
 * change   :/
 * other_dis:/
 * platform :432sdk
 * istested :N
 */
	extern void SOL_Beep_Init(_DEV(Beep) * dev,
                        Beep_Tog_Pin_Fun_P tog_pin,
						Beep_Delay_Fun_P delay);
	

    /**
 * @brief 蜂鸣器叫一会
 * @note 
 * input	:/
 *      @param dev  设备
 *      @param freq 声调频率
 *      @param time 发声时间
 * @note 
 * output   :/
		@return None
 * change   :/
 * other_dis:/
 * platform :432sdk
 * istested :N
 */
    extern void SOL_Beep_On(_DEV(Beep) * dev,
                            const uint32_t freq ,
                            volatile uint32_t time);



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