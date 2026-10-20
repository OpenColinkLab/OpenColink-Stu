#include <stdio.h>

int main() {
    int huashi;
    scanf ("%d", &huashi);
    float sheshi;
    sheshi = (huashi - 32) * 5.0/9;
    printf ("%.2f", sheshi);
    return 0;
}