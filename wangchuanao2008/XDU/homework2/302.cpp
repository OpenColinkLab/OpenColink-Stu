#include <stdio.h>

int sushu(int x) {
    if (x == 1)return 0;
    for (int i = 2; i < x; i++) {
        if (x % i == 0)return 0;
    }
    return 1;
}

int main() {
    int p = 0;
    scanf ("%d", &p);
    int count = 0;
    int i = 1;
    int zhishu[200];
    while (count < p+10) {
        if (sushu(i) == 1) {
            count++;
            zhishu[count-1] = i;
        }
        i++;
    }
    int sum = 0;
    for (int i = p; i <= p+10; i++) {
        sum = sum + zhishu[i-1];
    }
    printf ("%d", sum);
    return 0;
}