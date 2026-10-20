#include <stdio.h>

int sushu(int x) {
    if (x == 1) return 0;
    if (x == 2) return 1;
    for (int i = 2; i < x; i++) {
        if (x % i == 0) return 0;
    }
    return 1;
}

int main() {
    int n = 0;
    scanf ("%d", &n);

    int sum = 0;
    if (n <= 1 || n > 100000) printf ("%d", 0);
    else {
        for (int i = 2; i <= n; i++) {
            if (sushu(i) == 1) sum += i;
        }
        printf ("%d", sum);
    }
    return 0;
}