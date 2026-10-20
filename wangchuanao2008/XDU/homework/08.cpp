#include <stdio.h>

int main() {
    int h,m;
    scanf ("%d %d",&h, &m);
    float t;
    t = h + (float)m / 60.0 ;
    float T;
    T = 4*t*t/(t+2)-20;
    printf ("%.2f", T);
    return 0;
}