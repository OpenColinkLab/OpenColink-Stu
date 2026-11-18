#include <stdio.h>

typedef union
{
    int x;
    int y;
}Test;

int main(void)
{
    Test test;
    test.x = 10;
    test.y = 10;

    printf("%p ", &test.x);
    printf("%p ", &test.y);

    return 0;
}