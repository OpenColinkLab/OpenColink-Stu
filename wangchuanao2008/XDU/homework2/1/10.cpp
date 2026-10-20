#include <stdio.h>

int main() {
    int n;
    int pi[100];
    scanf ("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf ("%d", &pi[i]);
    }
    int one = 0;
    int two = 0;
    int three = 0;
    int four = 0;
    int five = 0;
    int six = 0;
    int sum = 0;
    for (int j = 0; j < n; j++) {
        if (pi[j] <= 50) {
            one++;
        }
        else if (pi[j] <= 100) {
            two++;
        }
        else if (pi[j] <= 150) {
            three++;
        }
        else if (pi[j] <= 200) {
            four++;
        }
        else if (pi[j] <= 300) {
            five++;
        }
        else {
            six++;
        }
        sum = sum + pi[j];
    }
    float avg = (float)sum / n;
    printf ("%.2f\n%d %d %d %d %d %d", avg, one, two, three, four, five, six);
    return 0;
}