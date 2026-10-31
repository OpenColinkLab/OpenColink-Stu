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
 * @LastEditTime: 2021-09-16 20:12:06
 * @LastEditors: Chsier
 * @Description: 模拟SPI驱动头文件
 * @Version: v_alpha
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Dev\Inc\SPI_Sim.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef __SPI_Sim_H
#define __SPI_Sim_H

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

#ifdef STM32_HAL_PLATFORM
	#include "gpio.h"
	#include "main.h"
	#ifdef SPI_HW_USED
		#include "spi.h"
		#include "stm32f4xx_hal.h"
	#endif
#endif
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
/*SPI速度定义*/
//(User_Change)
	#ifdef STM32_168MHZ	//实际上IO时钟只有84MHz
		#define SPI_VHIGH_SPEED 	1			//1.7Mb/s
		#define SPI_HIGH_SPEED 		10			//709kb/s
		#define SPI_MID_SPEED 		100			//112.22Kb/s
		#define SPI_LOW_SPEED 		200			//58Kb/s
		#define SPI_VLOW_SPEED 		500			//23.7Kb/s
		#define SPI_FLEXIBLE_SPEED 	2000  	//6.2kb/s
	#endif
	#ifdef MSP432_48MHZ	//未测试
		#define SPI_VHIGH_SPEED 	1		//1.7Mb/s
		#define SPI_HIGH_SPEED 		1		//709kb/s
		#define SPI_MID_SPEED 		1		//112.22Kb/s
		#define SPI_LOW_SPEED 		1		//58Kb/s
		#define SPI_VLOW_SPEED 		1		//23.7Kb/s
		#define SPI_FLEXIBLE_SPEED 	1  		//6.2kb/s
	#endif

/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/
/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
/*相关枚举定义*/

	//SPI模式枚举
	ENUM(SPI_MOD){
		MOD_0,
		MOD_1,
		MOD_2,
		MOD_3
	};
	//片选枚举定义
	ENUM(CS_State) {
		CS_DISEN,
		CS_EN
	};
	//SPI_MOD枚举定义
	ENUM(SPI_Sim_Mod) {
		SPI_MOD_0,
		SPI_MOD_1,
		SPI_MOD_2,
		SPI_MOD_3,
		//硬件模式(用于不同平台的硬件SPI以获得更快速度)
		SPI_MOD_HW0,
		SPI_MOD_HW1,
		SPI_MOD_HW2,
		SPI_MOD_HW3	
	};
