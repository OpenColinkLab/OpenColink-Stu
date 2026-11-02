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
 * @Date: 2021-09-21 19:44:48
 * @LastEditTime: 2021-09-21 19:47:52
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_alpha
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_Dev\Inc\dsp_ext.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __DSP_EXT_H
#define __DSP_EXT_H
	#ifdef __cplusplus
	extern "C"{
	#endif
	
		#include "stdint.h"
		
		//滑动窗口滤波
		extern uint16_t SOL_DSP_SlidWin_Filter(const uint16_t *dat_in,
									uint16_t *dat_out, 
									uint16_t len, 
									uint16_t win_width);
		//获取信号周期
		extern uint16_t SOL_DSP_SigCycle_Get(const uint16_t *dat,uint16_t len);
		//获取信号峰值
		extern uint16_t SOL_DSP_Vpp_Get(const uint16_t  *dat, uint16_t len);
		//获取信号最大值
		extern uint16_t SOL_DSP_Vmax_Get(const uint16_t  *dat, uint16_t len);
		//获取信号最小值
		extern uint16_t SOL_DSP_Vmin_Get(const uint16_t  *dat, uint16_t len);
		//获取信号直流分量
		extern uint16_t SOL_DSP_DC_Get(const uint16_t *dat_in, uint16_t len);
		//获取方波占空比
		extern float SOL_DSP_Duty_Get(uint16_t *dat_in, uint16_t len);
		//获取方波占空比
		extern uint16_t SOL_DSP_Correct(uint16_t *dat, uint16_t len, int16_t a, float b, int16_t c);
		//信号匹配算法
		extern uint8_t SOL_DSP_Scale_Match(const float *match_tab, 
											uint16_t rows,
											uint16_t columns, 
											const float *dat_checked, 
											const float *dat_weight);
		//内存格式转化
		extern void SOL_DSP_B16toB8(const uint16_t *dat_in, uint8_t *dat_out, uint16_t len);
		//简单排序,冒泡
		extern void SOL_DSP_Simp_Sort(uint16_t *data_in,uint16_t len);
		//较为精确的获取正弦波峰峰值
		extern uint16_t SOL_DSP_SinVpp_Get(const uint16_t *data_in, uint16_t len);
		

	#ifdef __cplusplus
	}
	#endif
#endif
