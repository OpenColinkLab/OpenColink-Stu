#include <stdio.h>

void Hello(void)
{
    static int count = 10;
    printf("Hello\n");
    if(-- count){
        Hello();
    }

}

long func(int num)
{
    long res;
    if(num > 0){
        res = num * func(num - 1);
    }
    else
    {
        res = 1;
    }
    return res;
}

int main(void)
{
    Hello();
    int num = 0;
    scanf("%d", &num);
    printf("%ld\n", func(num));

    return 0;
}