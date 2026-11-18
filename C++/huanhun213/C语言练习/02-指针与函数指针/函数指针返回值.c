#include<stdio.h>

int sum(int a, int b)
{
    int sum;
    sum = a + b;

    return sum;
}
int sub(int a, int b) 
{
    int sub;
    sub = a - b;

    return sub;
}
int (* select(char c))(int a, int b)
/*
 * 功能：根据输入字符选择并返回对应的函数指针（加法或减法）
 * 参数：c - 操作符字符（'+' 或 '-'）
 * 返回：对应的函数指针，若无匹配则返回NULL
 */
{
    switch(c)
    {
        case '+': return sum;
        case '-': return sub;
        default: return NULL;
    }
}

int main(int argc, char *argv[])
{
    char input;
    scanf("%c", &input);
    int a = 8;
    int b = 4;
    
    printf("%d\n", (select(input))(a, b));
    
    return 0;
}