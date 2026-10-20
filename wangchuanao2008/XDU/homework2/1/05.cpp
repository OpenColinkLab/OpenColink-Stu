#include <stdio.h>

int main() {
    int n = 0;
    int sum = 0;
    scanf ("%d", &n);
    while (n / 10 != 0) {
        sum = sum + n % 10;
        n = n / 10;
    }
    sum = sum + n;
    printf ("%d", sum);
    return 0;
}