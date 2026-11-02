/***
 *                                                                                    
 *     @@@@@@@ @@@  @@@  @@@@@@ @@@ @@@@@@@@ @@@@@@@     @@@@@@@@ @@@@@@  @@@@@@@     
 *    !@@      @@!  @@@ !@@     @@! @@!      @@!  @@@    @@!     @@!  @@@ @@!  @@@    
 *    !@!      @!@!@!@!  !@@!!  !!@ @!!!:!   @!@!!@!     @!!!:!  @!@  !@! @!@!!@!     
 *    :!!      !!:  !!!     !:! !!: !!:      !!: :!!     !!:     !!:  !!! !!: :!!     
 *     :: :: :  :   : : ::.: :  :   : :: ::   :   : :     :       : :. :   :   : :    
 *                                                                                    
 *                                                                                    
 *     @@@@@@  @@@@@@  @@@          @@@@@@@  @@@@@@@  @@@ @@@  @@@ @@@@@@@@ @@@@@@@   
 *    !@@     @@!  @@@ @@!          @@!  @@@ @@!  @@@ @@! @@!  @@@ @@!      @@!  @@@  
 *     !@@!!  @!@  !@! @!! @!@!@!@! @!@  !@! @!@!!@!  !!@ @!@  !@! @!!!:!   @!@!!@!   
 *        !:! !!:  !!! !!:          !!:  !!! !!: :!!  !!:  !: .:!  !!:      !!: :!!   
 *    ::.: :   : :. :  : ::.: :     :: :  :   :   : : :      ::    : :: ::   :   : :  
 *
 * @Author: Chsier
 * @Date: 2021-09-14 14:22:15
 * @LastEditTime: 2021-09-16 18:50:37
 * @LastEditors: Chsier
 * @Description: 全局宏定义
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_ADC14_Test_A\Library\driver_sol\User_Gen\Inc\gen_def.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __GEN_DEF_H
#define __GEN_DEF_H			//防止重定义

	#ifdef USER_FUN			//用户移植函数宏定义
		#undef USER_FUN
	#endif
	//#define USER_FUN

	#ifdef __cplusplus
	extern "C"{
	#endif					//兼容C++
	
/********************************************************/
/********************** INCLUDE *************************/
/********************************************************/

    #include "stdio.h"

/********************************************************/
/*********************** DEFINE *************************/
/********************************************************/
    #if defined(__ARMCC_VERSION) && (__ARMCC_VERSION >= 6010050) /* ARM Compiler V6 */
        #ifndef __weak
            #define __weak __attribute__((weak))
        #endif
        #ifndef __packed
            #define __packed __attribute__((packed))
        #endif
    #elif defined(__GNUC__) && !defined(__CC_ARM) /* GNU Compiler */
        #ifndef __weak
            #define __weak __attribute__((weak))
        #endif /* __weak */
        #ifndef __packed
            #define __packed __attribute__((__packed__))
        #endif /* __packed */
    #endif /* __GNUC__ */
       /*相关枚举,共用体宏定义*/
    #define STRUCT(name)    typedef struct name name##_Typedef ;\
                            struct name
	#define _STRUCT(name)	name##_Typedef
							
    #define DEV(name)   typedef struct name name##_Dev_Typedef ;\
                        struct name
	#define _DEV(name)	name##_Dev_Typedef
						
    #define ENUM(name)  typedef enum name name##_Typedef ;\
                        enum name
	#define _ENUM(name)	name##_Typedef
						
    #define UNION(name) typedef union name name##_Typedef ;\
                        union name
	#define _UNION(name)	name##_Typedef
	
/*BOOL类型*/
	#define True 	1
	#define False 	0
	#define Random  -1
	typedef char 	bool_t;
						
/*是否为标准C文件*/
    #define IS_STDC()   do{															\
                            if(__STDC__)											\
                                printf("%s:This file is std cfile.\n",__FILE__);	\
                            else													\
                                printf("%s:This file is not std cfile.\n",__FILE__);\
                        }while(0)
/*求数组元素个数*/
    #define COUNT_ARR(arr)  (sizeof(arr)/sizeof(*arr))
/*Forever*/
	#define FOREVER() while(1)
/* LOOP */
	#define START(run_once) while(run_once)
/* 硬件已设置 */
	#define HW_SET NULL
/* 标志位清零 */
	#define CLEAR(x) (x = 0)
/* 标志位设置 */
	#define SET(x) (x = 1)
/* 数组清零 */
	#define CLEAR_ARR(x) memset(x, 0 ,sizeof(x))

	#ifdef __cplusplus		//兼容C++
	}
	#endif

#endif