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
 * @Date: 2021-09-21 15:33:56
 * @LastEditTime: 2021-09-21 15:38:39
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_Dev\Inc\relay.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __RELAY_H
#define __RELAY_H		//Prevent redefinition

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

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/

    DEV(Relay){
        GPIO_Port relay_port;
        GPIO_Pin relay_pin;

		//Basic function pointer in struct
		//(User_Change)
		//delay
	  	void (* Relay_Delay) (volatile uint32_t time);
	  	//write_pin
	  	void (* Relay_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	  	//read_pin
	  	GPIO_Pin_State (* Relay_Read_Pin)  (GPIO_Port gpiox, GPIO_Pin gpio_pin);
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
	typedef void (* Relay_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* Relay_Write_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* Relay_Read_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
	
#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/

	extern void SOL_Relay_Init(_DEV(Relay) * dev, Relay_Write_Pin_Fun_P write_pin, Relay_Read_Pin_Fun_P read_pin, Relay_Delay_Fun_P delay);
    /*相关函数定义*/
    extern void SOL_Relay_Ctr(_DEV(Relay) * dev , GPIO_Pin_State state);

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
