#include <stdio.h>

int main() {
    int n;
    scanf ("%d", &n);
    int min = 9;
    int max = 0;
    int weishu = 0;
    while (n / 10 != 0) {
        if (n % 10 > max) {
            max = n % 10;
        }
        if (n % 10 < min) {
            min = n % 10;
        }
        weishu++;
        n = n / 10;
    }
    if (n > max) {
        max = n;
    }
    if (n < min) {
        min = n;
    }
    weishu++;
    printf ("%d %d %d", weishu, max, min);
}