#include <stdio.h>
#define Pi 3.1415926

int main() {
    int R1,H1,R2,H2;
    scanf ("%d %d %d %d",&R1,&H1,&R2,&H2);
    float v_1 = Pi * R1/2 * R1/2 * H1;
    float v_2 = Pi * R2/2 * R2/2 * H2 * 1/3;
    float v = v_1 - v_2;
    float m = 0.785 * v;
    printf("%d %d", (int)v, (int)m);
    return 0;
}