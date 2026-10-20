#include <stdio.h>
#include <math.h>

int main() {
    float d, P, r;
    scanf ("%f %f %f",&d, &P, &r);
    float m = log(P/(P-d*r))/log(1+r);
    printf ("%.2f", m);
    return 0;
}