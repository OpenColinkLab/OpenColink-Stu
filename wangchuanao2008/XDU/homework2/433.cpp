#include <stdio.h>

int main() {
    int n;
    scanf ("%d", &n);
    double a[101];

    for (int i = 1; i <= n; i++) {
        a[i] = 1 + 1.0/i;
    }

    double sn = 0;
    for (int i = 1; i <= n; i++) {
        sn += a[i];
    }

    printf ("%.1f", sn);
    return 0;
}