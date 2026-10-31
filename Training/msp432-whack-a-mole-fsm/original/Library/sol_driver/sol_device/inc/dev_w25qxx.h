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
 * @LastEditTime: 2021-09-17 16:54:02
 * @LastEditors: Chsier
 * @Description: w25qxx驱动头文件
 * @Version: v_alpha
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Dev\Inc\w25qxx.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __W25QXX_H
#define __W25QXX_H

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
	#include "dev_spi_sim.h"
#endif
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
		//W25X系列/Q系列芯片ID表
		#define W25Q80 	0XEF13
		#define W25Q16 	0XEF14
		#define W25Q32 	0XEF15
		#define W25Q64 	0XEF16
		#define W25Q128 0XEF17
		#define W25Q256 0XEF18

		//Standard SPI Instructions(标准SPI指令)
		#define W25Qxx_DUMMY      					0x00	//伪字

		#define W25Qxx_WRITE_EN      				0x06	//写使能
		#define W25Qxx_WRITE_DISEN     				0x04	//写失能
		#define	W25Qxx_VOL_SR_WRITE_EN    			0x50	//易失性写使能

		#define W25Qxx_RELEASE_POWER_DOWN 			0xAB	//唤醒
		#define W25Qxx_DEV_ID         				0xAB	//器件ID读取
		#define W25Qxx_MFTR_OR_DEV_ID 				0x90	//制造商/器件ID读取
		#define W25Qxx_JEDEC_ID    					0x9F	//JEDEC标准ID
		#define W25Qxx_UNIC_ID						0X4B	//惟一ID读取

		#define W25Qxx_READ_DATA        			0x03	//读数据
		#define W25Qxx_FREAD_DATA     				0x0B	//快速读数据

		#define W25Qxx_PROGRAM_PAGE      			0x02	//页编程

		#define W25Qxx_ERASE_SECTOR      			0x20	//4K扇区擦除
//		#define W25Qxx_ERASE_BLOCK32K     			0x52	//32K块擦除		
//		#define W25Qxx_ERASE_BLOCK64K    			0xD8	//64K块擦除
		#define W25Qxx_ERASE_CHIP        			0xC7	//片擦除

		#define W25Qxx_READ_SR1  		 			0x05	//读状态寄存器1
		#define W25Qxx_READ_SR2   					0x35	//读状态寄存器2
		#define W25Qxx_READ_SR3   					0x15	//读状态寄存器3
		#define W25Qxx_WRITE_SR1  					0x01	//写状态寄存器1
		#define W25Qxx_WRITE_SR2  					0x31	//写状态寄存器2
		#define W25Qxx_WRITE_SR3  					0x11	//写状态寄存器3

//		//不常用寄存器
//		#define W25Qxx_READ_SFDP_REG				0x5A	//...
//		#define W25Qxx_ERASE_SEC_REG				0x44	//...
//		#define W25Qxx_READ_SEC_REG					0x48	//...
//		#define W25Qxx_PROGRAM_SEC_REG				0x42	//...

//		//锁定相关(没事别乱用)
//		#define W25Qxx_LOCK_GLOB_BLOCK				0x7E	//...
//		#define W25Qxx_UNLOCK_GLOB_BLOCK			0x98	//...
//		#define W25Qxx_LOCK_INDI_BLOCK				0x36	//...
//		#define W25Qxx_UNLOCK_INDI_BLOCK			0x39	//...
//		#define W25Qxx_READ_BLOCK_LOCK				0x3D	//...
//		#define W25Qxx_LOCK_SR_FOREVER  			0x55	//永久锁定状态寄存器,慎用

		#define W25Qxx_ERASE_OR_PROGRAM_PAUSE		0x75	//擦除或编程工作暂停
		#define W25Qxx_ERASE_OR_PROGRAM_RESUME		0x7A	//擦除或编程工作恢复
		#define W25Qxx_POWER_DOWN        			0xB9	//掉电

