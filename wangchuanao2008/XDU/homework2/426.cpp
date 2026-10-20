#include <stdio.h>

int main() {
    long long a, b, c;
    if (scanf("%lld %lld %lld", &a, &b, &c) != 3) {
        return 0;
    }

    if (a <= 0 || b <= 0 || c <= 0 ||
        a + b <= c || a + c <= b || b + c <= a) {
        printf("不是三角形\n");
    }
    else if (a * a + b * b == c * c) {
        printf("%lld\n", a * b / 2);
    }
    else if (a * a + c * c == b * b) {
        printf("%lld\n", a * c / 2);
    }
    else if (b * b + c * c == a * a) {
        printf("%lld\n", b * c / 2);
    }
    else {
        printf("其他三角形\n");
    }

    return 0;
}
