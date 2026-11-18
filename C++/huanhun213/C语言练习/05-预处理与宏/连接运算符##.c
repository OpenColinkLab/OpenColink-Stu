#include <stdio.h>

#define TOGET(X, Y) X ## Y

int main(void)
{
    printf("%d\n", TOGET(1, 45));

    return 0;
}