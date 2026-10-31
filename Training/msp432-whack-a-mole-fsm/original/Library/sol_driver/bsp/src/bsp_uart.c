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
 * @LastEditTime: 2022-04-24 21:09:03
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\bsp\src\bsp_uart.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "string.h"
#include "driverlib.h"
#include "bsp_buffer.h"
#include "bsp_uart.h"
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/
//计算波特率所需参数
static const uint8_t table_cfg[STEP_SIZE] =
{
	0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x11, 0x21, 0x22, 0x44, 0x25, 0x49, 0x4a, 0x52, 0x92,
	0x53, 0x55, 0xaa, 0x6b, 0xad, 0xb5, 0xb6, 0xd6, 0xb7, 0xbb, 0xdd, 0xed, 0xee, 0xbf, 0xdf, 0xff,
	0xf7, 0xfb, 0xfd, 0xfe
};
static const uint16_t table_sp[STEP_SIZE] =
{
	529, 715, 835, 1001, 1252, 1430, 1670, 2147, 2224, 2503, 3000, 3335, 3575, 3753, 40003, 4286,
	4378, 5002, 5715, 6003, 6254, 6432, 6667, 7001, 7147, 7503, 7861, 8004, 8333, 8464, 8572, 8751,
	9004, 9170, 9288, 10001
};

/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/

/*
* fun_name :SOL_UART_Calc_Baud
* describe :COL库432波特率计算函数
* input	   :(eUSCI_UART_ConfigV1* uart_cfg,UART设备结构体)
			(float clk_val,UART时钟频率)
			(float baud,波特率)
*/
void SOL_UART_Calc_Baud(eUSCI_UART_ConfigV1 *uart_cfg, uint32_t clk_val, float baud)
{
    float baud_param; //波特率参数
    uint8_t index = 0;
    uint16_t index_table_cfg;

#ifdef ERR_MOD
    if ((!uart_cfg) || (baud == 0.0f))
    {
        USER_ERR("COL_UART_Calc_Baud Init Fail", );
    }
#endif

    baud_param = (float)clk_val / baud;
    if (baud_param > 16)
    {
        //Using oversampling
        uart_cfg->overSampling = EUSCI_A_UART_OVERSAMPLING_BAUDRATE_GENERATION;
        uart_cfg->clockPrescalar = (uint32_t)(baud_param / 16);
        uart_cfg->firstModReg = (uint32_t)(16 * (baud_param / 16 - uart_cfg->clockPrescalar));
        uart_cfg->secondModReg = 1;
    }
    else
    {
        //Low freq
        uart_cfg->overSampling = EUSCI_A_UART_LOW_FREQUENCY_BAUDRATE_GENERATION;
        uart_cfg->clockPrescalar = (uint32_t)(baud_param);
    }
    index_table_cfg = (uint16_t)((baud_param - (uint32_t)baud_param) * 10000);
    while (index_table_cfg > table_sp[index])
    {
        index++;
    }
    uart_cfg->secondModReg = table_cfg[index];
}

/*
* fun_name :SOL_UART_Transmit
* describe :串口发送函数
* input	   :(uint32_t moduleInstance, 串口接口)
            (const uint8_t* tx_dat, 发送数据)
            (uint16_t dat_num, 数据个数)
* platform :432sdk
* tested   :N
*/
void SOL_UART_Transmit(uint32_t moduleInstance, const uint8_t* tx_dat, uint16_t dat_num)
{
    uint16_t index = 0;
    for (index = 0; index < dat_num; index++)
    {
       MAP_UART_transmitData(moduleInstance,tx_dat[index]);
#ifdef DBG_MOD_OFF
    printf("[%d] ",index);
#endif
    }
}

