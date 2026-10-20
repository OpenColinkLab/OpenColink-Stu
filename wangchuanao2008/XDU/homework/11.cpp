#include <stdio.h>

int main() {
    int a;
    scanf ("%d",&a);
    int gewei = a % 10;
    int shiwei = (a/10) % 10;
    int baiwei = a / 100;
    int sum = gewei + shiwei + baiwei;
    printf ("%d", sum);
    return 0;
}