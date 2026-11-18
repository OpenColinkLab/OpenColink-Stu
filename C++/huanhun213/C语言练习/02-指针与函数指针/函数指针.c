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
int calc(int (*p1)(int a, int b), int (*p2)(int a, int b))
{
    int a = 8;
    int b = 4;
    int sum = 0;
    int sub = 0;
    int total = 0;

    sum = (*p1)(a, b);
    sub = (p2)(a, b);

    total = sum + sub;

    return total;
}

int main(int argc, char *argv[])
{
    int a = 1; 
    int b = 5;

    int (*p1)(int a, int b);
    int (*p2)(int a, int b);
    p1 = &sum;
    p2 = &sub;

    printf("%d\n", (*p1)(a, b));
    printf("%d\n", calc(p1, p2));

    return 0;
}