//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    鈻堚枅鈻堚枅鈻堚枅鈺椻枅鈻堚晽  鈻堚枅鈺椻枅鈻堚枅鈻堚枅鈻堚枅鈺椻枅鈻堚晽鈻堚枅鈻堚枅鈻堚枅鈻堚晽鈻堚枅鈻堚枅鈻堚枅鈺�
 * Engineer: Chsier                    鈻堚枅鈺斺晲鈺愨晲鈺愨暆鈻堚枅鈺�  鈻堚枅鈺戔枅鈻堚晹鈺愨晲鈺愨晲鈺濃枅鈻堚晳鈻堚枅鈺斺晲鈺愨晲鈺愨暆鈻堚枅鈺斺晲鈺愨枅鈻堚晽
 * E-mail: 1481154662@qq.com           鈻堚枅鈺�     鈻堚枅鈻堚枅鈻堚枅鈻堚晳鈻堚枅鈻堚枅鈻堚枅鈻堚晽鈻堚枅鈺戔枅鈻堚枅鈻堚枅鈺�  鈻堚枅鈻堚枅鈻堚枅鈺斺暆
 * Cnblogs: www.cnblogs.com/chsier     鈻堚枅鈺�     鈻堚枅鈺斺晲鈺愨枅鈻堚晳鈺氣晲鈺愨晲鈺愨枅鈻堚晳鈻堚枅鈺戔枅鈻堚晹鈺愨晲鈺�  鈻堚枅鈺斺晲鈺愨枅鈻堚晽
 *                                     鈺氣枅鈻堚枅鈻堚枅鈻堚晽鈻堚枅鈺�  鈻堚枅鈺戔枅鈻堚枅鈻堚枅鈻堚枅鈺戔枅鈻堚晳鈻堚枅鈻堚枅鈻堚枅鈻堚晽鈻堚枅鈺�  鈻堚枅鈺�
 * Create Date: 25-05-29 16:42:17
 * File Name: elcmd.h
 * Module Name: EL Shell API
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-29
 * ------------------
 * Description:
 * 	eg:
 * 		1. static test_cmdd;
 * 		2. el_cmd_reg;
 *
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

