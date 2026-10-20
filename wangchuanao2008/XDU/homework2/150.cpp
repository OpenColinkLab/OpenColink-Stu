#include <stdio.h>

int main() {
    int x;
    scanf ("%d", &x);

    if (x < 1) printf ("%d", x);
    else if (x < 10) printf ("%d", 2*x-1);
    else printf ("%d", 3*x-11);
    return 0;
}