#include <stdio.h>
#include <math.h>
float f(float x);

int main() {
    float x;
    scanf ("%f", &x);
    printf ("%.2f", f(x));
    return 0;
}

float f(float x) {
    if (x >= 0) {
        return sqrt(x);
    }
    else {
        return (x+1)*(x+1)+2*x+1/x;
    }
}