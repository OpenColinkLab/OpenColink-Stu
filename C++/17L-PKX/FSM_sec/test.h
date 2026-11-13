#include <stdio.h>
#ifndef _TEST_H_
#define _TEST_H_

#include "sol_fsm.h"
typedef struct{
    FSM_t fsm;
    int card_buf[52];//我的牌
    int card_start[3];//开始三张牌记住
    int card_is_front[52];//牌的正面和正面 0-背面 1-数字正面
    int card_pick_start[3];//在剩下牌里抽出三张
    //抽出来的牌的正背面直接修改52张的情况
    int card_resequ_1[16];//重新排布剩下49张牌
    int card_resequ_1_is_front[16];//第一堆牌的正面情况
    int card_resequ_2[16];
    int card_resequ_2_is_front[16];
    int card_resequ_3[17];
    int card_resequ_3_is_front[17];
    int card_final[52];
    int card_final_front[52];//最终时的正反面
    int idx_1;//三个位置
    int idx_2;
    int idx_3;
    int ex_final[3];//最终终端输出展示牌堆
} MAGIC_t;

enum{
    KEY_NXT_SIG = IS_GAME_SIG + 1,
    KEY_AUTO_SIG,
    KEY_CLICK_SIG,
    //KEY_STOP_SIG
    KEY_RST_SIG
};


#endif