#ifndef __ELCMD_H_PROTECT
#define __ELCMD_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
#include "eldef.h"
#include "elhash.h"
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

	// 瀹氫箟涓嶅悓鍙傛暟鏁伴噺鐨勫嚱鏁版寚閽堢被鍨�
	typedef void *(*el_fun_argnum_0)(void);											  // 鏃犲弬鏁�
	typedef void *(*el_fun_argnum_1)(void *arg1);									  // 1涓弬鏁�
	typedef void *(*el_fun_argnum_2)(void *arg1, void *arg2);						  // 2涓弬鏁�
	typedef void *(*el_fun_argnum_3)(void *arg1, void *arg2, void *arg3);			  // 3涓弬鏁�
	typedef void *(*el_fun_argnum_4)(void *arg1, void *arg2, void *arg3, void *arg4); // 4涓弬鏁�
	typedef void *(*el_fun_argnum_5)(void *arg1, void *arg2, void *arg3, void *arg4,
									 void *arg5); // 5涓弬鏁�
	typedef void *(*el_fun_argnum_6)(void *arg1, void *arg2, void *arg3, void *arg4,
									 void *arg5, void *arg6); // 6涓弬鏁�
	typedef void *(*el_fun_argnum_7)(void *arg1, void *arg2, void *arg3, void *arg4,
									 void *arg5, void *arg6, void *arg7); // 7涓弬鏁�
	typedef void *(*el_fun_argnum_8)(void *arg1, void *arg2, void *arg3, void *arg4,
									 void *arg5, void *arg6, void *arg7, void *arg8); // 8涓弬鏁�
	/**
	 * @brief ELShell 鍙傛暟绫诲瀷鏋氫妇
	 * @param e_elParaType_none 鏃犲弬鏁扮被鍨�,鐢ㄤ簬鍗犱綅鎴栨棤鏁堝弬鏁�
	 * @param e_elParaType_bool 甯冨皵绫诲瀷鍙傛暟(true/false)
	 * @param e_elParaType_size8 8浣嶆暣鏁板弬鏁�(int8_t 鎴� uint8_t)
	 * @param e_elParaType_size16 16浣嶆暣鏁板弬鏁�(int16_t 鎴� uint16_t)
	 * @param e_elParaType_size32 32浣嶆暣鏁板弬鏁�(int32_t 鎴� uint32_t)
	 * @param e_elParaType_float 鍗曠簿搴︽诞鐐瑰弬鏁�(float)
	 * @param e_elParaType_string 瀛楃涓插弬鏁�(const char *)
	 * @param e_elParaType_cmdix 
	 * @note - 鐢ㄤ簬瀹氫箟 shell 鍛戒护鐨勫弬鏁扮被鍨�,涓� elprintf 鏍煎紡璇存槑绗�(濡� %8b %f %s)瀵瑰簲.
	 *       - e_elParaType_last 鏍囪鏋氫妇杈圭晫,纭繚涓嶈秴杩� 255(uint8_t 鑼冨洿).
	 *       - 鐭暣鍨�(8/16 浣�)鍦� va_arg 涓彁鍗囦负 int,闇�娉ㄦ剰绫诲瀷鎻愬彇.
	 */
	typedef enum
	{
		e_elParaType_none = 0,
		e_elParaType_bool,
		e_elParaType_size8,
		e_elParaType_size16,
		e_elParaType_size32,
		e_elParaType_float,
		e_elParaType_string,
		//...
		e_elParaType_cmdix = 255
	} el_para_type_t;

	/**
	 * @brief ELShell 鍛戒护绫诲瀷鏋氫妇
	 * @param e_elCmdType_none 鏃犵被鍨嬪懡浠�,鐢ㄤ簬娴嬭瘯鎴栧崰浣�
	 * @param e_elCmdType_call 鍑芥暟璋冪敤绫诲瀷鍛戒护,鎵ц鎸囧畾鍑芥暟
	 * @param e_elCmdType_assign 鍙傛暟璧嬪�肩被鍨嬪懡浠�,淇敼鍙橀噺鍊�
	 * @note - 瀹氫箟 shell 鍛戒护鐨勬墽琛屾柟寮�,褰卞搷 el_cmdd_0p_t 涓仈鍚堜綋鐨勪娇鐢�.
	 *       - e_elCmdType_last 鏍囪鏋氫妇杈圭晫,纭繚涓嶈秴杩� 255(uint8_t 鑼冨洿).
	 *       - 鎵╁睍鏃跺彲娣诲姞鏂板懡浠ょ被鍨�(濡傛煡璇� 閰嶇疆).
	 */
	typedef enum
	{
		e_elCmdType_none = 0,
		e_elCmdType_call,
		e_elCmdType_assign,
		//...
		e_elCmdType_last = 255,
	} el_cmd_type_t;

	typedef enum
	{
		e_elCmdStatus_none = 0,
		e_elCmdStatus_idle,
		e_elCmdStatus_needToExecute,
		e_elCmdStatus_executing,
		//...
		e_elCmdStatus_last = 255,
	} el_cmd_status_t;

	/**
	 * @brief 鍛戒护绫诲瀷鐢熸垚鍣�
	 * @param f_parNum 鍛戒护鏀寔鐨勫弬鏁版暟閲�,鍐冲畾鐢熸垚鐨勭粨鏋勪綋绫诲瀷鍜屾暟缁勫ぇ灏�
	 *        鏈夋晥鍙傛暟:
	 *        - \b f_parNum:姝ｆ暣鏁�(澶т簬 0),琛ㄧず鍛戒护鐨勫弬鏁版暟閲�
	 * @return None(瀹氫箟涓�涓柊鐨勭粨鏋勪綋绫诲瀷 el_cmdd_Xp_t,鍏朵腑 X 涓� f_parNum)
	 * @note
	 *       - 鐢熸垚鐨勭粨鏋勪綋鐢ㄤ簬鎻忚堪 ELShell 鍛戒护鐨勫厓鏁版嵁,閰嶅悎 EL_REG_CMD_CALL 娉ㄥ唽鍛戒护
	 *       - m_cmdIx 瀛樺偍鍛戒护绱㈠紩瀛楃涓�,鏈�澶ч暱搴︿负 ELSHELL_CMD_IX_MAXLEN
	 *       - ms_flags 鍖呭惈鍛戒护绫诲瀷(m_cmdType @el_cmd_type_t,3 浣�)鍜岀姸鎬�(m_cmdStatus @el_cmd_status_t,2 浣�)
	 *       - m_cmdHelp_ptr 鎸囧悜甯姪淇℃伅,闇�涓� EL_REG_CMD_CALL 鐨� f_cmdHelp_ptr 涓�鑷�
	 *       - m_funArgNumx_ptr 涓哄懡浠ゅ鐞嗗嚱鏁版寚閽�,绫诲瀷鏍规嵁 f_parNum 纭畾
	 *       - m_pNum 鍙傛暟涓暟
	 *       - m_pTypeBuf 瀛樺偍鍙傛暟绫诲瀷(濡� ES_PF_B8, ES_PF_F),闀垮害涓� f_parNum
	 *       - m_pBuf 瀛樺偍鍛戒护绉佹湁鍙傛暟,鎬婚暱搴︿负 f_parNum * ELSHELL_CMD_PRV_VAR_BUF_PERSIZE
	 *       - 浣跨敤 __eladp_align(4) 纭繚缂撳啿鍖哄洓瀛楄妭瀵归綈,鍚﹀垯float浼氬嚭鐜伴棶棰�
	 *       - 璋冪敤鑰呴渶纭繚 ELSHELL_CMD_IX_MAXLEN 鍜� ELSHELL_CMD_PRV_VAR_BUF_PERSIZE 鍚堢悊
	 */
