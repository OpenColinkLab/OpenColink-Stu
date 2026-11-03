#ifndef MAGIC_CORR_H
#define MAGIC_CORR_H

#include "sol_fsm.h"

int receive_click(int idx);
void MAGIC_Dispatch(sig_t signal);
void AUTO_dispatch(sig_t signal);

//业务结构体 放我要用的数据

typedef struct {
    FSM_t fsm; //状态机结构
    uint8_t card_buf[52];
    int temp_buf[50];
    int spe_idx;
    int is_front[52];
    uint8_t head_card;
    uint8_t tail_card;
    int pick_special_idx[2];
    int click_idx;
} Magic_t;

enum {
    KEY_AUTO_SIG = IS_GAME_SIG + 1,  /* 从通用信号后面开始编号 */
    KEY_OK_SIG,
    KEY_CLICK_SIG,
    KEY_CANCLE_SIG,
    KEY_NXT_SIG,
    KEY_TIMEOUT_SIG,
    KEY_RST_SIG,
};

#endif