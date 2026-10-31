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
 * @Author: Chsier
 * @Date: 2021-09-17 17:47:35
 * @LastEditTime: 2021-09-20 13:57:24
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_432\Inc\ref_sup.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __REF_SUP_H
#define __REF_SUP_H			//Prevent redefinition

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
						 Define
\*-------------------------------------------------------*/



#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
extern float temperature_c;
extern float temperature_f;
extern uint16_t temperature_adc_val_get;


/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
//内部温度传感器参考设置状态
    ENUM(Temp_Ref_Mod){
        TEMP_REF_DEFAULT,
        TEMP_REF_USER
    };

/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
/**
 * @note 
 * fun_name :SOL_REF_Calc_Temputer
 * describe :获取参考温度值计算内部温度
 * 
 * input	:/
 *      @param internal_adc_val 采集的ADC值
 *      @param mod 计算时的参考模式
 *      - \b TEMP_REF_DEFAULT 默认模式
 *      - \b TEMP_REF_USER  用户自己设置
 * @note 
 * output   :/
 * change   :(float tempature_c,全局摄氏度)
 *           (float tempature_f,全局华氏度)
 * other_dis:/
 * platform :432sdk
 * istested :N
 */ 
extern void SOL_REF_Calc_Temperature(uint16_t internal_adc_val, _ENUM(Temp_Ref_Mod) mod);


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