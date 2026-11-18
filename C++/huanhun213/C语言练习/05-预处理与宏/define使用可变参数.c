#include <stdio.h>

#define SHOW(...) printf(#__VA_ARGS__)

#define PRINT(x, ...) printf(#x, ##__VA_ARGS__)
/*
加##是为了再可变参数为空的情况下，删掉逗号
*/

int main(void)
{
    SHOW(nihao, 123, 456\n);
    PRINT(NIHAO);
    PRINT(NIHAO %d, 132);

    return 0;
}