#define EL_CREAT_COMMAND_TYPE(f_parNum)                               \
	typedef struct                                                    \
	{                                                                 \
		char m_cmdIx[ELSHELL_CMD_IX_MAXLEN];                          \
		el_hash_node_t m_hashNode;                                    \
		struct                                                        \
		{                                                             \
			uint8_t m_cmdType : 3;                                    \
			uint8_t m_cmdStatus : 2;                                  \
		} ms_flags;                                                   \
		uint8_t m_pNum;                                               \
		char *m_cmdHelp_ptr;                                          \
		void *m_funArgNumx_ptr;                                       \
		uint8_t m_pTypeBuf[(f_parNum)];                               \
		uint8_t m_pBuf[(f_parNum) * ELSHELL_CMD_PRV_VAR_BUF_PERSIZE]; \
	} __eladp_align(4) el_cmdd_##f_parNum##p_t

	EL_CREAT_COMMAND_TYPE(0); // 鏀寔0涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴
	EL_CREAT_COMMAND_TYPE(1); // 鏀寔1涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴
	EL_CREAT_COMMAND_TYPE(2); // 鏀寔2涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴
	EL_CREAT_COMMAND_TYPE(3); // 鏀寔3涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴
	EL_CREAT_COMMAND_TYPE(4); // 鏀寔4涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴
	EL_CREAT_COMMAND_TYPE(5); // 鏀寔5涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴
	EL_CREAT_COMMAND_TYPE(6); // 鏀寔6涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴
	EL_CREAT_COMMAND_TYPE(7); // 鏀寔7涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴
	EL_CREAT_COMMAND_TYPE(8); // 鏀寔8涓弬鏁扮殑鍛戒护鎻忚堪绗︾粨鏋勪綋 鍏蜂綋鍙傛暟鍚箟鍙傝�� EL_CREAT_COMMAND_TYPE 娉ㄩ噴

	typedef el_cmdd_0p_t el_cmdd_0p_t;
	typedef el_cmdd_1p_t el_cmdd_1p_t;
	typedef el_cmdd_2p_t el_cmdd_2p_t;
	typedef el_cmdd_3p_t el_cmdd_3p_t;
	typedef el_cmdd_4p_t el_cmdd_4p_t;
	typedef el_cmdd_5p_t el_cmdd_5p_t;
	typedef el_cmdd_6p_t el_cmdd_6p_t;
	typedef el_cmdd_7p_t el_cmdd_7p_t;
	typedef el_cmdd_8p_t el_cmdd_8p_t;

	/*-------------------------------------------------------*\
			Referential function definition
	\*-------------------------------------------------------*/

	extern el_hash_table_t *g_el_cmd_hashTable_ptr;

	extern el_err_t _el_cmd_init(void);

#define EL_CMD_INST_CREAT(f_varName, f_varPtrName, f_pNum) \
	el_cmdd_##f_pNum##p_t f_varName;                       \
	el_cmdd_##f_pNum##p_t *f_varPtrName;

	extern el_err_t el_cmd_reg(void *f_cmdd_ptr,
							   char *f_cmdIx,
							   el_cmd_type_t f_cmdType,
							   void *f_funOrVar_ptr,
							   char *f_cmdHelp_ptr,
							   uint8_t f_pNum,
							   el_para_type_t f_pType[ELSHELL_CMD_PARAMETER_MAXNUM]);
	extern el_err_t el_cmd_get_para(void *f_cmdBuf_ptr,
									uint32_t f_cmdLen,
									el_cmdd_8p_t **fr_cmdMatched_pp);
	extern el_err_t el_cmd_exe(const void *f_cmdd_ptr, void **fr_exeReturn_pp);

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELCMD_H_PROTECT

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
