#include <stdio.h>

int main() {
    double yongdianliang, dianfei;
    scanf("%lf", &yongdianliang);

    if (yongdianliang <= 110) {
        dianfei = yongdianliang * 0.5;
    }
    else if (yongdianliang <= 210) {
        dianfei = 110 * 0.5 + (yongdianliang - 110) * 0.55;
    }
    else {
        dianfei = 110 * 0.5 + 100 * 0.55 + (yongdianliang - 210) * 0.7;
    }

    printf("%.2f", dianfei);
    return 0;
}
