#include <stdio.h>

int main() {
    int n;
    int A[100000];                              
    scanf ("%d", &n);
    for (int i = 0; i <= n-1; i++) {
        scanf ("%d", &A[i]);
    }
    int cur = A[0];
    int ans = cur;

    for (int i = 1; i <= n-1; i++) {
        if (cur > 0) cur += A[i];
        else cur = A[i];
        if (cur > ans) ans = cur;
    }

    printf ("%d", ans);
    return 0;
}