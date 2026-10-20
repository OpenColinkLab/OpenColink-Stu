#include <stdio.h>

int main() {
    char a, b, c, d, e;
    scanf ("%c|%c|%c|%c|%c",&a,&b,&c,&d,&e);
    a = a + 32;
    b = b + 32;
    c = c + 32;
    d = d + 32;
    e = e + 32;
    printf("%c%c%c%c%c!\n",a, b, c, d, e);
    return 0;
}