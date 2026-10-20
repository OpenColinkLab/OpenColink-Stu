#include <stdio.h>
#include <stdlib.h>

int main() {
    int m;
    scanf("%d", &m);
    int n = abs(m);
    int gewei = n % 10;
    int shiwei = (n/10) % 10;
    int baiwei = n/100;
    printf ("%d %d %d\n%d %d %d",baiwei, shiwei, gewei, gewei, shiwei, baiwei);
    return 0;
}