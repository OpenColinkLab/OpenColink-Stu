#include <stdio.h>

int main() {
    int number[4];
    for (int i = 0; i <= 3; i++) {
        scanf ("%d", &number[i]);
    }

    int max = number[0];
    for (int i = 1; i <= 3; i++) {
        if (number[i] > max) {
            max = number[i];
        }
    }

    printf ("%d", max);
    return 0;
}