#include <stdio.h>

int main() {
    int n = 0;
    int times = 0;
    scanf ("%d", &n);
    while (n != 1) {
        if (n % 2 == 0) {
            n = n / 2;
        }
        else {
            n = n * 3 + 1;
        }
        times++;
    }
    printf ("%d", times);
    return 0;
}