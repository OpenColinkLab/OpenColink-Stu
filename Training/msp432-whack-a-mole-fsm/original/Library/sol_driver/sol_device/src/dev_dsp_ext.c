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
 * @LastEditTime: 2022-04-24 21:11:50
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_dsp_ext.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/**
 * @attentiion 
 * 1.所有待测信号必须大于1mv小于3299mv,过低会发生波形畸变,过高会损坏单
 *	 片机.
 * 2.在进行DSP前务必先进行滤波,因为测试是在滤波后进行的!!!
*/

	#include "dev_dsp_ext.h"
	#include "stdlib.h"
	#include "math.h"
	#include "arm_math.h"
	#include "arm_const_structs.h"
/****************************************************************
* 名    称:SOL_DSP_SlidWin_Filter
* 功    能:平滑滤波
* 入口参数:(const uint16_t *dat_in,待平滑数组)(uint16_t *dat_out,平滑后数组)
*          (uint16_t len,数组长度)(uint16_t win_radius,窗口半径)
* 出口参数:/
* 改变参数:(uint16_t *dat_out,平滑后数组)
* 逻辑说明:以选定点为中心,周围点相加除以点数,从而平滑波形
* 额外说明:eg: win_radius = 2时加和是以选定数为
****************************************************************/
uint16_t SOL_DSP_SlidWin_Filter(const uint16_t *dat_in, uint16_t *dat_out, uint16_t len, uint16_t win_radius)
{
	uint16_t index_a;
	uint16_t index_b;
	uint16_t count = 0;
	uint32_t dat_sum = 0;

	
	if (len <= win_radius)
		return 0;
	
	for (index_a = 0; index_a < len ; index_a++)
	{
		if ((index_a >= win_radius) && (index_a < len - win_radius)){
			for(index_b = index_a - win_radius , dat_sum = 0;
				index_b <= index_a + win_radius; 
				index_b++){
				dat_sum += dat_in[index_b];
			}
			dat_out[index_a] = (dat_sum / (2 * win_radius + 1));
		}
		
		 else if (index_a < win_radius){
			for(index_b = 0,count = 0,dat_sum = 0;
				index_b <= index_a + win_radius; 
				index_b++){
					
				dat_sum += dat_in[index_b];
				count++;
			}
			dat_out[index_a] = (dat_sum / count);
			
		}
		
		else if(index_a >= len - win_radius){
			for(index_b = index_a - win_radius,count = 0,dat_sum = 0;
				index_b < len; 
				index_b++){
					
				dat_sum += dat_in[index_b];
				count++;
			}
			dat_out[index_a] = (dat_sum / count);
		}
	}
	return (1);
}

/****************************************************************
* 名    称:SOL_DSP_SigCycle_Get
* 功    能:获取一个正弦信号数组的中期
* 入口参数:(const uint16_t *dat,待测数组)(uint16_t len,数组长度)
* 出口参数:(return (flag2 - flag1),查分形式的数组周期,离散值)
* 改变参数:/
* 逻辑说明:自相关比大小
* 额外说明:只有在采样率足够高时才可以获得较准确周期数
*			BUG:采样点数过少时(200就不行)无法求出周期
*			建议点数1024
****************************************************************/
uint16_t SOL_DSP_SigCycle_Get(const uint16_t *dat, uint16_t len)
{
	uint16_t index;
	uint16_t cycle_len;
	uint16_t flag1 = 0;
	uint16_t flag2 = 0;
	int64_t auto_cor0 = 0, auto_cor1 = 0, auto_cor2 = 0;
	
	len /= 2;
	for (cycle_len = 0; cycle_len < len; cycle_len++)
	{
		auto_cor2 = 0;
		for (index = 0; index < len; index++){
			auto_cor2 += dat[index] * dat[index + cycle_len];
		}
		if (cycle_len > 2 && auto_cor1 > auto_cor0 && auto_cor1 > auto_cor2)
		{
			if (flag1 == 0)
				flag1 = cycle_len - 1;
			else if (flag2 == 0)
				flag2 = cycle_len - 1;
			else
				return (flag2 - flag1);
		}
		auto_cor0 = auto_cor1;
		auto_cor1 = auto_cor2;
	}
	return (0);

}

/****************************************************************
* 名    称:SOL_DSP_Vpp_Get
* 功    能:获取任意信号峰峰值
* 入口参数:(const uint16_t  *dat,传入数组)(uint16_t len,数组长度)
* 出口参数:(return (max - min),返回峰峰值);
* 改变参数:/
* 逻辑说明:最大减最小
* 额外说明:/
****************************************************************/

