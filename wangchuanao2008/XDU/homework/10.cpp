#include <stdio.h>
#define pi 3.14

int main() {
    float r ;
    scanf ("%f", &r);
    float v = 4.0f / 3 * pi * r * r * r;
    printf ("%.2f", v);
    return 0;
}