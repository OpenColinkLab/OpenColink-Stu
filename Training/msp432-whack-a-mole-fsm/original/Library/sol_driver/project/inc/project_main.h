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
 * @Date: 2021-09-19 21:10:31
 * @LastEditTime: 2021-09-22 16:47:07
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_Proj\Inc\project_c.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __PROJECT_MAIN_H
#define __PROJECT_MAIN_H			//Prevent redefinition

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
	#include "fsm.h"
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
	//FLASH匹配表大小
	#define TABLE_X_NUM 20
	#define TABLE_Y_NUM 12
	#define TABLE_Z_NUM 3
	#define TABLE_ALL_NUM (TABLE_X_NUM * TABLE_Y_NUM * TABLE_Z_NUM)

	//16M-W25Q16(0x000000 - 0x1FFFFF 2MByte)
	#define FLASH_START_ADDRESS 0x000000	//FLASH起始地址

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/
//(User Change)
	//继承状态机的工程子类结构体定义
	STRUCT(Proj_UserFsm){
		FSM_t fsm_used;		//基类必须放在首位,以防指针转换出错
	};
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/
//继承状态机的工程子类引用
extern _STRUCT(Proj_UserFsm) proj_fsm;
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/
//示例函数:(请所有状态函数都按此格式定义,建议使用typedef)
//extern status_t Proj_UserFsm_Mod_Switch	(_STRUCT(Proj_UserFsm) * this_p, event_t const * const evt);

extern status_t Proj_Idle(_STRUCT(Proj_UserFsm) * this_p, event_t const *const evt);
extern status_t Proj_StartGame(_STRUCT(Proj_UserFsm) * this_p, event_t const *const evt);
extern status_t Proj_Check(_STRUCT(Proj_UserFsm) * this_p, event_t const *const evt);

#ifdef USER_FUN
#endif

	#ifdef __cplusplus		//Compatible C++
	}
	#endif
#endif
