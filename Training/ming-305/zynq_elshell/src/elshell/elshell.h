#ifndef __ELSHELL_H_PROTECT
#define __ELSHELL_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
#include "eldef.h"
#include "elq.h"
#include "elcmd.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/*-------------------------------------------------------*\
							Define
	\*-------------------------------------------------------*/

	/**
	 * @brief ELShell接收队列定义
	 */
	EL_QUEUE_CREAT_DEF(char, elrecv);

	/**
	 * @brief ELShell 等待执行命令队列定义
	 */
	EL_QUEUE_CREAT_DEF(el_cmdd_8p_t *, elproc);

	/*-------------------------------------------------------*\
					   Enum/Union/Struct
	\*-------------------------------------------------------*/

	typedef enum
	{
		e_elshellStatus_err = -1,
		e_elshellStatus_idle,
		e_elshellStatus_getting,
		e_elshellStatus_got
	} el_shell_status_t;

	/*-------------------------------------------------------*\
				Referential function definition
	\*-------------------------------------------------------*/

	extern el_err_t ELShell_Init(void);
	extern el_err_t ELShell_Recv_Enq(char f_c);
	extern el_err_t ELShell_Dispatch(void);

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELSHELL_H_PROTECT

/*-------------------------------------------------------*\
					Example Helper
\*-------------------------------------------------------*/

/* Documents for direct replication */

/*
 * name:/
 * des:/
 * how2use:/
 * other:/
 */
/*
	static void cmd1p_test_call(void *f_ptr)
	{
		LOCAL_PRINTF("CMD 1P Test! Param = [%d]\n\r", *((uint32_t *)f_ptr));
	}
	static el_cmdd_1p_t fg_cmd1p_test;
	static el_para_type_t fg_cmd1p_pType[] = {e_elParaType_size32, 0, 0, 0, 0, 0, 0, 0};
	r_el |= el_cmd_reg(&fg_cmd1p_test,
					   "test_1p",
					   e_elCmdType_call,
					   cmd1p_test_call,
					   fg_cmd1p_test_help,
					   1,
					   fg_cmd1p_pType);
	if (r_el != e_el_eok)
	{
		return ANOS_ERROR;
	}
*/