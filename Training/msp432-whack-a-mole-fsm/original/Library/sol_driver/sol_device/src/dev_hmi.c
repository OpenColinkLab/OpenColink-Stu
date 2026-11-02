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
 * @LastEditTime: 2022-04-24 21:11:54
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_hmi.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */


#include "dev_hmi.h"
#include "stdio.h"
#include "math.h"
#include "string.h"
#include "stdlib.h"
#include "bsp_uart.h"
/*-----------------------*\
	   HMI基础发送函数
\*-----------------------*/
/****************************************************************
* 名    称：SOL_HMI_SendString
* 功    能：使用hmi_dev发送字符串(无串口中断),用于HMI发送
* 入口参数：(uint8_t *str,要发送的字符串)(_DEV(HMI) * dev,需要的HMI设备)
* 出口参数：/
****************************************************************/
void SOL_HMI_SendString(_DEV(HMI) * dev ,char *str)
{
#ifdef STM32_HAL_PLATFORM
	HAL_UART_Transmit(dev->usart, (uint8_t *)str, strlen(str), 200);
#endif
#ifdef MSP432_SDK_PLATFORM
	SOL_UART_Transmit(dev->moduleInstance,(uint8_t *)str,strlen(str));
#endif
}

/****************************************************************
* 名    称：SOL_HMI_SendCmd
* 功    能：使用USART向HMI发送一串符合标准的命令
* 入口参数：(uint8_t *cmd,命令字符串)(_DEV(HMI) * dev,需要的HMI设备)
* 出口参数：/
****************************************************************/
void SOL_HMI_SendCmd(_DEV(HMI) * dev, char *cmd)
{
	uint8_t end[] = {255, 255, 255};
	SOL_HMI_SendString(dev,cmd);

#ifdef STM32_HAL_PLATFORM
	HAL_Delay(5);
	HAL_UART_Transmit(dev->usart, end, 3, 200);
	HAL_Delay(5);
#endif
#ifdef MSP432_SDK_PLATFORM
	dev -> HMI_Delay (3000);
	SOL_UART_Transmit(dev->moduleInstance,end,3);
	dev -> HMI_Delay (3000);
#endif
}
/*-----------------------*\
	   HMI其他函数
\*-----------------------*/
/****************************************************************
* 名    称：Image_Match
* 功    能：波形幅度匹配
* 入口参数：(uint16_t *data,需要被匹配的数据)
            (uint16_t length,数据的数量)
* 出口参数：/
* 额外注意：注意观察入口处参数和数据的定义类型是否相同
****************************************************************/
void SOL_Image_Match(float *dat_y,uint16_t length)
{
	  uint16_t index;
    float max = 0;
    float Q;//比例系数
    for(index = 0;index < length;index ++)
    {
        if(dat_y[index] > max)
				{
					max = dat_y[index];
				}                                                                                                                               
    }
    Q = 0.9*240.0/max;
    for(index = 0;index < length;index ++)
    {
        dat_y[index] = Q*dat_y[index];
			  dat_y[index] = (240.0-dat_y[index]);
    }
		
}

/****************************************************************
* 名    称：HMI_TransLine
* 功    能：使用USART在曲线波形控件上进行线性拟合
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(float *dat_x,特殊点的x轴坐标)
						(float *dat_y,特殊点的y轴坐标)(uint8_t length,特殊点数)
						(uint8_t color,线的颜色)
* 出口参数：/
* 额外注意：1.此函数仍需优化！！入口参数length可以被取消，未解决sizeof问题
****************************************************************/
void SOL_HMI_TransLine(_DEV(HMI) * dev, //需要的HMI设备
				   float *dat_x,    //特殊点的x坐标
				   float *dat_y,    //特殊点的y坐标
				   uint8_t length,	//特殊点数
				   uint16_t color)  //颜色
{
	char hmi_cmd[50] = {0};
	uint16_t index;
	//对数据进行屏幕尺寸匹配
	SOL_Image_Match(dat_y,length);
	for(index = 1;index < length;index ++)
	{
		sprintf((char *)hmi_cmd,"line %d,%d,%d,%d,%d",(int)dat_x[index-1],(int)dat_y[index-1],(int)dat_x[index],(int)dat_y[index],color);
		SOL_HMI_SendCmd(dev,hmi_cmd);
	}
#ifdef STM32_HAL_PLATFORM
	HAL_Delay(1000);
#endif
#ifdef MSP432_SDK_PLATFORM
	dev -> HMI_Delay (6000 * 1000);
#endif	
	
}

/****************************************************************
* 名    称：HMI_TransLine_Log
* 功    能：使用USART在曲线波形控件上进行增益曲线的线性拟合
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(float *dat_x,特殊点的x轴坐标)
						(float *dat_y,特殊点的y轴坐标)(uint8_t length,特殊点数)
						(uint8_t color,线的颜色)
* 出口参数：/
* 额外注意：1.此函数仍需优化！！入口参数length可以被取消，未解决sizeof问题
****************************************************************/
void SOL_HMI_TransLine_Log(_DEV(HMI) * dev, //需要的HMI设备
											float *dat_x,          //特殊点的x坐标
											float *dat_y,          //特殊点的y坐标
											uint8_t length,					//特殊点数
											uint16_t color)          //线的颜色
{
	char hmi_cmd[50] = {0};
	uint16_t index;
	for(index = 0;index < length;index ++)
	{
		dat_y[index] = 20*log10((float)dat_y[index]);
	}
	//对数据进行屏幕尺寸匹配
	SOL_Image_Match(dat_y,length);
	//对y轴坐标对数化
	for(index = 1;index < length;index ++)
	{
		sprintf((char *)hmi_cmd,"line %d,%d,%d,%d,%d",(int)dat_x[index-1],(int)dat_y[index-1],(int)dat_x[index],(int)dat_y[index],color);
		SOL_HMI_SendCmd(dev,hmi_cmd);
	}
#ifdef STM32_HAL_PLATFORM
	HAL_Delay(1000);
#endif
#ifdef MSP432_SDK_PLATFORM
	dev -> HMI_Delay (6000 * 1000);
#endif
	
}

/****************************************************************
* 名    称：HMI_page
* 功    能：刷新页面
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t pageid,页面ID)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_page(_DEV(HMI) * dev,uint8_t pageid)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"page %d",pageid);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_ref
* 功    能：重绘控件
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t objid,控件ID)
* 出口参数：/
* 额外注意：如果一个控件被GUI指令画出来的内容遮挡或者被另外的控件
            遮挡之后需要再显示出来，就使用ref来重绘
****************************************************************/
void SOL_HMI_ref(_DEV(HMI) * dev,uint8_t objid)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"page %d",objid);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_click
* 功    能：激活控件的按下/弹起事件
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t objid,控件ID)
            (uint8_t event,事件序号:0为弹起，1为按下)
* 出口参数：/
* 额外注意：控件的按下/弹起事件在屏幕上触摸的时候会自动激活，如果在
            没有触摸的情况下想要手动激活，就使用click指令即可。
            即通过单片机控制按下/弹起事件
            
						
****************************************************************/
void SOL_HMI_click(_DEV(HMI) * dev,uint8_t objid,uint8_t event)
{
#ifdef STM32_HAL_PLATFORM	
	 HAL_Delay(20);
#endif
#ifdef MSP432_SDK_PLATFORM
	dev -> HMI_Delay (6000 * 20);
#endif	
	char hmi_cmd[50] = {0};
	sprintf((char *)hmi_cmd,"click %d,%d",objid,event);
	SOL_HMI_SendCmd(dev,hmi_cmd); 
}

