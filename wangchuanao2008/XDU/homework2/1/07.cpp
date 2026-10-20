#include <stdio.h>

int main() {
    int a = 0;
    int b = 0;
    int c = 0;
    scanf ("%d %d", &a, &b);
    while (b != 0) {
        c = a % b;
        a = b;
        b = c;
    }
    printf ("%d", a);
    return 0;
}