#include <stdio.h>

int main() {
    float run;
    int wait;
    scanf ("%f %d", &run, &wait);
    float runsum, waitsum, sum;

    if (run <= 3) runsum = 10;
    else if (run <= 10) runsum = 10 + (run-3) * 2;
    else runsum = 24 + (run-10) * 3;

    waitsum = (wait/5) * 2;
    sum = runsum + waitsum;

    printf ("%.0f", sum);
    return 0;
}