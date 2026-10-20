#include <stdio.h>

int has7(int x) {
    while (x > 0) {
        if (x % 10 == 7)return 1;
        x = x / 10;
    }
    return 0;
}

int main() {
    int n = 0;
    scanf ("%d", &n);
    int person = 1;
    int i = 1;
    int reported = 0;
    int tiao1 = 0;
    int tiao2 = 0;
    int tiao3 = 0;

    while (reported < n) {
        if (i % 7 == 0 || has7(i)) {
            if (person == 1) tiao1++;
            else if (person == 2) tiao2++;
            else tiao3++;
        } else {
            reported++;
        }
        i++;
        person = person % 3 + 1;
    }

    printf ("%d %d %d", tiao1, tiao2, tiao3);
    return 0;
}
