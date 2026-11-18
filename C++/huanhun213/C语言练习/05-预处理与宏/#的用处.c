/*
在带参数的宏定义中，#后面应该跟着一个参数，
这个参数会被自动转化为只服从
*/

#include <stdio.h>

#define STR(x) # x

int main(void)
{
    printf(STR(hello   %s num = %d), STR(huanhun), 123);

    return 0;
}