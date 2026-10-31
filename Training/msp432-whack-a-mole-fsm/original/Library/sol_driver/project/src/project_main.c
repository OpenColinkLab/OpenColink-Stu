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
 * @Date: 2021-09-19 21:10:19
 * @LastEditTime: 2021-09-22 16:46:52
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_Proj\Src\project_c.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "project_main.h"
#include "hamster_plate.h"
#include "main_432.h"
#include "bsp_delay.h"
#include "stdlib.h"
//本地调试控制
/* 	#ifdef DBG_MOD
		#undef DBG_MOD
	#endif
		#define DBG_MOD_OFF */

/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
_STRUCT(Proj_UserFsm) proj_fsm = {0};			//工程状态机
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
			     	FSM Function
\*-------------------------------------------------------*/
/* 空闲状态 */
status_t Proj_Idle(_STRUCT(Proj_UserFsm) * this_p, event_t const *const evt){
	status_t status_ret;
	
    switch (evt->signal)
    {
		case ENTRY_SIG:
		{
			status_ret = HANDLED_STATUS;
			break;
		}
		case EXIT_SIG:
		{
			status_ret = HANDLED_STATUS;
			break;
		}
		case IS_GAME_SIG :
		{
            if(mkey_val == 16){
                CLEAR(mkey_val);

                gS_hamsterPlate.m_gameInfo.m_totalScore = 0;    //清空记分板
                gS_hamsterPlate.m_gameInfo.m_totalLost = 0;
                SET(gS_hamsterPlate.m_gameInfo.m_nextTurn);     //设置为可以开始游戏
				SOL_FSM_Tran(Proj_StartGame);
                printf("Game Start!\n");
                SOL_Delayms(1000);
            }
            Hamster_KillAll(&gS_hamsterPlate);
            
            status_ret = HANDLED_STATUS;
			break;
		}
		default:
		{
			SOL_FSM_Sig_Ctor((event_t *) evt,ENTRY_SIG);    //确保出状态时为某一状态,默认为入状态
			status_ret = IGNORED_STATUS;
			break;
		}
    }
	
    return (status_ret);
}

/* 开始游戏 */
status_t Proj_StartGame(_STRUCT(Proj_UserFsm) * this_p, event_t const *const evt){
	status_t status_ret;

    if(mkey_val == 16){
        CLEAR(mkey_val);
        //退出游戏
        printf("Quit Game.\n");
		
		//跳转为空闲状态
        SOL_FSM_Tran(Proj_Idle);
		status_ret = HANDLED_STATUS;	
		return (status_ret);
    }
	
    switch (evt->signal)
    {
		case ENTRY_SIG:
		{ 
			status_ret = HANDLED_STATUS;
			break;
		}
		case EXIT_SIG:
		{
			status_ret = HANDLED_STATUS;
			break;
		}
		case IS_GAME_SIG :
		{
            if(gS_hamsterPlate.m_gameInfo.m_nextTurn){
                CLEAR(gS_hamsterPlate.m_gameInfo.m_nextTurn);//锁住本轮
                SOL_Delayms(((rand()%15) + 5) * 100);
                CLEAR(mkey_val);
                Hamster_Generate(&gS_hamsterPlate);           //某一位置随机生成一只地鼠
                gS_hamsterPlate.m_gameInfo.m_isTimeOut = 0;   //重置为不超时
                g_hamsterWaitToken = 0; //重置等待令牌
                SOL_FSM_Tran(Proj_Check);
            }else{
                SOL_FSM_Tran(Proj_Check);   //补完循环直接进入下一步
            }
            status_ret = HANDLED_STATUS;
			break;
		}
		default:
		{
			SOL_FSM_Sig_Ctor((event_t *) evt,ENTRY_SIG);    //确保出状态时为某一状态,默认为入状态
			status_ret = IGNORED_STATUS;
			break;
		}
    }
	
    return (status_ret);
}

/* 检查是否超时 */
status_t Proj_Check(_STRUCT(Proj_UserFsm) * this_p, event_t const *const evt){
	status_t status_ret;

    if(mkey_val == 16){
        CLEAR(mkey_val);
        //退出游戏
        printf("Quit Game.\n");
		
		//跳转为空闲状态
        SOL_FSM_Tran(Proj_Idle);
		status_ret = HANDLED_STATUS;	
		return (status_ret);
    }
    
    switch (evt->signal)
    {
		case ENTRY_SIG:
		{ 
			status_ret = HANDLED_STATUS;
			break;
		}
		case EXIT_SIG:
		{
			status_ret = HANDLED_STATUS;
			break;
		}
		case IS_GAME_SIG :
		{
            if(gS_hamsterPlate.m_gameInfo.m_isTimeOut){
                CLEAR(gS_hamsterPlate.m_gameInfo.m_isTimeOut);
                Hamster_Lost(&gS_hamsterPlate); //判定为打击失败
                Hamster_Kill(&gS_hamsterPlate); //清除地鼠
                SET(gS_hamsterPlate.m_gameInfo.m_nextTurn); //设置为可开启下一轮
                SOL_FSM_Tran(Proj_StartGame);   //重新开始生成地鼠进行下一轮
            }else if(mkey_val == gS_hamsterPlate.m_gameInfo.m_posion){
                CLEAR(mkey_val);
                Hamster_Got(&gS_hamsterPlate);  //判定为击中
                Hamster_Kill(&gS_hamsterPlate); //清除地鼠
                SET(gS_hamsterPlate.m_gameInfo.m_nextTurn); //设置为可开启下一轮
                SOL_FSM_Tran(Proj_StartGame);   //重新开始生成地鼠进行下一轮
            }else if(mkey_val != 0 && mkey_val != 16 && mkey_val != 4 && mkey_val != 8){
                CLEAR(mkey_val);
                Hamster_Lost(&gS_hamsterPlate); //判定为打击失败
                Hamster_Kill(&gS_hamsterPlate); //清除地鼠
                SET(gS_hamsterPlate.m_gameInfo.m_nextTurn); //设置为可开启下一轮
                SOL_FSM_Tran(Proj_StartGame);   //重新开始生成地鼠进行下一轮                
            }else{
                SOL_FSM_Tran(Proj_StartGame);   //补完循环但不进行下一轮
            }

            status_ret = HANDLED_STATUS;
			break;
		}
		default:
		{
			SOL_FSM_Sig_Ctor((event_t *) evt,ENTRY_SIG);    //确保出状态时为某一状态,默认为入状态
			status_ret = IGNORED_STATUS;
			break;
		}
    }
	
    return (status_ret);
}
