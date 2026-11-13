/*---------------------------*\
			Include
\*---------------------------*/
#include "elcmd.h"
#include "elstr.h"
#include "eladp.h"
#include "elcfg.h"
#include "elio.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/**
	 * @brief 命令哈希表指针
	 */
	el_hash_table_t *g_el_cmd_hashTable_ptr = EL_NULL;

	/*-------------------------------------------------------*\
						  Static PV
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
					Static fun declaration
	\*-------------------------------------------------------*/

	static uint32_t el_cmd_getelem(uint8_t *f_elemStart_ptr,
								   char **fr_nextElem_pp,
								   el_para_type_t *fr_elemType_ptr);

	/*-------------------------------------------------------*\
					Static function body
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
					Extern function body
	\*-------------------------------------------------------*/

	/**
	 * @brief 初始化 ELShell 命令哈希表
	 * @param None
	 * @return el_err_t 初始化结果
	 *         - \b e_el_eok: 哈希表初始化成功
	 *         - \b e_el_error: 哈希表创建失败
	 * @note
	 *       - 创建全局命令哈希表 g_el_cmd_hashTable_ptr，大小为 ELSHELL_CMD_HASH_TABLE_SIZE
	 *       - 使用默认哈希函数和键值比较函数(通过传入 EL_NULL 指定)
	 *       - 需在 ELShell 系统启动时调用，确保命令注册前哈希表可用
	 *       - 嵌入式环境，需确保内存分配成功，避免内存泄漏
	 *       - 配合 el_cmd_reg 和 el_cmd_get_para 使用，完成命令注册和解析
	 */
	el_err_t _el_cmd_init(void)
	{
		// 创建哈希表选择默认哈希函数和键值比较函数
		g_el_cmd_hashTable_ptr = el_hash_table_create(ELSHELL_CMD_HASH_TABLE_SIZE, EL_NULL, EL_NULL);
		if (g_el_cmd_hashTable_ptr == EL_NULL)
		{
			return e_el_error;
		}
		return e_el_eok;
	}

	/**
	 * @brief 初始化并注册 ELShell 命令描述符
	 * @param f_cmdd_ptr 命令描述符指针,指向要初始化的结构体
	 * @param f_cmdIx 命令索引字符串,用于标识命令
	 * @param f_cmdType 命令类型,指定命令的行为
	 * @param f_funOrVar_ptr 函数指针(调用命令)或变量指针(赋值命令)
	 * @param f_cmdHelp_ptr 命令帮助信息字符串指针
	 * @param f_pNum 参数数量,指定命令接受的参数个数
	 * @param f_pType 参数类型数组,定义每个参数的类型
	 *        有效参数:
	 *        - \b f_cmdd_ptr:非空指针,指向 el_cmdd_8p_t 类型的命令描述符
	 *        - \b f_cmdIx:非空指针,指向命令索引字符串,长度不超过 ELSHELL_CMD_IX_MAXLEN
	 *        - \b f_cmdType:有效值包括 e_elCmdType_call(调用命令)或 e_elCmdType_assign(赋值命令)
	 *        - \b f_funOrVar_ptr:非空指针,指向命令处理函数(调用命令)或变量(赋值命令)
	 *        - \b f_cmdHelp_ptr:指向帮助信息字符串,可为空
	 *        - \b f_pNum:参数数量,范围 0 到 ELSHELL_CMD_PARAMETER_MAXNUM,赋值命令必须为 1
	 *        - \b f_pType:参数类型数组,长度为 ELSHELL_CMD_PARAMETER_MAXNUM,前 f_pNum 个元素为有效类型(如 e_elParaType_b8, e_elParaType_f),其余为 e_elParaType_none
	 * @return el_err_t 初始化和注册结果
	 *         - \b e_el_eok:初始化和注册成功
	 *         - \b e_el_evalid:无效参数(空指针 无效命令类型 参数类型计数不匹配)
	 *         - \b e_el_error:赋值命令参数数量不为 1 类型为字符串,或哈希表添加失败
	 * @note
	 *       - f_cmdd_ptr 必须指向 el_cmdd_8p_t 类型的结构体,需与 ELSHELL_CMD_PARAMETER_MAXNUM 兼容
	 *       - f_cmdIx 会被复制到 m_cmdIx,长度受 ELSHELL_CMD_IX_MAXLEN 限制,使用 elstrncpy 确保安全复制
	 *       - 赋值命令(e_elCmdType_assign)必须有且仅有一个参数,且不支持 e_elParaType_string 类型
	 *       - f_pType 数组中非 e_elParaType_none 的元素数量必须等于 f_pNum
	 *       - 调用命令的 m_pBuf 未完全初始化,需配合 elbufgets_cmd 填充参数
	 *       - g_el_cmd_hashTable_ptr 必须已初始化为有效的哈希表
	 *       - m_hashNode 嵌入在 el_cmdd_8p_t 中,初始化为 EL_NULL
	 *       - 配合 EL_REG_CMD_CALL 和 elbufgets_cmd 使用,完成命令注册和解析
	 *       - 与 el_cmd_exe 协作,通过哈希表查找后执行命令
	 *       - 嵌入式环境,调用者需确保指针有效性和内存安全
	 */
	el_err_t el_cmd_reg(void *f_cmdd_ptr,
						char *f_cmdIx,
						el_cmd_type_t f_cmdType,
						void *f_funOrVar_ptr,
						char *f_cmdHelp_ptr,
						uint8_t f_pNum,
						el_para_type_t f_pType[ELSHELL_CMD_PARAMETER_MAXNUM])
	{
		if (f_cmdd_ptr == EL_NULL ||
			f_cmdIx == EL_NULL ||
			f_funOrVar_ptr == EL_NULL)
		{
			return e_el_evalid;
		}

		if (f_cmdType != e_elCmdType_call && f_cmdType != e_elCmdType_assign)
		{
			return e_el_evalid;
		}

		uint8_t typeCnt = 0;
		uint32_t ix = 0;
		el_err_t r = e_el_eok;

		if (f_pType != EL_NULL)
		{
			for (ix = 0; ix < ELSHELL_CMD_PARAMETER_MAXNUM; ix++)
			{
				if (f_pType[ix] != e_elParaType_none)
				{
					typeCnt++;
				}
			}
		}

		if (typeCnt != f_pNum)
		{
			return e_el_evalid;
		}

		// 如果是赋值命令则进一步检查参数
		if (f_cmdType == e_elCmdType_assign)
		{
			if (f_pNum != 1)
			{
				// 赋值类型命令必须有且只有一个参数
				return e_el_error;
			}
			if (f_pType[0] == e_elParaType_string)
			{
				// 赋值类型命令不支持直接修改字符串变量
				return e_el_error;
			}
		}

		el_cmdd_8p_t *thisCmdd_ptr = (el_cmdd_8p_t *)f_cmdd_ptr;

		// 基本参数赋值
		thisCmdd_ptr->m_hashNode.m_hashNodeNext_ptr = EL_NULL;
		thisCmdd_ptr->m_hashNode.m_key_ptr = EL_NULL;
		thisCmdd_ptr->m_hashNode.m_val_ptr = EL_NULL;
		thisCmdd_ptr->ms_flags.m_cmdType = f_cmdType;
		thisCmdd_ptr->ms_flags.m_cmdStatus = e_elCmdStatus_idle;
		thisCmdd_ptr->m_funArgNumx_ptr = (void *)f_funOrVar_ptr;
		thisCmdd_ptr->m_pNum = f_pNum;
		thisCmdd_ptr->m_cmdHelp_ptr = f_cmdHelp_ptr;
		elstrncpy(thisCmdd_ptr->m_cmdIx, f_cmdIx, ELSHELL_CMD_IX_MAXLEN);

		// 初始化赋值命令
		if (f_cmdType == e_elCmdType_assign)
		{
			thisCmdd_ptr->m_pTypeBuf[0] = f_pType[0];
			thisCmdd_ptr->m_pBuf[0] = 0;
		}

		// 初始化调用命令
		uint8_t *pTypeStart_ptr = thisCmdd_ptr->m_pTypeBuf;
		if (f_cmdType == e_elCmdType_call)
		{
			for (ix = 0; ix < typeCnt; ix++)
			{
				pTypeStart_ptr[ix] = f_pType[ix];
			}
		}

		// 检测是否为重复命令
		void *findResult = EL_NULL;
		findResult = el_hash_table_find(g_el_cmd_hashTable_ptr, thisCmdd_ptr->m_cmdIx);
		if (findResult != EL_NULL)
		{
			return e_el_evalid;
		}

		// 加入命令哈希表
		r = el_hash_table_add(g_el_cmd_hashTable_ptr,
							  &(thisCmdd_ptr->m_hashNode),
							  thisCmdd_ptr->m_cmdIx,
							  f_cmdd_ptr);

		return r;
	}

	/**
	 * @brief 解析命令缓冲区并提取参数到命令描述符私有缓冲区
	 * @param f_cmdBuf_ptr 命令缓冲区指针,存储完整命令字符串
	 * @param f_cmdLen 命令缓冲区长度,包含命令和结束符
	 *        有效参数:
	 *        - \b f_cmdBuf_ptr: 非空指针,指向以 ES_C_SOC ('/') 开头的命令字符串
	 *        - \b f_cmdLen: 命令长度,包含命令索引 参数和 ES_C_EOC,至少为 1
	 * @param *fr_cmdMatched_pp 匹配成功的命令描述符指针
	 * @return el_err_t 解析结果
	 *         - \b e_el_eok: 解析成功
	 *         - \b e_el_evalid: 无效参数(空指针 长度不足 无效格式 命令不存在 参数数量不匹配)
	 *         - \b e_el_error: 参数类型不匹配或值超出范围
	 * @note
	 *       - 未测试
	 *       - 命令格式:[SOC][CMD][SBP][SOP][PF][SBP][P0]...[SBP][SOP][PF][SBP][Pn][LBOOC][EOC]
	 *       - 支持 ES_C_LBOOC ('\n') 或无 LBOOC,结尾必须为 ES_C_EOC ('\r')
	 *       - CMD 作为哈希表键查找 el_cmdd_8p_t 描述符,不存储在 m_pBuf
	 *       - 参数存储在 m_pBuf,每参数占 ELSHELL_CMD_PRV_VAR_BUF_PERSIZE 字节,字符串长度限 ELSHELL_CMD_STRING_MAXLEN-1
	 *       - 使用 elatoi_cmd elatoli_cmd elatof_cmd 转换参数,截止符为 ES_P_SBP (' ')
	 *       - 非字符串参数存储转换后的数值,字符串参数存储原字符串
	 *       - 配合 el_cmd_reg 和 el_cmd_exe 使用,完成命令注册和执行
	 *       - 嵌入式环境,调用者需确保指针有效性和内存安全
	 *       - g_el_cmd_hashTable_ptr 必须已初始化
	 */
	el_err_t el_cmd_get_para(void *f_cmdBuf_ptr,
							 uint32_t f_cmdLen,
							 el_cmdd_8p_t **fr_cmdMatched_pp)
	{
		//* 命令完整性校验
		if (f_cmdBuf_ptr == EL_NULL ||
			f_cmdLen < 1 ||
			((uint8_t *)f_cmdBuf_ptr)[0] != ES_C_SOC ||
			fr_cmdMatched_pp == EL_NULL)
		{
			// 命令缓冲区为空 长度不足或未以 '/' 开头 或 其他参数不合法
			*fr_cmdMatched_pp = EL_NULL;
			return e_el_evalid;
		}
		uint8_t *buf = (uint8_t *)f_cmdBuf_ptr;
		if (buf[f_cmdLen - 1] != ES_C_EOC || (ES_C_LBOOC != '\0' && buf[f_cmdLen - 2] != ES_C_LBOOC))
		{
			// 命令末尾无 '\r' 或缺少 '\n'(当 ES_C_LBOOC 非空)
			*fr_cmdMatched_pp = EL_NULL;
			return e_el_evalid;
		}

		//* 提取命令索引并查找命令描述符
		*fr_cmdMatched_pp = EL_NULL;
		uint32_t pos = 1;
		char cmdIx[ELSHELL_CMD_IX_MAXLEN] = {0};
		uint32_t ix = 0;
		while (pos < f_cmdLen &&
			   buf[pos] != ES_P_SBP &&
			   buf[pos] != ES_C_LBOOC &&
			   buf[pos] != ES_C_EOC &&
			   ix < ELSHELL_CMD_IX_MAXLEN - 1)
		{
			cmdIx[ix++] = buf[pos++];
		}

		el_cmdd_8p_t *cmd_desc = (el_cmdd_8p_t *)el_hash_table_find(g_el_cmd_hashTable_ptr, cmdIx);
		if (cmd_desc == EL_NULL)
		{
			// 哈希表中未找到命令描述符
			*fr_cmdMatched_pp = EL_NULL;
			return e_el_evalid;
		}
		if (cmd_desc->ms_flags.m_cmdStatus != e_elCmdStatus_idle)
		{
			// 目标任务描述符不空闲
			*fr_cmdMatched_pp = EL_NULL;
			return e_el_ebusy;
		}

		//* 参数个数和类型校验
		uint8_t typeCnt = 0;
		for (ix = 0; ix < ELSHELL_CMD_PARAMETER_MAXNUM && cmd_desc->m_pNum > 0; ix++)
		{
			if (cmd_desc->m_pTypeBuf[ix] != e_elParaType_none)
			{
				typeCnt++;
			}
		}

		//* 根据是否有参数确认是否需要 pos++
		if (typeCnt > 0)
		{
			pos++;
		}

		//* 提取参数到命令私有缓冲区
		uint8_t param_idx = 0;
		if (typeCnt > 0)
		{
			while (param_idx < typeCnt && pos < f_cmdLen)
			{
				if (buf[pos++] != ES_P_SOP)
				{
					// 参数起始无 '-'
					*fr_cmdMatched_pp = EL_NULL;
					return e_el_evalid;
				}

				uint8_t pf[ELSHELL_CMD_PARAMETER_FLAG_MAXLEN] = {0};
				ix = 0;
				while (pos < f_cmdLen && buf[pos] != ES_P_SBP && ix < ELSHELL_CMD_PARAMETER_FLAG_MAXLEN - 1)
				{
					pf[ix++] = buf[pos++];
				}
				if (pos >= f_cmdLen || buf[pos] != ES_P_SBP)
				{
					// 参数类型标志提取失败(长度超限或无空格分隔)
					*fr_cmdMatched_pp = EL_NULL;
					return e_el_evalid;
				}
				pos++;

				el_para_type_t type = cmd_desc->m_pTypeBuf[param_idx];
				if ((elstrcmp(pf, ES_PF_BOOL) == 0 && type != e_elParaType_bool) ||
					((elstrcmp(pf, ES_PF_B8) == 0 || elstrcmp(pf, ES_PF_X8) == 0 || elstrcmp(pf, ES_PF_D8) == 0) && type != e_elParaType_size8) ||
					((elstrcmp(pf, ES_PF_B16) == 0 || elstrcmp(pf, ES_PF_X16) == 0 || elstrcmp(pf, ES_PF_D16) == 0) && type != e_elParaType_size16) ||
					((elstrcmp(pf, ES_PF_B32) == 0 || elstrcmp(pf, ES_PF_X32) == 0 || elstrcmp(pf, ES_PF_D32) == 0) && type != e_elParaType_size32) ||
					(elstrcmp(pf, ES_PF_F) == 0 && type != e_elParaType_float) ||
					(elstrcmp(pf, ES_PF_STR) == 0 && type != e_elParaType_string))
				{
					// 参数类型标志与描述符内参数类型不匹配
					*fr_cmdMatched_pp = EL_NULL;
					return e_el_error;
				}

				uint8_t *param_buf = cmd_desc->m_pBuf + param_idx * ELSHELL_CMD_PRV_VAR_BUF_PERSIZE;
				uint8_t param_tmp_buf[ELSHELL_PARAMETER_MAX_PERSIZE];
				ix = 0;
				el_err_t r = e_el_eok;
				while (pos < f_cmdLen && buf[pos] != ES_P_SBP && buf[pos] != ES_C_LBOOC && buf[pos] != ES_C_EOC && ix < ELSHELL_PARAMETER_MAX_PERSIZE - 1)
				{
					param_tmp_buf[ix++] = buf[pos++];
				}
				param_tmp_buf[ix] = ES_P_SBP; // 以 ES_P_SBP 切割各个参数方便后面转换
				switch (type)
				{
				case e_elParaType_bool:
				{
					int32_t val = elatoi_cmd(param_tmp_buf);
					if (val != 0 && val != 1)
					{
						// 布尔值非0或1
						*fr_cmdMatched_pp = EL_NULL;
						return e_el_error;
					}
					*(int32_t *)param_buf = (el_bool_t)val;
					break;
				}
				case e_elParaType_size8:
				{
					int32_t val;
					if (elstrcmp(pf, ES_PF_B8) == 0)
					{
						val = elstrtoul_cmd(param_tmp_buf, 2, &r);
						if (r != e_el_eok)
						{
							// 数字格式错误
							*fr_cmdMatched_pp = EL_NULL;
							return e_el_error;
						}
					}
					else if (elstrcmp(pf, ES_PF_X8) == 0)
					{
						val = elstrtoul_cmd(param_tmp_buf, 16, &r);
						if (r != e_el_eok)
						{
							// 数字格式错误
							*fr_cmdMatched_pp = EL_NULL;
							return e_el_error;
						}
					}
					else
					{
						val = elatoi_cmd(param_tmp_buf);
					}
					if (val < -128 || val > 255)
					{
						// 8位整数超出范围
						*fr_cmdMatched_pp = EL_NULL;
						return e_el_error;
					}
					*(int8_t *)param_buf = (int8_t)val;
					break;
				}
				case e_elParaType_size16:
				{
					int32_t val;
					if (elstrcmp(pf, ES_PF_B16) == 0)
					{
						val = elstrtoul_cmd(param_tmp_buf, 2, &r);
						if (r != e_el_eok)
						{
							// 数字格式错误
							*fr_cmdMatched_pp = EL_NULL;
							return e_el_error;
						}
					}
					else if (elstrcmp(pf, ES_PF_X16) == 0)
					{
						val = elstrtoul_cmd(param_tmp_buf, 16, &r);
						if (r != e_el_eok)
						{
							// 数字格式错误
							*fr_cmdMatched_pp = EL_NULL;
							return e_el_error;
						}
					}
					else
					{
						val = elatoi_cmd(param_tmp_buf);
					}
					if (val < -32768 || val > 65535)
					{
						// 16位整数超出范围
						*fr_cmdMatched_pp = EL_NULL;
						return e_el_error;
					}
					*(int16_t *)param_buf = (int16_t)val;
					break;
				}
				case e_elParaType_size32:
				{
					int32_t val;
					if (elstrcmp(pf, ES_PF_B32) == 0)
					{
						val = elstrtoul_cmd(param_tmp_buf, 2, &r);
						if (r != e_el_eok)
						{
							// 数字格式错误
							*fr_cmdMatched_pp = EL_NULL;
							return e_el_error;
						}
					}
					else if (elstrcmp(pf, ES_PF_X32) == 0)
					{
						val = elstrtoul_cmd(param_tmp_buf, 16, &r);
						if (r != e_el_eok)
						{
							// 数字格式错误
							*fr_cmdMatched_pp = EL_NULL;
							return e_el_error;
						}
					}
					else
					{
						val = elatoi_cmd(param_tmp_buf);
					}
					*(int32_t *)param_buf = (int32_t)val;
					break;
				}
				case e_elParaType_float:
				{
					float val = elatof_cmd(param_tmp_buf);
					*(float *)param_buf = (float)val;
					break;
				}
				case e_elParaType_string:
					if (ix > ELSHELL_CMD_STRING_MAXLEN - 1)
					{
						elstrncpy(param_buf, param_tmp_buf, ELSHELL_CMD_STRING_MAXLEN - 1);
						param_buf[ELSHELL_CMD_STRING_MAXLEN - 1] = '\0';
					}
					else
					{
						elstrncpy(param_buf, param_tmp_buf, ix);
						param_buf[ix] = '\0';
					}
					break;
				default:
				{
					// 无效参数类型
					*fr_cmdMatched_pp = EL_NULL;
					return e_el_error;
				}
				}

				param_idx++;
				if (pos < f_cmdLen && buf[pos] == ES_P_SBP)
				{
					pos++;
				}
			}
		}

		if (param_idx != typeCnt)
		{
			// 传入参数数量与命令类型数量不匹配
			*fr_cmdMatched_pp = EL_NULL;
			return e_el_evalid;
		}

		if (ES_C_LBOOC != '\0' && pos < f_cmdLen && buf[pos] == ES_C_LBOOC)
		{
			pos++;
		}

		if (pos != f_cmdLen - 1)
		{
			// 命令解析未到达正确结束位置
			*fr_cmdMatched_pp = EL_NULL;
			return e_el_evalid;
		}

		*fr_cmdMatched_pp = cmd_desc;
		return e_el_eok;
	}

	/**
	 * @brief 从命令描述符执行命令
	 * @param f_cmdd_ptr 命令描述符指针,指向要执行的命令结构体
	 * @param fr_exeReturn_pp 指向返回值的二级指针,存储调用命令的函数返回值
	 *        有效参数:
	 *        - \b f_cmdd_ptr:非空指针,指向 el_cmdd_8p_t 类型的命令描述符,包含参数和函数/变量指针
	 *        - \b fr_exeReturn_pp:非空指针,指向调用命令返回值存储位置(赋值命令不使用)
	 * @return el_err_t 执行结果
	 *         - \b e_el_eok:执行成功
	 *         - \b e_el_evalid:无效参数(f_cmdd_ptr 或 fr_exeReturn_pp 为空,或赋值命令的字符串类型)
	 *         - \b e_el_error:参数数量无效(超过 8 个)
	 * @note
	 *       - f_cmdd_ptr 必须指向有效的 el_cmdd_8p_t 结构体,需通过 _el_cmd_init 初始化
	 *       - 调用命令(e_elCmdType_call)根据参数数量(0 到 8)调用 m_funArgNumx_ptr 指向的函数
	 *       - 赋值命令(e_elCmdType_assign)将 m_pBuf[0] 赋给 m_funArgNumx_ptr 指向的变量,仅支持 bool pointer size8 size16 size32 size64 float 类型
	 *       - m_pBuf 需由 elbufgets_cmd 填充,每个参数占 ELSHELL_CMD_PRV_VAR_BUF_PERSIZE 字节
	 *       - 配合 _el_cmd_init el_cmd_reg 和 EL_REG_CMD_CALL 使用,完成命令初始化 注册和执行
	 *       - 与 elbufgets_cmd 协作,解析命令参数后执行
	 *       - 嵌入式环境,调用者需确保指针有效性和内存安全,此函数并未强制进入临界区,被执行函数的临界区安全由用户自己保证
	 *       - m_pBuf 的类型转换可能不安全(如 float),需确保数据格式正确
	 */
	el_err_t el_cmd_exe(const void *f_cmdd_ptr, void **fr_exeReturn_pp)
	{
		if (f_cmdd_ptr == EL_NULL || fr_exeReturn_pp == EL_NULL)
		{
			return e_el_evalid;
		}

		el_cmdd_8p_t *thisCmdd_ptr = (el_cmdd_8p_t *)f_cmdd_ptr;
		if (thisCmdd_ptr->ms_flags.m_cmdStatus != e_elCmdStatus_needToExecute)
		{
			return e_el_error;
		}
		thisCmdd_ptr->ms_flags.m_cmdStatus = e_elCmdStatus_executing;

		uint8_t typeCnt = 0;
		uint32_t ix = 0;
		for (ix = 0; ix < ELSHELL_CMD_PARAMETER_MAXNUM; ix++)
		{
			if (thisCmdd_ptr->m_pTypeBuf[ix] != e_elParaType_none)
			{
				typeCnt++;
			}
		}

		//* 执行命令
		void *arg1_ptr = &(thisCmdd_ptr->m_pBuf[0]);
		void *arg2_ptr = arg1_ptr + ELSHELL_CMD_PRV_VAR_BUF_PERSIZE;
		void *arg3_ptr = arg2_ptr + ELSHELL_CMD_PRV_VAR_BUF_PERSIZE;
		void *arg4_ptr = arg3_ptr + ELSHELL_CMD_PRV_VAR_BUF_PERSIZE;
		void *arg5_ptr = arg4_ptr + ELSHELL_CMD_PRV_VAR_BUF_PERSIZE;
		void *arg6_ptr = arg5_ptr + ELSHELL_CMD_PRV_VAR_BUF_PERSIZE;
		void *arg7_ptr = arg6_ptr + ELSHELL_CMD_PRV_VAR_BUF_PERSIZE;
		void *arg8_ptr = arg7_ptr + ELSHELL_CMD_PRV_VAR_BUF_PERSIZE;

		if (thisCmdd_ptr->ms_flags.m_cmdType == e_elCmdType_call)
		{
			switch (typeCnt)
			{
			case 0:
				*fr_exeReturn_pp = ((el_fun_argnum_0)(thisCmdd_ptr->m_funArgNumx_ptr))();
				break;
			case 1:
				*fr_exeReturn_pp = ((el_fun_argnum_1)(thisCmdd_ptr->m_funArgNumx_ptr))(arg1_ptr);
				break;
			case 2:
				*fr_exeReturn_pp = ((el_fun_argnum_2)(thisCmdd_ptr->m_funArgNumx_ptr))(arg1_ptr, arg2_ptr);
				break;
			case 3:
				*fr_exeReturn_pp = ((el_fun_argnum_3)(thisCmdd_ptr->m_funArgNumx_ptr))(arg1_ptr, arg2_ptr, arg3_ptr);
				break;
			case 4:
				*fr_exeReturn_pp = ((el_fun_argnum_4)(thisCmdd_ptr->m_funArgNumx_ptr))(arg1_ptr, arg2_ptr, arg3_ptr, arg4_ptr);
				break;
			case 5:
				*fr_exeReturn_pp = ((el_fun_argnum_5)(thisCmdd_ptr->m_funArgNumx_ptr))(arg1_ptr, arg2_ptr, arg3_ptr, arg4_ptr,
																					   arg5_ptr);
				break;
			case 6:
				*fr_exeReturn_pp = ((el_fun_argnum_6)(thisCmdd_ptr->m_funArgNumx_ptr))(arg1_ptr, arg2_ptr, arg3_ptr, arg4_ptr,
																					   arg5_ptr, arg6_ptr);
				break;
			case 7:
				*fr_exeReturn_pp = ((el_fun_argnum_7)(thisCmdd_ptr->m_funArgNumx_ptr))(arg1_ptr, arg2_ptr, arg3_ptr, arg4_ptr,
																					   arg5_ptr, arg6_ptr, arg7_ptr);
				break;
			case 8:
				*fr_exeReturn_pp = ((el_fun_argnum_8)(thisCmdd_ptr->m_funArgNumx_ptr))(arg1_ptr, arg2_ptr, arg3_ptr, arg4_ptr,
																					   arg5_ptr, arg6_ptr, arg7_ptr, arg8_ptr);
				break;

			default:
				return e_el_error;
				break;
			}
		}

		if (thisCmdd_ptr->ms_flags.m_cmdType == e_elCmdType_assign)
		{
			// 查看第一个参数类型并更改参数值
			switch (thisCmdd_ptr->m_pTypeBuf[0])
			{
			case e_elParaType_bool:
				*((el_bool_t *)(thisCmdd_ptr->m_funArgNumx_ptr)) = *((el_bool_t *)(thisCmdd_ptr->m_pBuf + 0));
				break;
			case e_elParaType_size8:
				*((int8_t *)(thisCmdd_ptr->m_funArgNumx_ptr)) = *((int8_t *)(thisCmdd_ptr->m_pBuf + 0));
				break;
			case e_elParaType_size16:
				*((int16_t *)(thisCmdd_ptr->m_funArgNumx_ptr)) = *((int16_t *)(thisCmdd_ptr->m_pBuf + 0));
				break;
			case e_elParaType_size32:
				*((int32_t *)(thisCmdd_ptr->m_funArgNumx_ptr)) = *((int32_t *)(thisCmdd_ptr->m_pBuf + 0));
				break;
			case e_elParaType_float:
				*((float *)(thisCmdd_ptr->m_funArgNumx_ptr)) = *((float *)(thisCmdd_ptr->m_pBuf + 0));
				break;
			case e_elParaType_string:
				// 不支持直接修改字符串
				return e_el_evalid;
				break;

			default:
				break;
			}
		}

		thisCmdd_ptr->ms_flags.m_cmdStatus = e_elCmdStatus_idle;
		return e_el_eok;
	}

#ifdef __cplusplus
}
#endif // Compatible C++
