#include <stdio.h>

int gcd(int x, int y) {
    int temp;
    while (y != 0) {
        temp = x % y;
        x = y;
        y = temp;
    }
    return x;
}

int main() {
    int m, n, temp;
    scanf ("%d %d", &m, &n);
    if (m > n) {
        temp = n;
        n = m;
        m = temp;
    }
    printf ("%d %d %d", m, n, m*n/gcd(m, n));
    return 0;
}