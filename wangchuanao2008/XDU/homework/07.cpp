#include <stdio.h>

int main() {
    int a;
    scanf("%d", &a);
    int gewei = a % 10;
    int shiwei = (a / 10) % 10;
    int baiwei = (a / 100) % 10;
    int qianwei = (a / 1000) % 10;
    int wanwei = a / 10000;
    printf ("%d %d %d %d %d",wanwei,qianwei,baiwei,shiwei,gewei);
}