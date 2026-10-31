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
 * @LastEditTime: 2022-04-24 21:08:59
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\bsp\src\bsp_gpio.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "bsp_gpio.h"
#include "driverlib.h"
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/

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
//SOL写管脚
void SOL_Write_Pin(GPIO_Port port,GPIO_Pin pin, GPIO_Pin_State state){

#ifdef STM32_HAL_PLATFORM
    HAL_GPIO_WritePin(port,pin,state);
#endif
#ifdef MSP432_SDK_PLATFORM
    if(state)
        MAP_GPIO_setOutputHighOnPin(port,pin);
    else
        MAP_GPIO_setOutputLowOnPin(port,pin);
#endif 
}

//SOL读管脚
GPIO_Pin_State SOL_Read_Pin(GPIO_Port port,GPIO_Pin pin){

#ifdef STM32_HAL_PLATFORM
    return (HAL_GPIO_ReadPin(port,pin));
#endif
#ifdef MSP432_SDK_PLATFORM
    return (MAP_GPIO_getInputPinValue(port,pin));
#endif 
}

//SOL读管脚
void SOL_Tog_Pin(GPIO_Port port,GPIO_Pin pin){

#ifdef STM32_HAL_PLATFORM
    return (HAL_GPIO_TogPin(port,pin));//?拼错了懒得改
#endif
#ifdef MSP432_SDK_PLATFORM
    MAP_GPIO_toggleOutputOnPin(port,pin);
#endif 
}

//SOL设置管脚输入输出
void SOL_Set_IO(GPIO_Port port,GPIO_Pin pin,_ENUM(IO_Type) io_op)
{
#ifdef STM32_HAL_PLATFORM
    return (HAL_GPIO_ReadPin(port,pin));
#endif
#ifdef MSP432_SDK_PLATFORM
	if(io_op == IO_OUTPUT)
    MAP_GPIO_setAsOutputPin(port,pin);
	else
	MAP_GPIO_setAsInputPinWithPullUpResistor(port,pin);
#endif 	
}

//SOL强制写管脚
void SOL_Write_Pin_Force(GPIO_Port port,GPIO_Pin pin, GPIO_Pin_State state)
{
	int i = 20;
	SOL_Set_IO(port,pin,IO_OUTPUT);
	while(i--)//小延时保证设置完成
		;	

#ifdef STM32_HAL_PLATFORM
    HAL_GPIO_WritePin(port,pin,state);
#endif
#ifdef MSP432_SDK_PLATFORM
    if(state)
        MAP_GPIO_setOutputHighOnPin(port,pin);
    else
        MAP_GPIO_setOutputLowOnPin(port,pin);
#endif 
}

//SOL强制读管脚
GPIO_Pin_State SOL_Read_Pin_Force(GPIO_Port port,GPIO_Pin pin)
{
	int i = 20;
	SOL_Set_IO(port,pin,IO_INPUT);
	while(i--)//小延时保证设置完成
		;

#ifdef STM32_HAL_PLATFORM
	return (HAL_GPIO_ReadPin(port,pin));
#endif
#ifdef MSP432_SDK_PLATFORM
	return (MAP_GPIO_getInputPinValue(port,pin));
#endif 
}

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif

