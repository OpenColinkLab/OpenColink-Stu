#include <stdio.h>

int main() {
    int n;
    scanf ("%d", &n);

    if (n == 1) {
        printf ("No");
        return 0;
    }

    if (n == 2) {
        printf ("Yes");
        return 0;
    }

    for (int i = 2; i < n; i++) {
        if (n % i == 0) {
            printf ("No");
            return 0;
        }
    }
    printf ("Yes");
    return 0;
}