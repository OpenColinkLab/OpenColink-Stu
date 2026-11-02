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
 * @LastEditTime: 2022-04-24 21:13:13
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\project\src\fsm.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "fsm.h"
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/


#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/
static event_t const entry_evt = {ENTRY_SIG};
static event_t const exit_evt = {EXIT_SIG};

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/**
 * @note 
 * fun_name :SOL_FSM_Handler_Ctor
 * describe :
 * input	:/
 *      @param 
 *      - \b 
 *      - \b 
 *      @param 
 *      - \b 
 *      - \b 
 * @note 
 * output   :/
 * change   :/
 * other_dis:/
 * platform :
 * istested :N
 */
void SOL_FSM_Handler_Ctor(FSM_t * const this_p, State_Handler ctr_evt){
	this_p->state_handler = ctr_evt;
}

/**
 * @note 
 * fun_name :
 * describe :
 * input	:/
 *      @param 
 *      - \b 
 *      - \b 
 *      @param 
 *      - \b 
 *      - \b 
 * @note 
 * output   :/
 * change   :/
 * other_dis:/
 * platform :
 * istested :N
 */
void SOL_FSM_Sig_Ctor(event_t * evt, sig_t initial){
	evt->signal = initial;
}

/**
 * @note 
 * fun_name :SOL_FSM_Init
 * describe :
 * input	:/
 *      @param 
 *      - \b 
 *      - \b 
 *      @param 
 *      - \b 
 *      - \b 
 * @note 
 * output   :/
 * change   :/
 * other_dis:/
 * platform :
 * istested :N
 */
void SOL_FSM_Init(FSM_t * const this_p){
	(this_p->state_handler)(this_p, &entry_evt);
}

/**
 * @note 
 * fun_name :SOL_FSM_Dispatch
 * describe ：
 * input	:/
 *      @param 
 *      - \b 
 *      - \b 
 *      @param 
 *      - \b 
 *      - \b 
 * @note 
 * output   :/
 * change   :/
 * other_dis:/
 * platform :
 * istested :N
 */

void SOL_FSM_Dispatch(FSM_t * const this_p, event_t const * const evt){
	status_t status;
	State_Handler prev_state = this_p -> state_handler;
	
	status = (this_p->state_handler)(this_p, evt);
	
	if(status == TRAN_STATUS){
		prev_state(this_p, &exit_evt);					//退出旧状态
		(this_p->state_handler)(this_p, &entry_evt);	//进入新状态
	}
}


#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif
