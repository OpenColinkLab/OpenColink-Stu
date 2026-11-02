#include "fsm.h"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void)
{
    system("chcp 65001 > nul");  /* 设置控制台编码为 UTF-8，解决中文乱码 */

    // 初始化随机数种子（给洗牌rand用，只写一次！）
    srand((unsigned)time(NULL));

    // 初始状态设置为IDLE，启动状态机
    fsm_status = IDLE;
    fsm_run(EV_AUTO, NULL);

    // 模拟：手动输入下标，模拟网页点击（本地调试用）
    int input_idx;
    while (1)
    {
        // 只有停在PICK状态，才等待点击
        if (fsm_status == PICK)
        {
            printf("\n===== 现在等待选牌，请输入点击下标：");
            scanf("%d", &input_idx);
            click_idx = input_idx;
            // 发送点击事件，触发func_pick
            fsm_run(KEY_CLICK, NULL);
        }
        else if(fsm_status == SEQU)
        {
            printf("流程全部走完\n");
            break;
        }
    }
    return 0;
}
