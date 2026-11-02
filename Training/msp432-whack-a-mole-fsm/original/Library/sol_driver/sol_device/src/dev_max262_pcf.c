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
 * @LastEditTime: 2022-04-24 21:12:02
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_max262_pcf.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "dev_max262_pcf.h"
#ifdef MSP432_SDK_PLATFORM
	#include "driverlib.h"
#endif
	#include "bsp_delay.h"
/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			     Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/
/* 对程控滤波器MAX262写一次6位控制字 */
static void MAX262_PCF_Write_Once(_DEV(MAX262_PCF) * dev, uint8_t dat);
/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/
/* 具体控制字见手册表 */
static void MAX262_PCF_Write_Once(_DEV(MAX262_PCF) * dev, uint8_t dat)
{
	//数据置位
	dev->MAX262_PCF_Write_Pin(dev->a0_port, dev->a0_pin, dat & 0x01);
	dev->MAX262_PCF_Write_Pin(dev->a1_port, dev->a1_pin, dat & 0x02);
	dev->MAX262_PCF_Write_Pin(dev->a2_port, dev->a2_pin, dat & 0x04);
	dev->MAX262_PCF_Write_Pin(dev->a3_port, dev->a3_pin, dat & 0x08);
	dev->MAX262_PCF_Write_Pin(dev->d0_port, dev->d0_pin, dat & 0x10);
	dev->MAX262_PCF_Write_Pin(dev->d1_port, dev->d1_pin, dat & 0x20);

	//数据加载
	dev->MAX262_PCF_Write_Pin(dev->wr_port, dev->wr_pin, 0);
	dev->MAX262_PCF_Delay(100); //wait at least 250ns
	dev->MAX262_PCF_Write_Pin(dev->wr_port, dev->wr_pin, 1);
	dev->MAX262_PCF_Delay(100); //wait at least 10ns

}
/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/* 初始化MAX262 */
void SOL_MAX262_PCF_Init(_DEV(MAX262_PCF) * dev,
					MAX262_PCF_Write_Pin_Fun_P write_pin,
					MAX262_PCF_Read_Pin_Fun_P read_pin,
					MAX262_PCF_Delay_Fun_P delay)
{
	dev->MAX262_PCF_Write_Pin = write_pin;
	dev->MAX262_PCF_Read_Pin = read_pin;
	dev->MAX262_PCF_Delay = delay;	
}
/* 写控制程控滤波器 */
void SOL_MAX262_PCF_Write(_DEV(MAX262_PCF) * dev,
								uint8_t channel,
								uint8_t mode,
								uint8_t freq_Word,
								uint8_t q_Word)
{
   	uint8_t channel_mask;
    channel_mask = channel ? 0x08/* CHB */ : 0x00/* CHA */;
	//根据手册置位,对应的参数请查表
	MAX262_PCF_Write_Once(dev, ((mode & 0x03) << 4) 		| 0x00 | channel_mask);

	MAX262_PCF_Write_Once(dev, ((freq_Word & 0x03) << 4) 	| 0x01 | channel_mask);
	MAX262_PCF_Write_Once(dev, ((freq_Word & 0x0C) << 2) 	| 0x02 | channel_mask);
	MAX262_PCF_Write_Once(dev, ((freq_Word & 0x30)) 		| 0x03 | channel_mask);

	MAX262_PCF_Write_Once(dev, ((q_Word & 0x03) << 4) 		| 0x04 | channel_mask);
	MAX262_PCF_Write_Once(dev, ((q_Word & 0x0C) << 2) 		| 0x05 | channel_mask);
	MAX262_PCF_Write_Once(dev, ((q_Word & 0x30)) 			| 0x06 | channel_mask);
	MAX262_PCF_Write_Once(dev, ((q_Word & 0x40) >> 1) 		| 0x07 | channel_mask);
}

/* 掉电程控滤波器 */
void SOL_MAX262_PCF_Shutdown(_DEV(MAX262_PCF) * dev)
{
	SOL_MAX262_PCF_Write(dev,PCF_CHA,0,0,0);
}

/* 上电程控滤波器 */
void SOL_MAX262_PCF_PWUP(_DEV(MAX262_PCF) * dev)
{
	SOL_MAX262_PCF_Write(dev,PCF_CHA,0,0,63);
	SOL_Delay_1000us();
	SOL_Delay_1000us();
	SOL_Delay_1000us();//至少2MS

}