//		#define W25Qxx_RST_EN						0x66	//复位使能
//		#define W25Qxx_RST							0x99	//复位



		//Dual/Quad SPI Instructions(双/四线SPI指令)
		//FPGA上使用较多,此处不用
// 		#define W25Qxx_FREAD_OP_DUAL    			0x3B

//		#define W25Qxx_FREAD_IO_DUAL				0xBB
//		#define W25Qxx_MFTR_OR_DEV_ID_DUAL 			0x92	

//		#define W25Qxx_PROGRAM_PAGE_QUAD			0x32
//		#define W25Qxx_FREAD_OP_QUAD				0x6B

//		#define W25Qxx_MFTR_OR_DEV_ID_QUAD			0x94
//		#define W25Qxx_FREAD_IO_QUAD				0xEB
//		#define W25Qxx_BRUST_SET					0x77

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
		//写保护枚举
		ENUM(W25Qxx_WP){
			W25Qxx_WP_DISEN,
			W25Qxx_WP_EN		
		};
		
		//状态保持枚举
		ENUM(W25Qxx_HD){
			W25Qxx_NHOLD,
			W25Qxx_HOLD
		};

		//检查警告枚举
		ENUM(W25Qxx_Check){
			CHECK_WARNING,
			CHECK_OK
		};
#ifdef USER_FUN
#endif


/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/

	DEV(W25Qxx){
	//Object properties
	//(User_Change)
		//型号
		uint16_t w25qxx_type;
		//芯片ID(用在读取ID上)
		uint16_t w25qxx_id;
		//使用的SPI
		_DEV(SPI_Sim) * spi_used;
		//WP 写保护管脚
		GPIO_Port wp_port;
		GPIO_Pin  wp_pin;
		//HOLD 保持管脚
		GPIO_Port hold_port;
		GPIO_Pin hold_pin;
	
	//结构体内函数指针
		//Basic function pointer in struct
		//(User_Change)
		//delay
		void (* W25Qxx_Delay) (volatile uint32_t time);
		//write_pin
		void (* W25Qxx_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
		//read_pin
		GPIO_Pin_State (* W25Qxx_Read_Pin)  (GPIO_Port gpiox, GPIO_Pin gpio_pin);
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
	typedef void (* W25Qxx_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* W25Qxx_Write_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* W25Qxx_Read_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
	
	//Other function pointer

/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
extern _DEV(W25Qxx) w25q_table;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
		//W25QXX初始化
		void SOL_W25Qxx_Init(_DEV(W25Qxx) * dev);
		//读取ID
		uint16_t SOL_W25Qxx_Read_ID(_DEV(W25Qxx) * dev);
		//读取状态寄存器
		uint8_t SOL_W25Qxx_Read_SR(_DEV(W25Qxx) * dev ,uint8_t reg_num);
		//写状态寄存器
		void SOL_W25Qxx_Write_SR(_DEV(W25Qxx) *dev, uint8_t dat, uint8_t reg_num);
		//任意位宽读
		void SOL_W25Qxx_Read(_DEV(W25Qxx) * dev, 
						uint8_t *p_buffer, 
						uint32_t read_addr, 
						uint8_t byte_num ,
						uint16_t dat_num);
		//任意位宽有校验写
		void SOL_W25Qxx_Write(_DEV(W25Qxx) * dev, 
						 const uint8_t *p_buffer, 
						 uint32_t write_addr, 
						 uint8_t byte_num , 
						 uint16_t dat_num);
		//整片擦除
		void SOL_W25Qxx_Erase_Chip(_DEV(W25Qxx) * dev);
		//扇区擦除
		void SOL_W25Qxx_Erase_Sector(_DEV(W25Qxx) * dev, uint32_t addr);
		//任意位宽无校验写(主要用于学习模式)
		void SOL_W25Qxx_Write_Only(_DEV(W25Qxx) * dev, 
							   const uint8_t *p_buffer, 
							   uint32_t write_addr, 
							   uint8_t byte_num , 
							   uint16_t dat_num);	

    #ifdef __cplusplus
    }
    #endif
#endif
