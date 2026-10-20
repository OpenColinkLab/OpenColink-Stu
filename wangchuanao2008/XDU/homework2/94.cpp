#include <stdio.h>

int main() {
    int number[4];
    int c;
    for (int i = 0; i <= 3; i++) {
        scanf ("%d", &number[i]);
    }

    for (int i = 1; i <= 3; i++) {
        for (int i = 0; i <= 2; i++) {
            if (number[i] > number[i+1]) {
                c = number[i+1]; number[i+1] = number[i]; number[i] = c;
            }
        }
    }

    printf ("%d %d %d %d", number[0], number[1], number[2], number[3]);
    return 0;
}