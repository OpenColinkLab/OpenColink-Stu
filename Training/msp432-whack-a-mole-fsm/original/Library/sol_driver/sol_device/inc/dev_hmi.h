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
 * @Date: 2021-09-17 17:47:35
 * @LastEditTime: 2021-09-20 14:00:36
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \MSP432_Proj_C_A\Library\driver_sol\User_Dev\Inc\hmi.h
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

#ifndef __HMI_H
#define __HMI_H			//Prevent redefinition

	#ifdef USER_FUN			//User function macro definition
		#undef USER_FUN
	#endif
	//#define USER_FUN

	#ifdef __cplusplus
	extern "C"{
	#endif					//Compatible C++
	
/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
	
	#include "env_info.h"
	#include "sol_define.h"
	#include "bsp_gpio.h"
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
#define HMI_RED				63488
#define HMI_GREEN			2016
#define HMI_BLUE			31
#define HMI_GRAY			33840
#define HMI_BLACK			0
#define HMI_WHILE			65535
#define HMI_BROWN			48192
#define HMI_YELLOW			65504

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
					Extern From .C
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				   Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  ENUM/UNION
\*-------------------------------------------------------*/

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			     Drive object structure
\*-------------------------------------------------------*/
#ifdef STM32_HAL_PLATFORM
	DEV(HMI){
			UART_HandleTypeDef * usart;
			void (*HMI_Delay) (volatile uint32_t time);
		};	
#endif
#ifdef MSP432_SDK_PLATFORM
	DEV(HMI){
			uint32_t moduleInstance;	//432串口接口
			void (*HMI_Delay) (volatile uint32_t time);
		};			
#endif


#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			   Support pointer definition
\*-------------------------------------------------------*/
//(User_Change)
/*It is mainly used for the declaration in init function, 
  and then the function pointer in the structure can be 
  assigned*/
	typedef void (*HMI_Delay_Fun_P) (volatile uint32_t time);


#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			Referential function definition
\*-------------------------------------------------------*/

/*-----------------------*\
	   HMI基础发送函数
\*-----------------------*/
//使用hmi_dev发送字符串(无串口中断),用于HMI发送
extern void SOL_HMI_SendString(_DEV(HMI) * hmi_dev ,char *str);
//使用USART向HMI发送一串符合标准的命令
extern void SOL_HMI_SendCmd(_DEV(HMI) * hmi_dev, char *cmd);

/*-----------------------*\
		基本HMI指令
\*-----------------------*/
//刷新页面
extern void SOL_HMI_page(_DEV(HMI) * hmi_dev,uint8_t pageid);
//重绘控件
extern void SOL_HMI_ref(_DEV(HMI) * hmi_dev,uint8_t objid);
//激活控件的按下/弹起事件
extern void SOL_HMI_click(_DEV(HMI) * hmi_dev,uint8_t objid,uint8_t event);
//带格式获取变量值/常量值
extern void SOL_HMI_get(_DEV(HMI) * hmi_dev,char objid);
//隐藏/显示控件
extern void SOL_HMI_vis(_DEV(HMI) * hmi_dev,uint8_t objid,uint8_t state);
//控件触摸使能
extern void SOL_HMI_tsw(_DEV(HMI) * hmi_dev,uint8_t objid,uint8_t state);
//往曲线控件添加数据
extern void SOL_HMI_add(_DEV(HMI) * hmi_dev,uint8_t objid,uint8_t channel,uint8_t val);
//使用USART向HMI透传
extern void SOL_HMI_addt(_DEV(HMI) * hmi_dev, uint8_t *dat ,uint8_t objid ,uint8_t dat_len);
//清除曲线控件中的数据
extern void SOL_HMI_cle(_DEV(HMI) * hmi_dev,uint8_t objid,uint8_t channel);
//复位
extern void SOL_HMI_rest(_DEV(HMI) * hmi_dev);
//向文本控件赋值文本
extern void SOL_HMI_TxtStr_Set(_DEV(HMI) * hmi_dev,char *obj,char *str);
//向文本控件赋值数字
extern void SOL_HMI_TextNum_Set(_DEV(HMI) * hmi_dev,char *obj,uint16_t num);
//向文本控件赋值文本和数字
extern void SOL_HMI_SetTextNS(_DEV(HMI) * hmi_dev,char *obj,char *str,uint16_t num);

/*-----------------------*\
		 GUI绘图指令
\*-----------------------*/
//清屏
extern void SOL_HMI_GUI_cls(_DEV(HMI) * hmi_dev,uint16_t color);
//刷图
extern void SOL_HMI_GUI_pic(_DEV(HMI) * hmi_dev,uint16_t x,uint16_t y,uint16_t picid);
//切图
extern void SOL_HMI_GUI_picq(_DEV(HMI) * hmi_dev,uint16_t x,uint16_t y,uint16_t width,uint16_t hight,uint16_t picid);
//高级切图
extern void SOL_HMI_GUI_xpic(_DEV(HMI) * hmi_dev,\
									uint16_t x,uint16_t y,uint16_t width,uint16_t hight,\
									uint16_t x0,uint16_t y0,uint16_t picid);\
//写字
extern void SOL_HMI_GUI_xstr(_DEV(HMI) * hmi_dev,\
	                uint16_t x,uint16_t y,uint16_t width,uint16_t hight,\
									uint16_t fontid,uint16_t pointcolor,uint16_t backcolor,\
									uint16_t xcenter,uint16_t ycenter,uint16_t sta,\
									char *str);
//区域填充
extern void SOL_HMI_GUI_fill(_DEV(HMI) * hmi_dev,uint16_t x,uint16_t y,uint16_t width,uint16_t hight,uint16_t color);
//画线
extern void SOL_HMI_GUI_line(_DEV(HMI) * hmi_dev,uint16_t x1,uint16_t y1,uint16_t x2,uint16_t y2,uint16_t color);
//画矩形
extern void SOL_HMI_GUI_draw(_DEV(HMI) * hmi_dev,uint16_t x1,uint16_t y1,uint16_t x2,uint16_t y2,uint16_t color);
//画空心圆
extern void SOL_HMI_GUI_cir(_DEV(HMI) * hmi_dev,uint16_t x,uint16_t y,uint16_t r,uint16_t color);
//画实心圆
extern void SOL_HMI_GUI_cirs(_DEV(HMI) * hmi_dev,uint16_t x,uint16_t y,uint16_t r,uint16_t color);


/*-----------------------*\
		 HMI其他功能
\*-----------------------*/
//线性拟合
extern void SOL_HMI_TransLine(_DEV(HMI) * hmi_dev,float *dat_x,float *dat_y,uint8_t length,uint16_t color);
//增益曲线的线性拟合
extern void SOL_HMI_TransLine_Log(_DEV(HMI) * hmi_dev,float *dat_x,float *dat_y,uint8_t length,uint16_t color);
//屏幕尺寸匹配数据
extern void SOL_Image_Match(float *dat_y,uint16_t length);


#ifdef USER_FUN
#endif

	#ifdef __cplusplus		//Compatible C++
	}
	#endif
#endif
