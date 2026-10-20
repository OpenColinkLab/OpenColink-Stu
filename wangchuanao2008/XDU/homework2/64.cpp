#include <stdio.h>

int main() {
    int n = 0;
    scanf ("%d", &n);
    int lifang = n * n * n;
    for (int i = 1; i <= lifang; i = i + 2) {
        int sum = 0;
        for (int j = i; j <= i + (n-1) * 2; j = j + 2) {
            sum = sum + j;
        }
        if (sum == lifang) {
            for (int j = i; j <= i + (n-1) * 2; j = j + 2) {
                printf ("%d ", j);
            }
        }
    }
    return 0;
}