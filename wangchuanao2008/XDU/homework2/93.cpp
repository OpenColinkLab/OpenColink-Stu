#include <stdio.h>

int main() {
    int a, b, c;
    scanf ("%d %d", &a, &b);

    if (b > a) {
        c = b; b = a; a = c;
    }

    printf ("%d %d", a%10, b*b);
    return 0;
}