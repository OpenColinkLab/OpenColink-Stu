#include <stdio.h>

int main() {
    int n, m;
    scanf ("%d %d", &n, &m);
    double dixinyeji = 0;
    double ticheng = 0;

    switch (n) {
        case 1:
            dixinyeji = 50000.0;
            if (m < dixinyeji) ticheng = 0;
            else ticheng = (m - dixinyeji) * 0.03;
            break;
        case 2:
            dixinyeji = 35000.0;
            if (m < dixinyeji) ticheng = 0;
            else ticheng = (m - dixinyeji) * 0.02;
            break;
        case 3:
            dixinyeji = 20000.0;
            if (m < dixinyeji) ticheng = 0;
            else ticheng = (m - dixinyeji) * 0.02;
            break;
        case 4:
            dixinyeji = 5000.0;
            if (m < dixinyeji) ticheng = 0;
            else ticheng = (m - dixinyeji) * 0.025;
            break;
    }

    printf ("%d %.1f %.1f", n, dixinyeji, ticheng);
    return 0;
}