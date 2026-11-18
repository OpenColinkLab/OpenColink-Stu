#include <stdio.h>
#include <stdlib.h>

typedef int *(*PTR2FUNC)(int);
int temp = 10;

int *FunA(int x)
{
    return &temp;
}

int *FunB(int x)
{
    return &temp;
}

int *FunC(int x)
{
    return &temp;
}

int main(void)
{
    PTR2FUNC funs[] = {
        &FunA, &FunB, &FunC
    };

    for(int i=0;i<3;i++){
        printf("%p ", (*(funs[i]))(i));
    }

    return 0;
}