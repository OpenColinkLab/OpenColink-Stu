#include <stdio.h>

int main() {
    int a, b;
    char c;
    scanf ("%d %d %c", &a, &b, &c);

    if (c == '+') printf ("%d%c%d=%d", a, c, b, a+b);
    else if (c == '-') printf ("%d%c%d=%d", a, c, b, a-b);
    else if (c == '*') printf ("%d%c%d=%d", a, c, b, a*b);
    else if (c == '/') printf ("%d%c%d=%d", a, c, b, a/b);
    else if (c == '%') printf ("%d%c%d=%d", a, c, b, a%b);
    return 0;
}