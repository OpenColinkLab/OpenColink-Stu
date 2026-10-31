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
 * @LastEditTime: 2022-04-24 21:11:41
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_dac_tlv5638.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "dev_dac_tlv5638.h"
#include "bsp_delay.h"
/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
_DEV(DAC_TLV5638) g_5638used = {0};
/*-------------------------------------------------------*\
			     Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/
static void SOL_TLV5638_Write_Data(_DEV(DAC_TLV5638) * dev,uint16_t dat);
/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/
static void SOL_TLV5638_Write_Data(_DEV(DAC_TLV5638) * dev,uint16_t dat)
{
	uint8_t dat_tmp[2];

	dat_tmp[0] = (uint8_t)(dat>>8);
	dat_tmp[1] = (uint8_t)dat;
	__SOL_SPI_CS(dev->spi_used,CS_EN);
		__SOL_SPI_Write(dev->spi_used,dat_tmp,2);
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
}
/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
void SOL_DAC_TLV5638_Init(_DEV(DAC_TLV5638) * dev,
					DAC_TLV5638_Write_Pin_Fun_P write_pin,
					DAC_TLV5638_Read_Pin_Fun_P read_pin,
					DAC_TLV5638_Delay_Fun_P delay)
{
	dev->DAC_TLV5638_Write_Pin = write_pin;
	dev->DAC_TLV5638_Read_Pin = read_pin;
	dev->DAC_TLV5638_Delay = delay;
}

/* 写控制寄存器 */
void SOL_TLV5638_Write_CtrReg(_DEV(DAC_TLV5638) * dev, uint16_t op)
{
	op |= W2_CTR_REG;
	SOL_TLV5638_Write_Data(dev,op);
}

/* DAC输出 */
void SOL_TLV5638_Output(_DEV(DAC_TLV5638) * dev, uint16_t * dat, uint16_t dat_num)
{
	uint16_t index = 0;

	for(index = 0; index < dat_num; index++){
		SOL_TLV5638_Write_Data(dev,dat[index]);
	}
}

/* 格式化数据 */
extern bool_t SOL_TLV5638_Format(_DEV(DAC_TLV5638) * dev, 
								uint16_t * dat, 
								uint16_t dat_num, 
								uint16_t op)
{
	uint16_t index = 0;

	for(index = 0; index < dat_num; index ++){
		dat[index] = dat[index] | op;
	}

	return (1);
}
/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif
