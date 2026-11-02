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
 * @Date: 2021-10-13 13:25:49
 * @LastEditTime: 2021-10-16 11:57:00
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Dev_Test_A\Library\driver_sol\User_Dev\Inc\switch_ch444g.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */


#ifndef __SWITCH_CH444G_H   
#define __SWITCH_CH444G_H			//Prevent redefinition

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
	#define SWITCH_OPEN 0
	#define SWITCH_CH1 1
	#define SWITCH_CH2 2
	#define SWITCH_CH3 3
	#define SWITCH_CH4 4
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/
	DEV(Switch){
			//Object Port & Pin
			//三个控制管脚
			GPIO_Port in1_port;
			GPIO_Pin  in1_pin;		
			GPIO_Port in0_port;
			GPIO_Pin  in0_pin;
			GPIO_Port en_port;
			GPIO_Pin  en_pin;			
			//Basic function pointer in struct
			//(User_Change)
			//delay
			void (* Switch_Delay) (volatile uint32_t time);
			//write_pin
			void (* Switch_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
			//read_pin
			GPIO_Pin_State (* Switch_Read_Pin)  (GPIO_Port gpiox, GPIO_Pin gpio_pin);
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
	typedef void (* Switch_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* Switch_Write_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* Switch_Read_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
	//Other function pointer
#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
/**
 * @brief 初始化模拟开关
 * @note 
 * platform :432sdk
 * istested :N
 */
	extern void SOL_Switch_Init(_DEV(Switch) * dev,
						Switch_Write_Pin_Fun_P write_pin,
						Switch_Read_Pin_Fun_P read_pin,
						Switch_Delay_Fun_P delay);
/**
 * @brief 选择开关通道
 * @note 
 * input	:/
 *      @param channel 通道名
 *      - \b SWITCH_CH1
 *      - \b SWITCH_CH2
 *      - \b SWITCH_CH3
 *      - \b SWITCH_CH1
 *      - \b SWITCH_OPEN
 * @note 
 * output   :/
		@return None
 * change   :/
 * other_dis:只使用了SA的四个通道(1-4),其他通道接地了
 * platform :432sdk
 * istested :N
 */
	extern void SOL_Switch_Select(_DEV(Switch) * dev,uint8_t channel);

#ifdef USER_FUN
#endif

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