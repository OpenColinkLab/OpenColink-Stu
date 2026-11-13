#include "test.h"
#include "sol_fsm.h"

#include <stdlib.h>

#ifndef _TEST_C_
#define _TEST_C_

//static表示只在这个文件里用
//status_t见定义文件定义状态函数
//状态函数传入两个参数 一个FSM的状态指针 另一个触发事件的指针
static status_t func_idle(FSM_t *p, event_t const *evt);//初始函数 洗牌之后
static status_t func_remember(FSM_t *p, event_t const *evt);//记住开头三张牌
static status_t func_select(FSM_t *p, event_t const *evt);//选出和开头三张牌一样的牌 抽出来也要保证顺序
static status_t func_sequence_1(FSM_t *p, event_t const *evt);//按照某种顺序排序 针对第一堆牌
static status_t func_sequence_2(FSM_t *p, event_t const *evt);
static status_t func_sequence_3(FSM_t *p, event_t const *evt);
static status_t func_re_seq(FSM_t *p, event_t const *evt);//重新排序
static status_t func_turn(FSM_t *p, event_t const *evt);//翻转插入牌旁边的三张牌


// 初始化牌：1~13，每个数字4张，并将所有牌设置为正面
void Card_Init(MAGIC_t *magic)
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
    for(i = 0; i < 52; i++)
    {
        magic->card_is_front[i] = 1; // 初始化所有牌为正面
    }
}

//初始化牌堆

// Fisher-Yates洗牌
void ShuffleCard(MAGIC_t *magic)
{
    int i;
    uint8_t temp;
    for(i = 52 - 1; i > 0; i--)
    {
        // 随机取 0 ~ i 的下标
        int rand_idx = rand() % (i + 1);
        // 交换
        temp = magic->card_buf[i];
        magic->card_buf[i] = magic->card_buf[rand_idx];
        magic->card_buf[rand_idx] = temp;
    }
}

//状态机函数需要完成状态函数传递 返回执行情况
//初始函数
status_t func_idle(FSM_t *p, event_t const *evt){
    MAGIC_t *magic = (MAGIC_t *) p;//将传入FSM的指针转化成我的工程指针 由于FSM就在第一个 地址没变
    int i;

    switch ((evt->signal))
    {
    case ENTRY_SIG:
        for(i = 0;i < 52;i++){
            magic -> card_is_front[i] = 0;//牌必须全是背面
        }
        return HANDLED_STATUS;
    case KEY_AUTO_SIG:
        return SOL_FSM_Tran(p, func_remember);
    case EXIT_SIG:
        return HANDLED_STATUS;
    default:
        return IGNORED_STATUS;
    }
}

status_t func_remember(FSM_t *p, event_t const *evt){
    MAGIC_t *magic = (MAGIC_t *)p;

    switch (evt->signal)
    {
    case ENTRY_SIG:
        magic->card_start[0] = magic->card_buf[0];//把这三张牌都记下
        magic->card_start[1] = magic->card_buf[1];
        magic->card_start[2] = magic->card_buf[2];
        return HANDLED_STATUS;
    case KEY_AUTO_SIG:
        return SOL_FSM_Tran(p, func_select);
    case EXIT_SIG:
        return HANDLED_STATUS;
    default:
        return IGNORED_STATUS;
    }
}

status_t func_select(FSM_t *p, event_t const *evt){
    MAGIC_t *magic = (MAGIC_t *)p;
    int i;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        for(i=0;i<3;i++){
            magic->card_pick_start[i] = magic->card_start[i];//直接赋值更保险
        }
        for(i=0;i<52;i++){
            if(magic->card_buf[i] == magic->card_start[0] ){
                magic->card_buf[i] = 0;   //将一样的牌全部抽出来  
                break; 
            }
                 
        }
        for(i=0;i<52;i++){
            if(magic->card_buf[i] == magic->card_start[1] ){
                magic->card_buf[i] = 0;   //将一样的牌全部抽出来  
                break;
            }
                  
        }
        for(i=0;i<52;i++){
            if(magic->card_buf[i] == magic->card_start[2] ){
                magic->card_buf[i] = 0;   //将一样的牌全部抽出来  
                break;
            }
                  
        }
        return HANDLED_STATUS;
    case EXIT_SIG:
        return HANDLED_STATUS;
    case KEY_NXT_SIG:
        return SOL_FSM_Tran(p, func_sequence_1);
    default:
        return IGNORED_STATUS;
    }
}

