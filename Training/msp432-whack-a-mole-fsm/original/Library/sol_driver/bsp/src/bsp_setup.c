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
 * @LastEditTime: 2022-04-24 21:09:13
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\bsp\src\bsp_setup.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "main_432.h"
#include "driverlib.h"
#include "bsp_setup.h"
#include "bsp_gpio.h"

/*-------------------------------------------------------*\
					Global Variable
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/
/* static const pmap_struct_P1 [] = {

}; */
/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/
//切勿打乱设置顺序!
static void Setup_Power_Default();
static void Setup_Flash_Default();
static void Setup_GPIO_Default();
static void Setup_Clock_Default();
static void Setup_DbgUART_Default();
static void Setup_PMAP_Default();

/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/

/*
* fun_name :Setup_Power_Default
* describe :设置48M支持内核电压
* platform :432sdk
*/
static void Setup_Power_Default()
{
	//内核电压设置支持48M
	MAP_PCM_setCoreVoltageLevel(PCM_VCORE1);
}

/*
* fun_name :Setup_Flash_Default
* describe :设置Flash等待以适应48MCPU
* platform :432sdk
*/

static void Setup_Flash_Default()
{
	//由于默认时钟48M,所以FLASH等待状态至1 概述 P30
	MAP_FlashCtl_setWaitState(FLASH_BANK0, 1);
	MAP_FlashCtl_setWaitState(FLASH_BANK1, 1);
}

/*
* fun_name :Setup_GPIO_Default
* describe :初始化默认模式相关IO
* platform :432sdk
*/
static void Setup_GPIO_Default()
{
	//复用引脚设置为主功能用以连接低,高速晶振 概述 P170
	MAP_GPIO_setAsPeripheralModuleFunctionInputPin(GPIO_PORT_PJ, GPIO_PIN0, GPIO_PRIMARY_MODULE_FUNCTION);
	MAP_GPIO_setAsPeripheralModuleFunctionInputPin(GPIO_PORT_PJ, GPIO_PIN1, GPIO_PRIMARY_MODULE_FUNCTION);
	MAP_GPIO_setAsPeripheralModuleFunctionInputPin(GPIO_PORT_PJ, GPIO_PIN2, GPIO_PRIMARY_MODULE_FUNCTION);
	MAP_GPIO_setAsPeripheralModuleFunctionInputPin(GPIO_PORT_PJ, GPIO_PIN3, GPIO_PRIMARY_MODULE_FUNCTION);
	//初始化调试串口管脚
	MAP_GPIO_setAsPeripheralModuleFunctionOutputPin(GPIO_PORT_P1,
													GPIO_PIN2 | GPIO_PIN3,
													GPIO_PRIMARY_MODULE_FUNCTION);
}

/*
* fun_name :Setup_Clock_Default
* describe :设置48M主、子系统、低速子系统时钟
* platform :432sdk
*/
static void Setup_Clock_Default()
{
	//配置时钟频率,低速32768,高速48M
	MAP_CS_setExternalClockSourceFrequency(32768, 48000000);
	//初始化外部高速晶振
	MAP_CS_startHFXT(False);
	//初始化外部低速晶振,驱动等级3(根据电容选择),大概1.3S 概述 P45
	MAP_CS_startLFXT(CS_LFXT_DRIVE3);

	//各时钟连接时钟源
	MAP_CS_initClockSignal(CS_MCLK, CS_HFXTCLK_SELECT, ADC_DIVIDER_1);
	MAP_CS_initClockSignal(CS_HSMCLK, CS_HFXTCLK_SELECT, ADC_DIVIDER_1);
	MAP_CS_initClockSignal(CS_SMCLK, CS_HFXTCLK_SELECT, ADC_DIVIDER_1);
	//设置REFO,连接至ACLK
	MAP_CS_setReferenceOscillatorFrequency(CS_REFO_128KHZ);
	MAP_CS_initClockSignal(CS_ACLK,CS_REFOCLK_SELECT,CS_CLOCK_DIVIDER_1);
	//BCLK默认连接到外部晶振,不需要设置,DCO,REFCLK或等待后续有需要时设置
}

/*
* fun_name :Setup_DbgUART_Default
* describe :设置调试串口(阻塞)
* platform :432sdk
*/
static void Setup_DbgUART_Default()
{
	eUSCI_UART_ConfigV1 dbg_uart_cfg;
	//结构体初始化
	dbg_uart_cfg.parity = EUSCI_A_UART_NO_PARITY;					 //无校验
	dbg_uart_cfg.msborLsbFirst = EUSCI_A_SPI_LSB_FIRST;				 //LSB
	dbg_uart_cfg.numberofStopBits = EUSCI_A_UART_ONE_STOP_BIT;		 //1位停止位
	dbg_uart_cfg.uartMode = EUSCI_A_UART_MODE;						 //普通串口模式
	dbg_uart_cfg.selectClockSource = EUSCI_A_UART_CLOCKSOURCE_SMCLK; //时钟源
	dbg_uart_cfg.clockPrescalar = 26;								 //48M下115200
	dbg_uart_cfg.firstModReg = 0;
	dbg_uart_cfg.secondModReg = 111;
	dbg_uart_cfg.overSampling = 1;
	dbg_uart_cfg.dataLength = EUSCI_A_UART_8_BIT_LEN;					//8位
	
	//串口模块初始化
	MAP_UART_initModule(EUSCI_A0_BASE,&dbg_uart_cfg);
	//使能串口模块
	MAP_UART_enableModule(EUSCI_A0_BASE);
}

