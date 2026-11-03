#ifndef FSM_C
#define FSM_C

#include <stdio.h>
#include <stdlib.h>

#include "magic_corr.h"
#include "sol_fsm.h"

#define CARD_NUM 52   // 一共52张牌
//uint8_t card_buf[CARD_NUM];  // 存放牌
//uint8_t head_card;  // 首牌
//uint8_t tail_card;  // 尾牌
//uint8_t fsm_status = IDLE;  // 状态机当前状态
//int pick_special_idx[2];//特殊牌序号
//uint8_t is_front[52] = {0};//牌的正反面状态，0为背面，1为正面
//int click_idx = -1;//用户点击的牌索引


static Magic_t *magic;

//函数第一次使用前加声明
static status_t func_idle(FSM_t *this_p, event_t const *evt);
static status_t func_read(FSM_t *this_p, event_t const *evt);
static status_t func_same(FSM_t *this_p, event_t const *evt);
static status_t func_rotate(FSM_t *this_p, event_t const *evt);
static status_t func_pick(FSM_t *this_p, event_t const *evt);
static status_t func_turn_1(FSM_t *this_p, event_t const *evt);
static status_t func_sequ(FSM_t *this_p, event_t const *evt);
static status_t func_select(FSM_t *this_p, event_t const *evt);
static status_t func_turn_2(FSM_t *this_p, event_t const *evt);
static status_t func_timeout(FSM_t *this_p, event_t const *evt);
static status_t func_rst(FSM_t *this_p, event_t const *evt);
void AUTO_dispatch(sig_t signal);
void MAGIC_Dispatch(sig_t signal);
int receive_click(int idx);

// 初始化牌：1~13，每个数字4张，并将所有牌设置为正面
void Card_Init(void)
{
    uint8_t i,j;
    uint8_t idx = 0;
    for(i = 1; i <= 13; i++)    // 数字1~13
    {
        for(j = 0; j < 4; j++)  // 每个数字4张
        {
            magic->card_buf[idx++] = i;
        }
    }
    for(i = 0; i < CARD_NUM; i++)
    {
        magic->is_front[i] = 1; // 初始化所有牌为正面
    }
}

// Fisher-Yates洗牌
void ShuffleCard(void)
{
    int i;
    uint8_t temp;
    for(i = CARD_NUM - 1; i > 0; i--)
    {
        // 随机取 0 ~ i 的下标
        int rand_idx = rand() % (i + 1);
        // 交换
        temp = magic->card_buf[i];
        magic->card_buf[i] = magic->card_buf[rand_idx];
        magic->card_buf[rand_idx] = temp;
    }
}

//网页前端接收点击
int receive_click(int idx)
{
    event_t evt;

    if (magic == NULL) {
        return 0;
    }

    if (magic->fsm.state_handler != func_pick) {
        return 0;
    }

    if (idx < 0 || idx >= CARD_NUM) {
        return 0;
    }

    if (magic->card_buf[idx] == 0 ||
        magic->is_front[idx] != 0) {
        return 0;
    }

    magic->click_idx = idx;
    //派发
    SOL_FSM_Sig_Ctor(&evt, KEY_CLICK_SIG);
    SOL_FSM_Dispatch(&magic->fsm, &evt);

    return 1;
}

//AUTO没DISPATCH 这里添加
void AUTO_dispatch(sig_t signal)
{
    event_t evt;

    if (magic == NULL) {
        return;
    }

    SOL_FSM_Sig_Ctor(&evt, signal);
    SOL_FSM_Dispatch(&magic->fsm, &evt);
}

//他吗咋连一个NXT也没有 这也要我写？？？
//发除AUTO外所有
void MAGIC_Dispatch(sig_t signal)
{
    event_t evt;

    if (magic == NULL) {
        return;
    }

    SOL_FSM_Sig_Ctor(&evt, signal);
    SOL_FSM_Dispatch(&magic->fsm, &evt);
}

//展示函数

//最初状态函数
static status_t func_idle(FSM_t *this_p, event_t const *evt)
{
    magic = (Magic_t *)this_p;
    switch(evt->signal)
    {
        case ENTRY_SIG:
            printf("洗牌中...\n");
            ShuffleCard();
            printf("洗牌完成\n");
            return HANDLED_STATUS;
        case KEY_AUTO_SIG:
            return SOL_FSM_Tran(this_p, func_read);
        default:
            return IGNORED_STATUS;
    }
    
}

//我要看一下首尾牌
static status_t func_read(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
         magic->head_card = magic->card_buf[0];
         magic->tail_card = magic->card_buf[CARD_NUM - 1];
        return HANDLED_STATUS;
    case KEY_AUTO_SIG:
        return SOL_FSM_Tran(this_p, func_same);
    default:
        return IGNORED_STATUS;
    }
}

//我选特殊的牌
static status_t func_same(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        magic->pick_special_idx[0] = -1;
        magic->pick_special_idx[1] = -1;
        int get_head = 0;
        int get_tail = 0;
        for(int i = 1; i < CARD_NUM - 1; i++){
            if(magic->card_buf[i] == magic->head_card && get_head == 0){
                magic->pick_special_idx[0] = i;
                magic->is_front[i] = 0;//把这张牌拿出来
                magic->card_buf[i] = 0;//把这张牌清空
                get_head = 1;
        }
        if(magic->card_buf[i] == magic->tail_card && get_tail == 0){
            magic->pick_special_idx[1] = i;
            magic->is_front[i] = 0;//把这张牌拿出来
            magic->card_buf[i] = 0;//把这张牌清空
            get_tail = 1;
        }
        if(get_head ==1 && get_tail == 1){
        printf("这里选了两张索引牌\n");
        break;
        }
    }
    return HANDLED_STATUS;
    case KEY_AUTO_SIG:
        return SOL_FSM_Tran(this_p, func_rotate);
    default:
        return IGNORED_STATUS;
    }
}

//剩下的牌继续背面
static status_t func_rotate(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        printf("翻转剩下的牌\n");
        for(int i = 0; i < CARD_NUM; i++){
            if(i != magic->pick_special_idx[0] && i != magic->pick_special_idx[1]){
                magic->is_front[i] = 0;
            }
        else{
            magic->is_front[i] = 1;
            }
        }
        return HANDLED_STATUS;
    case KEY_NXT_SIG:
        return SOL_FSM_Tran(this_p, func_pick);
    default:
        return IGNORED_STATUS;
    }
}

//用户点击选牌
static status_t func_pick(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        printf("你可以在剩下的牌中选择一张,请点击选择\n");
        return HANDLED_STATUS;
    case KEY_CLICK_SIG:
        return SOL_FSM_Tran(this_p, func_turn_1);
    default:
        return IGNORED_STATUS;
    }
}

//用户确认选牌并翻转该张牌
static status_t func_turn_1(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        magic->is_front[magic->click_idx] = 1;//翻转用户的牌
        return HANDLED_STATUS;
    case KEY_OK_SIG:
        return SOL_FSM_Tran(this_p, func_sequ);
    default:
        return IGNORED_STATUS;
    }
}

//排序黑箱操作
static status_t func_sequ(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        printf("现在我把这些牌再放成一堆\n");
    int i,j;
    //click_idx后的牌放temp_buf前面
    for(i = magic->click_idx + 1, j = 0; i < CARD_NUM; i++){
        if(magic->card_buf[i] != 0){
            magic->temp_buf[j] = magic->card_buf[i];
            j++;
        }    
    }
    magic->spe_idx = j;//避免j反复覆盖
    //click_idx前的牌放temp_buf后面
    for(i = 0, j = magic->spe_idx + 1; i < magic->click_idx; i++){
        if(magic->card_buf[i] != 0){
            magic->temp_buf[j] = magic->card_buf[i];
            j++;
        } 
    }
    //click_idx放在两落中间
    //保证用户牌前面和后面分别是首尾牌
    magic->temp_buf[magic->spe_idx] = magic->card_buf[magic->click_idx];
    
    return HANDLED_STATUS;
    case KEY_NXT_SIG:
        return SOL_FSM_Tran(this_p, func_select);
    default:
        return IGNORED_STATUS;
    }
}

//选刚刚以PICK为中心的三张牌
static status_t func_select(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        printf("现在你选择的牌周围是我选择的牌\n");
        return HANDLED_STATUS;
    case KEY_NXT_SIG:
        return SOL_FSM_Tran(this_p, func_turn_2);
    default:
        return IGNORED_STATUS;
    }
}

//翻转旁边两张牌
static status_t func_turn_2(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        printf("我们翻开看看\n");
        if(magic->click_idx > 0 && magic->click_idx < CARD_NUM - 1){
            magic->is_front[magic->click_idx - 1] = 1;
            magic->is_front[magic->click_idx + 1] = 1;
        }
    return HANDLED_STATUS;
    case KEY_TIMEOUT_SIG:
        return SOL_FSM_Tran(this_p, func_timeout);
    case KEY_RST_SIG:
        return SOL_FSM_Tran(this_p, func_rst);
    default:
        return IGNORED_STATUS;
    }
}

//超时状态处理函数
static status_t func_timeout(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    return HANDLED_STATUS;
}

//重来状态处理函数
static status_t func_rst(FSM_t *this_p, event_t const *evt){
    magic = (Magic_t *)this_p;
    return HANDLED_STATUS;
}


int main(void){
    Magic_t game = {0};
    int idx;
    magic = &game;
    Card_Init();
    SOL_FSM_Handler_Ctor(&game.fsm, (State_Handler)func_idle);//定义初始状态在IDLE
    SOL_FSM_Init(&game.fsm);//状态机初始化

    AUTO_dispatch(KEY_AUTO_SIG);  // IDLE -> READ
    AUTO_dispatch(KEY_AUTO_SIG);  // READ -> SAME
    AUTO_dispatch(KEY_AUTO_SIG);  // SAME -> ROTATE
    MAGIC_Dispatch(KEY_NXT_SIG);     // ROTATE -> PICK

    while (scanf("%d", &idx) == 1) {
    if (receive_click(idx)) {
        break;
    }
}

    MAGIC_Dispatch(KEY_OK_SIG);    // TURN_1 -> SEQU
    MAGIC_Dispatch(KEY_NXT_SIG);   // SEQU -> SELECT
    MAGIC_Dispatch(KEY_NXT_SIG);   // SELECT -> TURN_2
}

#endif