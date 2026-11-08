//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-23 19:34:25
 * File Name: elhash.h
 * Module Name: ELShell 哈希表API
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-23
 * ------------------
 * Description:
 * 命令查找专用静态Hash
 *
 *
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

#ifndef __ELHASH_H_PROTECT
#define __ELHASH_H_PROTECT

/*---------------------------*\
		   Include
\*---------------------------*/
#include "eldef.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

	/*-------------------------------------------------------*\
							Define
	\*-------------------------------------------------------*/

#define EL_HASH_TABLE_MIN_CAP 8 // 最小桶数

	/*-------------------------------------------------------*\
					   Enum/Union/Struct
	\*-------------------------------------------------------*/

	/**
	 * @brief ELShell 哈希节点
	 * @param m_hashNodeNext_ptr 下一节点指针
	 * @param m_key 键
	 * @param m_val 值
	 */
	typedef struct el_hash_node el_hash_node_t;
	struct el_hash_node
	{
		el_hash_node_t *m_hashNodeNext_ptr;
		void *m_key_ptr;
		void *m_val_ptr;
	};

	typedef uint32_t (*el_hash_func_ptr)(const void *f_key, uint32_t f_hashTableCap);	  // 哈希函数指针
	typedef el_bool_t (*el_hash_keycmp_func_ptr)(const void *f_key1, const void *f_key2); // 键比较函数指针

	/**
	 * @brief 哈希表结构
	 * @param m_buckets 桶链表
	 * @param m_hash_func_ptr 哈希函数
	 * @param m_keycmp_func_ptr 键比较函数
	 */
	typedef struct
	{
		el_hash_node_t **m_buckets_pp;			   // 桶数组
		uint32_t m_cap;							   // 桶数(表头容量)
		el_hash_func_ptr m_hash_func_ptr;		   // 哈希函数指针
		el_hash_keycmp_func_ptr m_keycmp_func_ptr; // 键比较函数指针
	} el_hash_table_t;

	/*-------------------------------------------------------*\
				Referential function definition
	\*-------------------------------------------------------*/

	extern el_hash_table_t *el_hash_table_create(uint32_t f_hashTableCap,
												 el_hash_func_ptr f_hash_fun_ptr,
												 el_hash_keycmp_func_ptr f_keycmp_func_ptr);
	extern el_err_t el_hash_table_destroy(el_hash_table_t *f_hash_table_ptr);
	extern el_err_t el_hash_table_add(el_hash_table_t *f_hash_table_ptr,
									  el_hash_node_t *f_node_ptr,
									  const void *f_key_ptr,
									  const void *f_val_ptr);
	extern el_err_t el_hash_table_del(el_hash_table_t *f_hash_table_ptr, const void *f_key_ptr);
	extern void *el_hash_table_find(el_hash_table_t *f_hash_table_ptr, const void *f_key_ptr);

/**
 * @brief 安全遍历哈希表中的所有键值对
 * @param f_hash_table_ptr (el_hash_table_t*) 指向哈希表的指针
 * @param itHashNode_ptr (el_hash_node_t *) 迭代节点指针,用于访问当前键值对
 * @param tmpHashNode_ptr (el_hash_node_t *) 临时节点指针,用于安全遍历(保存下一个节点)
 * @note 遍历所有桶及其链表,支持在循环体内删除节点,使用者需确保先Creat哈希表
 */
#define el_hash_table_foreach_safe(f_hash_table_ptr, itHashNode_ptr, tmpHashNode_ptr)                                                                          \
	for (uint32_t ix = 0; ix < (f_hash_table_ptr)->m_cap; ix++)                                                                                                \
		for ((itHashNode_ptr) = (f_hash_table_ptr)->m_buckets_pp[ix], (tmpHashNode_ptr) = ((itHashNode_ptr) ? (itHashNode_ptr)->m_hashNodeNext_ptr : EL_NULL); \
			 (itHashNode_ptr) != EL_NULL;                                                                                                                      \
			 (itHashNode_ptr) = (tmpHashNode_ptr), (tmpHashNode_ptr) = ((itHashNode_ptr) ? (itHashNode_ptr)->m_hashNodeNext_ptr : EL_NULL))

#ifdef __cplusplus // Compatible C++
}
#endif
#endif // endif __ELHASH_H_PROTECT

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
