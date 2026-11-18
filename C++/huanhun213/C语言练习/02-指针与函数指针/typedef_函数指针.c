#include <stdio.h>

typedef int (*PTR2FUNC)(void);

int fun(void)
{
    return 520;
}

int main(void)
{
    PTR2FUNC ptr;
    ptr = &fun;

    printf("%d\n", (*ptr)());

    return 0;

}