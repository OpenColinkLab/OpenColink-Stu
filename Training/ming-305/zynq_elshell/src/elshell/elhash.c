//--------------------------------------------------------------------------------
/* //-----------------------------------------------------------------------------
 * Organization: XDU				    ██████╗██╗  ██╗███████╗██╗███████╗██████╗
 * Engineer: Chsier                    ██╔════╝██║  ██║██╔════╝██║██╔════╝██╔══██╗
 * E-mail: 1481154662@qq.com           ██║     ███████║███████╗██║█████╗  ██████╔╝
 * Cnblogs: www.cnblogs.com/chsier     ██║     ██╔══██║╚════██║██║██╔══╝  ██╔══██╗
 *                                     ╚██████╗██║  ██║███████║██║███████╗██║  ██║
 * Create Date: 25-05-23 19:33:51
 * File Name: elhash.c
 * Module Name: ELShell 哈希表API
 * Target Devices: *
 * Tool Versions: VScode
 *
 * Versions | Modify
 * ------------------
 * v-alpha  | 25-05-23
 * ------------------
 * Description:
 * 命令查找专用
 *
 */
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------------------

/*---------------------------*\
			Include
\*---------------------------*/
#include "elhash.h"
#include "eldef.h"
#include "elstr.h"
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

	/**
	 * @brief 默认哈希函数:字符串每字节相乘后模 cap
	 * @param f_key 键(const char *)
	 * @param f_hashTableCap 哈希表容量
	 * @return 哈希值(uint32_t)
	 */
	static uint32_t default_hash_func(const void *f_key, uint32_t f_hashTableCap)
	{
		const char *str = (const char *)f_key;
		uint32_t hash = 1;
		while (*str)
		{
			hash = (hash * (uint32_t)(*str)) % f_hashTableCap;
			str++;
		}
		return hash ? hash : 1; // 避免返回 0
	}

	/*-------------------------------------------------------*\
					Extern function body
	\*-------------------------------------------------------*/

	/**
	 * @brief 创建哈希表
	 * @param f_hashTableCap 哈希表容量(桶数)
	 * @param f_hash_fun_ptr 哈希函数指针(EL_NULL 使用默认)
	 * @param f_keycmp_func_ptr 键比较函数指针(EL_NULL 使用 elstrcmp)
	 * @return 哈希表指针(成功),EL_NULL(失败)
	 */
	el_hash_table_t *el_hash_table_create(uint32_t f_hashTableCap,
										  el_hash_func_ptr f_hash_fun_ptr,
										  el_hash_keycmp_func_ptr f_keycmp_func_ptr)
	{
		if (f_hashTableCap < EL_HASH_TABLE_MIN_CAP)
		{
			f_hashTableCap = EL_HASH_TABLE_MIN_CAP;
		}

		el_hash_table_t *hashTable_ptr = (el_hash_table_t *)elcalloc(1, sizeof(el_hash_table_t));
		if (hashTable_ptr == EL_NULL)
		{
			// elprintf("ERR: Allocate hash hashTable_ptr failed\n\r");
			return EL_NULL;
		}

		hashTable_ptr->m_buckets_pp = (el_hash_node_t **)elcalloc(1, f_hashTableCap * sizeof(el_hash_node_t *));
		if (hashTable_ptr->m_buckets_pp == EL_NULL)
		{
			// elprintf("ERR: Allocate buckets failed\n\r");
			elfree(hashTable_ptr);
			return EL_NULL;
		}

		for (uint32_t i = 0; i < f_hashTableCap; i++)
		{
			hashTable_ptr->m_buckets_pp[i] = EL_NULL;
		}

		hashTable_ptr->m_cap = f_hashTableCap;
		hashTable_ptr->m_hash_func_ptr = (f_hash_fun_ptr != EL_NULL) ? f_hash_fun_ptr : default_hash_func;
		hashTable_ptr->m_keycmp_func_ptr = (f_keycmp_func_ptr != EL_NULL) ? f_keycmp_func_ptr : elstrcmp;

		return hashTable_ptr;
	}

	/**
	 * @brief 销毁哈希表(内部节点静态删除,不进行free)
	 * @param f_hash_table_ptr 哈希表指针
	 * @return e_el_eok(成功),e_el_error(失败)
	 */
	el_err_t el_hash_table_destroy(el_hash_table_t *f_hash_table_ptr)
	{
		if (f_hash_table_ptr == EL_NULL || f_hash_table_ptr->m_buckets_pp == EL_NULL)
		{
			// elprintf("ERR: Invalid hash table\n\r");
			return e_el_error;
		}

		for (uint32_t i = 0; i < f_hash_table_ptr->m_cap; i++)
		{
			el_hash_node_t *node = f_hash_table_ptr->m_buckets_pp[i];
			while (node != EL_NULL)
			{
				el_hash_node_t *next = node->m_hashNodeNext_ptr;
				el_hash_table_del(f_hash_table_ptr, node);
				node = next;
			}
		}

		elfree(f_hash_table_ptr->m_buckets_pp);
		elfree(f_hash_table_ptr);
		return e_el_eok;
	}

	/**
	 * @brief 添加键值对到哈希表
	 * @param f_hash_table_ptr 哈希表指针
	 * @param f_node_ptr 调用者提供的静态节点指针
	 * @param f_key_ptr 键指针
	 * @param f_val_ptr 值指针
	 * @return e_el_eok(成功),e_el_error(失败)
	 */
	el_err_t el_hash_table_add(el_hash_table_t *f_hash_table_ptr,
							   el_hash_node_t *f_node_ptr,
							   const void *f_key_ptr,
							   const void *f_val_ptr)
	{
		if (f_hash_table_ptr == EL_NULL || f_hash_table_ptr->m_buckets_pp == EL_NULL ||
			f_node_ptr == EL_NULL || f_key_ptr == EL_NULL || f_val_ptr == EL_NULL)
		{
			// elprintf("ERR: Invalid input for hash table add\n\r");
			return e_el_error;
		}

		uint32_t bucket_idx = f_hash_table_ptr->m_hash_func_ptr(f_key_ptr, f_hash_table_ptr->m_cap);

		el_hash_node_t *node = f_hash_table_ptr->m_buckets_pp[bucket_idx];
		while (node != EL_NULL)
		{
			if (f_hash_table_ptr->m_keycmp_func_ptr(f_key_ptr, node->m_key_ptr) == 0)
			{
				// elprintf("ERR: Key already exists\n\r");
				return e_el_error;
			}
			node = node->m_hashNodeNext_ptr;
		}

		// 初始化调用者提供的节点
		f_node_ptr->m_key_ptr = (void *)f_key_ptr;
		f_node_ptr->m_val_ptr = (void *)f_val_ptr;
		f_node_ptr->m_hashNodeNext_ptr = f_hash_table_ptr->m_buckets_pp[bucket_idx];

		// 插入节点(头插法)
		f_hash_table_ptr->m_buckets_pp[bucket_idx] = f_node_ptr;

		return e_el_eok;
	}

	/**
	 * @brief 从哈希表删除键值对(静态删除,不free)
	 * @param f_hash_table_ptr 哈希表指针
	 * @param f_key_ptr 键指针
	 * @param f_node_ptr_ptr 输出参数,返回删除的节点指针
	 * @return e_el_eok(成功),e_el_error(失败或键不存在)
	 * @note 不释放节点内存,调用者管理 f_node_ptr_ptr
	 */
	el_err_t el_hash_table_del(el_hash_table_t *f_hash_table_ptr, const void *f_key_ptr)
	{
		if (f_hash_table_ptr == EL_NULL || f_hash_table_ptr->m_buckets_pp == EL_NULL ||
			f_key_ptr == EL_NULL)
		{
			// elprintf("ERR: Invalid input for hash table delete\n\r");
			return e_el_error;
		}

		uint32_t bucket_idx = f_hash_table_ptr->m_hash_func_ptr(f_key_ptr, f_hash_table_ptr->m_cap);

		el_hash_node_t *node = f_hash_table_ptr->m_buckets_pp[bucket_idx];
		el_hash_node_t *prev = EL_NULL;
		while (node != EL_NULL)
		{
			if (f_hash_table_ptr->m_keycmp_func_ptr(f_key_ptr, node->m_key_ptr) == 0)
			{
				if (prev == EL_NULL)
				{
					f_hash_table_ptr->m_buckets_pp[bucket_idx] = node->m_hashNodeNext_ptr;
				}
				else
				{
					prev->m_hashNodeNext_ptr = node->m_hashNodeNext_ptr;
				}
				return e_el_eok;
			}
			prev = node;
			node = node->m_hashNodeNext_ptr;
		}

		// elprintf("ERR: Key not found\n\r");
		return e_el_error;
	}

	/**
	 * @brief 查找哈希表中的值
	 * @param f_hash_table_ptr 哈希表指针
	 * @param f_key_ptr 键指针
	 * @return 值指针(找到),EL_NULL(未找到或错误)
	 */
	void *el_hash_table_find(el_hash_table_t *f_hash_table_ptr, const void *f_key_ptr)
	{
		if (f_hash_table_ptr == EL_NULL || f_hash_table_ptr->m_buckets_pp == EL_NULL || f_key_ptr == EL_NULL)
		{
			// elprintf("ERR: Invalid input for hash table find\n\r");
			return EL_NULL;
		}

		uint32_t bucket_idx = f_hash_table_ptr->m_hash_func_ptr(f_key_ptr, f_hash_table_ptr->m_cap);

		el_hash_node_t *node = f_hash_table_ptr->m_buckets_pp[bucket_idx];
		while (node != EL_NULL)
		{
			if (f_hash_table_ptr->m_keycmp_func_ptr(f_key_ptr, node->m_key_ptr) == 0)
			{
				return node->m_val_ptr;
			}
			node = node->m_hashNodeNext_ptr;
		}

		return EL_NULL;
	}

#ifdef __cplusplus
}
#endif // Compatible C++
