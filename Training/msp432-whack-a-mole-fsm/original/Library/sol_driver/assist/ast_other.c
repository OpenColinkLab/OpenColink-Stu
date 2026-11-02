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
 * @Date: 2022-04-23 12:38:08
 * @LastEditTime: 2022-04-24 21:10:27
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\assist\ast_other.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#include "stdio.h"
#include "math.h"
#include "string.h"
#include "stdlib.h"

#include "driverlib.h"
#include "ast_other.h"

#include "dev_w25qxx.h"

	#ifndef OTH_MOD

		/*
		* fun_name :SOL_Math_Table
		* describe :表匹配函数
		* input	   :(uint32_t x_num,单个情况中的元素数)
					(uint32_t y_num,单套表的总情况数)
					(uint16_t z_num,重复制表次数)
					(const uint32_t * match_arr,待匹配数组)
					(uint32_t start_addr,FLASH首地址(若非FLASH匹配填0))
		* output   :(uint16_t match_num, 匹配到的情况,注意此处是从0开始的组号)
		* other_dis:表的规格应遵循如下格式:
			eg: x_num = 4; y_num = 5; z_num = 3;

			0  |a00|a01|a02|a03|
			1  |a10|a11|a12|a13|	0
			2  |a20|a21|a22|a23|
			-------------------------
			3  |b00|b01|b02|b03|
			4  |b10|b11|b12|b13|	1
			5  |b20|b21|b22|b23|
			-------------------------
			6  |c00|c01|c02|c03|
			7  |c10|c11|c12|c13|	2
			8  |c20|c21|c22|c23|
			-------------------------
			9  |d00|d01|d02|d03|
			10 |d10|d11|d12|d13|	3
			11 |d20|d21|d22|d23|
			-------------------------
			12 |e00|e01|e02|e03|
			13 |e10|e11|e12|e13|	4
			14 |e20|e21|e22|e23|

		* platform :432sdk
		* Tested   :N		
		*/
		uint16_t SOL_Match_Table(uint32_t x_num, 
								uint32_t y_num, 
								uint32_t z_num, 
								const uint32_t * match_arr, 
								uint32_t start_addr,
								const uint32_t * table)
		{
			uint16_t index = 0;			
			uint16_t index_total = 0;			
			uint16_t total_num = y_num * z_num;	
			uint32_t sum_now = 0;
			uint32_t sum_min;
			uint16_t match_position = 0;
			uint16_t match_num = 0;
			
			for(index_total = 0; index_total < total_num; index_total ++){
				for(index = 0; index < x_num; index ++){
					sum_now += (match_arr[index] - table[start_addr + index]) * (match_arr[index] - table[start_addr + index]);
				}
				if( ! index_total){
					sum_min = sum_now;
				}
				if(sum_now <= sum_min){		
					sum_min = sum_now;
					match_position = index_total;
				}
				sum_now = 0;
				start_addr += x_num;
			}

			match_num = match_position / z_num;
			return (match_num);
		}

		/**
		 * @note 
		 * fun_name :SOL_8To16_Change
		 * describe :8 to 16
		 * input	:/
		 *      @param arr2change 待转数组
		 *      @param arr_aft_change	接收数组
		 * @note 
		 * change   :arr_aft_change
		 * platform :432sdk
		 * istested :N
		 */
    	void SOL_8To16_Change(const uint8_t * arr2change, 
							  uint16_t * arr_aft_change, 
							  uint16_t dat_num){
			uint16_t index = 0;

			for(index = 0; index < dat_num; index ++){
				arr_aft_change[index] = arr2change[index];
			}
		}
		/**
		 * @note 
		 * fun_name :SOL_8To32_Change
		 * describe :8 to 32
		 * input	:/
		 *      @param arr2change 待转数组
		 *      @param arr_aft_change	接收数组
		 * @note 
		 * change   :arr_aft_change
		 * platform :432sdk
		 * istested :N
		 */		
    	void SOL_8To32_Change(const uint8_t * arr2change, 
							  uint32_t * arr_aft_change, 
							  uint16_t dat_num){
			uint16_t index = 0;

			for(index = 0; index < dat_num; index ++){
				arr_aft_change[index] = arr2change[index];
			}
		}
		/**
		 * @note 
		 * fun_name :SOL_16To32_Change
		 * describe :16 to 8
		 * input	:/
		 *      @param arr2change 待转数组
		 *      @param arr_aft_change	接收数组
		 * @note 
		 * change   :arr_aft_change
		 * platform :432sdk
		 * istested :N
		 */
    	void SOL_16To32_Change(const uint16_t * arr2change, 
							   uint32_t * arr_aft_change, 
							   uint16_t dat_num){
			uint16_t index = 0;

			for(index = 0; index < dat_num; index ++){
				arr_aft_change[index] = arr2change[index];
			}
		}


	#endif