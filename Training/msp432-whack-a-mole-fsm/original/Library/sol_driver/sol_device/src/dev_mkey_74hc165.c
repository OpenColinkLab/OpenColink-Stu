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
 * @LastEditTime: 2022-04-24 21:12:06
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_mkey_74hc165.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "dev_mkey_74hc165.h"
#include "bsp_delay.h"
#ifdef MSP432_SDK_PLATFORM
	#include "driverlib.h"
#endif
/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
_DEV(MKEY) mkey_used = {0};
_ENUM(MKEY_STATUS) mkey_state = MKEY_IDLE;
/*-------------------------------------------------------*\
			     Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/
static void HC165_Latch(_DEV(MKEY) * dev);
static uint16_t Mkey_ReadByte(_DEV(MKEY) * dev);
/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/
/**
 * @brief 锁存HC165
 * @note 
 * input	:/
 *      @param dev
 * @note 
 * output   :/
		@return None
 * platform :432sdk
 * istested :N
 */
static void HC165_Latch(_DEV(MKEY) * dev)
{
	dev->Mkey_Write_Pin(dev->sl_port,dev->sl_pin,GPIO_PIN_RESET);
	HC165_Wait_Charge();
	dev->Mkey_Write_Pin(dev->sl_port,dev->sl_pin,GPIO_PIN_SET);
	HC165_Wait_Charge();
}

/**
 * @brief 读取HC165回传电平
 * @note 
 * input	:/
 *      @param dev
 * @note 
 * output   :/
		@return (uint16_t receive,回传数值)
 * platform :432sdk
 * istested :N
 */
static uint16_t Mkey_Read2Byte(_DEV(MKEY) * dev)
{
		uint8_t index = 0;
		uint16_t receive = 0;
	
		HC165_Latch(dev);
		
		if(dev->Mkey_Read_Pin(dev->qh_port,dev->qh_pin))
		{
			receive |= 0x01; 
		}	
	
		for(index = 0;index < 15;index ++)
		{
			receive <<= 1;
			dev->Mkey_Write_Pin(dev->clk_port,dev->clk_pin,GPIO_PIN_RESET);
			//SOL_Delay_1000us();		
			dev->Mkey_Write_Pin(dev->clk_port,dev->clk_pin,GPIO_PIN_SET);
			if(dev->Mkey_Read_Pin(dev->qh_port,dev->qh_pin))
			{
				receive |= 0x01; 
			}
			//SOL_Delay_1000us();
		}
		dev->Mkey_Write_Pin(dev->sl_port,dev->sl_pin,GPIO_PIN_RESET);
		//printf("Key val is : %d \n",receive);
		return receive;
}
/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/* 初始化矩阵键盘 */
void SOL_Mkey_Init(_DEV(MKEY) * dev,
					Mkey_Write_Pin_Fun_P write_pin,
					Mkey_Read_Pin_Fun_P read_pin,
					Mkey_Delay_Fun_P delay)
{
	dev->Mkey_Delay = delay;
	dev->Mkey_Write_Pin = write_pin;
	dev->Mkey_Read_Pin = read_pin;
	
	//SL脚拉高，不读取键盘
	dev->Mkey_Write_Pin(dev->sl_port,dev->sl_pin,GPIO_PIN_SET);
	//CLK/CP脚拉高，便于产生时钟信号
	dev->Mkey_Write_Pin(dev->clk_port,dev->clk_pin,GPIO_PIN_SET);
}

/* 扫描矩阵键盘 */
uint16_t SOL_MKey_Scan(_DEV(MKEY) * dev)
{
	uint16_t key_num;
	uint16_t scan_key_num;
	key_num = Mkey_Read2Byte(dev);
	switch(key_num)
	{
		case 256:
			scan_key_num = 1;
		break;
		
		case 512:
			scan_key_num = 2;
		break;
		
		case 1024:
			scan_key_num = 3;
		break;
		
		case 2048:
			scan_key_num = 4;
		break;
		
		case 4096:
			scan_key_num = 5;
		break;
		
		case 8192:
			scan_key_num = 6;
		break;
		
		case 16384:
			scan_key_num = 7;
		break;
		
		case 32768:
			scan_key_num = 8;
		break;
		
		case 1:
			scan_key_num = 9;
		break;
		
		case 2:
			scan_key_num = 10;
		break;
		
		case 4:
			scan_key_num = 11;
		break;
		
		case 8:
			scan_key_num = 12;
		break;
		
		case 16:
			scan_key_num = 13;
		break;
		
		case 32:
			scan_key_num = 14;
		break;
		
		case 64:
			scan_key_num = 15;
		break;
		
		case 128:
			scan_key_num = 16;
		break;
		
		default:
			scan_key_num = 0;
		break;
	}
	
	return scan_key_num;
}
