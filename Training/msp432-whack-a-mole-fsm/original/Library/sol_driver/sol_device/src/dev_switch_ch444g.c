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
 * @LastEditTime: 2022-04-24 21:12:26
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_switch_ch444g.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "dev_switch_ch444g.h"

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
static void SOL_Switch_OpenAll(_DEV(Switch) * dev);
/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/
/* 全部断开 */
static void SOL_Switch_OpenAll(_DEV(Switch) * dev)
{
	//if(dev->en_pin != NULL && dev->en_port != NULL)
	dev -> Switch_Write_Pin(dev->en_port,dev->en_pin,1);
}
/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/* 初始化模拟开关 */
void SOL_Switch_Init(_DEV(Switch) * dev,
					Switch_Write_Pin_Fun_P write_pin,
					Switch_Read_Pin_Fun_P read_pin,
					Switch_Delay_Fun_P delay)
{
	dev ->Switch_Write_Pin = write_pin;
	dev ->Switch_Read_Pin = read_pin;
	dev ->Switch_Delay = delay;
}
/* 选择模拟开关通道 */
void SOL_Switch_Select(_DEV(Switch) * dev,uint8_t channel)
{
	dev -> Switch_Write_Pin(dev->en_port,dev->en_pin,0);
	switch (channel)
	{
	case SWITCH_OPEN:
		SOL_Switch_OpenAll(dev);
		break;
	case SWITCH_CH1:
			dev -> Switch_Write_Pin(dev->in0_port, dev->in0_pin, 0);
			dev -> Switch_Write_Pin(dev->in1_port, dev->in1_pin, 0);
		break;
	case SWITCH_CH2:
			dev -> Switch_Write_Pin(dev->in0_port, dev->in0_pin, 1);
			dev -> Switch_Write_Pin(dev->in1_port, dev->in1_pin, 0);		
		break;
	case SWITCH_CH3:
			dev -> Switch_Write_Pin(dev->in0_port, dev->in0_pin, 0);
			dev -> Switch_Write_Pin(dev->in1_port, dev->in1_pin, 1);		
		break;
	case SWITCH_CH4:
			dev -> Switch_Write_Pin(dev->in0_port, dev->in0_pin, 1);
			dev -> Switch_Write_Pin(dev->in1_port, dev->in1_pin, 1);	
		break;	
	default:
		break;
	}

	
}

