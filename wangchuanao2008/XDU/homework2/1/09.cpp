#include <stdio.h>
int sushu(int x);

int main() {
    int n = 0;
    scanf ("%d", &n);
    int b = 0;
    for (int a = 1; a <= n / 2; a++) {
        b = n - a;
        if ((sushu(a) == 1) && (sushu(b) == 1)) {
            printf ("%d %d", a, b);
            return 0;
        }
    }
    return 0;
}


int sushu(int x) {
    if (x == 1)return 0;
    for (int i = 2; i < x; i++) {
        if (x % i == 0)return 0;
    }
    return 1;
}