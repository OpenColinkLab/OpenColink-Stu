//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-22 12:07:09
 * File Name: eldef.h
 * Module Name: ELShell Definition
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-22
 * ------------------
 * Description:
 * ELShell 定义
 *
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

#ifndef __ELDEF_H_PROTECT
#define __ELDEF_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
#include "stdint.h"
#include "elcfg.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/*-------------------------------------------------------*\
							Define
	\*-------------------------------------------------------*/

#define EL_NULL ((void *)0)
#define EL_TRUE (!(!(1)))
#define EL_FALSE (!(!(0)))

	typedef uint8_t el_bool_t;

	/*-------------------------------------------------------*\
					   Enum/Union/Struct
	\*-------------------------------------------------------*/

	typedef enum
	{
		e_el_efull = -4,
		e_el_ebusy = -3,
		e_el_evalid = -2,
		e_el_error = -1,
		e_el_eok = 0
	} el_err_t;

	/*-------------------------------------------------------*\
				Referential function definition
	\*-------------------------------------------------------*/

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELDEF_H_PROTECT

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
...
*/