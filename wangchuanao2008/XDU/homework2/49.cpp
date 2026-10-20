#include <stdio.h>

int main() {
    int n = 0;
    scanf ("%d", &n);

    if (n == 0) {
        printf ("0");
        return 0;
    }

    for (int i = 1; i <= n / i; i++) {
        if (n == i * i) {
            printf ("%d", i);
            return 0;
        }
    }
    printf ("no");
    return 0;
}
