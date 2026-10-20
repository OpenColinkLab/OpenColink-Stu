#include <stdio.h>
#include <math.h>

int main() {
    float a;
    scanf ("%f", &a);
    float x[1001];
    x[1] = a;
    x[2] = (x[1] + a/x[1]) * 1/2;
    int n = 2;

    while (fabs(x[n] - x[n-1]) >= 0.00001) {
        x[n+1] = (x[n] + a/x[n]) * 1/2;
        n++;
    }

    printf ("%.5f", x[n]);
    return 0;
}