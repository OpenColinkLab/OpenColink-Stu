#include <stdio.h>
#include <math.h>

int main() {
    float a, b, c;
    scanf ("%f %f %f", &a, &b, &c);

    float delta = b*b - 4*a*c;
    if (delta < 0) printf ("no");
    else if (delta == 0) printf ("%.1f", -b/(2*a));
    else printf ("%.1f %.1f", (-b+sqrt(delta))/(2*a), (-b-sqrt(delta))/(2*a));
    return 0;
}