#include<stdio.h>

int main(int argc, char *argv[])
{
    int num = 13;
    const int s = 46;
    const int *p = &s;
    int const *pi = &num;

    printf("%d\n", num);
    printf("%d\n", s);
    printf("%d\n", *p);
    printf("%d\n", *pi);

    p = &num;
    printf("%d\n", *p);

    // *P = 100;   错误
    num = 465;
    printf("%d\n", *p);
    // pi = &s; 错误
    printf("%s\n", *pi);

    return 0;
}

