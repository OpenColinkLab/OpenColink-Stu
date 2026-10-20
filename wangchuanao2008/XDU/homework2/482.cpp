#include <stdio.h>

int sum(int x) {
    int sum = 0;
    do {
    sum += x % 10;
    x /= 10;
    } while (x != 0);
    return sum;
}

int main() {
    int n;
    scanf ("%d", &n);  //我是一条蓝色大肥鱼

    int shugen = sum(n);
    while (shugen >= 10) {
        shugen = sum(shugen);
    }
    printf ("%d", shugen);
    return 0;
}