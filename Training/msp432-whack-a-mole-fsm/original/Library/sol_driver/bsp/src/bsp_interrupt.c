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
 * @LastEditTime: 2022-04-24 21:09:21
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\bsp\src\bsp_interrupt.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "stdint.h"
#include "driverlib.h"

#include "ast_debug.h"
#include "bsp_interrupt.h"
#include "bsp_buffer.h"
#include "bsp_delay.h"
#include "dev_mkey_74hc165.h"
#include "hamster_plate.h"

#include "main_432.h"

/*-------------------------------------------------------*\
						 Extern
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
			      Interrupt function body
\*-------------------------------------------------------*/
/*-------------------------*\
TA1_0_IRQHandler(Token_Timer)
\*-------------------------*/


void TA1_0_IRQHandler (void){
/*---flag clear---*/
    //清除捕获比较中断标志位
    MAP_Timer_A_clearCaptureCompareInterrupt(TIMER_A1_BASE,
                                             TIMER_A_CAPTURECOMPARE_REGISTER_0);
//-------------------------------------------------------//
/* SOL库计时器 */
    solDelaymsCnt ++;
/* end */
    g_hamsterWaitToken ++;
/* 按键扫描APP */
    mkey_fresh_token ++;
    //标志位置位
    if(mkey_fresh_token == MKEY_FRESH_TIME){
        switch (mkey_state)
        {
        case MKEY_IDLE:
            mkey_val_last = SOL_MKey_Scan(&mkey_used);
            if(mkey_val_last){
                mkey_state = MKEY_IS_PRESSED_WAIT;
            }
            break;
        case MKEY_IS_PRESSED_WAIT:
            mkey_val_now = SOL_MKey_Scan(&mkey_used);
            if(mkey_val_now == mkey_val_last){
                mkey_state = MKEY_IS_PRESSED;
            }else{
                mkey_val_last = 0;
                mkey_val_now = 0;
                mkey_state = MKEY_IDLE;
            }
            break;   
        case MKEY_IS_PRESSED:
            mkey_val_now = SOL_MKey_Scan(&mkey_used);
            if(mkey_val_now == 0){
                mkey_state = MKEY_IS_RELEASED_WAIT;
            }
            break;   
        case MKEY_IS_RELEASED_WAIT:
            mkey_val_now = SOL_MKey_Scan(&mkey_used);
            if(mkey_val_now == 0){
                mkey_state = MKEY_IS_RELEASED;
            }
            break;   
        case MKEY_IS_RELEASED:
            mkey_val = mkey_val_last;
            mkey_val_last = 0;
            mkey_state = MKEY_IDLE;
            break; 
        default:
                mkey_val_last = 0;
                mkey_val_now = 0;
                mkey_state = MKEY_IDLE;
            break;
        }
    }
    //令牌清零
    if(mkey_fresh_token >= MKEY_FRESH_TIME){
         mkey_fresh_token = 0;
    }
/* 按键扫描APP结束 */
    if(g_hamsterWaitToken >= gS_hamsterPlate.m_gameInfo.m_delayTime){
        gS_hamsterPlate.m_gameInfo.m_isTimeOut = 1;
        g_hamsterWaitToken = 0;
    }

#ifdef DBG_MOD_OFF
    //USER_DBG("In TA1_0_IRQHandler");//在这里串口打印非常影响延时特别是放在刚进中断的时候
#endif
}

/*-------------------------*\
	  EUSCIA2_IRQHandler
\*-------------------------*/
void EUSCIA2_IRQHandler (void){
//主要用于接受蓝牙命令
/*---flag clean---*/
    //标志位清除
    uint16_t int_status = MAP_UART_getEnabledInterruptStatus(EUSCI_A2_BASE);
    MAP_UART_clearInterruptFlag(EUSCI_A2_BASE,/* EUSCI_A_UART_RECEIVE_INTERRUPT_FLAG */int_status);
//-------------------------------------------------------//
    if(int_status & EUSCI_A_UART_RECEIVE_INTERRUPT_FLAG)
    {   
        //相关变量在buf_sup.h中定义
        *uart_buf_2_p = MAP_UART_receiveData(EUSCI_A2_BASE);
        uart_buf_2_p ++;
        uart_buf_2_cnt ++;

        if(uart_buf_2_cnt == UART_BUF_SIZE){
            uart_buf_2_p -= UART_BUF_SIZE;
            uart_buf_2_cnt = 0;
        }

        if(uart_buf_2_cnt == uart_byte_limit){
            uart_buf_2_cnt = 0;
            uart_rx_cmp_flag_2 = 1;   //接收已经完成
            MAP_UART_disableInterrupt(EUSCI_A2_BASE,EUSCI_A_UART_RECEIVE_INTERRUPT);//关闭此次接收
        }
    }

}

/*-------------------------------------------------------*\
				    HardFault_Handler
\*-------------------------------------------------------*/
void HardFault_Handler (void){
#ifdef DBG_MOD
    USER_DBG("FAULT:HardFault");
#endif
	FOREVER();
}
/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif


