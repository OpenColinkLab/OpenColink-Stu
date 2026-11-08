//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-22 13:25:05
 * File Name: elmem.h
 * Module Name: ELShell Memory API
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-22
 * ------------------
 * Description:
 * 内存相关API
 *
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

#ifndef __ELMEM_H_PROTECT
#define __ELMEM_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
#include "eldef.h"
#include "eladp.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/*-------------------------------------------------------*\
							Define
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
					   Enum/Union/Struct
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
				Referential function definition
	\*-------------------------------------------------------*/

	extern void *(elmemchr)(const void *s, int32_t c, uint32_t n);
	extern int32_t(elmemcmp)(const void *s1, const void *s2, uint32_t n);
	extern void *(elmemcpy)(void *s1, const void *s2, uint32_t n);
	extern void *(elmemset)(void *s, int32_t c, uint32_t n);

	static inline void *elcalloc(uint32_t f_num, uint32_t f_perSize)
	{
		return (eladp_elcalloc(f_num, f_perSize));
	}

	static inline void elfree(void *f_ptr)
	{
		eladp_elfree(f_ptr);
		return;
	}

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELMEM_H_PROTECT

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