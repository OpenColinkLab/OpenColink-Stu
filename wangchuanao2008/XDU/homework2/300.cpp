#include <stdio.h>

int main() {
    int m = 0;
    int weishu = 0;
    scanf ("%d", &m);
    while (m / 10 != 0) {
        m = m / 10;
        weishu++;
    }
    weishu++;
    printf ("%d", weishu);
    return 0;
}