#include <stdio.h>

int main() {
    int n = 0;
    scanf ("%d", &n);
    int yibai, wushi, ershi, shi, wu, yi;

    yibai = n / 100;
    n = n % 100;

    wushi = n / 50;
    n = n % 50;

    ershi = n / 20;
    n = n % 20;

    shi = n / 10;
    n = n % 10;

    wu = n / 5;
    n = n % 5;

    yi = n;

    printf ("%d %d %d %d %d %d", yibai, wushi, ershi, shi, wu, yi);
    return 0;
}