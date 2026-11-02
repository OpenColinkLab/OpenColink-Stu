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
 * @Date: 2021-10-16 22:31:16
 * @LastEditTime: 2021-10-16 22:33:27
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Dev_Test_A\Library\driver_sol\User_Dev\Inc\pcf_max262.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */


#ifndef __MAX262_PCF_H
#define __MAX262_PCF_H			//Prevent redefinition

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
//程控滤波器模式
#define PCF_MOD_1 0
#define PCF_MOD_2 1
#define PCF_MOD_3 2
#define PCF_MOD_4 3
//通道(只有B通道Q值可调)
#define PCF_CHA 0
#define PCF_CHB 1
//CHA_Qval
#define PCF_CHA_QVAL 63
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
	DEV(MAX262_PCF){

		//Object Port & Pin
		//地址脚
		GPIO_Port a0_port;
		GPIO_Pin  a0_pin;
		GPIO_Port a1_port;
		GPIO_Pin  a1_pin;	
		GPIO_Port a2_port;
		GPIO_Pin  a2_pin;	
		GPIO_Port a3_port;
		GPIO_Pin  a3_pin;

		//数据脚
		GPIO_Port d0_port;
		GPIO_Pin  d0_pin;	
		GPIO_Port d1_port;
		GPIO_Pin  d1_pin;

		//写使能
		GPIO_Port wr_port;
		GPIO_Pin  wr_pin;	
		
		//Basic function pointer in struct
		//(User_Change)
		//delay
	  	void (* MAX262_PCF_Delay) (volatile uint32_t time);
	  	//write_pin
	  	void (* MAX262_PCF_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	  	//read_pin
	  	GPIO_Pin_State (* MAX262_PCF_Read_Pin)  (GPIO_Port gpiox, GPIO_Pin gpio_pin);
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
	typedef void (* MAX262_PCF_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* MAX262_PCF_Write_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* MAX262_PCF_Read_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
	
	//Other function pointer



#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
/**
 * @brief 初始化MAX262
 * @note 
 * platform :432sdk
 * istested :N
 */
extern void SOL_MAX262_PCF_Init(_DEV(MAX262_PCF) * dev,
								MAX262_PCF_Write_Pin_Fun_P write_pin,
								MAX262_PCF_Read_Pin_Fun_P read_pin,
								MAX262_PCF_Delay_Fun_P delay);
/**
 * @brief 写控制程控滤波器
 * @note 
 * input	:/
 *      @param channel
 *      - \b PCF_CHA
 *      - \b PCF_CHB
 *      @param mode
 *      - \b PCF_MOD_1
 *      - \b PCF_MOD_2
 *      - \b PCF_MOD_3
 *      - \b PCF_MOD_4
 *      @param freq_Word 即N,取(0-63)见手册表
 * 		- \b N(0-63) 即N,取(0-63)见手册表
 *      @param q_Word 
 * 		- \b N(0-127) 即N,取(0-127)见手册表
 * 		- \b PCF_CHA_QVAL 注意,若是通道A则写63,否则会进入掉电模式
 * @note 
 * output   :/
		@return None
 * platform :432sdk
 * istested :N
 */
extern void SOL_MAX262_PCF_Write(_DEV(MAX262_PCF) * dev,
								uint8_t channel,
								uint8_t mode,
								uint8_t freq_Word,
								uint8_t q_Word);
/**
 * @brief 掉电/上电程控滤波器(都关闭)
 * @note 
 * output   :/
		@return None
 * change   :/
 * other_dis:上电掉电都是在通道A的Q值寄存器做更改,注意其影响
 * platform :432sdk
 * istested :N
 */
extern void SOL_MAX262_PCF_Shutdown(_DEV(MAX262_PCF) * dev);
/**
 * @brief 掉电/上电程控滤波器(都关闭)
 * @note 
 * output   :/
		@return None
 * change   :/
 * other_dis:上电掉电都是在通道A的Q值寄存器做更改,注意其影响
 * platform :432sdk
 * istested :N
 */
extern void SOL_MAX262_PCF_PWUP(_DEV(MAX262_PCF) * dev);
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