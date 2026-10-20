#include <stdio.h>

int main() {
    char words[5];
    for (int i = 0; i <= 4; i++) {
        scanf (" %c", &words[i]);
    }

    int sum = 0;
    for (int i = 0; i <= 4; i++) {
        if (words[i] == 'A' || words[i] == 'a') sum++;
    }

    printf ("%d", sum);
    return 0;
}