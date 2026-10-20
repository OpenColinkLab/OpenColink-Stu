#include <stdio.h>

int main() {
    int n;
    int temp[30];
    scanf ("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf ("%d", &temp[i]);
    }
    int maxBodong = 0;
    for (int i = 1; i < n; i++) {
        int cha = temp[i] - temp[i-1];

        if (cha < 0) {
            cha = -cha;
        }

        if (cha > maxBodong) {
            maxBodong = cha;
        }
    }
    printf ("%d", maxBodong);
    return 0;
}