//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-22 13:26:46
 * File Name: elmem.c
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
#include "elmem.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/*-------------------------------------------------------*\
						  Static PV
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
					Static fun declaration
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
					Static function body
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
					Extern function body
	\*-------------------------------------------------------*/

	void *(elmemchr)(const void *s, int32_t c, uint32_t n)
	{ /* find first occurrence of c in s[n] */
		const unsigned char uc = c;
		const unsigned char *su = (const unsigned char *)s;

		for (; 0 < n; ++su, --n)
			if (*su == uc)
				return ((void *)su);
		return (EL_NULL);
	}

	int32_t(elmemcmp)(const void *s1, const void *s2, uint32_t n)
	{ /* compare unsigned char s1[n], s2[n] */
		const unsigned char *su1 = (const unsigned char *)s1;
		const unsigned char *su2 = (const unsigned char *)s2;

		for (; 0 < n; ++su1, ++su2, --n)
			if (*su1 != *su2)
				return (*su1 < *su2 ? -1 : +1);
		return (0);
	}

	void *(elmemcpy)(void *s1, const void *s2, uint32_t n)
	{ /* copy char s2[n] to s1[n] in any order */
		char *su1 = (char *)s1;
		const char *su2 = (const char *)s2;

		for (; 0 < n; ++su1, ++su2, --n)
			*su1 = *su2;
		return (s1);
	}

	void *(elmemset)(void *s, int32_t c, uint32_t n)
	{ /* store c throughout unsigned char s[n] */
		const unsigned char uc = c;
		unsigned char *su = (unsigned char *)s;

		for (; 0 < n; ++su, --n)
			*su = uc;
		return (s);
	}

#ifdef __cplusplus
}
#endif // Compatible C++