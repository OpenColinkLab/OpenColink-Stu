/*
不会返回函，而是再mian里面直接展开
*/
#include <stdio.h>

inline int add(int a, int b)
{
    return a + b;
}

int main(void)
{
    int a = 4;
    int b = 5;

    printf("%d\n", add(a, b));
    return 0;
    
}