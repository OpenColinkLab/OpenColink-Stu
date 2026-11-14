#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <windows.h>
#define t 500
typedef enum
{
    IDLE,
    START,
    CHECK
}mode;
int main()
{
    mode mode0=IDLE;
    int key;
    int round=1;
    srand((unsigned int)time(NULL));
    int num;
    int score=0;
    ULONGLONG t0,t1;
    while(1)
    {
        switch(mode0)
        {
            case IDLE:
            {
                scanf("%d",&key);
                if(key==16)
                {
                    mode0=START;
                    printf("开始\n");
                }
                else
                {
                    mode0=IDLE;
                }
                break;
            }
            case START:
            {
                num=rand()%9+1;
                printf("洞号为%d\n",num);               
                mode0=CHECK;
                t0=GetTickCount64();
                break;
            }
            case CHECK:
            {                  
                scanf("%d",&key);
                if(key==16)
                {
                    mode0=IDLE;
                    printf("退出%d %d\n",round,score);
                    round=1;
                    score=0;
                    break;
                }
                t1=GetTickCount64();
                if(t1-t0<t)
                {
                    if(key==num)
                    {
                        score++;
                        round++;
                        printf("加分%d %d\n",round,score);
                        mode0=START;
                        break;
                    }
                    else
                    {                    
                        score--;
                        round++;
                        printf("减分%d %d\n",round,score);
                        mode0=START;
                        break;
                    }
                }
                else
                {
                    round++;
                    score--;
                    printf("超时%d %d",round,score);
                    mode0=START;
                    break;
                }             
                break;
            }
        }
    }
    return 0;
}