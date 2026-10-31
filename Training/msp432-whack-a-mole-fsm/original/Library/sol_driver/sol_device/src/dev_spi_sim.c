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
 * @Date: 2022-04-23 12:38:08
 * @LastEditTime: 2022-04-24 21:12:17
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_spi_sim.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "dev_spi_sim.h"
#include "bsp_delay.h"
#ifdef MSP432_SDK_PLATFORM
	#include "driverlib.h"
#endif
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
_DEV(SPI_Sim) g_spiForW25q = {0};
_DEV(SPI_Sim) g_spiFor5638 = {0};
/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/

//SCLK管脚写
static void __SPI_SCLK(_DEV(SPI_Sim) * dev, GPIO_Pin_State op);
//MOSI管脚写
static void __SPI_MOSI(_DEV(SPI_Sim) * dev, GPIO_Pin_State op);
//MISO管脚读
static uint8_t __SPI_MISO(_DEV(SPI_Sim) * dev);

//SPI写字节
static void __SPI_Write_Byte_0(_DEV(SPI_Sim) * dev, uint8_t dat);
static void __SPI_Write_Byte_1(_DEV(SPI_Sim) * dev, uint8_t dat);
static void __SPI_Write_Byte_2(_DEV(SPI_Sim) * dev, uint8_t dat);
static void __SPI_Write_Byte_3(_DEV(SPI_Sim) * dev, uint8_t dat);
//SPI读字节
static uint8_t __SPI_Read_Byte_0(_DEV(SPI_Sim) * dev);
static uint8_t __SPI_Read_Byte_1(_DEV(SPI_Sim) * dev);
static uint8_t __SPI_Read_Byte_2(_DEV(SPI_Sim) * dev);
static uint8_t __SPI_Read_Byte_3(_DEV(SPI_Sim) * dev);
//SPI管脚初始化
static void SPI_Pin_Init(_DEV(SPI_Sim) * dev);

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/
/*
* 名    称:__SPI_xPIN
* 功    能:操作标准SPI引脚电平
* 入口参数:(_DEV(SPI_Sim) * dev,SPI设备)
		   (xPIN_Typedef op,操作数)
* 额外说明:这个函数可能会报错,是因为操作数op的类型转换
		   GPIO_Pin_State 可能不匹配,换成uint8_t就行
*/
//SCLK
static void __SPI_SCLK(_DEV(SPI_Sim) * dev, GPIO_Pin_State op){
		dev->SPI_Write_Pin(dev->sclk_port,dev->sclk_pin, op);
}
//MOSI
static void __SPI_MOSI(_DEV(SPI_Sim) * dev, GPIO_Pin_State op){
		dev->SPI_Write_Pin(dev->mosi_port,dev->mosi_pin, op);
}
//MISO
static uint8_t __SPI_MISO(_DEV(SPI_Sim) * dev){
	uint8_t receive = 0;
	
	receive = dev->SPI_Read_Pin(dev->miso_port,dev->miso_pin);
	return (receive);
}


