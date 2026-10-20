#include <stdio.h>

int sushu(int x) {
    if (x == 1)return 0;
    for (int i = 2; i < x; i++) {
        if (x % i == 0)return 0;
    }
    return 1;
}


int main() {
    int a, b;
    int count = 0;
    int i = 1;
    int c = 0;
    int sushuzu[200];
    scanf ("%d %d", &a, &b);
    if (a > b) {
        c = a;
        a = b;
        b = c;
    }
    while (count < b+10) {
        if (sushu(i) == 1) {
            count++;
            sushuzu[count-1] = i;
        }
        i++;
    }

    int sum = 0;
    for (int i = a; i <= b; i++) {
        sum = sum + sushuzu[i-1];
    }

    printf ("%d", sum);
}