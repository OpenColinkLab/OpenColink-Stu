#include <stdio.h>

int sum(int x) {
    int n = 0;
    while (x > 0) {
        n = n + x % 10;
        x = x / 10;
    }
    return n;
}

int main() {
    int n = 0;
    int number[100];
    scanf ("%d", &n);
    for (int i = 0; i <= n-1; i++) {
        scanf ("%d", &number[i]);
    }

    int max = 0;
    for (int i = 0; i <= n-1; i++) {
        if (sum(number[i]) > sum(max)) {
            max = number[i];
        }
        else if (sum(number[i]) == sum(max)) {
            if (number[i] > max) {
                max = number[i];
            }
        }
    }
    
    printf ("%d", max);
    return 0;
}