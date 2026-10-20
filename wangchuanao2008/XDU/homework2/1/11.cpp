#include <stdio.h>

int main() {
    int a, b;
    scanf ("%d %d", &a, &b);
    if (a % b == 0) {
        printf ("yes");
    }
    else {
        printf ("%d %d", a/b, a%b);
    }
    return 0;
}