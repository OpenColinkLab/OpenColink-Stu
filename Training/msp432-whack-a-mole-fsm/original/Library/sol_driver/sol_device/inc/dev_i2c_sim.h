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
 * @LastEditTime: 2021-09-16 18:24:56
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Dev\Inc\I2C_Sim.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __I2C_Sim_H
#define __I2C_Sim_H			//Prevent redefinition

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
	//接收应答等待周期数
	#define ACK_WAIT_TIME 10
	//I2C速度
	#define I2C_VLOW_SPEED 2000
	#define I2C_LOW_SPEED 500
	#define I2C_MID_SPEED 100
	#define I2C_HIGH_SPEED 10
	#define I2C_VHIGH_SPEED 1

/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
	ENUM(I2C_Ack_Status){
		I2C_ACK_RECEIVE_FAIL,
		I2C_ACK_RECEIVE_SUCESS
	};

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/
	DEV(I2C_Sim){
		
		//Object properties
		//(User_Change)
		uint32_t speed;
		
		//SCLK(开漏输出,默认高电平)
		GPIO_Port scl_port;
		GPIO_Pin scl_pin;
		//SDA(开漏输出,默认高电平)
		GPIO_Port sda_port;
		GPIO_Pin sda_pin;	
			
		//Basic function pointer in struct
		//(User_Change)
		//delay
	  	void (* I2C_Delay) (volatile uint32_t time);
	  	//write_pin
	  	void (* I2C_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	  	//read_pin
	  	GPIO_Pin_State (* I2C_Read_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
		
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
	typedef void (* I2C_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* I2C_Write_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* I2C_Read_Pin_Fun_P)  (GPIO_Port gpiox, GPIO_Pin gpio_pin);
	
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
extern _DEV(I2C_Sim) i2c_for_at24;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/

	//I2C初始化
	extern void SOL_I2C_Init(_DEV(I2C_Sim) * dev,
				  		I2C_Write_Pin_Fun_P i2c_pin_write,
				  		I2C_Read_Pin_Fun_P i2c_pin_read,
				  		I2C_Delay_Fun_P i2c_delay);
	//I2C开始
	extern void __SOL_I2C_Start(_DEV(I2C_Sim) * dev);
	//I2C停止
	extern void __SOL_I2C_Stop(_DEV(I2C_Sim) * dev);
	//I2C发送应答
	extern void __SOL_I2C_Ack(_DEV(I2C_Sim) * dev);
	//I2C发送非应答
	extern void __SOL_I2C_NAck(_DEV(I2C_Sim) * dev);
	//I2C等待应答
	extern _ENUM(I2C_Ack_Status) __SOL_I2C_Wait_Ack(_DEV(I2C_Sim) * dev, uint32_t timeout);
	//I2C写字节
	extern void __SOL_I2C_Write_Byte(_DEV(I2C_Sim) * dev, uint8_t dat);
	//I2C读字节
	extern uint8_t __SOL_I2C_Read_Byte(_DEV(I2C_Sim) * dev);
	
	//I2C连写(带应等待)
	extern void __SOL_I2C_Write(_DEV(I2C_Sim) * dev, 
					 			const uint8_t * tx_dat, 
					 			uint16_t dat_num);
	/**
	 * @note 
	 * fun_name :__SOL_I2C_Read
	 * describe :I2C连读带应答&末位发送非应答
	 * 
	 * input	:/
	 *      @param dev
	 *      @param rx_dat
	 * 	 	@param dat_num
	 * @note 
	 * output   :/
	 * change   :/
	 * other_dis:/
	 * platform :
	 * istested :N
	 */
	extern void __SOL_I2C_Read(_DEV(I2C_Sim) * dev, 
					   uint8_t * rx_dat, 
					   uint16_t dat_num);
	
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