/*
* 名    称:SPI_Write_Byte_x
* 功    能:SPI分模式写字节
* 入口参数:(_DEV(SPI_Sim) * dev, SPI设备)
		   (uint8_t dat, 传输字节)
*/
//SPI_MOD_0
static void __SPI_Write_Byte_0(_DEV(SPI_Sim) * dev, uint8_t dat){
	uint8_t index = 0;
	
	for (index = 0; index < 8; index++)
	{
		__SPI_SCLK(dev, 0);
		if (dat & 0x80)
			__SPI_MOSI(dev, 1);
		else
			__SPI_MOSI(dev, 0);
		dev->SPI_Delay(dev->spi_speed);
		__SPI_SCLK(dev, 1);//拉低锁存数据
		dev->SPI_Delay(dev->spi_speed);
		dat <<= 1;
	}
	__SPI_SCLK(dev, 0);//在此回归本模式默认电平
}
//SPI_MOD_1
static void __SPI_Write_Byte_1(_DEV(SPI_Sim) * dev, uint8_t dat){
	uint8_t index = 0;
	
	__SPI_SCLK(dev, 1);
	for (index = 0; index < 8; index++)
	{
		if (dat & 0x80)
			__SPI_MOSI(dev, 1);
		else
			__SPI_MOSI(dev, 0);
		
		dev->SPI_Delay(dev->spi_speed);	
		__SPI_SCLK(dev, 0);//拉低锁存数据
		if(index == 7){
			dev->SPI_Delay(dev->spi_speed);
			break;//在此回归本模式默认电平
		}
		dev->SPI_Delay(dev->spi_speed);
		__SPI_SCLK(dev, 1);
		dat <<= 1;
	}		
}
//SPI_MOD_2
static void __SPI_Write_Byte_2(_DEV(SPI_Sim) * dev, uint8_t dat){
	uint8_t index = 0;
	
	for (index = 0; index < 8; index++)
	{
		if (dat & 0x80)
			__SPI_MOSI(dev, 1);
		else
			__SPI_MOSI(dev, 0);
		
		dev->SPI_Delay(dev->spi_speed);	
		__SPI_SCLK(dev, 0);//拉低锁存数据
		dev->SPI_Delay(dev->spi_speed);
		__SPI_SCLK(dev, 1);//在此回归本模式默认电平
		dat <<= 1;
	}	
}
//SPI_MOD_3
static void __SPI_Write_Byte_3(_DEV(SPI_Sim) * dev, uint8_t dat){
	uint8_t index = 0;
	
	for (index = 0; index < 8; index++)
	{
		__SPI_SCLK(dev, 0);
		if (dat & 0x80)
			__SPI_MOSI(dev, 1);
		else
			__SPI_MOSI(dev, 0);
		dev->SPI_Delay(dev->spi_speed);
		__SPI_SCLK(dev, 1);//拉高锁存数据并在此回归本模式默认电平
		dev->SPI_Delay(dev->spi_speed);
		dat <<= 1;
	}
}

/*
* 名    称:SPI_Read_Byte_x
* 功    能:SPI分模式读字节
* 入口参数:(_DEV(SPI_Sim) * dev, SPI设备)
* 出口参数:(uint8_t receive, 读到的字节)
*/
static uint8_t __SPI_Read_Byte_0(_DEV(SPI_Sim) * dev){
	uint8_t receive = 0;
	uint8_t index = 0;
	
	for (index = 0; index < 8; index++)
	{
		__SPI_SCLK(dev, 1);
		dev->SPI_Delay(dev->spi_speed);
		receive <<= 1;
		receive |= __SPI_MISO(dev);//读数
		__SPI_SCLK(dev, 0);//拉低等待下次拉高并在此回归本模式默认电平	
		dev->SPI_Delay(dev->spi_speed);
	}
	
	return(receive);
}
static uint8_t __SPI_Read_Byte_1(_DEV(SPI_Sim) * dev){
	uint8_t receive = 0;
	uint8_t index = 0;
	
	__SPI_SCLK(dev, 1);
	for (index = 0; index < 8; index++)
	{
		
		dev->SPI_Delay(dev->spi_speed);
		__SPI_SCLK(dev, 0);
		dev->SPI_Delay(dev->spi_speed);
		receive <<= 1;
		receive |= __SPI_MISO(dev);//读数
		if(index == 7){
			dev->SPI_Delay(dev->spi_speed);
			break;
		}
		__SPI_SCLK(dev, 1);
		dev->SPI_Delay(dev->spi_speed);
	}
	
	return(receive);
}
static uint8_t __SPI_Read_Byte_2(_DEV(SPI_Sim) * dev){
	uint8_t receive = 0;
	uint8_t index = 0;
	
	for (index = 0; index < 8; index++)
	{
		__SPI_SCLK(dev, 0);
		dev->SPI_Delay(dev->spi_speed);
		receive <<= 1;
		receive |= __SPI_MISO(dev);//读数
		__SPI_SCLK(dev, 1);//拉低等待下次拉高并在此回归本模式默认电平	
		dev->SPI_Delay(dev->spi_speed);
	}
	
	return(receive);
}
static uint8_t __SPI_Read_Byte_3(_DEV(SPI_Sim) * dev){
	uint8_t receive = 0;
	uint8_t index = 0;
	
	for (index = 0; index < 8; index++)
	{
		__SPI_SCLK(dev, 0);
		dev->SPI_Delay(dev->spi_speed);
		receive <<= 1;
		receive |= __SPI_MISO(dev);//读数
		__SPI_SCLK(dev, 1);//拉低等待下次拉高并在此回归本模式默认电平	
		dev->SPI_Delay(dev->spi_speed);
	}
	
	return(receive);
}

