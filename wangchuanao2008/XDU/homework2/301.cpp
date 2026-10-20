#include <stdio.h>

int sum(int x) {
    int sum = 0;
    for (int i = 1; i < x; i++) {
        if (x % i == 0) {
            sum = sum + i;
        }
    }
    return sum;
}

int geshu(int x) {
    int sum = 0;
    for (int i = 1; i < x; i++) {
        if (x % i == 0) {
            sum++;
        }
    }
    return sum;
}

int main() {
    int n, m;
    scanf ("%d %d", &n, &m);
    if (sum(m) == n && sum(n) == m) {
        printf ("yes ");
    }
    else {
        printf ("no ");
    }
    printf ("%d %d\n", geshu(n), geshu(m));
    return 0;
}