#include <stdio.h>
#include <math.h>

int main() {
    float r, n;
    scanf("%f %f", &r, &n);
    float p = pow ((1+r),n);
    printf ("%.2f", p);
    return 0;
}