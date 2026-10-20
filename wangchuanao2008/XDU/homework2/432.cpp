#include <stdio.h>

int main() {
    int n;
    scanf ("%d", &n);

    int weishu = 0;
    if (n == 0) weishu = 1;
    while (n != 0) {
        n = n / 10;
        weishu++;
    }

    printf ("%d", weishu);
    return 0;
}