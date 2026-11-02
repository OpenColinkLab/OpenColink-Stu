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
 * @LastEditTime: 2022-04-24 21:10:16
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\assist\ast_debug.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */


/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "ast_debug.h"

#ifdef STM32_HAL_PLATFORM
        #include "main.h"
		#include "usart.h"
#endif
#ifdef MSP432_SDK_PLATFORM
        #include "driverlib.h"
        #include "bsp_uart.h"
#endif
        #include "stdio.h"
        #include "string.h"

#ifdef DBG_MOD

#ifdef STM32_HAL_PLATFORM
/****************************************************************
* 名    称:Dbg_StrSend
* 功    能:向串口调试助手发送一条字符串
* 入口参数:(UART_HandleTypeDef * usart_dev,使用到的串口)
*         (char* str,要发送的定字符串)
* 额外说明:这里一阶递归了,乱开DBG_STR_LEN_MAX会爆
****************************************************************/
void Dbg_StrSend(UART_HandleTypeDef * usart_dev, const char* str){
	
	char err_str[] = {"\n\nerr:SerialPortArray OVERFLOW !\n"};

    if(strlen(str) > DBG_STR_LEN_MAX){
        HAL_UART_Transmit(usart_dev,(uint8_t *)err_str, strlen(err_str),100);
        return;
    }
	HAL_UART_Transmit(usart_dev,(uint8_t *)str,strlen(str),100);
}

/****************************************************************
* 名    称:Dbg_Plot_Ux
* 功    能:使用串口调试助手绘制曲线
* 入口参数:(UART_HandleTypeDef * usart_dev,使用到的串口)
*		  (char* line_name,线名称)(const uintx_t* dat,待传送数据)
*		  (uint16_t dat_len,待传数据长度)
* 额外说明:要发送的数组指针是uint_8,所以发送其他格式的话会出错,要注意
****************************************************************/
//U8
void Dbg_Plot_U8(UART_HandleTypeDef * usart_dev, char* line_name, const uint8_t* dat,uint16_t dat_len){
	char dbg_cmd[DBG_STR_LEN_MAX];//注意发送字符数目不要越界
	uint16_t index;
	
	for(index = 0; index < dat_len; index++){
		sprintf(dbg_cmd,"%s=%d\n",line_name,dat[index]);
		Dbg_StrSend(usart_dev,dbg_cmd);
	}
}
//U16
void Dbg_Plot_U16(UART_HandleTypeDef * usart_dev, char* line_name, const uint16_t* dat,uint16_t dat_len){
	char dbg_cmd[DBG_STR_LEN_MAX];//注意发送字符数目不要越界
	uint16_t index;
	
	for(index = 0; index < dat_len; index++){
		sprintf(dbg_cmd,"%s=%d\n",line_name,dat[index]);
		Dbg_StrSend(usart_dev,dbg_cmd);
	}
}
//U32
void Dbg_Plot_U32(UART_HandleTypeDef * usart_dev, char* line_name, const uint32_t* dat,uint16_t dat_len){
	char dbg_cmd[DBG_STR_LEN_MAX];//注意发送字符数目不要越界
	uint16_t index;
	
	for(index = 0; index < dat_len; index++){
		sprintf(dbg_cmd,"%s=%d\n",line_name,dat[index]);
		Dbg_StrSend(usart_dev,dbg_cmd);
	}
}
#endif
#ifdef MSP432_SDK_PLATFORM
/****************************************************************
* 名    称:Dbg_StrSend
* 功    能:向串口调试助手发送一条字符串
* 入口参数:(UART_HandleTypeDef * usart_dev,使用到的串口)
*         (char* str,要发送的定字符串)
* 额外说明:这里一阶递归了,乱开DBG_STR_LEN_MAX会爆
****************************************************************/
void Dbg_StrSend(uint32_t moduleInstance, const char* str){
	
	char err_str[] = {"\n\nerr:Serial Port Array OVERFLOW !\n"};
	
    if(strlen(str) > DBG_STR_LEN_MAX - 1){
		printf("%s",err_str);
        return;
    }
	SOL_UART_Transmit(moduleInstance, (uint8_t *)str, strlen(str));
}
/****************************************************************
* 名    称:Dbg_Plot_U8
* 功    能:使用串口调试助手绘制曲线
* 入口参数:(char* line_name,线名称)(const uint16_t* dat,待传送数据)
*		  (uint16_t dat_len,待传数据长度)
* 额外说明:要发送的数组指针是uint_8,所以发送其他格式的话会出错,要注意
* 平	台:432sdk
****************************************************************/
//U8
void Dbg_Plot_U8(uint32_t moduleInstance, char* line_name, const uint8_t* dat,uint16_t dat_len){
	char dbg_cmd[DBG_STR_LEN_MAX];//注意发送字符数目不要越界
	uint16_t index;
	
	for(index = 0; index < dat_len; index++){
		sprintf(dbg_cmd,"%s=%d\n",line_name,dat[index]);
		Dbg_StrSend(moduleInstance,dbg_cmd);
	}
}
//U16
void Dbg_Plot_U16 (uint32_t moduleInstance, char* line_name, const uint16_t* dat,uint16_t dat_len){
	char dbg_cmd[DBG_STR_LEN_MAX];//注意发送字符数目不要越界
	uint16_t index;
	
	for(index = 0; index < dat_len; index++){
		sprintf(dbg_cmd,"%s=%d\n",line_name,dat[index]);
		Dbg_StrSend(moduleInstance,dbg_cmd);
	}
}
//U32
void Dbg_Plot_U32(uint32_t moduleInstance, char* line_name, const uint32_t* dat,uint16_t dat_len){
	char dbg_cmd[DBG_STR_LEN_MAX];//注意发送字符数目不要越界
	uint16_t index;
	
	for(index = 0; index < dat_len; index++){
		sprintf(dbg_cmd,"%s=%d\n",line_name,dat[index]);
		Dbg_StrSend(moduleInstance,dbg_cmd);
	}
}
#endif


/***************************************************************
* 名    称:Dbg_Up_Init_U8
* 功    能:单增赋值U8数组
****************************************************************/

void Dbg_Up_Init_U8(uint8_t * arr, uint16_t len){
	uint16_t index = 0;
	
	for(index = 0; index < len; index ++){
		arr[index] = index;
	}
}

/***************************************************************
* 名    称:Dbg_Up_Init_U16
* 功    能:单增赋值U16数组
****************************************************************/
void Dbg_Up_Init_U16(uint16_t * arr, uint16_t len){
	uint16_t index = 0;
	
	for(index = 0; index < len; index ++){
		arr[index] = index;
	}
}

/***************************************************************
* 名    称:Dbg_Up_Init_U32
* 功    能:单增赋值U32数组
****************************************************************/
void Dbg_Up_Init_U32(uint32_t * arr, uint16_t len){
	uint16_t index = 0;
	
	for(index = 0; index < len; index ++){
		arr[index] = index;
	}
}
#endif