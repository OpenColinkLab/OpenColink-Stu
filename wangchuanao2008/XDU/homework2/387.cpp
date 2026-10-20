#include <stdio.h>

int gcd(int x, int y) {
    int temp = 0;
    while (y != 0) {
        temp = x % y;
        x = y;
        y = temp;
    }
    return x;
}

int main() {
    int a, b;
    scanf ("%d %d", &a, &b);

    int gbs = a * b / gcd(a, b);
    printf ("%d", gbs);
    return 0;
}