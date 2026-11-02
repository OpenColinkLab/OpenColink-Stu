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
 * @Date: 2021-10-18 21:31:33
 * @LastEditTime: 2021-10-18 22:05:24
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Dev_Test_A\Library\driver_sol\User_Dev\Inc\tlv5638.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __TLV5638_H
#define __TLV5638_H			//Prevent redefinition

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
	#include "driverlib.h"
    #include "dev_spi_sim.h"
#endif
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
//Speed ctr bit(Logic or)
#define FAST_MOD 0x4000
#define SLOW_MOD 0x0000
//PWR ctr bit(Logic or)
#define PWR_NORMAL 0x0000
#define PWR_DOWN 0x2000
//reg select bit(Logic or)
#define W2_B_AND_BUF 0x0000
#define W2_BUF 0x1000
#define W2_A_AND_UPDATE_B_WITH_BUF 0x8000
#define W2_CTR_REG 0x9000
//ref ctr bit(Logic or)
#define	REF_EXT		0
#define	REF_1024	1	//内部1024mv
#define	REF_2048	2	//内部2048mv

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/
	DEV(DAC_TLV5638){
		//Object properties
        _DEV(SPI_Sim) * spi_used;
		
		//Basic function pointer in struct
		//(User_Change)
		//delay
	  	void (* DAC_TLV5638_Delay) (volatile uint32_t time);
	  	//write_pin
	  	void (* DAC_TLV5638_Write_Pin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	  	//read_pin
	  	GPIO_Pin_State (* DAC_TLV5638_Read_Pin)  (GPIO_Port gpiox, GPIO_Pin gpio_pin);
			
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
	typedef void (* DAC_TLV5638_Delay_Fun_P) (volatile uint32_t time);
	//write_pin
	typedef void (* DAC_TLV5638_Write_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* DAC_TLV5638_Read_Pin_Fun_P) (GPIO_Port gpiox, GPIO_Pin gpio_pin);

/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
extern _DEV(DAC_TLV5638) g_5638used;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/

extern void SOL_DAC_TLV5638_Init(_DEV(DAC_TLV5638) * dev,
								DAC_TLV5638_Write_Pin_Fun_P write_pin,
								DAC_TLV5638_Read_Pin_Fun_P read_pin,
								DAC_TLV5638_Delay_Fun_P delay);


/**
 * @brief TLV5638设置(必须完成四项设置)
 * @note 
 * input	:/
 *      @param op 操作数
 *      - \b FAST_MOD Speed ctr bit(Logic or)
 *      - \b SLOW_MOD
 *      - \b PWR_NORMAL PWR ctr bit(Logic or)
 *      - \b PWR_DOWN
 *      - \b REF_EXT ref ctr bit(Logic or)
 *      - \b REF_1024 内部1024mv
 *      - \b REF_2048 内部2048mv
 * @note 
 * other_dis:在一次输出中只对控制寄存器操作一次就可以
 * 			 连续输出,不需要再次操作控制寄存器.
 * output   :/
		@return None
 * platform :432sdk
 * istested :N
 */
extern void SOL_TLV5638_Write_CtrReg(_DEV(DAC_TLV5638) * dev, uint16_t op);

/**
 * @brief 连续输出DAC数据
 * @note 
 * input	:/
 *      @param dat
 *      @param dat_num
 * @note 
 * output   :/
		@return None
 * other_dis:连续输出时数据的高四位仍要包含控制信息！
 * 			 这就需要先对待输出数组进行格式化！(非常重要)
 * platform :432sdk
 * istested :N
 */
extern void SOL_TLV5638_Output(_DEV(DAC_TLV5638) * dev, uint16_t * dat, uint16_t dat_num);

/**
 * @brief 输出数据格式化函数
 * @note 
 * input	:/
 *      @param dev
 *      @param dat
 *      @param dat_num
 *      @param op 操作数
 *      - \b FAST_MOD Speed ctr bit(Logic or)
 *      - \b SLOW_MOD
 *      - \b PWR_NORMAL PWR ctr bit(Logic or)
 *      - \b PWR_DOWN
 *      - \b W2_B_AND_BUF reg select bit(Logic or)
 *      - \b W2_BUF
 *      - \b W2_A_AND_UPDATE_B_WITH_BUF
 * @note 
 * output   :/
		@return (bool_t is_formated,是否已经格式化)
 * other_dis:连续输出时数据的高四位仍要包含控制信息！
 * 			 这就需要先对待输出数组高四位进行格式化！(非常重要)
 * platform :432sdk
 * istested :N
 */
extern bool_t SOL_TLV5638_Format(_DEV(DAC_TLV5638) * dev, 
								uint16_t * dat, 
								uint16_t dat_num, 
								uint16_t op);


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