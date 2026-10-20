#include <stdio.h>

int sum(int x) {
    int sum = 0;
    for (int i = 1; i < x; i++) {
        if (x % i == 0) sum += i;
    }
    return sum;
}

int geshu(int x) {
    int sum = 0;
    for (int i = 1; i < x; i++) {
        if (x % i == 0) sum++;
    }
    return sum;
}

int main() {
    int m, n;
    scanf ("%d %d", &m, &n);

    int j = 0;
    for (int i = m; i <= n; i++) {
        j = sum(i);
        if (sum(j) == i && i < j && j <= n) printf ("%d %d,%d %d\n", i, geshu(i), j, geshu(j)); 
    }
    return 0;
}