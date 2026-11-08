//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-22 12:03:04
 * File Name: elio.h
 * Module Name: ELShell IO
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-22
 * ------------------
 * Description:
 * ELShell 输入输出API
 * 包含 elprintf elstrcpy 等实现
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

#ifndef __ELIO_H_PROTECT
#define __ELIO_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
#include "eldef.h"
#include "eladp.h"
#include "elq.h"

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

	extern uint32_t elprintf(const uint8_t *format, ...);
	extern el_err_t elbufclr(uint8_t *buf_ptr, uint32_t f_size);

	extern el_err_t elitoa(int32_t i32);
	extern el_err_t ellitoa(int64_t i64);
	extern el_err_t elftoa(float f);

	extern int32_t elatoi(uint8_t *c_ptr);
	extern int64_t elatoli(uint8_t *c_ptr);
	extern float elatof(uint8_t *c_ptr);

	extern int32_t elatoi_cmd(uint8_t *c_ptr);
	extern int64_t elatoli_cmd(uint8_t *c_ptr);
	extern float elatof_cmd(uint8_t *c_ptr);
	extern uint32_t elstrtoul_cmd(uint8_t *c_ptr, uint32_t base, el_err_t *fr_errorCode_ptr);
	//! 弃用 extern uint64_t elstrtoull_cmd(uint8_t *c_ptr, uint32_t base);
	extern uint32_t elbufgets_cmd(uint8_t *buf_ptr, uint32_t f_bufLen, char **fr_soc_ptr);

	/**
	 * @brief 向流发送字符
	 */
	static inline void elputc(char c)
	{
		eladp_elputc(c);
	}

	/**
	 * @brief 从流接收字符
	 */
	static inline char elgetc(void)
	{
		return (eladp_elgetc());
	}

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELIO_H_PROTECT

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