status_t func_sequence_1(FSM_t *p, event_t const *evt){
    MAGIC_t *magic = (MAGIC_t *)p;
    int i,j = 1;
    int insert_idx;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        magic->card_resequ_1[0] = magic->card_start[0];//让第一堆的第一张牌为开头第一张牌
        //magic->card_buf[0] = 0;//第一张牌我取走了
        printf("请从1-15中选一个数字\n");
        scanf("%d",&insert_idx);//用户自己输入插入的数目
       
        if(insert_idx < 16 && insert_idx >0){
            magic->idx_1 = insert_idx;
            magic->card_resequ_1[insert_idx] = magic->card_pick_start[0];//第一张牌直接放入对应的序号里
            magic->card_resequ_1_is_front[insert_idx] = 1;//用户的牌正面朝上
            //剩下的从牌堆里取前15张牌（我偷个懒）
            for(i=3;i<52;i++){
                if(j != insert_idx && magic->card_buf[i] != 0){//没有被拿出来
                    if(j == 16)//先看有没有溢出
                    break;
                    magic->card_resequ_1[j] = magic->card_buf[i];//把牌堆里的迁移过来
                    magic->card_resequ_1_is_front[j] = 0;//保证其余的牌都是背面
                    magic->card_buf[i] = 0;//被拿走了
                    j++;
                    
                }
                if(j == insert_idx)
                    j++;
                else
                    continue;
            }
            return HANDLED_STATUS;
        }
        else{
            printf("不在考虑区间喔\n");
            return SOL_FSM_Tran(p, func_sequence_1);
        }
        
    case EXIT_SIG:
        return HANDLED_STATUS;
    case KEY_NXT_SIG:
        return SOL_FSM_Tran(p, func_sequence_2);
    default:
        return IGNORED_STATUS;
    }
}

status_t func_sequence_2(FSM_t *p, event_t const *evt){
    MAGIC_t *magic = (MAGIC_t *)p;
    int i,j = 1;
    int insert_idx;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        magic->card_resequ_2[0] = magic->card_start[1];//让第二堆的第一张牌为开头第二张牌
        //magic->card_buf[1] = 0;//第二张牌我取走了
        printf("请从1-15中选一个数字\n");
        scanf("%d",&insert_idx);//用户自己输入插入的数目
        
        if(insert_idx < 16 && insert_idx >0){
            magic->idx_2 = insert_idx;
            magic->card_resequ_2[insert_idx] = magic->card_pick_start[1];//第一张牌直接放入对应的序号里
            magic->card_resequ_2_is_front[insert_idx] = 1;//用户的牌正面朝上
            //剩下的从牌堆里取中15张牌（我偷个懒）
            for(i=3;i<52;i++){
                if(j != insert_idx && magic->card_buf[i] != 0){
                    if(j == 16)
                    break;
                    magic->card_resequ_2[j] = magic->card_buf[i];//把牌堆里的迁移过来
                    magic->card_resequ_2_is_front[j] = 0;//保证其余的牌都是背面
                    magic->card_buf[i] = 0;
                    j++;
                    
                }
                 if(j == insert_idx)
                    j++;
                else
                    continue;
            }
            return HANDLED_STATUS;
        }
        else{
            printf("不在考虑区间喔\n");
            return SOL_FSM_Tran(p, func_sequence_2);
        }
        
    case EXIT_SIG:
        return HANDLED_STATUS;
    case KEY_NXT_SIG:
        return SOL_FSM_Tran(p, func_sequence_3);
    default:
        return IGNORED_STATUS;
    }
}

status_t func_sequence_3(FSM_t *p, event_t const *evt){
    MAGIC_t *magic = (MAGIC_t *)p;
    int i,j = 1;
    int insert_idx;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        magic->card_resequ_3[0] = magic->card_start[2];//让第三堆的第一张牌为开头第三张牌
        printf("请从1-16中选一个数字\n");
        scanf("%d",&insert_idx);//用户自己输入插入的数目
        if(insert_idx < 17 && insert_idx >0){
            magic->idx_3 = insert_idx;
            magic->card_resequ_3[insert_idx] = magic->card_pick_start[2];//第一张牌直接放入对应的序号里
            magic->card_resequ_3_is_front[insert_idx] = 1;//用户的牌正面朝上
            //剩下的从牌堆里取中15张牌（我偷个懒）
            for(i=3;i<52;i++){
                if(j != insert_idx && magic->card_buf[i] != 0){
                    if(j == 17)
                    break;
                    magic->card_resequ_3[j] = magic->card_buf[i];//把牌堆里的迁移过来
                    magic->card_resequ_3_is_front[j] = 0;//保证其余的牌都是背面
                    magic->card_buf[i] = 0;
                    j++;
                    
                }
                 if(j == insert_idx)
                    j++;
                else
                    continue;
            }
            return HANDLED_STATUS;
        }
        else{
            printf("不在考虑区间喔\n");
            return SOL_FSM_Tran(p, func_sequence_3);
        }
        
    case EXIT_SIG:
        return HANDLED_STATUS;
    case KEY_NXT_SIG:
        return SOL_FSM_Tran(p, func_re_seq);
    default:
        return IGNORED_STATUS;
    }
}

status_t func_re_seq(FSM_t *p, event_t const *evt){
    MAGIC_t *magic = (MAGIC_t *)p;
    int i,j = 0;
    switch (evt->signal)
    {
    case ENTRY_SIG:
            //第一堆IDX后的牌放前面
            for(i=magic->idx_1 + 1;i<16;i++){
                magic->card_final[j] = magic->card_resequ_1[i];
                magic->card_final_front[j] = 0;//依旧背着
                j++;
            }
            //IDX放这里
            magic->card_final[j] = magic->card_resequ_1[magic->idx_1];
            magic->card_final_front[j] = 1;
            j++;
            //第一堆IDX前的牌放后面 尤其是第一张牌
            for(i=0;i<magic->idx_1;i++){
                magic->card_final[j] = magic->card_resequ_1[i];
                magic->card_final_front[j] = 0;
                j++;
            }

            //其余同理
            //第er堆IDX后的牌放前面
            for(i=magic->idx_2 + 1;i<16;i++){
                magic->card_final[j] = magic->card_resequ_2[i];
                magic->card_final_front[j] = 0;
                j++;
            }
            //IDX放这里
            magic->card_final[j] = magic->card_resequ_2[magic->idx_2];
            magic->card_final_front[j] = 1;
            j++;
            //第er堆IDX前的牌放后面 尤其是第一张牌
            for(i=0;i<magic->idx_2;i++){
                magic->card_final[j] = magic->card_resequ_2[i];
                magic->card_final_front[j] = 0;
                j++;
            }

            //第san堆IDX后的牌放前面
            for(i=magic->idx_3 + 1;i<17;i++){
                magic->card_final[j] = magic->card_resequ_3[i];
                magic->card_final_front[j] = 0;
                j++;
            }
            //IDX放这里
            magic->card_final[j] = magic->card_resequ_3[magic->idx_3];
            magic->card_final_front[j] = 1;
            j++;
            //第一堆IDX前的牌放后面 尤其是第一张牌
            for(i=0;i<magic->idx_3;i++){
                magic->card_final[j] = magic->card_resequ_3[i];
                magic->card_final_front[j] = 0;
                j++;
            }
        return HANDLED_STATUS;
    case EXIT_SIG:
        return HANDLED_STATUS;
    case KEY_NXT_SIG:
        return SOL_FSM_Tran(p, func_turn);
    default:
        return IGNORED_STATUS;
    }
}

status_t func_turn(FSM_t *p, event_t const *evt){
    MAGIC_t *magic = (MAGIC_t *)p;
    switch (evt->signal)
    {
    case ENTRY_SIG:
        magic->card_final_front[15 - magic->idx_1] = 1;
        magic->ex_final[0] =magic->card_final[15 - magic->idx_1];
        magic->card_final_front[16 + 15 - magic->idx_2] = 1;
        magic->ex_final[1] =magic->card_final[16 + 15 - magic->idx_2];
        magic->card_final_front[32 + 15 - magic->idx_3] = 1;
        magic->ex_final[2] =magic->card_final[32 + 15 - magic->idx_3];
        for(int i=0;i<3;i++){
            printf("%d\n",magic->ex_final[i]);
        }
        return HANDLED_STATUS;
    case EXIT_SIG:
        return HANDLED_STATUS;
    case KEY_RST_SIG:
        return SOL_FSM_Tran(p, func_idle);
    default:
        return IGNORED_STATUS;
    }
}

#endif