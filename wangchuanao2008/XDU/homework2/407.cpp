#include <stdio.h>
#include <math.h>

int main() {
    int a, b, c;
    scanf ("%d %d %d", &a, &b, &c);
    double P = 0;
    double S = 0;

    if (a+b>c && b+c>a && a+c>b) {
        P = a + b + c;
        S = sqrt(P/2*(P/2 - a)*(P/2 - b)*(P/2 - c));
        if (a*a+b*b==c*c || a*a+c*c==b*b || b*b+c*c==a*a) printf ("yes 1 %.2f %.2f", P, S);
        else printf ("yes 2 %.2f %.2f", P, S);
    }
    else printf ("no 3");

    return 0;
}