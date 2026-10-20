#include <stdio.h>

int main() {
    int m, n;
    scanf ("%d %d", &m, &n);
    int jia = m + n;
    int jian = m - n;
    int cheng = m * n;
    int chu = m / n;
    int quyu = m % n;
    printf ("%d %d %d %d %d",jia, jian, cheng, chu, quyu);
    return 0;
}