/*
* 名    称:SPI_Pin_Init
* 功    能:设置初始引脚电平
* 入口参数:(_DEV(SPI_Sim) * dev, SPI设备)
*/
static void SPI_Pin_Init(_DEV(SPI_Sim) * dev){
	switch(dev->spi_mod){
		case SPI_MOD_0 : 
			__SOL_SPI_CS(dev,CS_DISEN);//先不要片选,否则扰乱时序
			__SPI_SCLK(dev,0);
			break;
		case SPI_MOD_1 : 
			__SOL_SPI_CS(dev,CS_DISEN);
			__SPI_SCLK(dev,0);
			break;		
		case SPI_MOD_2 : 
			__SOL_SPI_CS(dev,CS_DISEN);
			__SPI_SCLK(dev,1);
			break;		
		case SPI_MOD_3 : 
			__SOL_SPI_CS(dev,CS_DISEN);
			__SPI_SCLK(dev,1);
			break;
		default : 
		#ifdef SPI_HW_USED
			#ifdef STM32_HAL_PLATFORM
				//在STM32HAL_Device下SCLK会自动设置,但是一般用软件片选,所以先不片选
				__SOL_SPI_CS(dev,CS_DISEN);
			#endif
		#endif
			break;
	}
}


/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/*
* 名    称:SOL_SPI_Init
* 功    能:用于设置不同模式的初始状态和结构体初始化
* 入口参数:(_DEV(SPI_Sim) * dev, SPI设备)
		   (SPI_Write_Pin_Fun_P spi_pin_write, 自定义引脚写函数)
		   (SPI_Read_Pin_Fun_P spi_pin_read, 自定义引脚读函数)
		   (SPI_Delay_Fun_P spi_delay, 自定义延时)
* 额外说明:实用软件模拟时硬件函数指针传NULL,反之亦然
*/
	void SOL_SPI_Init(_DEV(SPI_Sim) * dev, 
				  SPI_Write_Pin_Fun_P spi_pin_write, 
				  SPI_Read_Pin_Fun_P spi_pin_read,
	#ifdef SPI_HW_USED
		#ifdef STM32_HAL_PLATFORM
					  SPI_Write_HAL_Fun_P hal_spi_transmit,
					  SPI_Read_HAL_Fun_P hal_spi_receive,
		#endif
	#endif
				  SPI_Delay_Fun_P spi_delay){
	/*结构体初始化*/			    
		dev->SPI_Write_Pin = spi_pin_write;
		dev->SPI_Read_Pin = spi_pin_read;
	#ifdef SPI_HW_USED
		#ifdef STM32_HAL_PLATFORM
			dev->SPI_Write_HAL = hal_spi_transmit;
			dev->SPI_Read_HAL = hal_spi_receive;
		#endif
	#endif
		dev->SPI_Delay = spi_delay;
		
		/*初始管脚电平*/
		SPI_Pin_Init(dev);
}

