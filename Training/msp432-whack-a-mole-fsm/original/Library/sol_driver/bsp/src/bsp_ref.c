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
 * @LastEditTime: 2022-04-24 21:08:53
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\bsp\src\bsp_ref.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "bsp_ref.h"
#include "driverlib.h"
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
uint16_t temperature_adc_val_get = 0;
float temperature_c = 0;
float temperature_f = 0;

/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/*计算内部温度传感器温度值*/
void SOL_REF_Calc_Temperature(uint16_t internal_adc_val, _ENUM(Temp_Ref_Mod) mod)
{
    int16_t conRes;
    float calDifference = 0;
    //Reference temperature parameters
    uint32_t rtp_30 = 0;
    uint32_t rtp_85 = 0;

    switch (mod)
    {
    case TEMP_REF_DEFAULT ://利用斜率计算温度、返回摄氏度
            rtp_30 = MAP_SysCtl_getTempCalibrationConstant(SYSCTL_2_5V_REF,
                    SYSCTL_30_DEGREES_C);
            rtp_85 = MAP_SysCtl_getTempCalibrationConstant(SYSCTL_2_5V_REF,
                    SYSCTL_85_DEGREES_C);
            calDifference = rtp_85 - rtp_30;
            conRes = (internal_adc_val - rtp_30) * 55;
            temperature_c = (conRes / calDifference) + 30.0f;
            temperature_f = temperature_c * 9.0f / 5.0f + 32.0f;
        break;
    case TEMP_REF_USER :

        break;
    default:
        break;
    }
}

/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif
