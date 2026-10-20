#include <stdio.h>
#include <math.h>

int main() {
    int a,b;
    scanf ("%d %d", &a, &b);
    double CL = a + sqrt(b * a + 1);
    double tD = a * pow((CL + b),2);
    double SP = tD/CL + b*b;
    printf("CL=%d tD=%d SP=%d", (int)CL,(int)tD,(int)SP);
    return 0;
}