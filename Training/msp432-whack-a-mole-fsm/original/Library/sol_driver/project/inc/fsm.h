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
 * @LastEditTime: 2021-09-16 19:38:09
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Gen\Inc\gen_fsm.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __GEN_FSM_H
#define __GEN_FSM_H			//Prevent redefinition

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
				  Extern Form .C
\*-------------------------------------------------------*/



/*-------------------------------------------------------*\
				  Extern Form Other
\*-------------------------------------------------------*/



/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
#define SOL_FSM_Tran(target) (((FSM_t *)this_p) -> state_handler = (State_Handler)(target), TRAN_STATUS)


#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
/*-------------------------*\
   SOL库支持状态机(继承型)
\*-------------------------*/
	//事件保留信号枚举
	ENUM(SOL_FSM_Rev_Sig){
		INIT_SIG, 	/* dispatched to AO before entering event-loop */
		ENTRY_SIG, 	/* for triggering the entry action in a state */
		EXIT_SIG,  	/* for triggering the exit action from a state */

		/* Please define User FSM MOD and User FSM Sig*/
		IS_GAME_SIG,           //游戏开始
	};
	//信号定义
	typedef uint16_t sig_t;
	typedef uint16_t pmod_t;
	//事件结构体
	typedef struct event_t event_t;
	struct event_t {
		//模式信号
		sig_t signal;		
	};

	//状态句柄枚举
	typedef enum {
		TRAN_STATUS, 	//转换状态
		HANDLED_STATUS, //处理状态
		IGNORED_STATUS, //忽略状态
		INIT_STATUS		//初始化状态
	} status_t;

	typedef struct FSM_t FSM_t;
	typedef status_t (* State_Handler) (FSM_t * this_p, event_t const * const evt);
	//FSM状态机结构体
	struct FSM_t{
		State_Handler state_handler;
	};

	ENUM(FSM_Mod){
		FSM_NORMAL_MOD,
		FSM_TABLE_MOD
	};
/*-------------------------*\
    捕获比较状态机(Case型)
\*-------------------------*/
/* ENUM(FSM_CapValue_Status){
    
}; */

#ifdef USER_FUN
#endif

/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/

	extern void SOL_FSM_Handler_Ctor(FSM_t * const this_p, State_Handler initial);
	extern void SOL_FSM_Sig_Ctor(event_t * evt, sig_t initial);
	extern void SOL_FSM_Init(FSM_t * const this_p);
	extern void SOL_FSM_Dispatch(FSM_t * const this_p, event_t const * const evt);

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