/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/

	DEV(SPI_Sim) {
	  //MISO(输入模式)
	  GPIO_Port miso_port;		 
	  GPIO_Pin miso_pin;		
	  //MOSI(推挽输出下拉)
	  GPIO_Port mosi_port;		 
	  GPIO_Pin mosi_pin;
	  //CS片选接口(推挽输出上拉)
	  GPIO_Port cs_port;		 
	  GPIO_Pin cs_pin;
	  //SCLK时钟接口(推挽输出无上下拉)
	  GPIO_Port sclk_port;		 
	  GPIO_Pin sclk_pin;
	  
	  //SPI速度
	  uint32_t spi_speed;
	  //SPI模式
	  SPI_Sim_Mod_Typedef spi_mod;
	  //使用STM32HAL硬件SPI时传入的结构体参数
#ifdef SPI_HW_USED
	#ifdef STM32_HAL_PLATFORM
		  SPI_HandleTypeDef * hspi_used;
	#endif
#endif
	//结构体内函数指针
	//(User_Change)	
	
	  //SPI延时函数
	  void (* SPI_Delay) (volatile uint32_t time);
	  //SPI引脚状态改变函数
	  void (* SPI_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	  //SPI读引脚状态函数
	  GPIO_Pin_State (* SPI_Read_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
	  //*这里是根据实际的硬件平台来改的
#ifdef SPI_HW_USED
	#ifdef STM32_HAL_PLATFORM
		  //HAL库的非DMA SPI阻塞发送函数
		  HAL_StatusTypeDef (*SPI_Write_HAL)(SPI_HandleTypeDef *hspi, uint8_t *pData, GPIO_Pin Size, uint32_t Timeout);
		  //HAL库的非DMA SPI阻塞接收函数
		  HAL_StatusTypeDef (*SPI_Read_HAL)(SPI_HandleTypeDef *hspi, uint8_t *pData, GPIO_Pin Size, uint32_t Timeout);
	#endif
#endif
	
	};
/*-------------------------------------------------------*\
			   Support pointer definition
\*-------------------------------------------------------*/
//(User_Change)
/*It is mainly used for the declaration in init function, 
  and then the function pointer in the structure can be 
  assigned*/

	//SPI延时(默认为SOL_Delay)
	typedef void (* SPI_Delay_Fun_P) (volatile uint32_t time);
	//SPI写管脚(默认为HAL库写)
	typedef void (* SPI_Write_Pin_Fun_P) (GPIO_Port GPIOx, GPIO_Pin GPIO_Pin, GPIO_Pin_State PinState);
	//SPI读管脚(默认为HAL库读)
	typedef GPIO_Pin_State (* SPI_Read_Pin_Fun_P) (GPIO_Port GPIOx, GPIO_Pin GPIO_Pin);

  //*这里是根据实际的硬件平台来改的
#ifdef STM32_HAL_PLATFORM 
	#ifdef SPI_HW_USED
		//HAL库的非DMA SPI阻塞发送函数
		typedef HAL_StatusTypeDef (*SPI_Write_HAL_Fun_P)(SPI_HandleTypeDef *hspi, uint8_t *pData, GPIO_Pin Size, uint32_t Timeout);
		//HAL库的非DMA SPI阻塞接收函数
		typedef HAL_StatusTypeDef (*SPI_Read_HAL_Fun_P)(SPI_HandleTypeDef *hspi, uint8_t *pData, GPIO_Pin Size, uint32_t Timeout);
	#endif
#endif
#ifdef MSP432_SDK_PLATFORM 
	#ifdef SPI_HW_USED

	#endif
#endif	

/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
extern _DEV(SPI_Sim) g_spiForW25q;
extern _DEV(SPI_Sim) g_spiFor5638;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
	//SPI初始化
#ifdef STM32_HAL_PLATFORM
	void SOL_SPI_Init(_DEV(SPI_Sim) * dev, 
				  SPI_Write_Pin_Fun_P spi_pin_write, 
				  SPI_Read_Pin_Fun_P spi_pin_read,
	#ifdef SPI_HW_USED
				  SPI_Write_HAL_Fun_P hal_spi_write,
				  SPI_Read_HAL_Fun_P hal_spi_read,				 
	#endif 
				  SPI_Delay_Fun_P spi_delay);
#endif
#ifdef MSP432_SDK_PLATFORM
		void SOL_SPI_Init(_DEV(SPI_Sim) * dev, 
					  SPI_Write_Pin_Fun_P spi_pin_write, 
				  	  SPI_Read_Pin_Fun_P spi_pin_read,
				  	  SPI_Delay_Fun_P spi_delay);
#endif

	//SPI写字节
	extern void __SOL_SPI_Write_Byte(_DEV(SPI_Sim) * dev, uint8_t dat);
	//SPI读字节
	extern uint8_t __SOL_SPI_Read_Byte(_DEV(SPI_Sim) * dev);	
	//连写
	extern void __SOL_SPI_Write(_DEV(SPI_Sim) * dev, const uint8_t* tx_arr, GPIO_Pin dat_num);
	//连读
	extern void __SOL_SPI_Read(_DEV(SPI_Sim) * dev, uint8_t * rx_arr, GPIO_Pin dat_num);
	//SPI片选
	extern void __SOL_SPI_CS(_DEV(SPI_Sim) * dev, _ENUM(CS_State) op);
	
	
	#ifdef __cplusplus
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



/*相关快速使用文档,便于直接复制*/
  //软件
//	spi_test.cs_pin = CS_Pin;
//	spi_test.cs_port = CS_GPIO_Port;
//	spi_test.miso_pin = MISO_Pin;
//	spi_test.miso_port = MISO_GPIO_Port;
//	spi_test.mosi_pin = MOSI_Pin;
//	spi_test.mosi_port = MOSI_GPIO_Port;
//	spi_test.sclk_pin = SCLK_Pin;
//	spi_test.sclk_port = SCLK_GPIO_Port;
//	spi_test.spi_mod = SPI_MOD_0;
//	spi_test.spi_speed = SPI_MID_SPEED;
//	开启硬件兼容时软件的初始化方法
//	SPI_Init(&spi_test,HAL_GPIO_WritePin,HAL_GPIO_ReadPin,NULL,NULL,Gen_Delay);
//	关闭硬件兼容时软件的初始化方法
//	SPI_Init(&spi_test,HAL_GPIO_WritePin,HAL_GPIO_ReadPin,Gen_Delay);

	
  //硬件(官方F407板因硬件电路接线无法测试)
//	spi_test.cs_pin = CS_Pin;
//	spi_test.cs_port = CS_GPIO_Port;
//	spi_test.spi_mod = SPI_MOD_HW0;
//	spi_test.hspi_used = &hspi2;
//	开启硬件兼容时硬件的初始化方法
//	SPI_Init(&spi_test,HAL_GPIO_WritePin,HAL_GPIO_ReadPin,HAL_SPI_Transmit,HAL_SPI_Receive,Gen_Delay);