/*
* fun_name :Setup_PMAP_Default
* describe :重映射各个默认端口
* platform :432sdk
*/
static void Setup_PMAP_Default()
{
	/* NONE */
}

/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
//432SOL初始设置函数
void SOL_Setup_432(_ENUM(Setup_State_432) setup_state)
{
	switch (setup_state)
	{
	case SETUP_DEFAULT:{
			Setup_Power_Default();
			Setup_Flash_Default();
			Setup_GPIO_Default();
			Setup_Clock_Default();
			Setup_DbgUART_Default();
			//MAP_FPU_enableModule();//Has already enabled in KEIL

		break;	
	}
		
	case SETUP_LPW:{
		
		break;
	}
		
	default:
		break;
	}
}

//432内部外设配置
extern Timer_A_PWMConfig g_tim_a3_pwm_cfg;  //TA3.1 P10.5 from main.c
void SOL_432_PerCfg_Init(_ENUM(Setup_State_432) setup_state)
{
	switch (setup_state)
	{
	case CLK_USER :{

		break;
	}
	case NVIC_USER :{
		MAP_Interrupt_setPriority(INT_TA1_N,2 << 5);	//Token_Timer
		MAP_Interrupt_setPriority(INT_EUSCIA2,2 << 5);	//Blueteeth uart

		MAP_Interrupt_setPriorityMask(5 << 5);

/* 	Interrupt_setPriority(uint32_t interruptNumber,uint8_t priority) 
		[priority << 5] (priority E (0,7))//设置优先级(只可使用寄存器的高三位所以要左移5)
		
	Interrupt_pendInterrupt (uint32_t interruptNumber)	//挂起中断(不需要左移)
	
	Interrupt_setPriorityMask (uint8_t priorityMask)	//设置中断屏蔽(0为不屏蔽,大于或等于这个等级的中断都会被屏蔽)
		[priorityMask << 5] (priorityMask E (0,7))//设置优先级(只可使用寄存器的高三位所以要左移5) */

		break;
	}		
	case SPE_IO_USER :{
		BLUE_INIT();
		RED_INIT();
		GREEN_INIT();
		//设置P4.2输出ACLK时钟(ACLK作为I2C时钟 128kHz)
		//MAP_GPIO_setAsPeripheralModuleFunctionOutputPin(GPIO_PORT_P4,GPIO_PIN2,GPIO_PRIMARY_MODULE_FUNCTION);
		//设置P3.6输出(翻转测试用)
		MAP_GPIO_setAsOutputPin(GPIO_PORT_P3,GPIO_PIN6);
		break;
	}

	case REF_USER :{
		//设置内部参考电压(默认2.5V)
		MAP_REF_A_setReferenceVoltage(REF_A_VREF2_5V);
		break;
	}

	case FPU_USER :{
		break;
	}

	case TIMER_USER :{
	//Token_Timer & MKEY_Fresh (Timer_A1 CCR0)
		//设置为增计数
		Timer_A_UpModeConfig tim_a1_up_cgf = {0};
			tim_a1_up_cgf.captureCompareInterruptEnable_CCR0_CCIE = TIMER_A_CCIE_CCR0_INTERRUPT_ENABLE;	//捕获比较中断
			tim_a1_up_cgf.clockSource = TIMER_A_CLOCKSOURCE_SMCLK;				//48MHZ
			tim_a1_up_cgf.clockSourceDivider = TIMER_A_CLOCKSOURCE_DIVIDER_12;	//4MHZ
			tim_a1_up_cgf.timerClear = TIMER_A_DO_CLEAR;
			tim_a1_up_cgf.timerInterruptEnable_TAIE =TIMER_A_TAIE_INTERRUPT_DISABLE; //溢出中断
			tim_a1_up_cgf.timerPeriod = 4000 - 1;	//1ms
		MAP_Timer_A_configureUpMode(TIMER_A1_BASE, &tim_a1_up_cgf);

	//TA3_N(CCR1)PWM输出
		//设置为增计数
        MAP_GPIO_setAsPeripheralModuleFunctionOutputPin(GPIO_PORT_P10,GPIO_PIN5,GPIO_PRIMARY_MODULE_FUNCTION);  //P10.5
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P10,GPIO_PIN4);

            g_tim_a3_pwm_cfg.clockSource = TIMER_A_CLOCKSOURCE_SMCLK; //48MHz
            g_tim_a3_pwm_cfg.clockSourceDivider = TIMER_A_CLOCKSOURCE_DIVIDER_48; //1MHz
            g_tim_a3_pwm_cfg.compareOutputMode = TIMER_A_CCTLN_OUTMOD_7;
            g_tim_a3_pwm_cfg.compareRegister = TIMER_A_CAPTURECOMPARE_REGISTER_1;
            g_tim_a3_pwm_cfg.dutyCycle = 500;
            g_tim_a3_pwm_cfg.timerPeriod  = 5000;
        MAP_Timer_A_generatePWM(TIMER_A3_BASE, &g_tim_a3_pwm_cfg);
		break;
	}
	case PWM_LIGHT_USER :{


		break;
	}			
	case UART_USER :{
		//UCA2_Blueteeth_UART
		MAP_GPIO_setAsPeripheralModuleFunctionOutputPin(GPIO_PORT_P3,GPIO_PIN2/* RX */ | GPIO_PIN3/* TX */,
													   	GPIO_PRIMARY_MODULE_FUNCTION);
		eUSCI_UART_ConfigV1 blueteeth_uart_cfg = {0};
			//结构体初始化
			blueteeth_uart_cfg.selectClockSource = EUSCI_A_UART_CLOCKSOURCE_SMCLK;  //时钟源
			blueteeth_uart_cfg.clockPrescalar = 26;									//48M下115200
			blueteeth_uart_cfg.firstModReg = 0;
			blueteeth_uart_cfg.secondModReg = 111;
			blueteeth_uart_cfg.parity = EUSCI_A_UART_NO_PARITY;					 	//无校验
			blueteeth_uart_cfg.msborLsbFirst = EUSCI_A_SPI_LSB_FIRST;				//LSB
			blueteeth_uart_cfg.numberofStopBits = EUSCI_A_UART_ONE_STOP_BIT;		//1位停止位
			blueteeth_uart_cfg.uartMode = EUSCI_A_UART_MODE;						//普通串口模式
			blueteeth_uart_cfg.overSampling = 1;
			blueteeth_uart_cfg.dataLength = EUSCI_A_UART_8_BIT_LEN;					//8位
		MAP_UART_initModule(EUSCI_A2_BASE,&blueteeth_uart_cfg);

		break;
	}
		
	case I2C_USER :{
		/* 不会用,不想用,不要用,用模拟!!! */
		break;
	}
		
	case SPI_USER :{
		break;
	}	
	case ADC_USER :{
		break;
	}



	case DMA_USER :{
		break;
	}
		
	case GEN_FSM_USER :{
		
		break;
	}
		
	default:
		break;
	}
}

