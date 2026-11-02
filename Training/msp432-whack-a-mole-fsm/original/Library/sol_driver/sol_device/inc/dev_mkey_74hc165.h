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
 * @Date: 2021-10-11 14:53:09
 * @LastEditTime: 2021-10-11 14:56:30
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Dev_Test_A\Library\driver_sol\User_Dev\Inc\mkey_74hc165.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __MKEY_74HC165_H
#define __MKEY_74HC165_H			//Prevent redefinition

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
#define HC165_Wait_Charge() SOL_Delay_10us()

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
	ENUM(MKEY_STATUS){
		MKEY_IDLE,
		MKEY_IS_PRESSED_WAIT,
		MKEY_IS_PRESSED,
		MKEY_IS_RELEASED_WAIT,
		MKEY_IS_RELEASED
	};

/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/
	DEV(MKEY){
		//Object Port & Pin		
		GPIO_Port sl_port;
		GPIO_Pin sl_pin;	
		GPIO_Port clk_port;
		GPIO_Pin clk_pin;
		GPIO_Port qh_port;
		GPIO_Pin qh_pin;

		//Basic function pointer in struct
		//(User_Change)
		//delay
	  	void (* Mkey_Delay) (volatile uint32_t time);
	  	//write_pin
	  	void (* Mkey_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	  	//read_pin
	  	GPIO_Pin_State (* Mkey_Read_Pin)  (GPIO_Port gpiox, GPIO_Pin gpio_pin);
		
		};

/*-------------------------------------------------------*\
			   Support pointer definition
\*-------------------------------------------------------*/
//(User_Change)
/*It is mainly used for the declaration in init function, 
  and then the function pointer in the structure can be 
  assigned*/
  
	//Basic function pointer
	//delay
	typedef void (* Mkey_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* Mkey_Write_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* Mkey_Read_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/	
extern _DEV(MKEY) mkey_used;
extern _ENUM(MKEY_STATUS) mkey_state;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
/**
 * @brief 矩阵键盘初始化
 * @note 
 * input	:/
 *      @param dev
 *      @param write_pin
 *      @param read_pin
 *      @param delay
 * @note 
 * output   :/
		@return None
 * platform :432sdk
 * istested :N
 */
extern void SOL_Mkey_Init(_DEV(MKEY) * dev,
						Mkey_Write_Pin_Fun_P write_pin,
						Mkey_Read_Pin_Fun_P read_pin,
						Mkey_Delay_Fun_P delay);

/**
 * @brief 扫描矩阵键盘
 * @note 
 * input	:/
 *      @param dev
 * @note 
 * output   :/
		@return key_value
 *      - \b 1-16
 * change   :/
 * other_dis:/
 * platform :432sdk
 * istested :N
 */
extern uint16_t SOL_MKey_Scan(_DEV(MKEY) * dev);

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