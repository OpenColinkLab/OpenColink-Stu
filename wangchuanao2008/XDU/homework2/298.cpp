#include <stdio.h>

int max(int x, int y) {
    if (x > y) return x;
    else return y;
}

int min(int x, int y) {
    if (x > y) return y;
    else return x;
}

int main() {
    int a, b;
    scanf ("%d %d", &a, &b);
    int one, two, three, four, maxx, minn;
    one = (a+b) * (a+b);
    two = (a-b) * (a-b);
    three = a*a + b*b;
    four = a*a - b*b;
    maxx = max(max(one, two), max(three, four));
    minn = min(min(one, two), min(three, four));
    printf ("%d %d", maxx, minn);
    return 0;
}