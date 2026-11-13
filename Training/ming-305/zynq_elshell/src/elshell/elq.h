//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-22 16:54:37
 * File Name: elq.h
 * Module Name: EL Shell Queue API
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-22
 * ------------------
 * Description:
 *
 * 函数/宏调用顺序(以 int 队列为例)
 * 1. EL_QUEUE_CREAT_DEF(int, intQueue);
 * 2. EL_QUEUE_CREAT_INST_AND_PTR(intQueue, testQ, testQ_ptr);
 * 3. elq_init(testQ_ptr, QUEUE_MAXSIZE, EL_QUEUE_PRIORITY_2);
 * 4. 返回错误代码检查:
 * 			if (testQ_ptr->m_q_errCode != EL_QEOK)
 *			{
 *				printf("ERR: testQ_ptr errCode = %d\n\r", testQ_ptr->m_q_errCode);
 *			}
 * 5. user logic ...
 *
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

#ifndef __ELQ_H_PROTECT
#define __ELQ_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
#include "eldef.h"
#include "elmem.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/*-------------------------------------------------------*\
							Define
	\*-------------------------------------------------------*/

#define _elq_calloc elcalloc
#define _elq_free elfree

/**
 * @brief el queue error code
 * @note 队列错误代码
 */
#define EL_QEOK (0)		// 无错误
#define EL_QERROR (-1)	// 队列错误
#define EL_QEFULL (-2)	// 队满错误
#define EL_QEEMPTY (-3) // 队空错误
#define EL_QEOOM (-4)	// out of memory 内存溢出错误
#define EL_QEFREE (-5)	// 释放空指针错误
#define EL_QEAT (-5)	// 查找特定位置元素错误

	/*-------------------------------------------------------*\
					   Enum/Union/Struct
	\*-------------------------------------------------------*/

/**
 * @brief EL_QUEUE_CREAT_DEF 创建队列数据结构定义
 * @param _______para________
 * @param elem_type 排队数据类型
 * @param q_name 队列名组份
 * @param ______member_______
 * @param m_q_errCode 队列错误码
 *        有效参数:
 *        - \b EL_QEOK
 *        - \b EL_QERROR
 *        - \b EL_QEFULL
 *        - \b EL_QEEMPTY
 *        - \b EL_QEOOM
 *        - \b EL_QEFREE
 *        - \b EL_QEAT
 * @param m_cap int32_t capacity 容量
 * @param m_front_ix int32_t 队首下标
 * @param m_rear_ix int32_t 队尾下标
 * @param m_elemArr_ptr elem_type * 队列数据数组指针
 * @note 顺序队列
 */
#define EL_QUEUE_CREAT_DEF(elem_type, q_name) \
	typedef struct elq_##q_name               \
	{                                         \
		int8_t m_q_errCode;                   \
		int32_t m_cap;                        \
		int32_t m_front_ix;                   \
		int32_t m_rear_ix;                    \
		elem_type *m_elemArr_ptr;             \
	} elq_##q_name##_t;

/**
 * @brief EL_QUEUE_CREAT_INST_AND_PTR
 * @param q_name 队列名组份
 * @param q_inst 队列实例
 * @param q_ptr 队列指针
 * @note 定义队列实例与对应指针
 */
#define EL_QUEUE_CREAT_INST_AND_PTR(q_name, q_inst, q_ptr) \
	elq_##q_name##_t q_inst;                               \
	elq_##q_name##_t *q_ptr = &q_inst;

	/*-------------------------------------------------------*\
				Referential function definition
	\*-------------------------------------------------------*/

/**
 * @brief elq_init
 * @param f_q_ptr 队列指针
 * @param f_cap 队列容量
 * @return m_q_errCode:EL_QEOOM(队列元素内存申请失败),EL_QEOK
 */
#define elq_init(f_q_ptr, f_cap)                                                                         \
	do                                                                                                   \
	{                                                                                                    \
		(f_q_ptr)->m_q_errCode = EL_QEOK;                                                                \
		(f_q_ptr)->m_cap = f_cap;                                                                        \
		(f_q_ptr)->m_front_ix = 0;                                                                       \
		(f_q_ptr)->m_rear_ix = 0;                                                                        \
		(f_q_ptr)->m_elemArr_ptr = _elq_calloc(1, sizeof(*(f_q_ptr)->m_elemArr_ptr) * (f_q_ptr)->m_cap); \
		if ((f_q_ptr)->m_elemArr_ptr == EL_NULL)                                                         \
		{                                                                                                \
			(f_q_ptr)->m_q_errCode = EL_QEOOM;                                                           \
		}                                                                                                \
		else                                                                                             \
		{                                                                                                \
			(f_q_ptr)->m_q_errCode = EL_QEOK;                                                            \
		}                                                                                                \
	} while (0)

