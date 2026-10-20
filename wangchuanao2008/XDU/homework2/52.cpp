#include <stdio.h>

int main() {
    char word;
    scanf ("%c", &word);

    if (word >= 65 && word <= 90) {
        printf ("%c", word + 32);
    }

    else if (word >= 97 && word <= 122) {
        printf ("%c", word - 32);
    }

    else {
        printf ("%c", word);
    }

    return 0;
}