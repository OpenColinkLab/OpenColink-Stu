#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) return 0;

    double sum = 0.0;
    for (int i = 1; i <= n; i++) {
        double term = 1.0 / (2.0 * i - 1);      /* 通项：1/(2i-1) */
        sum += (i % 2 == 1) ? term : -term;     /* (-1)^(i-1) */
    }

    printf("%.6f\n", sum * 4.0);
    return 0;
}