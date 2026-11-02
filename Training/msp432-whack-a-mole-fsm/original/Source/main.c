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
 * @LastEditTime: 2021-09-16 21:59:04
 * @LastEditors: Chsier
 * @Description: main.c
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Source\main.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
/*------------------------------------------------------*\
						INCLUDES
\*------------------------------------------------------*/
/* Main.h */
#include "main_432.h"
/* Standard Includes */
#include <stdint.h>
/* TI Driver Lib */
#include "driverlib.h"
/* BSP */
#include "bsp_buffer.h"
#include "bsp_delay.h"
#include "bsp_setup.h"
/* SOL_Driver */
#include "dev_at24cxx.h"
#include "dev_beep.h"
#include "dev_mkey_74hc165.h"
#include "dev_dac_tlv5638.h"
#include "dev_spi_sim.h"
#include "ast_debug.h"
/* Proj */
#include "fsm.h"
#include "hamster_plate.h"
#include "project_main.h"
/*-------------------------------------------------------*\
				Glob_Variable In main.c
\*-------------------------------------------------------*/
/*------------------------*\
	   Need_to_Extern
\*------------------------*/
Timer_A_PWMConfig g_tim_a3_pwm_cfg ={0};
/*------------------------*\
	    Timer_Token
\*------------------------*/
uint16_t mkey_fresh_token = 0;		//MKEY令牌
uint16_t g_hamsterWaitToken = 0;    //地鼠游戏令牌
/*------------------------*\
		About_MKEY
\*------------------------*/
uint8_t mkey_val_last = 0;
uint8_t mkey_val_now = 0;
uint16_t mkey_val = 0;          //矩阵键盘输出值
uint8_t  is_button_fresh = 0;	//按键命令被刷新
/*------------------------*\
	 About_Hamster&PWM
\*------------------------*/
/*------------------------*\
	       Other
\*------------------------*/
//内部温度传感器
	//uint16_t adc_0pin_internal_temp_value = 0;
/*-------------------------------------------------------*\
					 Static_Variable
\*-------------------------------------------------------*/
volatile event_t sol_fsm_evt = {INIT_SIG};	//全局状态机状态
/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
						init fun
\*-------------------------------------------------------*/
//432上电初始化
void Main_432_Default_Setup();
//432内置外设初始化(不开启总中断)
void Main_432_PerCfg_Init();
//SOL库初始化设置
void Main_SOL_Dev_Setup();

/*-------------------------------------------------------*\
						main fun
\*-------------------------------------------------------*/
int main(void)
{
/*------------------------*\
	   432 & SOL_Init
\*------------------------*/
    /* Power_On Init */
	Main_432_Default_Setup();

	/* User_Init */
	Main_432_PerCfg_Init();

	/* SOL_Init */
	Main_SOL_Dev_Setup();

    /* Open Interrupt Master */
	MAP_Interrupt_enableMaster();

	/* 上电响应 */
	SOL_Beep_On(&beep_used,BEEP_FREQ_DEF,BEEP_TIME_DEF);
/*------------------------*\
		 FSM Init
\*------------------------*/
//请初始化完成状态机相关函数后再使能状态机
SOL_FSM_Handler_Ctor((FSM_t *) &proj_fsm, (State_Handler) Proj_Idle);
SOL_FSM_Init((FSM_t *) &proj_fsm);
sol_fsm_evt.signal = IS_GAME_SIG;//上电直接进入的模式	
/*------------------------*\
    Peripheral Start
\*------------------------*/
//Token_Timer Start(支持令牌分发和按键扫描)
	MAP_Timer_A_startCounter(TIMER_A1_BASE,TIMER_A_UP_MODE);
//arr clear
	//CLEAR_ARR(x);
/*------------------------*\
     Hamster Game Init
\*------------------------*/
gS_hamsterPlate.m_gameInfo.m_delayTime = 500;
/*------------------------*\
	  str_:Start Proj
\*------------------------*/
	START(RUN_ONCE){
/* RUN_ONCE!!! */
		//RUN_ONCE = 0;
/* RUN_ONCE!!! */
		#ifdef DBG_MOD_OFF
			SOL_Delayms(1000);
			USER_DBG("IN START\n");
			BLUE_TG();
 			if(mkey_val == 16){
				CLEAR(mkey_val);
			}
		#endif
/*------------------------*\
	  	Start_FSM
\*------------------------*/

//ala_:
	SOL_FSM_Dispatch((FSM_t *) &proj_fsm, (event_t const * const)&sol_fsm_evt);	//也许不能强制转换?
    
    if(mkey_val == 4){
        CLEAR(mkey_val);

        g_tim_a3_pwm_cfg.dutyCycle += 500;
        if(g_tim_a3_pwm_cfg.dutyCycle <= 5000){
            MAP_Timer_A_generatePWM(TIMER_A3_BASE, &g_tim_a3_pwm_cfg); 
        }else{
            g_tim_a3_pwm_cfg.dutyCycle = 5000;
        }
    }
    if(mkey_val == 8){
        CLEAR(mkey_val);

        g_tim_a3_pwm_cfg.dutyCycle -= 500;
        if(g_tim_a3_pwm_cfg.dutyCycle > 0){
            MAP_Timer_A_generatePWM(TIMER_A3_BASE, &g_tim_a3_pwm_cfg); 
        }else{
            g_tim_a3_pwm_cfg.dutyCycle = 500;
        }
    }







	/*------*/	
	}
	FOREVER();
}
/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/

/**
 * @brief 上电关闭看门狗,总中断,设置432基本参数
 * @note 
 * platform :432sdk
 * istested :N
 */
