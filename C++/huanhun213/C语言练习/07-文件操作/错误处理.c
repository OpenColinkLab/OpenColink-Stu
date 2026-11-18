#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    FILE *ptr;
    if((ptr = fopen("nini.txt", "r")) == NULL){
        printf("文件打开失败\n");
        printf("原因是：%s\n", strerror(errno));
        perror("文件打开失败，原因是");
        printf("%d", errno);
        exit(1);
    }

    fclose(ptr);
    return 0;
}