/****************************************************************
* 名    称：HMI_get
* 功    能：带格式获取变量值/常量值
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t objid,控件ID)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_get(_DEV(HMI) * dev,char objid)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"get %d.txt",objid);
	 SOL_HMI_SendCmd(dev,hmi_cmd); 
}

/****************************************************************
* 名    称：HMI_vis
* 功    能：隐藏/显示控件
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t objid,控件ID)
            (uint8_t state,事件序号:0为隐藏，1为显示)
* 出口参数：/
* 额外注意：当第一个参数为255时，该函数对当前页面的所有控件进行使能
****************************************************************/
void SOL_HMI_vis(_DEV(HMI) * dev,uint8_t objid,uint8_t state)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"vis %d,%d",objid,state);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_tsw
* 功    能：控件触摸使能
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t objid,控件ID)
            (uint8_t state,事件序号:0为触摸失效，1为触摸有效)
* 出口参数：/
* 额外注意：当第一个参数为255时，该函数对当前页面的所有控件进行使能
****************************************************************/
void SOL_HMI_tsw(_DEV(HMI) * dev,uint8_t objid,uint8_t state)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"tsw %d,%d",objid,state);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_add
* 功    能：往曲线控件添加数据
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t objid,曲线波形控件的ID)
            (uint8_t channel,通道序列号)(uint8_t val,要发送的数据)
* 出口参数：/
* 额外注意：发送的数据一定是8位数据！！
            一般一个页面的波形控件最多支持4个通道,而且通道序号从0
             开始！而且开启的通道数量要在上位机软件里进行配置
						 可以连续发送数据，控件会自动平推显示数据.
****************************************************************/
void SOL_HMI_add(_DEV(HMI) * dev,uint8_t objid,uint8_t channel,uint8_t val)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"add %d,%d,%d",objid,channel,val);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_addt
* 功    能：使用USART向HMI透传
* 入口参数：(uint8_t *cmd,命令字符串)(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t dat_num,数据数组长度)
* 出口参数：/
* 额外注意：1.此功能仅适用于曲线波形控件
						2.不能直接用数字电源供电,电压可能对透传产生影响
						透传反应较慢,应给适当延时
****************************************************************/
void SOL_HMI_addt(_DEV(HMI) * dev, uint8_t *dat ,uint8_t objid ,uint8_t dat_num)
{
	char hmi_cmd[50];
	uint8_t end[] = {255, 255, 255};
	sprintf(hmi_cmd,"addt %d,0,%d",objid,dat_num);	
	SOL_HMI_SendCmd(dev,hmi_cmd);

#ifdef STM32_HAL_PLATFORM
	HAL_Delay(100);
	HAL_UART_Transmit(dev->usart, dat, dat_num, 200);
	HAL_Delay(100);
	HAL_UART_Transmit(dev->usart, end, 3, 200);	
#endif
#ifdef MSP432_SDK_PLATFORM
	dev -> HMI_Delay (6000 * 100);
	SOL_UART_Transmit(dev->moduleInstance, dat, dat_num);
	dev -> HMI_Delay (6000 * 100);
	SOL_UART_Transmit(dev->moduleInstance, end, 3);
#endif
}

/****************************************************************
* 名    称：HMI_cle
* 功    能：清除曲线控件中的数据
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
*						(uint8_t objid,曲线波形控件的ID)
            (uint8_t channel,通道序列号)
* 出口参数：/
* 额外注意：通道号为255时表示清除此曲线控件内的所有通道数据
****************************************************************/
void SOL_HMI_cle(_DEV(HMI) * dev,uint8_t objid,uint8_t channel)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"cle %d,%d",objid,channel);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_rest
* 功    能：复位
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_rest(_DEV(HMI) * dev)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"rest");
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}


/****************************************************************
* 名    称：HMI_TxtStr_Set
* 功    能：向文本控件赋值文本
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (char *obj,文本控件的名称 注意不是ID)
            (char *str,要赋值的字符串)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_TxtStr_Set(_DEV(HMI) * dev,char *obj,char *str)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"%s.txt=\"%s\"",obj,str);
	 SOL_HMI_SendCmd(dev,hmi_cmd); 
}

/****************************************************************
* 名    称：HMI_TextNum_Set
* 功    能：向文本控件赋值数字
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (char *obj,文本控件的名称 注意不是ID)
            (char *num,要赋值的数字)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_TextNum_Set(_DEV(HMI) * dev,char *obj,uint16_t num)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"%s.txt=\"%d\"",obj,num);
	 SOL_HMI_SendCmd(dev,hmi_cmd); 
}


/****************************************************************
* 名    称：HMI_SetTextNum
* 功    能：向文本控件赋值文本和数字
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (char *obj,文本控件的名称 注意不是ID)
						(char *str,要赋值的字符串)            
						(char *num,要赋值的数字)
* 出口参数：/
* 额外注意：此函数的赋值为字符在前，数字在后
****************************************************************/
void SOL_HMI_SetTextNS(_DEV(HMI) * dev,char *obj,char *str,uint16_t num)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"%s.txt=\"%s%d\"",obj,str,num);
	 SOL_HMI_SendCmd(dev,hmi_cmd); 
}

/****************************************************************
* 名    称：HMI_GUI_cls
* 功    能：清屏
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t color,颜色)
* 出口参数：/
* 额外注意：/
****************************************************************/
void 	SOL_HMI_GUI_cls(_DEV(HMI) * dev,uint16_t color)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"cls %d",color);
	 SOL_HMI_SendCmd(dev,hmi_cmd); 
}

/****************************************************************
* 名    称：HMI_GUI_pic
* 功    能：刷图
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x,起始点x坐标)(uint16_t y,起始点y坐标)
            (uint16_t picid,图片ID)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_GUI_pic(_DEV(HMI) * dev,\
								uint16_t x,\
								uint16_t y,\
								uint16_t picid)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"pic %d,%d,%d",x,y,picid);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_GUI_pic
* 功    能：切图
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x,屏幕起始点x坐标)
						(uint16_t y,屏幕起始点y坐标)
            (uint16_t width,切图所选择的宽度)
						(uint16_t hight,切图所选择的高度)
						(uint16_t picid,图片ID)
* 出口参数：/
* 额外注意：此指令切图，在图片上选择的起始坐标均为(0,0)
****************************************************************/
void SOL_HMI_GUI_picq(_DEV(HMI) * dev,\
									uint16_t x,\
									uint16_t y,\
									uint16_t width,\
									uint16_t hight,\
									uint16_t picid)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"picq %d,%d,%d,%d,%d",x,y,width,hight,picid);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_GUI_xpic
* 功    能：高级切图
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x,屏幕起始点x坐标)
						(uint16_t y,屏幕起始点y坐标)
            (uint16_t width,切图所选择的宽度)
						(uint16_t hight,切图所选择的高度)
						(uint16_t x0,图片起始点x坐标)
						(uint16_t y0,图片起始点y坐标)
						(uint16_t picid,图片ID)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_GUI_xpic(_DEV(HMI) * dev,\
									uint16_t x,\
									uint16_t y,\
									uint16_t width,\
									uint16_t hight,\
									uint16_t x0,\
									uint16_t y0,\
									uint16_t picid)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"xpic %d,%d,%d,%d,%d,%d,%d",x,y,width,hight,x0,y0,picid);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_GUI_xstr
* 功    能：写字
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x,屏幕起始点x坐标)
						(uint16_t y,屏幕起始点y坐标)
            (uint16_t width,:区域宽度)
						(uint16_t hight,区域高度)
						(uint16_t fontid,字库ID)
            (uint16_t pointcolor,字体颜色)
						(uint16_t backcolor,背景色(sta设置为切图或图片时，backcolor表示图片ID))
						(uint16_t xcenter,水平对齐方式(0为左对齐，1为居中，2为右对齐))
						(uint16_t ycenter,垂直对齐方式(0为上对齐，1为居中，2为下对齐))
						(uint16_t sta,背景填充方式(0为切图，1为单色，2为图片，3为无背景,
																sta设置为切图或图片时，backcolor表示图片ID))
						(char *str,字符内容)
* 出口参数：/
* 额外注意：字符写到超过设定的width以后将自动换行，如果换行到h之后还有剩下的字符没写完，将会被忽略。
****************************************************************/
void SOL_HMI_GUI_xstr(_DEV(HMI) * dev,\
	                uint16_t x,uint16_t y,uint16_t width,uint16_t hight,\
									uint16_t fontid,uint16_t pointcolor,uint16_t backcolor,\
									uint16_t xcenter,uint16_t ycenter,uint16_t sta,\
									char *str)
{
	 char hmi_cmd[200] = {0};
	 sprintf((char *)hmi_cmd,"xstr %d,%d,%d,%d,%d,%d,%d,%d,%d,%d,\"%s\"",\
	  x,y,width,hight,fontid,pointcolor,backcolor,xcenter,ycenter,sta,str);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_GUI_fill
* 功    能：区域填充
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x,屏幕起始点x坐标)
						(uint16_t y,屏幕起始点y坐标)
            (uint16_t width,切图所选择的宽度)
						(uint16_t hight,切图所选择的高度)
						(uint16_t color,颜色)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_GUI_fill(_DEV(HMI) * dev,\
									uint16_t x,\
									uint16_t y,\
									uint16_t width,\
									uint16_t hight,\
									uint16_t color)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"fill %d,%d,%d,%d,%d",x,y,width,hight,color);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_GUI_line
* 功    能：画线
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x1,起始点坐标x)
						(uint16_t y1,起始点坐标y)
            (uint16_t x2,结束点坐标x)
						(uint16_t y2,结束点坐标y)
						(uint16_t color,直线颜色)
* 出口参数：/
* 额外注意：/
****************************************************************/
void SOL_HMI_GUI_line(_DEV(HMI) * dev,\
									uint16_t x1,\
									uint16_t y1,\
									uint16_t x2,\
									uint16_t y2,\
									uint16_t color)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"line %d,%d,%d,%d,%d",x1,y1,x2,y2,color);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}


/****************************************************************
* 名    称：HMI_GUI_draw
* 功    能：画矩形
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x1,起始点坐标x)
						(uint16_t y1,起始点坐标y)
            (uint16_t x2,结束点坐标x)
						(uint16_t y2,结束点坐标y)
						(uint16_t color,直线颜色)
* 出口参数：/
* 额外注意：draw画出来的是空心矩形，需要填充实心矩形的话请直接使用fill区域填充指令
            (x1,y1)是矩形左上角坐标，(x2,y2)是矩形右上角坐标
****************************************************************/
void SOL_HMI_GUI_draw(_DEV(HMI) * dev,\
									uint16_t x1,\
									uint16_t y1,\
									uint16_t x2,\
									uint16_t y2,\
									uint16_t color)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"draw %d,%d,%d,%d,%d",x1,y1,x2,y2,color);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_GUI_cir
* 功    能：画空心圆
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x,圆心坐标x)
						(uint16_t y,圆心坐标y)
            (uint16_t r,半径)
						(uint16_t color,曲线颜色)
* 出口参数：/
* 额外注意：若作画超出屏幕范围，则屏幕只保留在屏幕范围内的部分
****************************************************************/
void SOL_HMI_GUI_cir(_DEV(HMI) * dev,uint16_t x,uint16_t y,uint16_t r,uint16_t color)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"cir %d,%d,%d,%d",x,y,r,color);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}

/****************************************************************
* 名    称：HMI_GUI_cirs
* 功    能：画实心圆
* 入口参数：(_DEV(HMI) * dev,需要的HMI设备)
            (uint16_t x,圆心坐标x)
						(uint16_t y,圆心坐标y)
            (uint16_t r,半径)
						(uint16_t color,曲线颜色)
* 出口参数：/
* 额外注意：若作画超出屏幕范围，则屏幕只保留在屏幕范围内的部分
****************************************************************/
void SOL_HMI_GUI_cirs(_DEV(HMI) * dev,uint16_t x,uint16_t y,uint16_t r,uint16_t color)
{
	 char hmi_cmd[50] = {0};
	 sprintf((char *)hmi_cmd,"cirs %d,%d,%d,%d",x,y,r,color);
	 SOL_HMI_SendCmd(dev,hmi_cmd);
}


