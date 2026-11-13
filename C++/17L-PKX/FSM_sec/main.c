#include <stdio.h>
#include <stdint.h>

#include "sol_fsm.h"
#include "test.h"

#include "test.c"
#include "sol_fsm.c"

static MAGIC_t game;//定义完整内存
static MAGIC_t *magic = &game;//内存指针

//修改状态 -> 传递函数 拼接成一个完整的dispatch函数
void magic_dispatch(sig_t signal){
    event_t evt;
    if (magic == NULL)
    return;

    else
    SOL_FSM_Sig_Ctor(&evt, signal);//&evt的类型是event_t*
    SOL_FSM_Dispatch(&magic->fsm, &evt);
    
}


int main(void){
    Card_Init(magic);
    ShuffleCard(magic);

    //初始化状态
    SOL_FSM_Handler_Ctor((FSM_t *)magic, func_idle);
    //初始化状态机
    SOL_FSM_Init((FSM_t *)magic);

    //走流程
    magic_dispatch(KEY_AUTO_SIG);//IDLE->REM
    magic_dispatch(KEY_AUTO_SIG);//REM->SEL
    magic_dispatch(KEY_NXT_SIG);//SEL->SEQ
    magic_dispatch(KEY_NXT_SIG);//SEQ内部
    magic_dispatch(KEY_NXT_SIG);
    magic_dispatch(KEY_NXT_SIG);//SEQ->RES
    magic_dispatch(KEY_NXT_SIG);//RES->TURN
    magic_dispatch(KEY_RST_SIG);//TURN->IDEL

    return 0;

}