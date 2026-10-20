#include <stdio.h>

int max(int a, int b) {
    if (a > b) return a;
    else return b;
}

int main() {
    int n = 0;
    scanf ("%d", &n);
    int f[51];
    f[1] = 0;
    f[2] = 1;
    f[3] = 2;

    for (int i = 4; i <= n; i++) {
        f[i] = 0;
        for (int j = 1; j <= i-1; j++) {                     //枚举切下来的j
            int rest = i - j;
            int better = max(rest, f[rest]);
            if (j * better > f[i]) f[i] = j * better;
        }     
    }
    printf ("%d", f[n]);
    return 0;
}