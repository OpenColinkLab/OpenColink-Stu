#include <stdio.h>
#include <math.h>

int main(void)
{
    double x, y;

    /* 读取两个实数，若输入不合法则输出 error */
    if (scanf("%lf %lf", &x, &y) != 2) {
        printf("input error\n");
        return 0;
    }

    /* 四个炮台底座圆心 */
    double cx[4] = { 2, -2, -2, 2};
    double cy[4] = { 2,  2, -2, -2};
    double r = 1.0;

    int found = 0;
    for (int i = 0; i < 4; i++) {
        double dist_sq = (x - cx[i]) * (x - cx[i]) + (y - cy[i]) * (y - cy[i]);
        if (dist_sq <= r * r) {
            found = 1;
            break;
        }
    }

    if (found)
        printf("10\n");
    else
        printf("0\n");

    return 0;
}
