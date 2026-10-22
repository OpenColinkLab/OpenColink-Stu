#include <stdio.h>

int main(void)
{
    double h;   /* 初始下落高度 */
    int n;      /* 第 n 次落地 */

    scanf("%lf %d", &h, &n);
    
        
    

    double total = 0.0;     /* 在空中经过的总距离 */
    double cur = h;         /* 当前这一段下落的高度 */

    for (int i = 1; i <= n; i++) {
        total += cur;            /* 第 i 次落地前下落的距离 */
        cur /= 2.0;              /* 反弹高度 = 下落高度的一半 */
        if (i < n) {
            total += cur;        /* 反弹上升 + 再下落，计入下一次落地 */
        }
    }

    /* cur 此时即为第 n 次反弹的高度 */
    printf("%.1f %.1f\n", total, cur);
    return 0;
}
