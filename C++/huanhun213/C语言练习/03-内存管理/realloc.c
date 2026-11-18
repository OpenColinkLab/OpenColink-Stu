#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *pr = NULL;
    int num, count = 0;
    while(1){
        printf("请输入一个整数：");
        if(scanf("%d", &num) != 1){
            break;;
        }
        if(num == -1){
            break;
        }
        int *temp = realloc(pr, (count + 1) * sizeof(int));
        if(temp == NULL){
            free(pr);
            exit(1);
        }
        pr = temp;
        pr[count] = num;
        count ++;
    }

    for(int i=0;i<count;i++){
        printf("%d ", pr[i]);
    }

    return 0;
    
}