uint16_t SOL_DSP_Vpp_Get(const uint16_t  *dat, uint16_t len)
{
	uint16_t index;
	uint16_t max;
	uint16_t min;
	max = dat[0];
	min = dat[0];
	
	for (index = 1; index < len; index++)
	{
		if (min > dat[index])
			min = dat[index];
			
		if (max < dat[index])
			max = dat[index];
	}
	return (max - min);
}

/****************************************************************
* 名    称:SOL_DSP_Vmax_Get
* 功    能:获取任意信号峰值(最大值)
* 入口参数:(const uint16_t  *dat,传入数组)(uint16_t len,数组长度)
* 出口参数:(return (max),返回峰值);
* 改变参数:/
* 逻辑说明:比大小
* 额外说明:/
****************************************************************/
uint16_t SOL_DSP_Vmax_Get(const uint16_t  *dat, uint16_t len)
{
	uint16_t index;
	uint16_t max;
	
	max = dat[0];
	for (index = 1; index < len; index++){
		if (max < dat[index])
			max = dat[index];
	}
	return (max);
}

/****************************************************************
* 名    称:SOL_DSP_Vmin_Get
* 功    能:获取任意信号谷值(最小值)
* 入口参数:(const uint16_t  *dat,传入数组)(uint16_t len,数组长度)
* 出口参数:(return (min),返回峰值);
* 改变参数:/
* 逻辑说明:比大小
* 额外说明:/
****************************************************************/

uint16_t SOL_DSP_Vmin_Get(const uint16_t  *dat, uint16_t len)
{
	uint16_t index;
	uint16_t min;
	min = dat[0];
	
	for (index = 1; index < len; index++){
		if (min > dat[index])
			min = dat[index];
	}
	return (min);
}

/****************************************************************
* 名    称:SOL_DSP_Duty_Get
* 功    能:获取方波占空比
* 入口参数:(uint16_t *dat_in, 输入数据)(uint16_t len，输入数据长度)
* 出口参数:(return ((float)up * 100 / (float)cycle),占空比)
* 改变参数:/
* 逻辑说明:/
* 额外说明:功能正常,但采样率要求较高
****************************************************************/

float SOL_DSP_Duty_Get(uint16_t *dat_in, uint16_t len)
{
	uint16_t index;
	uint16_t dc_level;	
	uint16_t up = 0;
	uint16_t cycle = 0;
	
	dc_level = SOL_DSP_DC_Get(dat_in,len);
	
	for (index = 0; (index < len) && (dat_in[index] > dc_level); index++)
		;
	for (; (index < len) && (dat_in[index] < dc_level); index++)
		;
	for (; (index < len) && (dat_in[index] > dc_level); index++){
		up++;
		cycle++;
	}
	for (; (index < len) && (dat_in[index] < dc_level); index++){
		cycle++;
	}

	if (index < len)
		return ((float)up * 100 / (float)cycle);

	return 0;
}

/****************************************************************
* 名    称:SOL_DSP_Data_Map
* 功    能:将传入数组应用函数 y = (x / a) + b;
* 入口参数:(uint16_t *dat_in, uint16_t len, int16_t a, float b, int16_t c)
* 出口参数:/
* 改变参数:(uint16_t *dat_in,略)
* 逻辑说明:/
* 额外说明:此函数根据需要自行修改
****************************************************************/
uint16_t SOL_DSP_Data_Map(uint16_t *dat_in, uint16_t len, int16_t a, float b, int16_t c)
{
	uint16_t index;
	
	for (index = 0; index < len; index++)
		dat_in[index] = (uint16_t)((dat_in[index] / a) + b);
	return 1;
}

/****************************************************************
* 名    称:SOL_DSP_DC_Get
* 功    能:获取信号直流分量
* 入口参数:(uint16_t *dat, 需要检测的数据)(uint16_t len数据长度)
* 出口参数:(return dc_level,直流分量值)
* 改变参数:/
* 逻辑说明:/
* 额外说明:全相加除以长度(仅对完整周期信号而言)
****************************************************************/
uint16_t SOL_DSP_DC_Get(const uint16_t *dat_in, uint16_t len)
{
	uint16_t index;
	uint16_t dc_level;
	uint32_t sum = 0;
	
	for (index = 0; index < len; index++)
		sum += dat_in[index];
	dc_level = sum / len;
	return dc_level;
}