void Main_432_Default_Setup()
{
    /* Power_On Init */
    MAP_WDT_A_holdTimer();
    SOL_Setup_432(SETUP_DEFAULT);
	MAP_Interrupt_disableMaster();
}

/**
 * @brief 432内置外设硬件设置与中断使能(不开启总中断)
 * @note 
 * platform :432sdk
 * istested :N
 */
void Main_432_PerCfg_Init()
{
/*------------------------*\
	  Always Default
\*------------------------*/
	SOL_432_PerCfg_Init(SPE_IO_USER);

	SOL_432_PerCfg_Init(REF_USER);
	//使能内部参考电压
		MAP_REF_A_enableReferenceVoltage();

	SOL_432_PerCfg_Init(FPU_USER);
	//保护FPU堆栈数据,在中断中进行较多运算时使能
/* 		MAP_FPU_enableModule();
		MAP_FPU_enableLazyStacking();	 */	

	SOL_432_PerCfg_Init(NVIC_USER);

/*------------------------*\
	    Always Used
\*------------------------*/
	SOL_432_PerCfg_Init(TIMER_USER);
	//Token_Timer TA1使能
		MAP_Timer_A_enableInterrupt(TIMER_A1_BASE);
		MAP_Timer_A_enableCaptureCompareInterrupt(TIMER_A1_BASE,TIMER_A_CAPTURECOMPARE_REGISTER_0);
		MAP_Interrupt_enableInterrupt(INT_TA1_0);

	SOL_432_PerCfg_Init(UART_USER);
	//蓝牙串口使能
		MAP_UART_enableModule(EUSCI_A2_BASE);
		MAP_UART_enableInterrupt(EUSCI_A2_BASE,EUSCI_A_UART_RECEIVE_INTERRUPT);		
		MAP_Interrupt_enableInterrupt(INT_EUSCIA2);
}

/**
 * @brief 用户初始化SOL库内支持设备结构体和设置对应硬件属性
 * @note 
 * platform :432sdk
 * istested :N
 */
void Main_SOL_Dev_Setup()
{

	MAP_GPIO_setAsOutputPin(GPIO_PORT_P3,GPIO_PIN6);
	MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P3,GPIO_PIN6);

	SOL_Setup_Dev(SOL_BEEP_USER);
		beep_used.beep_port = GPIO_PORT_P1;
		beep_used.beep_pin = GPIO_PIN5;
		SOL_Beep_Init(&beep_used,SOL_Tog_Pin,SOL_Delay);

	SOL_Setup_Dev(SOL_MKEY_USER);
		mkey_used.clk_pin = GPIO_PIN0;
		mkey_used.clk_port = GPIO_PORT_P9;
		mkey_used.qh_pin = GPIO_PIN5;
		mkey_used.qh_port = GPIO_PORT_P8;
		mkey_used.sl_pin = GPIO_PIN4;
		mkey_used.sl_port = GPIO_PORT_P8;
		SOL_Mkey_Init(&mkey_used,SOL_Write_Pin,SOL_Read_Pin,SOL_Delay);

	SOL_Setup_Dev(SOL_AT24Cxx_USER);
		i2c_for_at24.scl_pin = GPIO_PIN7;
		i2c_for_at24.scl_port = GPIO_PORT_P1;
		i2c_for_at24.sda_pin = GPIO_PIN6;
		i2c_for_at24.sda_port = GPIO_PORT_P1;
		i2c_for_at24.speed = I2C_HIGH_SPEED;
		SOL_I2C_Init(&i2c_for_at24,SOL_Write_Pin_Force,SOL_Read_Pin_Force,SOL_Delay);
		at24_used.addr = 0xa0;
		at24_used.i2c_used = &i2c_for_at24;
		at24_used.type = AT24C256;
		SOL_AT24Cxx_Init(&at24_used,SOL_Write_Pin_Force,SOL_Read_Pin_Force,SOL_Delay);

	SOL_Setup_Dev(HAMSTER_PLATE_USER);
        //打地鼠提示蜂鸣器
        gS_hamsterPlate.m_beepUsed = &beep_used;
        //地鼠盘
        gS_hamsterPlate.m_h1Pin = GPIO_PIN3;    //P7.3
        gS_hamsterPlate.m_h1Port = GPIO_PORT_P7;
        gS_hamsterPlate.m_h2Pin = GPIO_PIN1;
        gS_hamsterPlate.m_h2Port = GPIO_PORT_P7;
        gS_hamsterPlate.m_h3Pin = GPIO_PIN4;
        gS_hamsterPlate.m_h3Port = GPIO_PORT_P9;
        gS_hamsterPlate.m_h4Pin = GPIO_PIN6;
        gS_hamsterPlate.m_h4Port = GPIO_PORT_P9;
        gS_hamsterPlate.m_h5Pin = GPIO_PIN0;
        gS_hamsterPlate.m_h5Port = GPIO_PORT_P8;
        gS_hamsterPlate.m_h6Pin = GPIO_PIN4;
        gS_hamsterPlate.m_h6Port = GPIO_PORT_P7;
        gS_hamsterPlate.m_h7Pin = GPIO_PIN6;
        gS_hamsterPlate.m_h7Port = GPIO_PORT_P7;
        gS_hamsterPlate.m_h8Pin = GPIO_PIN3;
        gS_hamsterPlate.m_h8Port = GPIO_PORT_P10;
        gS_hamsterPlate.m_h9Pin = GPIO_PIN7;
        gS_hamsterPlate.m_h9Port = GPIO_PORT_P7;
        //初始化
        HamsterPlate_Init(&gS_hamsterPlate,SOL_Write_Pin,SOL_Read_Pin,SOL_Delay);
    
    SOL_Setup_Dev(SOL_DAC_TLV5638_USER);
}
