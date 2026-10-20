#include <stdio.h>

int main() {
    int random, n;
    scanf ("%d %d", &random, &n);

    int guess = 0;
    for (int i = 1; i <= n; i++) {
        scanf ("%d", &guess);
        if (guess < 0) {
            printf ("Game Over\n");
            return 0;
        }

        if (guess == random) {
            if (i == 1) {
                printf ("Bingo!\n");
                return 0;
            }
            else if (i <= 3) {
                printf ("Lucky You!\n");
                return 0;
            }
            else {
                printf ("Good Guess!\n");
                return 0;
            }
        }

        else {
            if (guess > random) printf ("Too big\n");
            else printf ("Too small\n");
        }
    }
    printf ("Game Over\n");
    return 0;
}