#ifndef __ELCRTSEC_H_PROTECT
#define __ELCRTSEC_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
#include "eldef.h"
#include "eladp.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++
#ifdef DEBUG_LOCAL_LOG_OUTPUT
#undef DEBUG_LOCAL_LOG_OUTPUT
#endif
#ifdef LOCAL_PRINTF
#undef LOCAL_PRINTF
#endif
#define DEBUG_LOCAL_LOG_OUTPUT 0
#if (DEBUG_LOCAL_LOG_OUTPUT == 1)
#define LOCAL_PRINTF LOG_PRINTF
#else
#define LOCAL_PRINTF
#endif

	/*-------------------------------------------------------*\
							Define
	\*-------------------------------------------------------*/

#define _el_crtsec_start(f_secName) eladp_elcrtsec_start(f_secName)
#define _el_crtsec_end(f_secName) eladp_elcrtsec_end(f_secName)

	/*-------------------------------------------------------*\
					   Enum/Union/Struct
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
				Referential function definition
	\*-------------------------------------------------------*/

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELCRTSEC_H_PROTECT

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