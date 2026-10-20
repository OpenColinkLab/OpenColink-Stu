#include <stdio.h>

int main() {
    double t;
    scanf ("%lf", &t);

    double a = 0;
    double b = 0;
    char better;
    a = t * 0.6;
    b = 50 + t * 0.4;
    if (a >= b) better = 'B';
    else better = 'A';

    printf("%.2f\n%.2f\n%c\n", a, b, better);
    return 0;
}