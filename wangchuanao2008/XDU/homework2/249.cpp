#include <stdio.h>

int main() {
    int n = 0;
    scanf ("%d", &n);
    int ans[1001];
    int a = 1;

    for (int i = 2; i <= n; i++) {
        while (n % i == 0) {
            n = n / i;
            ans[a] = i;
            a++;
        }
    }

    printf("%d", ans[1]);
    for (int k = 2; k <= a-1; k++) {
        printf("*%d", ans[k]);
    }
    return 0;
}