/*
用于存放动态内存的地方
*/
#include <stdio.h>
#include <stdlib.h>

int *func(void)
{
    int *ptr = NULL;
    ptr = (int *)malloc(sizeof(int));
    *ptr = 520;

    return ptr;
}

int main(void)
{
    int *ptr = NULL;
    ptr = func();

    printf("%d\n", *ptr);
    free(ptr);

    printf("%d\n", *ptr);

    return 0;
}