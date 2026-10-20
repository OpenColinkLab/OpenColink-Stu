#include <stdio.h>

int main() {
    int num[1000];
    int den[1000];
    float ans[1000];
    int n = 0;
    scanf ("%d", &n);

    num[0] = 1;
    den[0] = 1;
    ans[0] = 1;
    float sum = ans[0];
    for (int i = 1; i <= n-1; i++) {
        num[i] = num[i-1] + 1;
        den[i] = den[i-1] + 2;
        ans[i] = (float)num[i] / (float)den[i];
        if (i % 2 == 0) sum += ans[i];
        else sum -= ans[i];
    }

    printf ("%.3f", sum);
    return 0;
}