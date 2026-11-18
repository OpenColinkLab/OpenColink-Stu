#include <stdio.h>
#include <stdlib.h>

#define MAX 1024

int main(void)
{
    FILE *ptr;
    char buffer[MAX];

    if((ptr = fopen("hhbjh.txt", "w")) == NULL){
        printf("打开文件失败");
        exit(EXIT_FAILURE);
    }

    fputs("Hello huanhun\n", ptr);
    fputs("Hello huanhun\n", ptr);

    fclose(ptr);

    if((ptr = fopen("hhbjh.txt", "r")) == NULL){
        printf("打开文件失败");
        exit(EXIT_FAILURE);
    }

    while(fgets(buffer, MAX, ptr) != NULL){
        printf("%s", buffer);
    }

    return 0;

}