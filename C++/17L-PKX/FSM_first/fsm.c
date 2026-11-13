#ifndef FSM_C
#define FSM_C

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include "fsm.h"

#define CARD_NUM 52   // 一共52张牌
uint8_t card_buf[CARD_NUM];  // 存放牌
uint8_t head_card;  // 首牌
uint8_t tail_card;  // 尾牌
uint8_t fsm_status = IDLE;  // 状态机当前状态
int pick_special_idx[2];//特殊牌序号
uint8_t is_front[52] = {0};//牌的正反面状态，0为背面，1为正面
int click_idx = -1;//用户点击的牌索引


//状态转移表
fsm_state fsm_table[] = {
    {EV_AUTO, IDLE, func_idle, READ},//初始化序列
    {EV_AUTO, READ, func_read, SAME},//查看首尾牌
    {KEY_NXT, SAME, func_same, ROTATE},//选取和首尾牌相同的两张牌并拿出来
    {KEY_NXT, ROTATE, func_rotate, PICK},//返回剩下牌的反面
    {KEY_CLICK, PICK, func_pick, FINISH},//用户点击选牌
    {KEY_CANCLE, PICK, NULL, ROTATE},//用户取消选牌，返回翻转状态
    {KEY_OK, FINISH, func_turn_1, SEQU},//用户确认选牌并翻转该张牌
    {KEY_NXT, SEQU, func_sequ, SELECT},//进行黑箱操作
    {KEY_NXT, SELECT, func_select, TURN},//选刚刚以PICK为中心的三张牌
    {KEY_RST, TURN, func_turn_2, IDLE},//展示这两张牌正面
    {KEY_TIMEOUT, TURN, func_timeout, IDLE},//展示完回初始状态
    {KEY_RST, READ, func_rst, IDLE},//我不玩了
    {KEY_RST, SAME, func_rst, IDLE},
    {KEY_RST, FINISH, func_rst, IDLE},
    {KEY_RST, ROTATE, func_rst, IDLE},
    {KEY_RST, PICK, func_rst, IDLE},
    {KEY_RST, SEQU, func_rst, IDLE},
    {KEY_RST, SELECT, func_rst, IDLE}
};


// 初始化牌：1~13，每个数字4张，并将所有牌设置为正面
void Card_Init(void)
{
    uint8_t i,j;
    uint8_t idx = 0;
    for(i = 1; i <= 13; i++)    // 数字1~13
    {
        for(j = 0; j < 4; j++)  // 每个数字4张
        {
            card_buf[idx++] = i;
        }
    }
    for(i = 0; i < CARD_NUM; i++)
    {
        is_front[i] = 1; // 初始化所有牌为正面
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
        temp = card_buf[i];
        card_buf[i] = card_buf[rand_idx];
        card_buf[rand_idx] = temp;
    }
}

//网页前端接收点击
void receive_click(int idx)
{
    click_idx = idx;
    fsm_run(KEY_CLICK, NULL);
}

//展示函数

//最初状态函数
void func_idle(void *p)
{
    printf("洗牌中...\n");
    ShuffleCard();
    fsm_status = READ;
    printf("洗牌完成\n");
}

//我要看一下首尾牌
void func_read(void *p){
    head_card = card_buf[0];
    tail_card = card_buf[CARD_NUM - 1];
    fsm_status = SAME;
}

//我选特殊的牌
void func_same(void *p){
    pick_special_idx[0] = -1;
    pick_special_idx[1] = -1;
    int get_head = 0;
    int get_tail = 0;
    for(int i = 1; i < CARD_NUM - 1; i++){
        if(card_buf[i] == head_card && get_head == 0){
            pick_special_idx[0] = i;
            card_buf[i] = 0;//把这张牌拿出来
            get_head = 1;
        }
        if(card_buf[i] == tail_card && get_tail == 0){
            pick_special_idx[1] = i;
            card_buf[i] = 0;//把这张牌拿出来
            get_tail = 1;
        }
        if(get_head ==1 && get_tail == 1){
        printf("这里选了两张索引牌\n");
        break;
        }
    }
    
    fsm_status = ROTATE;
}

//剩下的牌继续背面
void func_rotate(void *p){
    printf("翻转剩下的牌\n");
    for(int i = 0; i < CARD_NUM; i++){
        if(i != pick_special_idx[0] && i != pick_special_idx[1]){
            is_front[i] = 0;
        }
        else{
            is_front[i] = 1;
        }
    }
    fsm_status = PICK;
}

//用户点击选牌
void func_pick(void *p){
    printf("你可以在剩下的牌中选择一张,请点击选择\n");
    fsm_status = FINISH;
} 

//用户确认选牌并翻转该张牌
void func_turn_1(void *p){ 
    is_front[click_idx] = 1;//翻转用户的牌
    fsm_status = SEQU;
}

//排序黑箱操作
void func_sequ(void *p){
    printf("现在我把这些牌再放成一堆\n");
    int temp_buf[50];
    int i,j;
    int spe_idx;
    //click_idx后的牌放temp_buf前面
    for(i = click_idx + 1, j = 0; i < CARD_NUM; i++, j++){
        if(card_buf[i] != 0)
            temp_buf[j] = card_buf[i];
        spe_idx = j;
    }
    //click_idx前的牌放temp_buf后面
    for(i = 0, j = spe_idx + 1; i < click_idx; i++, j++){
        if(card_buf[i] != 0)
            temp_buf[j] = card_buf[i];
    }
    //click_idx放在两落中间
    //保证用户牌前面和后面分别是首尾牌
    temp_buf[spe_idx] = card_buf[click_idx];
    
    fsm_status = SELECT;
}

//选刚刚以PICK为中心的三张牌
void func_select(void *p){
    printf("现在你选择的牌周围是我选择的牌\n");
    fsm_status = TURN;
}

//翻转旁边两张牌
void func_turn_2(void *p){
    printf("我们翻开看看\n");
    is_front[click_idx - 1] = 1;
    is_front[click_idx + 1] = 1;
    fsm_status = IDLE;
}

//超时状态处理函数
void func_timeout(void *p){
    fsm_status = IDLE;
}

//重来状态处理函数
void func_rst(void *p){
    fsm_status = IDLE;
}

//状态机运行函数
void fsm_run(uint8_t event, void *p)
{
    for(int i = 0; i < sizeof(fsm_table)/sizeof(fsm_state); i++)
    {
        if(fsm_table[i].event == event && fsm_table[i].now_status == fsm_status)
        {
            if(fsm_table[i].triggerFunc != NULL)
            {
                fsm_table[i].triggerFunc(p);
            }
            fsm_status = fsm_table[i].nxt_status;
            break;
        }
    }
}



#endif