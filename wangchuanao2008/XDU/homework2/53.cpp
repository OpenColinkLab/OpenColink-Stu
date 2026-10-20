#include <stdio.h>

int main() {
    int m = 0;
    scanf ("%d", &m);

    if (m >= 90) {
        printf ("%c", 'A');
    }
    else if (m >= 80) {
        printf ("%c", 'B');
    }
    else if (m >= 70) {
        printf ("%c", 'C');
    }
    else if (m >= 60) {
        printf ("%c", 'D');
    }
    else {
        printf ("%c", 'E');
    }
    return 0;
}