//用户设置SOL库内支持设备硬件属性
void SOL_Setup_Dev(_ENUM(Setup_State_Dev) dev_state){
	switch (dev_state)
	{
	case SOL_HMI_USER :{
		//直接使用了之前使能的蓝牙串口115200
		break;
	}
	case SOL_AT24Cxx_USER :{
		//模拟I2C
		MAP_GPIO_setAsOutputPin(GPIO_PORT_P1,GPIO_PIN6);
		MAP_GPIO_setAsOutputPin(GPIO_PORT_P1,GPIO_PIN7);
		break;
	}
	case SOL_SWITCH_USER :{
		break;
	}
	case SOL_DAC_TLV5638_USER :{
        


		break;
	}
	case SOL_BEEP_USER :{
		MAP_GPIO_setAsOutputPin(GPIO_PORT_P1,GPIO_PIN5);//1.5	BEEP
		break;
	}
	case SOL_MKEY_USER :{
		MAP_GPIO_setAsInputPin(GPIO_PORT_P8,GPIO_PIN5);//8.5 QH
		MAP_GPIO_setAsOutputPin(GPIO_PORT_P9,GPIO_PIN0);//9.0. CLK
		MAP_GPIO_setAsOutputPin(GPIO_PORT_P8,GPIO_PIN4);//8.4. SL
		break;
	}
	case HAMSTER_PLATE_USER :{
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P7,GPIO_PIN3);    //H1 P7.3
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P7,GPIO_PIN3);
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P7,GPIO_PIN1);    //H2 P7.1
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P7,GPIO_PIN1);
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P9,GPIO_PIN4);    //H3 P9.4
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P9,GPIO_PIN4);
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P9,GPIO_PIN6);    //H4 P9.6
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P9,GPIO_PIN6);
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P8,GPIO_PIN0);    //H5 P8.0
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P8,GPIO_PIN0);
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P7,GPIO_PIN4);    //H6 P7.4
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P7,GPIO_PIN4);
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P7,GPIO_PIN6);    //H7 P7.6
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P7,GPIO_PIN6);
		MAP_GPIO_setAsOutputPin(GPIO_PORT_P10,GPIO_PIN3);    //H8 P10.3
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P10,GPIO_PIN3);
        MAP_GPIO_setAsOutputPin(GPIO_PORT_P7,GPIO_PIN7);   //H9 P7.7
            MAP_GPIO_setOutputLowOnPin(GPIO_PORT_P7,GPIO_PIN7);
		break;
	}

	default:
		break;
	}
}
