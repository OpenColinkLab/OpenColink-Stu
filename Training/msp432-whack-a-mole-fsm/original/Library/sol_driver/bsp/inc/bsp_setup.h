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
 * @LastEditTime: 2021-09-16 15:43:27
 * @LastEditors: Chsier
 * @Description: 432设置初始化函数库头文件
 * @Version: v_alpha
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_432\Inc\setup_sup.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明出处
 */

#ifndef __SETUP_SUP_H
#define __SETUP_SUP_H			//Prevent redefinition

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

/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					    Static PV
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

//初始化模式
    ENUM(Setup_State_432){
		/***SOL_INIT***/
        SETUP_DEFAULT,
		SETUP_LPW,
		SETUP_USER,
		/*** USER_INIT ***/
		CLK_USER,
		SPE_IO_USER,
		TIMER_USER,
		UART_USER,
		I2C_USER,
		SPI_USER,
		ADC_USER,
		DMA_USER,
		REF_USER,
		FPU_USER,
		NVIC_USER,
		GEN_FSM_USER,
        PWM_LIGHT_USER
    };

	ENUM(Setup_State_Dev){
		SOL_AT24Cxx_USER,
		SOL_AD9833_USER,
		SOL_W25Qxx_USER,
		SOL_AD9959_USER,
		SOL_RELAY_USER,
		SOL_BEEP_USER,
		SOL_MKEY_USER,
		SOL_HMI_USER,
		SOL_SWITCH_USER,
		SOL_MAX262_PCF_USER,
		SOL_DAC_TLV5638_USER,
        //User APP Device
        HAMSTER_PLATE_USER
	};

#ifdef USER_FUN

#endif
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
/**
 * @note 
 * @brief 初始设置函数,上电设置432,注意管脚冲突！
 * 		  测试的时候可没考虑所有模块同时用！
 * 
 * input	:/
 *      @param setup_state
 * 		- \b SETUP_DEFAULT	默认48M上电配置
 * 		- \b SETUP_LPW		默认低功耗模式
 * 		- \b SETUP_USER		用户自设定模式
 * @note 
 * other_dis:初始电源模式,FLASH速率,时钟设置,调试串口等已经设置并使能
 * platform :432sdk
 * istested :N
 */
extern void SOL_Setup_432(_ENUM(Setup_State_432) setup_state);

/**
 * @note 
 * @brief 用户设置函数,上电设置432,注意管脚冲突！
 * 		  测试的时候可没考虑所有模块同时用！
 * 
 * input	:/
 *      @param setup_state
 * 		- \b CLK_USER		用户时钟配置
 * 		- \b SPE_IO_USER	用户特殊功能管脚配置
 * 		- \b TIMER_USER		用户定时器配置
 * 		- \b UART_USER		用户串口配置
 * 		- \b I2C_USER		用户I2C配置
 * 		- \b SPI_USER		用户SPI配置
 * 		- \b ADC_USER		用户ADC配置
 * 		- \b DMA_USER		用户DMA配置
 * 		- \b GEN_FSM 		用户状态机配置
 * @note 
 * other_dis:用户配置中只配置,初始化,不使能
 * platform :432sdk
 * istested :N
 */
extern void SOL_432_PerCfg_Init(_ENUM(Setup_State_432) setup_state);

/**
 * @note 
 * @brief 用户初始化SOL库内支持设备,注意管脚冲突！
 * 		  测试的时候可没考虑所有模块同时用！
 * input	:/
 *      @param dev_state
 *      - \b SOL_AT24Cxx_USER
 *      - \b SOL_AD9833_USER
 *      - \b SOL_W25Qxx_USER
 *      - \b SOL_AD9959_USER
 *      - \b SOL_RELAY_USER
 *      - \b SOL_BEEP_USER
 *      - \b SOL_MKEY_USER
 *      - \b SOL_HMI_USER
 *      - \b SOL_SWITCH_USER
 *      - \b SOL_MAX262_PCF_USER
 * 待续
 * @note 
 * platform :432sdk
 * istested :N
 */
extern void SOL_Setup_Dev(_ENUM(Setup_State_Dev) dev_state);
	
#ifdef USER_FUN

#endif

	#ifdef __cplusplus		//Compatible C++
	}
	#endif
#endif