/*
* 名    称:__SOL_SPI_Write_Byte
* 功    能:SPI写一个字节
* 入口参数:(_DEV(SPI_Sim) * dev, SPI设备)
		   (uint8_t dat, 数据)
*/
void __SOL_SPI_Write_Byte(_DEV(SPI_Sim) * dev, uint8_t dat){
	switch(dev -> spi_mod){
		case SPI_MOD_0 : __SPI_Write_Byte_0(dev, dat); break;
		case SPI_MOD_1 : __SPI_Write_Byte_1(dev, dat); break;
		case SPI_MOD_2 : __SPI_Write_Byte_2(dev, dat); break;
		case SPI_MOD_3 : __SPI_Write_Byte_3(dev, dat); break;
		default : break;
	}
}
/*
* 名    称:__SOL_SPI_Read_Byte
* 功    能:SPI读一个字节
* 入口参数:(_DEV(SPI_Sim) * dev, SPI设备)
* 出口参数:(uint8_t receive,接收到的数据)
*/
uint8_t __SOL_SPI_Read_Byte(_DEV(SPI_Sim) * dev){
	uint8_t receive = 0;
	
	switch(dev -> spi_mod){
		case SPI_MOD_0 : receive = __SPI_Read_Byte_0(dev); break;
		case SPI_MOD_1 : receive = __SPI_Read_Byte_1(dev); break;
		case SPI_MOD_2 : receive = __SPI_Read_Byte_2(dev); break;
		case SPI_MOD_3 : receive = __SPI_Read_Byte_3(dev); break;
		default : break;
	}
	
	return (receive);
}

/*
* 名    称:__SOL_SPI_Write
* 功    能:SPI连写
* 入口参数:(_DEV(SPI_Sim) * dev, SPI设备)
		   (uint8_t* dat_arr, 将写数组)
		   (uint16_t dat_num, 将写数组长度)
* 额外说明:单纯连写,别往里加CS！*/
void __SOL_SPI_Write(_DEV(SPI_Sim) * dev, const uint8_t* tx_arr, GPIO_Pin dat_num){
	uint16_t index = 0;

	switch(dev->spi_mod){
		case SPI_MOD_0 : ;
		case SPI_MOD_1 : ;
		case SPI_MOD_2 : ;
		case SPI_MOD_3 : 
			{
				for(index = 0; index < dat_num; index ++){
					__SOL_SPI_Write_Byte(dev,tx_arr[index]);
				}
			}
			break;
		
		default : 
		#ifdef SPI_HW_USED
			#ifdef STM32_HAL_PLATFORM
				dev->SPI_Write_HAL(dev->hspi_used,(uint8_t *)tx_arr,dat_num,100);
			#endif
		#endif
			break;
	}
}

/*
* 名    称:__SOL_SPI_Read
* 功    能:SPI连读
* 入口参数:(_DEV(SPI_Sim) * dev, SPI设备)
		   (uint8_t* rec_arr, 读数组缓冲区)
		   (uint16_t dat_num, 要读数组长度)
* 额外说明:单纯连读,别往里加CS！
*/
void __SOL_SPI_Read(_DEV(SPI_Sim) * dev, uint8_t* rx_arr, GPIO_Pin dat_num){
	uint16_t index = 0;
	
	switch(dev->spi_mod){
		case SPI_MOD_0 : ;
		case SPI_MOD_1 : ;
		case SPI_MOD_2 : ;
		case SPI_MOD_3 : 
			{
				for(index = 0; index < dat_num; index ++){
					rx_arr[index] = __SOL_SPI_Read_Byte(dev);
				}
			}
			break;
		
		default : 
		#ifdef SPI_HW_USED
			#ifdef STM32_HAL_PLATFORM
				dev->SPI_Read_HAL(dev->hspi_used,rx_arr,dat_num,100);
			#endif
		#endif
			break;
	}
}

/*
* 名    称:__SOL_SPI_xPIN
* 功    能:操作标准SPI引脚电平
* 入口参数:(_DEV(SPI_Sim) * dev,SPI设备)
		   (xPIN_Typedef op,操作数)
*/
//CS
void __SOL_SPI_CS(_DEV(SPI_Sim) * dev, _ENUM(CS_State) op){
		dev->SPI_Write_Pin(dev->cs_port,dev->cs_pin, !op);
}