/**
 * @brief elq_clean
 * @param f_q_ptr 队列指针
 * @note 清空队列(保留 m_elemArr_ptr 内存)
 */
#define elq_clean(f_q_ptr)         \
	do                             \
	{                              \
		(f_q_ptr)->m_front_ix = 0; \
		(f_q_ptr)->m_rear_ix = 0;  \
	} while (0)
/**
 * @brief elq_distory
 * @param f_q_ptr 队列指针
 * @note 销毁队列(释放 m_elemArr_ptr 内存)
 * @return m_q_errCode:EL_QEFREE(对空指针free),EL_QEOK
 */
#define elq_distory(f_q_ptr)                     \
	do                                           \
	{                                            \
		elq_clean(f_q_ptr);                      \
		if ((f_q_ptr)->m_elemArr_ptr != EL_NULL) \
		{                                        \
			(f_q_ptr)->m_q_errCode = EL_QEOK;    \
			_elq_free((f_q_ptr)->m_elemArr_ptr); \
			(f_q_ptr)->m_elemArr_ptr = EL_NULL;  \
		}                                        \
		else                                     \
		{                                        \
			(f_q_ptr)->m_q_errCode = EL_QEFREE;  \
		}                                        \
	} while (0)

/**
 * @brief elq_get_cap
 * @param f_q_ptr 队列指针
 * @note 获取队列容量
 */
#define elq_get_cap(f_q_ptr) ((f_q_ptr)->m_cap)
/**
 * @brief elq_get_used
 * @param f_q_ptr 队列指针
 * @note 获取队列占用量
 */
#define elq_get_used(f_q_ptr) (((f_q_ptr)->m_rear_ix - (f_q_ptr)->m_front_ix + (f_q_ptr)->m_cap) % (f_q_ptr)->m_cap)
/**
 * @brief elq_get_remain
 * @param f_q_ptr 队列指针
 * @note 获取剩余可用队列容量
 */
#define elq_get_remain(f_q_ptr) (elq_get_cap(f_q_ptr) - elq_get_used(f_q_ptr) - 1)
/**
 * @brief elq_peek_front
 * @param f_q_ptr 队列指针
 * @note Peek队首元素,不真正出队
 * @return f_deqElem: 0(队空);队首元素
 * @return m_q_errCode: EL_QEEMPTY(队空);EL_QEOK
 */
#define elq_peek_front(f_q_ptr)                                       \
	(elq_is_empty(f_q_ptr) ? ((f_q_ptr)->m_q_errCode = EL_QEEMPTY, 0) \
						   : ((f_q_ptr)->m_q_errCode = EL_QEOK,       \
							  f_q_ptr->m_elemArr_ptr[(((f_q_ptr)->m_front_ix + 1) % (f_q_ptr)->m_cap)]))
/**
 * @brief elq_peek_rear
 * @param f_q_ptr 队列指针
 * @note Peek队尾元素,不真正出队
 * @return f_deqElem: 0(队空);队尾元素
 * @return m_q_errCode: EL_QEEMPTY(队空);EL_QEOK
 */
#define elq_peek_rear(f_q_ptr)                                        \
	(elq_is_empty(f_q_ptr) ? ((f_q_ptr)->m_q_errCode = EL_QEEMPTY, 0) \
						   : ((f_q_ptr)->m_q_errCode = EL_QEOK,       \
							  (f_q_ptr)->m_rear_ix))
/**
 * @brief elq_peek_at
 * @param f_q_ptr 队列指针
 * @param f_ix 寻找索引
 * @return 0(队长不足);整个队列中下标为 f_ix 处的元素(无关是否入队)
 * @note 返回整个队列中下标为 f_ix 处的元素,查看 front 时数据往往无效,应该 +1 才是队首数据, front 一般指向无效数据
 */
#define elq_peek_at(f_q_ptr, f_ix) ((elq_get_used(f_q_ptr) < (int32_t)f_ix) ? ((f_q_ptr)->m_q_errCode = EL_QEAT, 0) \
																			: ((f_q_ptr)->m_q_errCode = EL_QEOK, (f_q_ptr)->m_elemArr_ptr[(f_ix) % (f_q_ptr)->m_cap]))
/**
 * @brief elq_is_empty
 * @param f_q_ptr 队列指针
 * @note 队列空断言
 */
#define elq_is_empty(f_q_ptr) (!(!((f_q_ptr)->m_front_ix == (f_q_ptr)->m_rear_ix)))
/**
 * @brief elq_is_full
 * @param f_q_ptr 队列指针
 * @note 队列满断言
 */
