#include <stdio.h>

int main() {
    int issue[1000];
    int n = 0;
    while (scanf("%d", &issue[n]) == 1) {
        if (issue[n] == 0) break;
        n++;
    }

    int i = 0;
    int score = 0;
    int base = 1;
    while (issue[i] != 0) {
        if (issue[i] == 1) {
            score++;
            base = 1;
            i++;
        }
        if (issue[i] == 2) {
            score += 2 * base;
            base++;
            i++;
        }
    }

    printf ("%d", score);
    return 0;
}