/****************************************************************
* 名    称:SOL_DSP_B16toB8
* 功    能:将16位数据转为8位数据
* 入口参数:(const uint16_t *dat_in,待转换数据)(uint8_t *dat_out,接收转换数据的数组)
		   (uint16_t len需要转换的数据长度)
* 出口参数:/
* 改变参数:(uint8_t *dat_out,接收转换数据的数组)
* 逻辑说明:/
* 额外说明:大于255的数据将会清零
****************************************************************/
void SOL_DSP_B16toB8(const uint16_t *dat_in, uint8_t *dat_out, uint16_t len)
{
	uint16_t index;
	for (index = 0; index < len ; index++)
	{
		if (dat_in[index] > 255)
			dat_out[index] = 0;
		else
			dat_out[index] = dat_in[index];
	}
}

/****************************************************************
* 名    称:SOL_DSP_Scale_Match
* 功    能:最大似然编码,用于情况匹配
* 入口参数:(const float *match_tab,对照表)
*		   (uint16_t rows,表行数)
*		   (uint16_t columns,表列数) 
*		   (const float *dat_checked,待检数组) 
*		   (const float *dat_weight,各列权重)
* 出口参数:(return index_match,检得行号,从0开始的)
* 改变参数:/
* 逻辑说明:/
* 额外说明:最大似然编码
****************************************************************/
uint8_t SOL_DSP_Scale_Match(const float *match_tab, 
						uint16_t rows,
						uint16_t columns, 
						const float *dat_checked, 
						const float *dat_weight)
{
	uint16_t index_match;
	uint16_t index_a;
	uint16_t index_b;
	float match_tmp = 0;
	float match_result = 0;
	
	for (index_a = 0; index_a < rows; index_a++)
	{
		for (match_tmp = 0, index_b = 0; index_b < columns; index_b++)
		{
			match_tmp += pow((match_tab[columns * index_a + index_b] - dat_checked[index_b]),2) * dat_weight[index_b];
			if(index_a == 0 && (index_b == columns - 1))
				match_result = match_tmp;
		}
		if (match_tmp < match_result)
		{
			index_match = index_a;
			match_result = match_tmp;
		}
	}
	return index_match;
}

/****************************************************************
* 名    称:SOL_DSP_SinVpp_Get
* 功    能:较为精确的获取正弦波峰峰值
* 入口参数:(uint16_t *dat, 需要处理的数据)(uint16_t len需要转换的数据长度)
* 出口参数:(return (),正弦峰峰值)
* 改变参数:/
* 逻辑说明:根据面积求解
* 额外说明:确认是正弦函数时使用此函数得到的峰峰值更为精准
****************************************************************/
uint16_t SOL_DSP_SinVpp_Get(const uint16_t *data_in, uint16_t len)
{
	uint16_t cycle_len;		//周期长度
	uint16_t dc_level;		//支流分量
	uint16_t index;
	uint32_t ac_sum = 0;	//交流和(面积)
	
	cycle_len = SOL_DSP_SigCycle_Get(data_in,len);
	//直接使用尽可能多的完整周期来计算峰峰值
	dc_level = SOL_DSP_DC_Get(data_in, len - len%cycle_len);
	
	for(index = 0,ac_sum = 0;index < len - len%cycle_len; index++)
	{
		if(data_in[index] >= dc_level)
			ac_sum += (data_in[index] - dc_level);
		else
			ac_sum += (dc_level - data_in[index]);
	}
		return (uint16_t)(ac_sum*3.1415926f/len - len%cycle_len);
}

/****************************************************************
* 名    称:SOL_DSP_Simp_Sort
* 功    能:冒泡
* 入口参数:(uint16_t *dat, 需要处理的数据)(uint16_t len需要转换的数据长度)
* 出口参数:(return (uint16_t)(ac_sum*3.14159/cycle_len),正弦峰峰值)
* 改变参数:/
* 逻辑说明:/
* 额外说明:此函数会改变传入数组的值,需要保留原数组时慎用！
****************************************************************/
void SOL_DSP_Simp_Sort(uint16_t *data_in,uint16_t len)
{
	uint16_t index_a;
	uint16_t index_b;
	uint16_t tem;

	for(index_a = 0; index_a < len; index_a ++){
		for(index_b = index_a + 1; index_b <len; index_b ++){
			if(data_in[index_a] > data_in[index_b]){          
				tem = data_in[index_a];
				data_in[index_a] = data_in[index_b];
				data_in[index_b] = tem;
			}
		}
	}

}

