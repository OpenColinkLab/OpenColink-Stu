#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    FILE *ptr1;
    FILE *ptr2;
    int ch;
    if((ptr1 = fopen("hello.txt", "r")) == NULL){
        printf("打开文件失败\n");
        exit(EXIT_FAILURE);
    }
    if((ptr2 = fopen("huanhun.txt", "w")) == NULL){
        printf("打开文件失败\n");
        exit(EXIT_FAILURE);
    }

    while((ch = fgetc(ptr1)) != EOF){
        fputc(ch, ptr2);
    }

    fclose(ptr1);
    fclose(ptr2);
    
    return 0;
}