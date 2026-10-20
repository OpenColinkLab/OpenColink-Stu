#include <stdio.h>

int main() {
    int a; int b;
    scanf("%d %d",&a, &b);
    int he = a + b;
    int cha = a - b;
    int ji = a * b;
    int shang = a / b;
    printf("%d\n%d\n%d\n%d\n", he, cha, ji, shang);
}