/*
* fun_name :SOL_UART_Receive_IT
* describe :UART中断接收函数
* input	   :(uint32_t moduleInstance, 串口接口)
            (const uint8_t* rx_dat, 接收数据)
            (uint16_t dat_num, 数据个数,会在中断函数中进行限制(HMI),务必保证接收字符个数和这里相等)
* logic_dis:从缓冲区取数据对应缓冲区会清零
* platform :432sdk
* tested   :N
*/
void SOL_UART_Receive(uint32_t moduleInstance, uint8_t* rx_dat,uint16_t dat_num){
    uint16_t index = 0;
    uart_byte_limit = dat_num;      //规定了串口这一次接受的字节个数
  
    if(uart_rx_cmp_flag_0){
        for(index = 0; index < dat_num; index ++){
            rx_dat[index] = uart_buf_0[index];
        }
        uart_buf_0_p = uart_buf_0;
        memset(uart_buf_0, 0 ,sizeof(uart_buf_0));
        uart_rx_cmp_flag_0 = 0;
    }
    
    if (uart_rx_cmp_flag_1)
    {
        for(index = 0; index < dat_num; index ++){
            rx_dat[index] = uart_buf_1[index];
        }
        uart_buf_1_p = uart_buf_1;
        memset(uart_buf_1, 0 ,sizeof(uart_buf_1));
        uart_rx_cmp_flag_1 = 0;
    }

    if (uart_rx_cmp_flag_2)
    {
        for(index = 0; index < dat_num; index ++){
            rx_dat[index] = uart_buf_2[index];
        }
        uart_buf_2_p = uart_buf_2;
        memset(uart_buf_2, 0 ,sizeof(uart_buf_2));
        uart_rx_cmp_flag_2 = 0;        
    }

    if (uart_rx_cmp_flag_3)
    {
        for(index = 0; index < dat_num; index ++){
            rx_dat[index] = uart_buf_3[index];
        }
        uart_buf_3_p = uart_buf_3;
        memset(uart_buf_3, 0 ,sizeof(uart_buf_3));
        uart_rx_cmp_flag_3 = 0;
    }

    //清零标志位等待下一次接收完成
    MAP_UART_enableInterrupt(moduleInstance,EUSCI_A_UART_RECEIVE_INTERRUPT);     //重新使能串口中断以便下次接收
}
/*-------------------------------------------------------*\
					Printf Remap
\*-------------------------------------------------------*/
#ifdef STM32_HAL_PLATFORM
/****************************************************************
* 名    称:fputc
* 功    能:用于重定向printf
* 入口参数:(int ch, 发送的字符串)
* 出口参数:(int ch, 发送的字符串)
* 额外说明:使用F4规定调试串口USART1,注意要使用MicroLib生成代码
****************************************************************/
int fputc(int ch, FILE * stream){
	HAL_UART_Transmit(&huart1, (uint8_t *)&ch, 1, 200);
	return (ch);
}


/****************************************************************
* 名    称:fgetc
* 功    能:用于重定向getchar
* 出口参数:(int ch, 串口获取的字符串)
* 额外说明:使用F4规定调试串口USART1,注意要使用MicroLib生成代码
****************************************************************/
int fgetc(FILE *stream)
{	
	int ch;
	while (__HAL_UART_GET_FLAG(&huart1, UART_FLAG_RXNE) == RESET);
		HAL_UART_Receive(&huart1, (uint8_t *)&ch, 1, 1000);	
	return (ch);
}
#endif
#ifdef MSP432_SDK_PLATFORM
int fputc(int ch, FILE *stream)
{
	UART_transmitData(EUSCI_A0_BASE, ch & 0xFF);
	return ch;
}

int fgetc(FILE *f)
{
	while(EUSCI_A_UART_RECEIVE_INTERRUPT_FLAG != 
		      UART_getInterruptStatus (EUSCI_A0_BASE, 
									   EUSCI_A_UART_RECEIVE_INTERRUPT_FLAG) );
	return UART_receiveData(EUSCI_A0_BASE);
}
#endif

/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif





