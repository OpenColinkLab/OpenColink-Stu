#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void)
{
    FILE *ptr;
    struct tm *p;
    time_t t;

    time(&t);
    p = localtime(&t);

    if((ptr = fopen("data.txt", "w")) == NULL){
        printf("文件打开失败\n");
        exit(EXIT_FAILURE);
    }

    fprintf(ptr, "%d-%d-%d\n", 1900+p->tm_year, 1+p->tm_mon, p->tm_mday);

    fclose(ptr);

    if((ptr = fopen("data.txt", "r")) == NULL){
        printf("文件打开失败\n");
        exit(EXIT_FAILURE);
    }

    int year, month, day;
    fscanf(ptr, "%d-%d-%d", &year, &month, &day);
    printf("%d-%d-%d\n", year, month, day);

    fclose(ptr);

    return 0;
}