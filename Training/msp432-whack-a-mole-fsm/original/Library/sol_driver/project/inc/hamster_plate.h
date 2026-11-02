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
 * @Date: 2022-04-23 15:52:03
 * @LastEditTime: 2022-04-23 15:56:19
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\driver_sol\User_Dev\Inc\hamsterPlate.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
#ifndef HAMSTER_PLATE_H_PROTECT
#define HAMSTER_PLATE_H_PROTECT
#ifdef __cplusplus  //Compatible C++
extern "C"{     
#endif  	
/*---------------------------*\
		   Include
\*---------------------------*/
	#include "env_info.h"
    #include "sol_define.h"
	#include "bsp_gpio.h"
	#include "dev_beep.h"
				
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/
    STRUCT(Game_Info){
        bool_t m_nextTurn;      //可进行下一轮
        bool_t m_isTimeOut;     //是否超时
        uint8_t m_gameLevel;    //游戏难度
        uint16_t m_delayTime;   //地鼠出现间隔时间
        uint8_t m_posion;       //活着的鼹鼠位置
        uint16_t m_totalScore;  //总得分
        uint16_t m_totalLost;   //总失分
    };
	DEV(HamsterPlate){
		
		//Object Port & Pin
		GPIO_Port m_h1Port;
		GPIO_Pin  m_h1Pin;

		GPIO_Port m_h2Port;
		GPIO_Pin  m_h2Pin;

		GPIO_Port m_h3Port;
		GPIO_Pin  m_h3Pin;

		GPIO_Port m_h4Port;
		GPIO_Pin  m_h4Pin;

		GPIO_Port m_h5Port;
		GPIO_Pin  m_h5Pin;

		GPIO_Port m_h6Port;
		GPIO_Pin  m_h6Pin;

		GPIO_Port m_h7Port;
		GPIO_Pin  m_h7Pin;

		GPIO_Port m_h8Port;
		GPIO_Pin  m_h8Pin;

		GPIO_Port m_h9Port;
		GPIO_Pin  m_h9Pin;

        _DEV(Beep) *m_beepUsed; //注意调用其他设备时使用地址
        _STRUCT(Game_Info) m_gameInfo;  //内含直接使用的结构体时直接声明，不要使用地址形式
		//Basic function pointer in struct
		//(User_Change)
		//delay
	  	void (* m_hamsterPlateDelay) (volatile uint32_t time);
	  	//write_pin
	  	void (* m_hamsterPlateWritePin) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	  	//read_pin
	  	GPIO_Pin_State (* m_hamsterPlateReadPin)  (GPIO_Port gpiox, GPIO_Pin gpio_pin);
			
		//Other function pointer in struct
		
	};
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
    extern _DEV(HamsterPlate) gS_hamsterPlate;
/*-------------------------------------------------------*\
			   Support pointer definition
\*-------------------------------------------------------*/
//(User_Change)
/*It is mainly used for the declaration in init function, 
  and then the function pointer in the structure can be 
  assigned*/
  
	//Basic function pointer
	//delay
	typedef void (* hamsterPlateDelayFunP) (volatile uint32_t time);
	//write_pin
	typedef void (* hamsterPlateWritePinFunP) (GPIO_Port gpiox, GPIO_Pin gpio_pin, GPIO_Pin_State pin_state);
	//read_pin
	typedef GPIO_Pin_State (* hamsterPlateReadPinFunP) (GPIO_Port gpiox, GPIO_Pin gpio_pin);
	
	//Other function pointer



/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/

    extern void HamsterPlate_Init(_DEV(HamsterPlate) * fm_dev,
                            hamsterPlateWritePinFunP fm_write_pin,
                            hamsterPlateReadPinFunP fm_read_pin,
                            hamsterPlateDelayFunP fm_delay);
/**
 * @brief 任意位置生成地鼠
 * @note 
 * input	:/
 *      @param fm_dev 地鼠盘设备
 * @note 
 * output   :/
		@return None
 * istested :N
 */
    extern void Hamster_Generate(_DEV(HamsterPlate) * fm_dev);
/**
 * @brief 杀死地鼠
 * @note 
 * input	:/
 *      @param fm_dev 地鼠盘设备
 * @note 
 * output   :/
		@return None
 * istested :N
 */
    extern void Hamster_Kill(_DEV(HamsterPlate) * fm_dev);
/**
 * @brief 杀死所有地鼠
 * @note 
 * input	:/
 *      @param fm_dev 地鼠盘设备
 * @note 
 * output   :/
		@return None
 * istested :N
 */
    extern void Hamster_KillAll(_DEV(HamsterPlate) * fm_dev);
/**
 * @brief 地鼠丢失
 * @note 
 * input	:/
 *      @param fm_dev 地鼠盘设备
 * @note 
 * output   :/
		@return None
 * istested :N
 */
    extern void Hamster_Lost(_DEV(HamsterPlate) * fm_dev);
/**
 * @brief 击中地鼠
 * @note 
 * input	:/
 *      @param fm_dev 地鼠盘设备
 * @note 
 * output   :/
		@return None
 * istested :N
 */
    extern void Hamster_Got(_DEV(HamsterPlate) * fm_dev);

	#ifdef __cplusplus		//Compatible C++
	}
	#endif
#endif

/*-------------------------------------------------------*\
					Example TXT Helper
\*-------------------------------------------------------*/

/* Documents for direct replication */

/*
* name:/
* des:/
* how2use:/
* other:/
*/
/*
...
*/