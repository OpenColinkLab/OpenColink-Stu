#include <stdio.h>

int huiwen(int x) {
    int a = (x * 100) + (x / 100) + (((x / 10) % 10) * 10);
    return a; 
}

int main() {

    int sum = 0;
    int m;
    scanf ("%d", &m);

    for (int i = 100; i <= 999; i++) {
        if (huiwen(i) % m == 0) {
            sum++;
        }
    }
    printf ("%d %d", m, sum);
    return 0;
}