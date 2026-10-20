#include <stdio.h>

// 辗转相除法求gcd
int gcd(int a, int b)
{
    while(b != 0)
    {
        int temp = a % b;
        a = b;
        b = temp;
    }
    return a;
}

int main()
{
    int a, b;
    // 输入两个非负整数
    scanf("%d %d", &a, &b);
    printf("%d\n", gcd(a,b));
    return 0;
}