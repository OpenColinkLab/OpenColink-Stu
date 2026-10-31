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
 * @LastEditTime: 2021-09-16 18:51:49
 * @LastEditors: Chsier
 * @Description: 全局io定义设置,为了和Cortex_H/F7兼容,特意没有使用位带操作
 * @Version: v_alpha
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Gen\Inc\gen_io.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __GEN_IO_H
#define __GEN_IO_H			//防止重定义

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

/*本驱动支持头文件*/

    #include "env_info.h"
    #include "sol_define.h"

//IO相关类型名兼容
	#ifdef STM32_HAL_PLATFORM
		#define GPIO_Port GPIO_TypeDef*
		typedef uint16_t GPIO_Pin;
		typedef GPIO_PinState GPIO_Pin_State;
	#endif
	#ifdef MSP432_SDK_PLATFORM
		typedef uint_fast8_t GPIO_Port;
		typedef uint_fast16_t GPIO_Pin;
		typedef char GPIO_Pin_State;
		ENUM(GPIO_Pin_State){
			GPIO_PIN_RESET = 0,
			GPIO_PIN_SET = 1
		};
	#endif

//IO输入输出模式
	ENUM(IO_Type){
		IO_INPUT,
		IO_OUTPUT
	};

//432LED & KEY
	#ifdef MSP432_SDK_PLATFORM
		#define LED_PORT		GPIO_PORT_P2
		#define LED_RED_PIN		GPIO_PIN0
		#define LED_GREEN_PIN	GPIO_PIN1	
		#define LED_BLUE_PIN	GPIO_PIN2
		#define RED_INIT()		MAP_GPIO_setAsOutputPin(LED_PORT,LED_RED_PIN);\
    							MAP_GPIO_setOutputLowOnPin(LED_PORT,LED_RED_PIN)
		#define GREEN_INIT()	MAP_GPIO_setAsOutputPin(LED_PORT,LED_GREEN_PIN);\
    							MAP_GPIO_setOutputLowOnPin(LED_PORT,LED_GREEN_PIN)
		#define BLUE_INIT()		MAP_GPIO_setAsOutputPin(LED_PORT,LED_BLUE_PIN);\
    							MAP_GPIO_setOutputLowOnPin(LED_PORT,LED_BLUE_PIN)
		#define RED_ON()		MAP_GPIO_setOutputHighOnPin(LED_PORT,LED_RED_PIN)
		#define	RED_OFF()		MAP_GPIO_setOutputLowOnPin(LED_PORT,LED_RED_PIN)
		#define RED_TG()		MAP_GPIO_toggleOutputOnPin(LED_PORT,LED_RED_PIN)
		#define	GREEN_ON()		MAP_GPIO_setOutputHighOnPin(LED_PORT,LED_GREEN_PIN)
		#define	GREEN_OFF()		MAP_GPIO_setOutputLowOnPin(LED_PORT,LED_GREEN_PIN)
		#define GREEN_TG()		MAP_GPIO_toggleOutputOnPin(LED_PORT,LED_GREEN_PIN)
		#define	BLUE_ON()		MAP_GPIO_setOutputHighOnPin(LED_PORT,LED_BLUE_PIN)
		#define	BLUE_OFF()		MAP_GPIO_setOutputLowOnPin(LED_PORT,LED_BLUE_PIN)
		#define BLUE_TG()		MAP_GPIO_toggleOutputOnPin(LED_PORT,LED_BLUE_PIN)
		#define KEY_PORT 		GPIO_PORT_P1
		#define KEY_1_PIN		GPIO_PIN1
		#define KEY_2_PIN		GPIO_PIN2
	#endif
/*------------------------*\
   SOL读写及输入输出设置函数
\*------------------------*/
/**
 * @brief SOL写管脚
 * @note 
 * input	:/
 *      @param port 端口
 *      @param pin 管脚
 *      @param state 状态
 *       - \b 0 低电平
 *       - \b 1 高电平
 * @note 
 * platform :432sdk
 * istested :N
 */
extern void SOL_Write_Pin(GPIO_Port port,GPIO_Pin pin, GPIO_Pin_State state);

/**
 * @brief SOL读管脚
 * @note 
 * input	:/
 *      @param port 端口
 *      @param pin 管脚
 * @note 
 * output   :/
 *		@return GPIO_Pin_State
 *       - \b 0 低电平
 *       - \b 1 高电平
 * platform :432sdk
 * istested :N
 */
extern GPIO_Pin_State SOL_Read_Pin(GPIO_Port port,GPIO_Pin pin);

/**
 * @brief SOL翻转管脚
 * @note 
 * input	:/
 *      @param port 端口
 *      @param pin 管脚
 * @note 
 * output   :/
		@return None
 * change   :/
 * other_dis:/
 * platform :432sdk
 * istested :N
 */
extern void SOL_Tog_Pin(GPIO_Port port,GPIO_Pin pin);

/**
 * @brief SOL设置管脚输入输出
 * @note 
 * input	:/
 *      @param port 端口
 *      @param pin 管脚
 *      @param io_op
 *      - \b IO_INPUT
 *      - \b IO_OUTPUT
 * @note 
 * platform :432sdk
 * istested :N
 */
extern void SOL_Set_IO(GPIO_Port port,GPIO_Pin pin,_ENUM(IO_Type) io_op);

/**
 * @brief SOL强制写管脚(建议只用在432sdk平台的模拟I2C设备的初始化)
 * 		  调用了SOL_Set_IO强制将管脚设为输出,并且不会改回!!!
 * 		  还带有小延时，速度慢	
 * @note 
 * input	:/
 *      @param port 端口
 *      @param pin 管脚
 *      @param state 状态
 *       - \b 0 低电平
 *       - \b 1 高电平
 * @note 
 * platform :432sdk
 * istested :N
 */
extern void SOL_Write_Pin_Force(GPIO_Port port,GPIO_Pin pin, GPIO_Pin_State state);

/**
 * @brief SOL强制读管脚(建议只用在432sdk平台的模拟I2C设备的初始化)
 * 		  调用了SOL_Set_IO强制将管脚设为输出,并且不会改回!!!
 * 		  还带有小延时，速度慢
 * @note 
 * input	:/
 *      @param port 端口
 *      @param pin 管脚
 * @note 
 * output   :/
 *		@return GPIO_Pin_State
 *       - \b 0 低电平
 *       - \b 1 高电平
 * @note 
 * platform :432sdk
 * istested :N
 */
extern GPIO_Pin_State SOL_Read_Pin_Force(GPIO_Port port,GPIO_Pin pin);
	
	#ifdef __cplusplus		//兼容C++
	}
	#endif
#endif
