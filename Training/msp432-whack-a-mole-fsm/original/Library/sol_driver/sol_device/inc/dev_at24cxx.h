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
 * @Date: 2021-10-13 13:22:16
 * @LastEditTime: 2021-10-14 11:20:44
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Dev_Test_A\Library\driver_sol\User_Dev\Inc\at24cxx.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __AT24CXX_H
#define __AT24CXX_H			//Prevent redefinition

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
	
#ifdef MSP432_SDK_PLATFORM
	#include "dev_i2c_sim.h"
#endif
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/


/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
	ENUM(AT24Cxx_Type){
			AT24C02,
			AT24C04,
			AT24C08,
			AT24C16,
			AT24C32,	
			AT24C64,
			AT24C128,
			AT24C256
		};
#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/
	DEV(AT24Cxx){
		
		//使用到的I2C
		_DEV(I2C_Sim) * i2c_used;
		//器件地址
		uint8_t addr;
		//器件类型
		_ENUM(AT24Cxx_Type) type;	
		
		//AT24Cxx延时函数
		void (*AT24Cxx_Delay) (volatile uint32_t time);
		//AT24Cxx引脚状态改变函数
		void (*AT24Cxx_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
		//AT24Cxx读引脚状态函数
		GPIO_Pin_State (*AT24Cxx_Read_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
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
	typedef void (* AT24Cxx_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* AT24Cxx_Write_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* AT24Cxx_Read_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
	
	//Other function pointer


/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
extern _DEV(AT24Cxx) at24_used;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/

	extern void SOL_AT24Cxx_Init(_DEV(AT24Cxx) * dev,
						AT24Cxx_Write_Pin_Fun_P write_pin,
						AT24Cxx_Read_Pin_Fun_P read_pin,
						AT24Cxx_Delay_Fun_P delay);
	//连写
	extern void SOL_AT24Cxx_Write(_DEV(AT24Cxx) * dev, 
					   const uint8_t * tx_dat, 
					   uint16_t mem_addr, 
					   uint8_t byte_num, 
					   uint16_t dat_num);
	//连读
	extern void SOL_AT24Cxx_Read(_DEV(AT24Cxx) * dev, 
						uint8_t * rx_dat, 
						uint16_t mem_addr, 
						uint8_t byte_num, 
						uint16_t dat_num);
	//单读
	extern uint8_t SOL_AT24Cxx_Read_Byte(_DEV(AT24Cxx) * dev , uint16_t mem_addr);
	//单写
	extern void SOL_AT24Cxx_Write_Byte(_DEV(AT24Cxx) * dev , uint16_t mem_addr , uint8_t dat);	

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