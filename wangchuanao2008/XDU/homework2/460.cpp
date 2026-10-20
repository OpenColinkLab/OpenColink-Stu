#include <stdio.h>

int main() {
    int n;
    scanf ("%d", &n);
    int jiecheng = 1;

    if (n == 0) jiecheng = 1;
    else {
        for (int i = 1; i <= n; i++) {
            jiecheng *= i;
        }
    }

    printf ("%d", jiecheng);
    return 0;
}