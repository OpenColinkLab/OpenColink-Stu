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
 * @Date: 2022-04-23 15:51:04
 * @LastEditTime: 2022-04-23 15:56:04
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\driver_sol\User_Dev\Src\hamsterPlate.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */
/*---------------------------*\
			Include
\*---------------------------*/
#include "hamster_Plate.h"

#include "stdlib.h"
#include "main_432.h"
/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
_DEV(HamsterPlate) gS_hamsterPlate;
/*-------------------------------------------------------*\
			     Extern From Other
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
void HamsterPlate_Init(_DEV(HamsterPlate) * fm_dev,
						hamsterPlateWritePinFunP fm_write_pin,
						hamsterPlateReadPinFunP fm_read_pin,
						hamsterPlateDelayFunP fm_delay)
{
	fm_dev->m_hamsterPlateWritePin = fm_write_pin;
	fm_dev->m_hamsterPlateReadPin = fm_read_pin;
	fm_dev->m_hamsterPlateDelay = fm_delay;
}
/**
 * @brief 任意位置生成地鼠
 */
//为了与矩阵键盘对应，所以采取了数组映射
static const uint8_t l_hamsterPositionArr[10] = {0,1,2,3,5,6,7,9,10,11};
void Hamster_Generate(_DEV(HamsterPlate) * fm_dev){
    uint8_t tem_hamsterPoision = 0;
    tem_hamsterPoision = ((rand()%9) + 1);
    fm_dev->m_gameInfo.m_posion = l_hamsterPositionArr[tem_hamsterPoision];

    switch (tem_hamsterPoision)
    {
    case 1:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h1Port,fm_dev->m_h1Pin,GPIO_PIN_SET);
        break;
    case 2:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h2Port,fm_dev->m_h2Pin,GPIO_PIN_SET);
        break;
    case 3:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h3Port,fm_dev->m_h3Pin,GPIO_PIN_SET);
        break;
    case 4:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h4Port,fm_dev->m_h4Pin,GPIO_PIN_SET);
        break;
    case 5:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h5Port,fm_dev->m_h5Pin,GPIO_PIN_SET);
        break;
    case 6:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h6Port,fm_dev->m_h6Pin,GPIO_PIN_SET);
        break;
    case 7:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h7Port,fm_dev->m_h7Pin,GPIO_PIN_SET);
        break;
    case 8:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h8Port,fm_dev->m_h8Pin,GPIO_PIN_SET);
        break;
    case 9:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h9Port,fm_dev->m_h9Pin,GPIO_PIN_SET);
        break;
    default:
        break;
    }

    //printf("The hamster was generated in block %d\n",tem_hamsterPoision);
}
/**
 * @brief 杀死地鼠
 */
void Hamster_Kill(_DEV(HamsterPlate) * fm_dev){

    switch (fm_dev->m_gameInfo.m_posion)
    {
    case 1:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h1Port,fm_dev->m_h1Pin,GPIO_PIN_RESET);
        break;
    case 2:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h2Port,fm_dev->m_h2Pin,GPIO_PIN_RESET);
        break;
    case 3:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h3Port,fm_dev->m_h3Pin,GPIO_PIN_RESET);
        break;
    case 5:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h4Port,fm_dev->m_h4Pin,GPIO_PIN_RESET);
        break;
    case 6:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h5Port,fm_dev->m_h5Pin,GPIO_PIN_RESET);
        break;
    case 7:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h6Port,fm_dev->m_h6Pin,GPIO_PIN_RESET);
        break;
    case 9:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h7Port,fm_dev->m_h7Pin,GPIO_PIN_RESET);
        break;
    case 10:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h8Port,fm_dev->m_h8Pin,GPIO_PIN_RESET);
        break;
    case 11:
        fm_dev->m_hamsterPlateWritePin(fm_dev->m_h9Port,fm_dev->m_h9Pin,GPIO_PIN_RESET);
        break;
    
    default:
        break;
    }
    fm_dev->m_gameInfo.m_posion = 17;   //地鼠位置置99不与其他键位冲突
}
/**
 * @brief 全灭地鼠
 */
void Hamster_KillAll(_DEV(HamsterPlate) * fm_dev){
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h1Port,fm_dev->m_h1Pin,GPIO_PIN_RESET);
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h2Port,fm_dev->m_h2Pin,GPIO_PIN_RESET);
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h3Port,fm_dev->m_h3Pin,GPIO_PIN_RESET);
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h4Port,fm_dev->m_h4Pin,GPIO_PIN_RESET);
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h5Port,fm_dev->m_h5Pin,GPIO_PIN_RESET);
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h6Port,fm_dev->m_h6Pin,GPIO_PIN_RESET);
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h7Port,fm_dev->m_h7Pin,GPIO_PIN_RESET);
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h8Port,fm_dev->m_h8Pin,GPIO_PIN_RESET);
    fm_dev->m_hamsterPlateWritePin(fm_dev->m_h9Port,fm_dev->m_h9Pin,GPIO_PIN_RESET);
}

/**
 * @brief 地鼠丢失
 */

void Hamster_Lost(_DEV(HamsterPlate) * fm_dev){
    uint16_t tmp_num = fm_dev->m_gameInfo.m_totalLost;
    if((tmp_num >= 0) && (tmp_num <= 9999)){
        fm_dev->m_gameInfo.m_totalLost ++;
    }
    SOL_Beep_On(fm_dev->m_beepUsed,500,600);
    //printf("Ulost it!\n");
}
/**
 * @brief 击中地鼠
 */
void Hamster_Got(_DEV(HamsterPlate) * fm_dev){
    uint16_t tmp_num = fm_dev->m_gameInfo.m_totalScore;
    if((tmp_num >= 0) && (tmp_num <= 9999)){
        fm_dev->m_gameInfo.m_totalScore ++;
    }
    SOL_Beep_On(fm_dev->m_beepUsed,1000,300);
    //printf("Ugot it!\n");
}

/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif
