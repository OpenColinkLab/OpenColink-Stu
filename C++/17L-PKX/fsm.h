//保护头文件

#ifndef _FSM_H_
#define _FSM_H_

#include <stdio.h>
#include <stddef.h>
#include <stdint.h>


//状态表结构体
typedef struct{
    uint8_t event;//触发
    uint8_t now_status;//当前状态
    void (*triggerFunc)(void *);//处理函数
    uint8_t nxt_status;//下一步
}fsm_state;

typedef enum STATUS{
    IDLE,//洗牌 1
    READ,//查看首尾 2
    SAME,//选取和首尾牌相同的两张牌并拿出来 3
    ROTATE,//翻转 4
    PICK,//选牌 5
    FINISH,//结束 6
    SEQU,//排序 7
    SELECT,//取三张 8
    TURN//翻旁边两张 9
};

typedef enum EVENT{
    EV_AUTO,//自动
    KEY_OK,//确认
    KEY_CLICK,//点击
    KEY_CANCLE,//取消
    KEY_NXT,//下一步
    KEY_TIMEOUT,//超时
    KEY_RST//重来
};

//全局变量
extern uint8_t card_buf[52];//存放牌
extern uint8_t head_card;//首牌
extern uint8_t tail_card;//尾牌
extern uint8_t fsm_status;//状态机当前状态
extern int pick_special_idx[2];//选取的特殊牌索引
extern uint8_t is_front[52];//牌的正反面状态，0为背面，1为正面
extern int click_idx;//用户点击的牌索引


//函数声明
void Card_Init(void);//初始化牌
void ShuffleCard(void);//洗牌

void fsm_run(uint8_t event, void *p);//状态机运行
void func_idle(void *p);//洗牌
void func_read(void *p);//查看首尾牌数
void func_same(void *p);//选取和首尾牌相同的两张牌并拿出来
void func_rotate(void *p);//翻转剩下所有牌
void func_pick(void *p);//鼠标点击
void func_turn_1(void *p);//翻转一张牌
void func_sequ(void *p);//黑箱操作
void func_select(void *p);//取三张状态处理函数
void func_turn_2(void *p);//翻旁边两张牌
void func_timeout(void *p);//超时状态处理函数
void func_rst(void *p);//重来状态处理函数

#endif