#define elq_is_full(f_q_ptr) (!(!(((f_q_ptr)->m_rear_ix + 1) % elq_get_cap(f_q_ptr) == (f_q_ptr)->m_front_ix)))
/**
 * @brief elq_enq
 * @param f_q_ptr 队列指针
 * @param f_elem 入队元素
 * @return m_q_errCode:EL_QEFULL(队满),EL_QEOK
 * @note 元素入队
 */
#define elq_enq(f_q_ptr, f_elem)                                                                   \
	(elq_is_full(f_q_ptr) ? ((f_q_ptr)->m_q_errCode = EL_QEFULL, EL_QEFULL)                        \
						  : ((f_q_ptr)->m_rear_ix = ((f_q_ptr)->m_rear_ix + 1) % (f_q_ptr)->m_cap, \
							 (f_q_ptr)->m_elemArr_ptr[(f_q_ptr)->m_rear_ix] = f_elem,              \
							 (f_q_ptr)->m_q_errCode = EL_QEOK, EL_QEOK))
/**
 * @brief elq_jpq
 * @param f_q_ptr 队列指针
 * @param f_elem 入队元素
 * @return m_q_errCode:EL_QEFULL(队满),EL_QEOK
 * @note 元素插队(从队首入队)
 */
#define elq_jpq(f_q_ptr, f_elem)                                                                                        \
	(elq_is_full(f_q_ptr) ? ((f_q_ptr)->m_q_errCode = EL_QEFULL, EL_QEFULL)                                             \
						  : ((f_q_ptr)->m_elemArr_ptr[(f_q_ptr)->m_front_ix] = f_elem,                                  \
							 (f_q_ptr)->m_front_ix = ((f_q_ptr)->m_front_ix - 1 + (f_q_ptr)->m_cap) % (f_q_ptr)->m_cap, \
							 (f_q_ptr)->m_q_errCode = EL_QEOK, EL_QEOK))
/**
 * @brief elq_deq
 * @param f_q_ptr 队列指针
 * @return f_deqElem:  0(队空);出队元素
 * @return m_q_errCode:  EL_QEEMPTY(队空);EL_QEOK
 * @note 元素出队
 */
#define elq_deq(f_q_ptr)                                                                              \
	(elq_is_empty(f_q_ptr) ? ((f_q_ptr)->m_q_errCode = EL_QEEMPTY, 0)                                 \
						   : ((f_q_ptr)->m_front_ix = ((f_q_ptr)->m_front_ix + 1) % (f_q_ptr)->m_cap, \
							  (f_q_ptr)->m_q_errCode = EL_QEOK,                                       \
							  (f_q_ptr)->m_elemArr_ptr[(f_q_ptr)->m_front_ix]))
/**
 * @brief 获取对应位置下标宏
 */
#define elq_get_front_ix(f_q_ptr) ((f_q_ptr)->m_front_ix)
#define _get_front_ix(f_q_ptr) elq_get_front_ix(f_q_ptr)

#define elq_get_rear_ix(f_q_ptr) ((f_q_ptr)->m_rear_ix)
#define _get_rear_ix(f_q_ptr) elq_get_rear_ix(f_q_ptr)

#define elq_get_next_ix(f_q_ptr, f_refIx) ((f_refIx + 1) % (f_q_ptr)->m_cap)
#define _get_next_ix(f_q_ptr, f_refIx) elq_get_next_ix(f_q_ptr, f_refIx)

/**
 * @brief elq_foreach
 * @param f_q_ptr 队列指针
 * @param f_e_iterator 元素迭代器
 * @note 遍历队列有效元素((front + 1) % cap -> rear)
 */
#define elq_foreach(f_q_ptr, f_e_iterator)                                           \
	for (int32_t _lk = 1, _ix = ((_get_front_ix(f_q_ptr) + 1) % ((f_q_ptr)->m_cap)); \
		 (!(!(_lk))) && (_ix != ((_get_rear_ix(f_q_ptr) + 1) % ((f_q_ptr)->m_cap))); \
		 _lk = !_lk, _ix = _get_next_ix(f_q_ptr, _ix))                               \
		for (f_e_iterator = (f_q_ptr)->m_elemArr_ptr[_ix]; _lk; _lk = !_lk)
	// printf("_ix = %d, _lk = %d, _get_front_ix = %d , _get_rear_ix = %d \n\r", _ix, _lk, _get_front_ix(f_q_ptr), _get_rear_ix(f_q_ptr))

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELQ_H_PROTECT

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