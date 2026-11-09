//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-22 13:09:36
 * File Name: elio.c
 * Module Name:
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-22
 * ------------------
 * Description:
 *
 *
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

/*---------------------------*\
			Include
\*---------------------------*/
#include "elio.h"
#include "elcrtsec.h"
#include "elcfg.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/*-------------------------------------------------------*\
						  Static PV
	\*-------------------------------------------------------*/

	/**
	 * @brief 命令流发送缓冲区
	 * @note 此缓冲区承接了 elprintf 的格式转换工作,中断内一般不会调用
	 * 		elprintf 但是不绝对,因此有临界区保护
	 */
	static uint8_t fg_xmitBuf[ELSHELL_PARAMETER_MAX_PERSIZE];

	static const char *valid_pfs[] = {
		ES_PF_B8, ES_PF_X8, ES_PF_D8,
		ES_PF_B16, ES_PF_X16, ES_PF_D16,
		ES_PF_B32, ES_PF_X32, ES_PF_D32,
		ES_PF_F, ES_PF_STR, ES_PF_BOOL,
		EL_NULL};

	/*-------------------------------------------------------*\
					Static fun declaration
	\*-------------------------------------------------------*/

	static el_bool_t is_valid_cmd_char(uint8_t c);
	static el_bool_t is_valid_pf(const uint8_t *pf, uint32_t len);
	static el_bool_t is_valid_binary(const uint8_t *param, uint32_t len, uint32_t expected_bits);
	static el_bool_t is_valid_hex(const uint8_t *param, uint32_t len, uint32_t expected_bytes);
	static el_bool_t is_valid_decimal(const uint8_t *param, uint32_t len);
	static el_bool_t is_valid_float(const uint8_t *param, uint32_t len);
	static el_bool_t is_valid_bool(const uint8_t *param, uint32_t len);

	/*-------------------------------------------------------*\
					Static function body
	\*-------------------------------------------------------*/

	/**
	 * @brief 检查字符是否为命令或参数的有效字符
	 * @param c 要检查的字符
	 * @return 1 EL_TRUE(有效),0 EL_FASLE(无效)
	 */
	static el_bool_t is_valid_cmd_char(uint8_t c)
	{
		// 允许字母 数字 下划线
		return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
			   (c >= '0' && c <= '9') || (c == '_');
	}

	/**
	 * @brief 检查参数标志是否有效
	 * @param pf 参数标志字符串
	 * @param len 标志长度
	 * @return 1(有效),0(无效)
	 */
	static el_bool_t is_valid_pf(const uint8_t *pf, uint32_t len)
	{
		for (int j = 0; valid_pfs[j] != EL_NULL; j++)
		{
			uint32_t pf_len = 0;
			while (valid_pfs[j][pf_len] != '\0')
				pf_len++;
			if (len == pf_len)
			{
				int match = 1;
				for (uint32_t k = 0; k < len; k++)
				{
					if (pf[k] != (uint8_t)valid_pfs[j][k])
					{
						match = 0;
						break;
					}
				}
				if (match)
					return EL_TRUE;
			}
		}
		return EL_FALSE;
	}

	/**
	 * @brief 检查二进制参数格式
	 * @param param 参数字符串
	 * @param len 字符串参数长度
	 * @param expected_bits 期望位数(8, 16, 32, 64)
	 * @return 1(有效),0(无效)
	 */
	static el_bool_t is_valid_binary(const uint8_t *param, uint32_t len, uint32_t expected_bits)
	{
		if (len != expected_bits)
			return EL_FALSE;
		for (uint32_t j = 0; j < len; j++)
		{
			if (param[j] != '0' && param[j] != '1')
				return EL_FALSE;
		}
		return EL_TRUE;
	}

	/**
	 * @brief 检查十六进制参数格式
	 * @param param 参数字符串
	 * @param len 字符串参数长度
	 * @param expected_bytes 期望字节数(1, 2, 4, 8)
	 * @return 1(有效),0(无效)
	 */
	static el_bool_t is_valid_hex(const uint8_t *param, uint32_t len, uint32_t expected_bytes)
	{
		if (len != expected_bytes * 2)
			return EL_FALSE;
		for (uint32_t j = 0; j < len; j++)
		{
			if (!((param[j] >= '0' && param[j] <= '9') ||
				  (param[j] >= 'a' && param[j] <= 'f') ||
				  (param[j] >= 'A' && param[j] <= 'F')))
			{
				return EL_FALSE;
			}
		}
		return EL_TRUE;
	}

	/**
	 * @brief 检查十进制参数格式
	 * @param param 参数字符串
	 * @param len 字符串参数长度
	 * @return 1(有效),0(无效)
	 */
	static el_bool_t is_valid_decimal(const uint8_t *param, uint32_t len)
	{
		if (len == 0)
			return EL_FALSE;
		if (param[0] == '-')
			return EL_FALSE; // 不支持负数
		for (uint32_t j = 0; j < len; j++)
		{
			if (param[j] < '0' || param[j] > '9')
				return EL_FALSE;
		}
		return EL_TRUE;
	}

	/**
	 * @brief 检查浮点参数格式(简单校验)
	 * @param param 参数字符串
	 * @param len 字符串参数长度
	 * @return 1(有效),0(无效)
	 */
	static el_bool_t is_valid_float(const uint8_t *param, uint32_t len)
	{
		if (len == 0)
			return EL_FALSE;
		int has_dot = 0, has_digit = 0;
		for (uint32_t j = 0; j < len; j++)
		{
			if (param[j] == '.')
			{
				if (has_dot)
					return EL_FALSE;
				has_dot = 1;
			}
			else if (param[j] == '-')
			{
				if (j != 0)
					return EL_FALSE;
			}
			else if (param[j] >= '0' && param[j] <= '9')
			{
				has_digit = EL_TRUE;
			}
			else
			{
				return EL_FALSE;
			}
		}
		return has_digit;
	}

	/**
	 * @brief 检查布尔参数格式
	 * @param param 参数字符串
	 * @param len 字符串参数长度
	 * @return 1(有效),0(无效)
	 */
	static el_bool_t is_valid_bool(const uint8_t *param, uint32_t len)
	{
		return (len == 1 && (param[0] == '0' || param[0] == '1'));
	}

	/*-------------------------------------------------------*\
					Extern function body
	\*-------------------------------------------------------*/

	/**
	 * @brief 格式化字符串并通过 elputc 发送,支持转义字符和格式说明符.
	 * @param format 格式字符串,包含 %d, %ld, %s, %f, %x, %8b, %16b, %32b 以及转义字符.
	 * @param ... 可变参数列表,与格式说明符对应.
	 * @return uint32_t 发送的字符数:
	 *         - 成功:返回发送的字符数.
	 *         - 失败(格式错误):返回 0.
	 * @note - 函数通过 elputc 直接发送格式化结果:
	 *       - 支持格式说明符:
	 *         - %d:32 位整数 (int32_t).
	 *         - %ld:64 位整数 (int64_t).
	 *         - %s:字符串 (const char *).
	 *         - %f:单精度浮点数 (float),ELSHELL_DEFAULT_DECIMAL_PLACES(4)位小数.
	 *         - %x:32 位整数 (uint32_t) 的十六进制表示.
	 *         - %8b, %16b, %32b:8/16/32 位整数的二进制表示.
	 *       - 支持转义字符:
	 *         - \n:换行 (0x0A).
	 *         - \r:回车 (0x0D).
	 *         - \t:制表符 (0x09).
	 *         - \\:反斜杠 (\).
	 *         - \%:字面百分号 (%).
	 *       - 使用 fg_xmitBuf 作为 elitoa ellitoa elftoa 的临时缓冲区(>32 字节).
	 *       - 无临界区保护,日志输出可能被打断,适合单线程或低并发场景.
	 *       - 若格式化失败(例如 elitoa 返回错误),返回 0.
	 *       - 使用 elstrlen 替代标准库,减少 Flash 开销.
	 * 		 - 不支持 NAN INFINITY 输出
	 */
	uint32_t elprintf(const uint8_t *format, ...)
	{
		extern uint8_t fg_xmitBuf[ELSHELL_PARAMETER_MAX_PERSIZE];
		va_list args;
		uint32_t sent = 0;

		if (!format)
		{
			return 0;
		}

		va_start(args, format);

		while (*format)
		{
			// 处理转义字符
			// 先处理单 %
			if (*format == '%')
			{
				if (*(format + 1) == '\0')
				{
					elputc('%');
					return 1;
				}
			}

			if (*format == '\\')
			{
				format++;
				if (*format == '\0')
				{
					elputc('\\');
					sent++;
					break;
				}
				switch (*format)
				{
				case 'n':
					elputc('\n');
					sent++;
					break;
				case 'r':
					elputc('\r');
					sent++;
					break;
				case 't':
					elputc('\t');
					sent++;
					break;
				case '\\':
					elputc('\\');
					sent++;
					break;
				case '%':
					elputc('%');
					sent++;
					break;
				default:
					elputc('\\');
					elputc(*format);
					sent += 2;
					break;
				}
				format++;
				continue;
			}

			if (*format != '%')
			{
				elputc(*format++);
				sent++;
				continue;
			}

			format++; // 跳过 %

			if (*format == '\0')
			{
				va_end(args);
				return 0; // 格式字符串不完整
			}

			// 处理格式说明符
			if (*format == 'd')
			{
				int32_t val = va_arg(args, int32_t);
				if (elitoa(val) != e_el_eok)
				{
					va_end(args);
					return 0;
				}
				for (uint32_t i = 0; fg_xmitBuf[i] != '\0'; i++)
				{
					elputc(fg_xmitBuf[i]);
					sent++;
				}
			}
			else if (*format == 'l' && *(format + 1) == 'd')
			{
				int64_t val = va_arg(args, int64_t);
				if (ellitoa(val) != e_el_eok)
				{
					va_end(args);
					return 0;
				}
				for (uint32_t i = 0; fg_xmitBuf[i] != '\0'; i++)
				{
					elputc(fg_xmitBuf[i]);
					sent++;
				}
				format++; // 跳过 l
			}
			else if (*format == 's')
			{
				const char *str = va_arg(args, const char *);
				if (!str)
				{
					str = "(null)";
				}
				uint32_t strLen = elstrlen(str);
				for (uint32_t i = 0; i < strLen; i++)
				{
					elputc(str[i]);
					sent++;
				}
			}
			else if (*format == 'f')
			{
				float val = (float)va_arg(args, double); // float 提升为 double
				if (elftoa(val) != e_el_eok)
				{
					va_end(args);
					return 0;
				}
				for (uint32_t i = 0; fg_xmitBuf[i] != '\0'; i++)
				{
					elputc(fg_xmitBuf[i]);
					sent++;
				}
			}
			else if (*format == 'x')
			{
				uint32_t val = va_arg(args, uint32_t);
				char buf[9]; // 最大 8 位 + \0
				char *p = buf + 8;
				*p = '\0';
				p--;
				if (val == 0)
				{
					elputc('0');
					sent++;
				}
				else
				{
					while (val > 0)
					{
						int digit = val % 16;
						*p-- = digit < 10 ? '0' + digit : 'a' + digit - 10;
						val /= 16;
					}
					p++;
					for (; *p; p++)
					{
						elputc(*p);
						sent++;
					}
				}
			}
			else if (*format == '8' && *(format + 1) == 'b')
			{
				uint8_t val = (uint8_t)va_arg(args, int);
				for (int i = 7; i >= 0; i--)
				{
					elputc((val & (1 << i)) ? '1' : '0');
					sent++;
				}
				format++; // 跳过 8
			}
			else if (*format == '1' && *(format + 1) == '6' && *(format + 2) == 'b')
			{
				uint16_t val = (uint16_t)va_arg(args, int);
				for (int i = 15; i >= 0; i--)
				{
					elputc((val & (1 << i)) ? '1' : '0');
					sent++;
				}
				format += 2; // 跳过 16
			}
			else if (*format == '3' && *(format + 1) == '2' && *(format + 2) == 'b')
			{
				uint32_t val = (uint32_t)va_arg(args, uint32_t);
				for (int i = 31; i >= 0; i--)
				{
					elputc((val & (1 << i)) ? '1' : '0');
					sent++;
				}
				format += 2; // 跳过 32
			}
			else
			{
				// 未知格式说明符,发送 % 和当前字符
				elputc('%');
				elputc(*format);
				sent += 2;
			}

			format++;
		}

		va_end(args);
		return sent;
	}

	/**
	 * @brief 将 32 位整数转换为十进制字符串,存储在外部缓冲区 fg_xmitBuf.
	 * @param i32 输入的 32 位整数.
	 * @return el_err_t 操作结果:
	 *         - \b e_el_eok:转换成功,字符串存储在 fg_xmitBuf.
	 *         - \b e_el_error:转换失败(如 fg_xmitBuf 溢出).
	 * @note - 函数将整数转换为十进制字符串:
	 *       - 支持负数,负号前缀.
	 *       - 结果存储在全局静态缓冲区 fg_xmitBuf(调用者需确保线程安全).
	 *       - 假设 ELSHELL_PARAMETER_MAX_PERSIZE 为 33 字节,足以容纳 int32_t 最大值(-2147483648).
	 *       - 带有临界区保护 高负载场景下建议避免频繁访问 fg_xmitBuf.
	 */
	el_err_t elitoa(int32_t i32)
	{
		char *p = (char *)fg_xmitBuf + ELSHELL_PARAMETER_MAX_PERSIZE - 1;
		*p = '\0';

		// 处理负数
		int is_negative = i32 < 0;
		uint32_t u32 = is_negative ? -i32 : i32;

		_el_crtsec_start();
		// 转换为字符串
		do
		{
			if (p <= (char *)fg_xmitBuf)
			{
				_el_crtsec_end();
				return e_el_error;
			}
			*--p = '0' + (u32 % 10);
			u32 /= 10;
		} while (u32 > 0);

		// 添加负号
		if (is_negative)
		{
			if (p <= (char *)fg_xmitBuf)
			{
				_el_crtsec_end();
				return e_el_error;
			}
			*--p = '-';
		}

		// 移动字符串到缓冲区开头
		char *start = (char *)fg_xmitBuf;
		while (*p)
		{
			*start++ = *p++;
		}
		*start = '\0';
		_el_crtsec_end();

		return e_el_eok;
	}

	/**
	 * @brief 将 64 位整数转换为十进制字符串,存储在外部缓冲区 fg_xmitBuf.
	 * @param i64 输入的 64 位整数.
	 * @return el_err_t 操作结果:
	 *         - \b e_el_eok:转换成功,字符串存储在 fg_xmitBuf.
	 *         - \b e_el_error:转换失败(如 fg_xmitBuf 溢出).
	 * @note - 函数将整数转换为十进制字符串:
	 *       - 支持负数,负号前缀.
	 *       - 结果存储在全局静态缓冲区 fg_xmitBuf(调用者需确保线程安全).
	 *       - 假设 ELSHELL_PARAMETER_MAX_PERSIZE 为 33 字节,足以容纳 int64_t 最大值(-9223372036854775808).
	 *       - 带有临界区保护,高负载场景下建议避免频繁访问 fg_xmitBuf.
	 */
	el_err_t ellitoa(int64_t i64)
	{
		extern uint8_t fg_xmitBuf[ELSHELL_PARAMETER_MAX_PERSIZE];
		char *p = (char *)fg_xmitBuf + ELSHELL_PARAMETER_MAX_PERSIZE - 1;
		*p = '\0';

		// 处理负数
		int is_negative = i64 < 0;
		uint64_t u64 = is_negative ? -i64 : i64;

		_el_crtsec_start();
		// 转换为字符串
		do
		{
			if (p <= (char *)fg_xmitBuf)
			{
				_el_crtsec_end();
				return e_el_error;
			}
			*--p = '0' + (u64 % 10);
			u64 /= 10;
		} while (u64 > 0);

		// 添加负号
		if (is_negative)
		{
			if (p <= (char *)fg_xmitBuf)
			{
				_el_crtsec_end();
				return e_el_error;
			}
			*--p = '-';
		}

		// 移动字符串到缓冲区开头
		char *start = (char *)fg_xmitBuf;
		while (*p)
		{
			*start++ = *p++;
		}
		*start = '\0';
		_el_crtsec_end();

		return e_el_eok;
	}

	/**
	 * @brief 将单精度浮点数转换为字符串,存储在外部缓冲区 fg_xmitBuf.
	 * @param f 输入的单精度浮点数.
	 * @return el_err_t 操作结果:
	 *         - \b e_el_eok: 转换成功,字符串存储在 fg_xmitBuf.
	 *         - \b e_el_evalid: 输入无效(如 NaN 或 Inf).
	 *         - \b e_el_error: 转换失败(如 fg_xmitBuf 溢出).
	 * @note
	 *       - 函数将浮点数转换为字符串,保留 ELSHELL_DEFAULT_DECIMAL_PLACES 位小数:
	 *       - 支持负数,负号前缀.
	 *       - 不支持科学计数法,适合简单场景.
	 *       - 结果存储在全局静态缓冲区 fg_xmitBuf(调用者需确保线程安全).
	 *       - 假设 ELSHELL_PARAMETER_MAX_PERSIZE 为 33 字节,足以容纳 float 典型值.
	 *       - 带有临界区保护,高负载场景下建议避免频繁访问 fg_xmitBuf.
	 *       - 小数部分在转换后进行字节序翻转以确保正确顺序.
	 */
	el_err_t elftoa(float f)
	{
		extern uint8_t fg_xmitBuf[ELSHELL_PARAMETER_MAX_PERSIZE];
		char *p = (char *)fg_xmitBuf + ELSHELL_PARAMETER_MAX_PERSIZE - 1;
		*p = '\0';

		// 检查 NaN 或 Inf
		if (f != f || f * 0 != 0)
		{
			return e_el_evalid;
		}

		// 处理负数
		int is_negative = f < 0;
		if (is_negative)
		{
			f = -f;
		}

		// 分离整数和小数部分
		uint32_t int_part = (uint32_t)f;
		float frac_part = f - int_part;

		_el_crtsec_start();
		// 转换小数部分(ELSHELL_DEFAULT_DECIMAL_PLACES 位)
		for (int i = 0; i < ELSHELL_DEFAULT_DECIMAL_PLACES; i++)
		{
			if (p <= (char *)fg_xmitBuf)
			{
				_el_crtsec_end();
				return e_el_error;
			}
			frac_part *= 10;
			int digit = (int)frac_part;
			*--p = '0' + digit;
			frac_part -= digit;
		}

		// 添加小数点
		if (p <= (char *)fg_xmitBuf)
		{
			_el_crtsec_end();
			return e_el_error;
		}
		*--p = '.';

		// 转换整数部分
		if (int_part == 0)
		{
			if (p <= (char *)fg_xmitBuf)
			{
				_el_crtsec_end();
				return e_el_error;
			}
			*--p = '0';
		}
		else
		{
			do
			{
				if (p <= (char *)fg_xmitBuf)
				{
					_el_crtsec_end();
					return e_el_error;
				}
				*--p = '0' + (int_part % 10);
				int_part /= 10;
			} while (int_part > 0);
		}

		// 添加负号
		if (is_negative)
		{
			if (p <= (char *)fg_xmitBuf)
			{
				_el_crtsec_end();
				return e_el_error;
			}
			*--p = '-';
		}

		// 移动字符串到缓冲区开头
		char *start = (char *)fg_xmitBuf;
		while (*p)
		{
			*start++ = *p++;
		}
		*start = '\0';

		// 翻转小数部分字节序
		char *decimal_point = (char *)fg_xmitBuf;
		while (*decimal_point && *decimal_point != '.')
		{
			decimal_point++;
		}
		if (*decimal_point == '.')
		{
			char *left = decimal_point + 1;
			char *right = left;
			while (*right && *right != '\0')
			{
				right++;
			}
			right--; // 移动到最后一个非空字符
			// 翻转小数部分
			while (left < right)
			{
				char temp = *left;
				*left = *right;
				*right = temp;
				left++;
				right--;
			}
		}

		_el_crtsec_end();

		return e_el_eok;
	}

	/**
	 * @brief 将以 \0 终止的字符串解析为 32 位整数.
	 * @param c_ptr 指向参数字符串的指针,以 \0 终止.
	 * @return int32_t 解析结果:
	 *         - 成功:返回解析的整数.
	 *         - 失败(无效格式 溢出):返回 0.
	 * @note - 函数解析十进制字符串为 int32_t:
	 *       - 支持负数(前导 -).
	 *       - 假设字符串以 \0 终止,长度不超过 ELSHELL_PARAMETER_MAX_PERSIZE(33 字节).
	 *       - 无效字符 溢出或空字符串返回 0.
	 */
	int32_t elatoi(uint8_t *c_ptr)
	{
		if (!c_ptr || *c_ptr == '\0')
		{
			return 0;
		}

		int32_t result = 0;
		int is_negative = 0;

		// 处理负号
		if (*c_ptr == '-')
		{
			is_negative = 1;
			c_ptr++;
		}

		// 解析数字
		while (*c_ptr != '\0' && *c_ptr >= '0' && *c_ptr <= '9')
		{
			int digit = *c_ptr - '0';
			// 检查溢出
			if (result > INT32_MAX / 10)
			{
				return 0;
			}
			result = result * 10 + digit;
			c_ptr++;
		}

		// 无效格式(非空但无数字,或有非数字字符)
		if (*c_ptr != '\0' || result == 0 && c_ptr == c_ptr - (is_negative ? 1 : 0))
		{
			return 0;
		}

		return is_negative ? -result : result;
	}

	/**
	 * @brief 将以 \0 终止的字符串解析为 64 位整数.
	 * @param c_ptr 指向参数字符串的指针,以 \0 终止.
	 * @return int64_t 解析结果:
	 *         - 成功:返回解析的整数.
	 *         - 失败(无效格式 溢出):返回 0.
	 * @note - 函数解析十进制字符串为 int64_t:
	 *       - 支持负数(前导 -).
	 *       - 假设字符串以 \0 终止,长度不超过 ELSHELL_PARAMETER_MAX_PERSIZE(33 字节).
	 *       - 无效字符 溢出或空字符串返回 0.
	 */
	int64_t elatoli(uint8_t *c_ptr)
	{
		if (!c_ptr || *c_ptr == '\0')
		{
			return 0;
		}

		int64_t result = 0;
		int is_negative = 0;

		// 处理负号
		if (*c_ptr == '-')
		{
			is_negative = 1;
			c_ptr++;
		}

		// 解析数字
		while (*c_ptr != '\0' && *c_ptr >= '0' && *c_ptr <= '9')
		{
			int digit = *c_ptr - '0';
			// 检查溢出
			if (result > INT64_MAX / 10)
			{
				return 0;
			}
			result = result * 10 + digit;
			c_ptr++;
		}

		// 无效格式
		if (*c_ptr != '\0' || result == 0 && c_ptr == c_ptr - (is_negative ? 1 : 0))
		{
			return 0;
		}

		return is_negative ? -result : result;
	}

	/**
	 * @brief 将以 \0 终止的字符串解析为单精度浮点数.
	 * @param c_ptr 指向参数字符串的指针,以 \0 终止.
	 * @return float 解析结果:
	 *         - 成功:返回解析的浮点数.
	 *         - 失败(无效格式 溢出):返回 0.0.
	 * @note - 函数解析十进制字符串为 float,支持小数点:
	 *       - 支持负数(前导 -).
	 *       - 假设字符串以 \0 终止,长度不超过 ELSHELL_PARAMETER_MAX_PERSIZE(33 字节).
	 *       - 小数部分解析 ELSHELL_DEFAULT_DECIMAL_PLACES(4)位.
	 *       - 无效字符 溢出或空字符串返回 0.0.
	 */
	float elatof(uint8_t *c_ptr)
	{
		if (!c_ptr || *c_ptr == '\0')
		{
			return 0.0f;
		}

		float result = 0.0f;
		int is_negative = 0;
		int decimal_places = 0;
		float decimal_divisor = 1.0f;

		// 处理负号
		if (*c_ptr == '-')
		{
			is_negative = 1;
			c_ptr++;
		}

		// 解析整数部分
		while (*c_ptr != '\0' && *c_ptr >= '0' && *c_ptr <= '9')
		{
			result = result * 10 + (*c_ptr - '0');
			c_ptr++;
		}

		// 解析小数部分
		if (*c_ptr == '.')
		{
			c_ptr++;
			while (*c_ptr != '\0' && *c_ptr >= '0' && *c_ptr <= '9' &&
				   decimal_places < ELSHELL_DEFAULT_DECIMAL_PLACES)
			{
				decimal_divisor *= 10.0f;
				result += (*c_ptr - '0') / decimal_divisor;
				c_ptr++;
				decimal_places++;
			}
		}

		// 无效格式
		if (*c_ptr != '\0' || result == 0.0f && c_ptr == c_ptr - (is_negative ? 1 : 0))
		{
			return 0.0f;
		}

		return is_negative ? -result : result;
	}

	/**
	 * @brief 将以空格终止的字符串解析为 32 位整数.
	 * @param c_ptr 指向参数字符串的指针,以 ES_P_SBP(空格)终止.
	 * @return int32_t 解析结果:
	 *         - 成功:返回解析的整数.
	 *         - 失败(无效格式 溢出):返回 0.
	 * @note - 函数解析十进制字符串为 int32_t,适用于 shell 参数:
	 *       - 支持负数(前导 -).
	 *       - 假设字符串以空格终止,长度不超过 ELSHELL_PARAMETER_MAX_PERSIZE(33 字节).
	 *       - 无效字符 溢出或空字符串返回 0.
	 */
	int32_t elatoi_cmd(uint8_t *c_ptr)
	{
		if (!c_ptr || *c_ptr == ES_P_SBP)
		{
			return 0;
		}

		int32_t result = 0;
		int is_negative = 0;

		// 处理负号
		if (*c_ptr == '-')
		{
			is_negative = 1;
			c_ptr++;
		}

		// 解析数字
		while (*c_ptr != ES_P_SBP &&
			   *c_ptr >= '0' && *c_ptr <= '9')
		{
			int digit = *c_ptr - '0';
			if (result > INT32_MAX / 10)
			{
				return 0;
			}
			result = result * 10 + digit;
			c_ptr++;
		}

		// 无效格式
		if (*c_ptr != ES_P_SBP ||
			result == 0 && c_ptr == c_ptr - (is_negative ? 1 : 0))
		{
			return 0;
		}

		return is_negative ? -result : result;
	}

	/**
	 * @brief 将以空格终止的字符串解析为 64 位整数.
	 * @param c_ptr 指向参数字符串的指针,以 ES_P_SBP(空格)终止.
	 * @return int64_t 解析结果:
	 *         - 成功:返回解析的整数.
	 *         - 失败(无效格式 溢出):返回 0.
	 * @note - 函数解析十进制字符串为 int64_t,适用于 shell 参数:
	 *       - 支持负数(前导 -).
	 *       - 假设字符串以空格终止,长度不超过 ELSHELL_PARAMETER_MAX_PERSIZE(33 字节).
	 *       - 无效字符 溢出或空字符串返回 0.
	 */
	int64_t elatoli_cmd(uint8_t *c_ptr)
	{
		if (!c_ptr || *c_ptr == ES_P_SBP)
		{
			return 0;
		}

		int64_t result = 0;
		int is_negative = 0;

		// 处理负号
		if (*c_ptr == '-')
		{
			is_negative = 1;
			c_ptr++;
		}

		// 解析数字
		while (*c_ptr != ES_P_SBP &&
			   *c_ptr >= '0' && *c_ptr <= '9')
		{
			int digit = *c_ptr - '0';
			if (result > INT64_MAX / 10)
			{
				return 0;
			}
			result = result * 10 + digit;
			c_ptr++;
		}

		// 无效格式
		if (*c_ptr != ES_P_SBP ||
			result == 0 && c_ptr == c_ptr - (is_negative ? 1 : 0))
		{
			return 0;
		}

		return is_negative ? -result : result;
	}

	/**
	 * @brief 解析以空格终止的字符串为单精度浮点数，用于 ELShell 命令参数处理.
	 * @param c_ptr 指向输入字符串的指针，以 ES_P_SBP(空格)终止，通常为 ELSHELL_DEFAULT_DECIMAL_PLACES
	 *              容量的数组首地址.
	 * @return float 解析结果:
	 *         - \b 成功:返回解析的浮点数，整数部分最多 ELSHELL_DEFAULT_INTEGER_DIGITS 位，
	 *                     小数部分最多 ELSHELL_DEFAULT_DECIMAL_PLACES 位.
	 *         - \b 失败:返回 0.0f(无效格式 溢出或空字符串).
	 * @note
	 *       - 支持十进制字符串，包括负号(-)和小数点(.)，如 "-123.1234".
	 *       - 整数部分超限截断至 ELSHELL_DEFAULT_INTEGER_DIGITS 位，小数部分截断至
	 *         ELSHELL_DEFAULT_DECIMAL_PLACES 位.
	 *       - 字符串长度不得超过 ELSHELL_PARAMETER_MAX_PERSIZE(33 字节)，否则返回 0.0f.
	 *       - 无效格式(如非数字字符 "123.12a" 只有负号 "-")返回 0.0f.
	 *       - 与 elftoa 配合，用于解析 ELShell 浮点参数(如 /test_8p -f 3.14).
	 */
	float elatof_cmd(uint8_t *c_ptr)
	{
		if (!c_ptr || *c_ptr == ES_P_SBP)
		{
			elprintf("ERR: F Invalid\n\r");
			return 0.0f;
		}

		float result = 0.0f;
		el_bool_t is_negative = 0;
		uint32_t decimal_places = 0;
		uint32_t integer_digits = 0;
		uint8_t *c_ptr_start = c_ptr;
		float decimal_divisor = 1.0f;

		// 处理负号
		if (*c_ptr == '-')
		{
			is_negative = 1;
			c_ptr++;
		}

		// 解析整数部分
		while (*c_ptr != ES_P_SBP &&
			   *c_ptr >= '0' && *c_ptr <= '9' &&
			   integer_digits < ELSHELL_DEFAULT_INTEGER_DIGITS)
		{
			result = result * 10 + (*c_ptr - '0');
			c_ptr++;
			integer_digits++;
		}

		// 处理整数部分超限
		if (integer_digits == ELSHELL_DEFAULT_INTEGER_DIGITS)
		{
			if (*c_ptr == ES_P_SBP)
			{
				return is_negative ? -result : result; // 合法终止
			}
			elprintf("ERR: F Invalid 0\n\r"); // 整数部分超限被视为直接丢失,是错误
			return 0.0f;
		}

		// 解析小数部分
		if (*c_ptr == '.')
		{
			c_ptr++;
			while (*c_ptr != ES_P_SBP &&
				   *c_ptr >= '0' && *c_ptr <= '9' &&
				   decimal_places < ELSHELL_DEFAULT_DECIMAL_PLACES)
			{
				decimal_divisor *= 10.0f;
				result += (*c_ptr - '0') / decimal_divisor;
				c_ptr++;
				decimal_places++;
			}
		}

		// 无效格式
		if (result == 0.0f && c_ptr == c_ptr_start + (is_negative ? 1 : 0))
		{
			elprintf("ERR: F Invalid 1\n\r");
			return 0.0f;
		}

		// 处理小数位超限
		if (decimal_places == ELSHELL_DEFAULT_DECIMAL_PLACES)
		{
			if (*c_ptr == ES_P_SBP)
			{
				return is_negative ? -result : result; // 合法终止
			}
			// 扫描后续字符
			while (c_ptr < c_ptr_start + ELSHELL_PARAMETER_MAX_PERSIZE)
			{
				if (*c_ptr == ES_P_SBP)
				{
					return is_negative ? -result : result; // 截断有效数字
				}
				if (*c_ptr < '0' || *c_ptr > '9')
				{
					elprintf("ERR: F Invalid 2\n\r");
					return 0.0f; // 无效字符
				}
				c_ptr++;
			}
			elprintf("ERR: F Invalid 3\n\r");
			return 0.0f; // 溢出
		}

		// 验证格式
		if (*c_ptr != ES_P_SBP && c_ptr < c_ptr_start + ELSHELL_PARAMETER_MAX_PERSIZE)
		{
			elprintf("ERR: F Invalid 4\n\r");
			return 0.0f; // 无效字符
		}

		return is_negative ? -result : result;
	}

	/**
	 * @brief 将字符串转换为无符号32位整数,支持指定进制
	 * @param c_ptr 字符串指针,以 ES_P_SBP (' ') 或 ES_C_LBOOC ('\n') 或 ES_C_EOC ('\r') 为截止
	 * @param base 进制(2 10 16)
	 *        有效参数:
	 *        - \b c_ptr:非空指针,指向以数字字符开头的字符串
	 *        - \b base:有效值包括 2(二进制) 10(十进制) 16(十六进制)
	 * @param fr_errorCode_ptr 本函数的错误码
	 * @return uint32_t 转换后的无符号32位整数,溢出或无效输入返回 0
	 * @note
	 *       - 字符串截止符为 ES_P_SBP (' ') ES_C_LBOOC ('\n') ES_C_EOC ('\r'),而非 '\0'
	 *       - 支持前导空格,忽略前导 '0'(八进制除外)
	 *       - 无效字符或溢出返回 0,调用者需验证结果
	 *       - 嵌入式环境,无标准库,适配 ELShell 命令解析
	 *       - 配合 el_cmd_get_para 使用,转换 b8 b16 b32 参数
	 */
	uint32_t elstrtoul_cmd(uint8_t *c_ptr, uint32_t base, el_err_t *fr_errorCode_ptr)
	{
		if (c_ptr == EL_NULL || (base != 2 && base != 10 && base != 16) || fr_errorCode_ptr == EL_NULL)
		{
			*fr_errorCode_ptr = e_el_evalid;
			return 0;
		}

		// Skip leading spaces
		while (*c_ptr == ' ')
		{
			c_ptr++;
		}

		uint32_t result = 0;
		uint8_t digit;
		uint32_t max_div = UINT32_MAX / base;

		while (*c_ptr != ES_P_SBP && *c_ptr != ES_C_LBOOC && *c_ptr != ES_C_EOC && *c_ptr != '\0')
		{
			if (base == 16 && (*c_ptr >= 'a' && *c_ptr <= 'f'))
			{
				digit = *c_ptr - 'a' + 10;
			}
			else if (base == 16 && (*c_ptr >= 'A' && *c_ptr <= 'F'))
			{
				digit = *c_ptr - 'A' + 10;
			}
			else if (*c_ptr >= '0' && *c_ptr <= '9')
			{
				digit = *c_ptr - '0';
			}
			else
			{
				// 无效字符
				*fr_errorCode_ptr = e_el_evalid;
				return 0;
			}

			if (digit >= base)
			{
				// 数字超出进制范围
				*fr_errorCode_ptr = e_el_evalid;
				return 0;
			}

			if (result > max_div)
			{
				// 溢出风险
				*fr_errorCode_ptr = e_el_evalid;
				return 0;
			}

			result = result * base + digit;
			c_ptr++;
		}

		*fr_errorCode_ptr = e_el_eok;
		return result;
	}

	/**
	 * @brief 将字符串转换为无符号64位整数,支持指定进制
	 * @param c_ptr 字符串指针,以 ES_P_SBP (' ') 或 ES_C_LBOOC ('\n') 或 ES_C_EOC ('\r') 为截止
	 * @param base 进制(2 10 16)
	 *        有效参数:
	 *        - \b c_ptr:非空指针,指向以数字字符开头的字符串
	 *        - \b base:有效值包括 2(二进制) 10(十进制) 16(十六进制)
	 * @return uint64_t 转换后的无符号64位整数,溢出或无效输入返回 0
	 * @note
	 *       - 未测试
	 *       - 字符串截止符为 ES_P_SBP (' ') ES_C_LBOOC ('\n') ES_C_EOC ('\r'),而非 '\0'
	 *       - 支持前导空格,忽略前导 '0'(八进制除外)
	 *       - 无效字符或溢出返回 0,调用者需验证结果
	 *       - 嵌入式环境,无标准库,适配 ELShell 命令解析
	 *       - 配合 el_cmd_get_para 使用,转换 b64 x64 参数
	 */
	uint64_t elstrtoull_cmd(uint8_t *c_ptr, uint32_t base)
	{
		if (c_ptr == EL_NULL || (base != 2 && base != 10 && base != 16))
		{
			return 0;
		}

		// Skip leading spaces
		while (*c_ptr == ' ')
		{
			c_ptr++;
		}

		uint64_t result = 0;
		uint8_t digit;
		uint64_t max_div = UINT64_MAX / base;

		while (*c_ptr != ES_P_SBP && *c_ptr != ES_C_LBOOC && *c_ptr != ES_C_EOC && *c_ptr != '\0')
		{
			if (base == 16 && (*c_ptr >= 'a' && *c_ptr <= 'f'))
			{
				digit = *c_ptr - 'a' + 10;
			}
			else if (base == 16 && (*c_ptr >= 'A' && *c_ptr <= 'F'))
			{
				digit = *c_ptr - 'A' + 10;
			}
			else if (*c_ptr >= '0' && *c_ptr <= '9')
			{
				digit = *c_ptr - '0';
			}
			else
			{
				// 无效字符
				return 0;
			}

			if (digit >= base)
			{
				// 数字超出进制范围
				return 0;
			}

			if (result > max_div)
			{
				// 溢出风险
				return 0;
			}

			result = result * base + digit;
			c_ptr++;
		}

		return result;
	}

	/**
	 * @brief 从缓冲区提取以[SOC]开头 以[EOC]或[LBOOC][EOC]结尾的命令字符串
	 * @param buf_ptr 输入缓冲区,包含命令
	 * @param f_bufLen 缓冲区长度
	 * @param fr_soc_ptr 输出参数,指向命令起始符[SOC]的指针
	 * @return cmd_len 命令字符串长度(包括[SOC]和[EOC]),错误时返回0
	 * @note 命令格式:
	 *       - 若 ES_C_LBOOC != '\0':[SOC][CMD][SBP][SOP][PF][SBP][P0]...[SBP][SOP][PF][SBP][Pn][LBOOC][EOC]
	 *       - 若 ES_C_LBOOC == '\0':[SOC][CMD][SBP][SOP][PF][SBP][P0]...[SBP][SOP][PF][SBP][Pn][EOC]
	 */
	uint32_t elbufgets_cmd(uint8_t *buf_ptr, uint32_t f_bufLen, char **fr_soc_ptr)
	{
		// 初始化输出
		if (fr_soc_ptr == EL_NULL || buf_ptr == EL_NULL)
		{
			elprintf("ERR: elbufgets_cmd Invalid\n\r");
			return 0;
		}
		*fr_soc_ptr = EL_NULL;

		// 查找 [SOC]
		uint32_t i = 0;
		while (i < f_bufLen && buf_ptr[i] != ES_C_SOC)
		{
			i++;
		}
		if (i >= f_bufLen || buf_ptr[i] != ES_C_SOC)
		{
			elprintf("ERR: elbufgets_cmd Lost [SOC]\n\r");
			return 0;
		}

		// 设置起始指针
		*fr_soc_ptr = (char *)&buf_ptr[i];
		uint32_t start_idx = i;

		// 检查 [CMD](非空)
		i++;
		uint32_t cmd_start = i;
		while (i < f_bufLen && buf_ptr[i] != '\0' && buf_ptr[i] != ES_P_SBP &&
			   buf_ptr[i] != ES_C_LBOOC && buf_ptr[i] != ES_C_EOC)
		{
			if (!is_valid_cmd_char(buf_ptr[i]))
			{
				elprintf("ERR: elbufgets_cmd Invalid command char\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}
			i++;
		}
		if (i == cmd_start)
		{
			elprintf("ERR: elbufgets_cmd Empty command\n\r");
			*fr_soc_ptr = EL_NULL;
			return 0;
		}

		// 检查空格后是否有效
		if (i < f_bufLen && buf_ptr[i] == ES_P_SBP)
		{
			i++;
			if (i >= f_bufLen || (buf_ptr[i] != ES_P_SOP && buf_ptr[i] != ES_C_LBOOC &&
								  buf_ptr[i] != ES_C_EOC && buf_ptr[i] != '\0'))
			{
				elprintf("ERR: elbufgets_cmd Lost [SOP] after command\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}
		}

		// 检查参数部分
		while (i < f_bufLen && buf_ptr[i] != '\0' && buf_ptr[i] != ES_C_LBOOC &&
			   buf_ptr[i] != ES_C_EOC)
		{
			// 期望 [SOP]
			if (buf_ptr[i] != ES_P_SOP)
			{
				elprintf("ERR: elbufgets_cmd Lost [SOP]\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}
			i++;

			// 提取 [PF]
			uint32_t pf_start = i;
			while (i < f_bufLen && buf_ptr[i] != '\0' && buf_ptr[i] != ES_P_SBP)
			{
				i++;
			}
			if (i == pf_start || i >= f_bufLen || buf_ptr[i] != ES_P_SBP)
			{
				elprintf("ERR: elbufgets_cmd Invalid [PF]\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}
			if (!is_valid_pf(&buf_ptr[pf_start], i - pf_start))
			{
				elprintf("ERR: elbufgets_cmd Invalid [PF]\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}
			uint8_t pf_buf[5] = {0};
			for (uint32_t j = 0; j < i - pf_start && j < 4; j++)
			{
				pf_buf[j] = buf_ptr[pf_start + j];
			}

			i++; // 跳过 [SBP]

			// 提取 [Pi]
			uint32_t param_start = i;
			while (i < f_bufLen && buf_ptr[i] != '\0' && buf_ptr[i] != ES_P_SBP &&
				   buf_ptr[i] != ES_C_LBOOC && buf_ptr[i] != ES_C_EOC)
			{
				i++;
			}
			if (i == param_start)
			{
				elprintf("ERR: elbufgets_cmd Empty param\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}

			// 校验参数格式
			uint32_t param_len = i - param_start;
			if (pf_buf[0] == 'b' && pf_buf[1] == '8' && pf_buf[2] == '\0')
			{
				if (!is_valid_binary(&buf_ptr[param_start], param_len, 8))
				{
					elprintf("ERR: elbufgets_cmd Invalid b8 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'x' && pf_buf[1] == '8' && pf_buf[2] == '\0')
			{
				if (!is_valid_hex(&buf_ptr[param_start], param_len, 1))
				{
					elprintf("ERR: elbufgets_cmd Invalid x8 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'd' && pf_buf[1] == '8' && pf_buf[2] == '\0')
			{
				if (!is_valid_decimal(&buf_ptr[param_start], param_len))
				{
					elprintf("ERR: elbufgets_cmd Invalid d8 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'b' && pf_buf[1] == '1' && pf_buf[2] == '6')
			{
				if (!is_valid_binary(&buf_ptr[param_start], param_len, 16))
				{
					elprintf("ERR: elbufgets_cmd Invalid b16 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'x' && pf_buf[1] == '1' && pf_buf[2] == '6')
			{
				if (!is_valid_hex(&buf_ptr[param_start], param_len, 2))
				{
					elprintf("ERR: elbufgets_cmd Invalid x16 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'd' && pf_buf[1] == '1' && pf_buf[2] == '6')
			{
				if (!is_valid_decimal(&buf_ptr[param_start], param_len))
				{
					elprintf("ERR: elbufgets_cmd Invalid d16 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'b' && pf_buf[1] == '3' && pf_buf[2] == '2')
			{
				if (!is_valid_binary(&buf_ptr[param_start], param_len, 32))
				{
					elprintf("ERR: elbufgets_cmd Invalid b32 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'x' && pf_buf[1] == '3' && pf_buf[2] == '2')
			{
				if (!is_valid_hex(&buf_ptr[param_start], param_len, 4))
				{
					elprintf("ERR: elbufgets_cmd Invalid x32 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'd' && pf_buf[1] == '3' && pf_buf[2] == '2')
			{
				if (!is_valid_decimal(&buf_ptr[param_start], param_len))
				{
					elprintf("ERR: elbufgets_cmd Invalid d32 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'b' && pf_buf[1] == '6' && pf_buf[2] == '4')
			{
				if (!is_valid_binary(&buf_ptr[param_start], param_len, 64))
				{
					elprintf("ERR: elbufgets_cmd Invalid b64 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'x' && pf_buf[1] == '6' && pf_buf[2] == '4')
			{
				if (!is_valid_hex(&buf_ptr[param_start], param_len, 8))
				{
					elprintf("ERR: elbufgets_cmd Invalid x64 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'd' && pf_buf[1] == '6' && pf_buf[2] == '4')
			{
				if (!is_valid_decimal(&buf_ptr[param_start], param_len))
				{
					elprintf("ERR: elbufgets_cmd Invalid d64 param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 'f' && pf_buf[1] == '\0')
			{
				if (!is_valid_float(&buf_ptr[param_start], param_len))
				{
					elprintf("ERR: elbufgets_cmd Invalid float param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}
			else if (pf_buf[0] == 's' && pf_buf[1] == '\0')
			{
				for (uint32_t j = 0; j < param_len; j++)
				{
					if (param_len > ELSHELL_CMD_STRING_MAXLEN - 1)
					{
						elprintf("ERR: elbufgets_cmd string param too long\n\r");
						*fr_soc_ptr = EL_NULL;
						return 0;
					}
					if (!is_valid_cmd_char(buf_ptr[param_start + j]))
					{
						elprintf("ERR: elbufgets_cmd Invalid string param\n\r");
						*fr_soc_ptr = EL_NULL;
						return 0;
					}
				}
			}
			else if (pf_buf[0] == 'b' && pf_buf[1] == '\0')
			{
				if (!is_valid_bool(&buf_ptr[param_start], param_len))
				{
					elprintf("ERR: elbufgets_cmd Invalid bool param\n\r");
					*fr_soc_ptr = EL_NULL;
					return 0;
				}
			}

			// 下一个参数
			if (i < f_bufLen && buf_ptr[i] == ES_P_SBP)
			{
				i++;
			}
		}

		// 检查结尾
		if (ES_C_LBOOC != '\0')
		{
			if (i >= f_bufLen || buf_ptr[i] != ES_C_LBOOC)
			{
				elprintf("ERR: elbufgets_cmd Lost [LBOOC]\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}
			i++;
			if (i >= f_bufLen || buf_ptr[i] != ES_C_EOC)
			{
				elprintf("ERR: elbufgets_cmd Lost [EOC] after [LBOOC]\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}
			i++;
		}
		else
		{
			if (i >= f_bufLen || buf_ptr[i] != ES_C_EOC)
			{
				elprintf("ERR: elbufgets_cmd Lost [EOC]\n\r");
				*fr_soc_ptr = EL_NULL;
				return 0;
			}
			i++;
		}

		// 计算命令长度
		uint32_t cmd_len = i - start_idx;
		return cmd_len;
	}

	/**
	 * @brief 清空对应缓冲区(置0)
	 * @param buf_ptr 指向要清空的缓冲区的指针
	 * @param f_size 缓冲区大小(字节数)
	 *        有效参数:
	 *        - \b buf_ptr:非空指针,指向有效内存区域
	 *        - \b f_size:大于0的字节数,不超过缓冲区实际大小
	 * @return el_err_t 返回操作结果
	 *         - \b e_el_eok:清空成功
	 *         - \b e_el_error:输入参数无效(空指针或大小为0)
	 * @note - 调用者需确保 buf_ptr 指向的内存区域可写且大小足够
	 *       - 使用 elmemset 实现,依赖嵌入式内存操作函数
	 */
	el_err_t elbufclr(uint8_t *buf_ptr, uint32_t f_size)
	{
		elmemset(buf_ptr, 0, f_size);
		return e_el_eok;
	}

#ifdef __cplusplus
}
#endif // Compatible C++
