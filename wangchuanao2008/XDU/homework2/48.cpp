#include <stdio.h>

int main() {
    int m, n, q, s;
    scanf ("%d %d %d %d", &m, &n, &q, &s);
    int shang = m / n;
    int yushu = m % n;
    if ((q == shang) && (s == yushu)) {
        printf ("yes");
    }
    else {
        printf ("%d %d", shang, yushu);
        return 0;
    }
}