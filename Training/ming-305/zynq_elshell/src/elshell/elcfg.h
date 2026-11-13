//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-22 13:49:50
 * File Name: elcfg.h
 * Module Name: ELShell Configuration
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-22
 * ------------------
 * Description:
 * ELSHELL 相关配置项
 *
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

#ifndef __ELCFG_H_PROTECT
#define __ELCFG_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/*-------------------------------------------------------*\
							Define
	\*-------------------------------------------------------*/

#define ELSHELL_TEST_ENABLE 0 // 是否启用测试

#define ELSHELL_CMD_WAIT_PROC_QUEUE_SIZE (4U)					  // 任务等待处理队列大小
#define ELSHELL_RX_QUEUE_SIZE (256U)							  // 接收队列大小
#define ELSHELL_DEFAULT_DECIMAL_PLACES (6)						  // 默认小数位数(10进制 Float 下)
#define ELSHELL_DEFAULT_INTEGER_DIGITS (7)						  // 默认整数位数(10进制 Float 下)
#define ELSHELL_CMD_PARAMETER_MAXNUM (8)						  // 命令最大参数数量(禁止改变)
#define ELSHELL_CMD_IX_MAXLEN (16U)								  // 命令索引最大长度
#define ELSHELL_PARAMETER_MAX_PERSIZE (36U)						  // 单个参数最大缓冲区大小
#define ELSHELL_CMD_STRING_MAXLEN (32U)							  // 字符串参数最大字符串长度(实际字符串 ELSHELL_CMD_STRING_MAXLEN - 1)
#define ELSHELL_CMD_PRV_VAR_BUF_PERSIZE ELSHELL_CMD_STRING_MAXLEN // 命令结构体内私有变量缓冲区块大小
#define ELSHELL_CMD_HASH_TABLE_SIZE (32)						  // 命令哈希表规模
#define ELSHELL_CMD_PARAMETER_FLAG_MAXLEN (5)					  // 参数标识符最大长度

#if (ELSHELL_PARAMETER_MAX_PERSIZE < 32U)
#error ELSHELL_PARAMETER_MAX_PERSIZE Must Larger Than 33! (for %32b  Format)
#endif
#if (ELSHELL_CMD_PARAMETER_MAXNUM != 8U)
#error ELSHELL_CMD_PARAMETER_MAXNUM Must Eq 8!
#endif
#if (ELSHELL_PARAMETER_MAX_PERSIZE < ELSHELL_CMD_STRING_MAXLEN)
#error ELSHELL_PARAMETER_MAX_PERSIZE Not Enough For String!
#endif
#if (ELSHELL_CMD_STRING_MAXLEN != ELSHELL_CMD_PRV_VAR_BUF_PERSIZE)
#error ELSHELL_CMD_STRING_MAXLEN Must Eq ELSHELL_CMD_PRV_VAR_BUF_PERSIZE!
#endif

#define ES_C_SOC '/'  // ELSHELL_START_OF_COMMAND 必须存在
#define ES_C_EOC '\r' // ELSHELL_END_OF_COMMAND 必须存在

// #define ES_C_LBOOC '\n' // ELSHELL_LAST_BUT_ONE_OF_COMMAND 为 '\0' 则不进行断言
#define ES_C_LBOOC '\0' // ELSHELL_LAST_BUT_ONE_OF_COMMAND 为 '\0' 则不进行断言

//!! 由于转换缓冲区大小问题,以下标识符长度不得超过 ELSHELL_CMD_PARAMETER_FLAG_MAXLEN 字节(包括 '\0')
#define ES_P_SBP ' '	// ELSHELL_SYMBOL_BETWEEN_PARAMETER 参数间间隔符号
#define ES_P_SOP '-'	// ELSHELL_START_OF_PARAMETER 参数标识起始符
#define ES_PF_B8 "b8"	// ELSHELL_PARAMETER_FLAG B8 8位2进制参数标识
#define ES_PF_X8 "x8"	// ELSHELL_PARAMETER_FLAG X8 8位16进制参数标识
#define ES_PF_D8 "d8"	// ELSHELL_PARAMETER_FLAG D8 8位10进制参数标识
#define ES_PF_B16 "b16" // ELSHELL_PARAMETER_FLAG B16 16位2进制参数标识
#define ES_PF_X16 "x16" // ELSHELL_PARAMETER_FLAG X16 16位16进制参数标识
#define ES_PF_D16 "d16" // ELSHELL_PARAMETER_FLAG D16 16位10进制参数标识
#define ES_PF_B32 "b32" // ELSHELL_PARAMETER_FLAG B32 32位2进制参数标识
#define ES_PF_X32 "x32" // ELSHELL_PARAMETER_FLAG X32 32位16进制参数标识
#define ES_PF_D32 "d32" // ELSHELL_PARAMETER_FLAG D32 32位10进制参数标识
#define ES_PF_F "f"		// ELSHELL_PARAMETER_FLAG FLOAT 单精度浮点参数标识
#define ES_PF_STR "s"	// ELSHELL_PARAMETER_FLAG STRING 字符串参数标识
#define ES_PF_BOOL "b"	// ELSHELL_PARAMETER_FLAG BOOL 布尔值参数标识

	/*-------------------------------------------------------*\
					   Enum/Union/Struct
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
				Referential function definition
	\*-------------------------------------------------------*/

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELCFG_H_PROTECT

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
