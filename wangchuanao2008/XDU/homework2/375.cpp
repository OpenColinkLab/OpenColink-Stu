#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    double temperatures[10];
    double sum = 0.0;
    double minimum, maximum;

    for (int i = 0; i < n; ++i) {
        int celsius;
        scanf("%d", &celsius);
        temperatures[i] = 9.0 / 5.0 * celsius + 32.0;
        sum += temperatures[i];

        if (i == 0) {
            minimum = maximum = temperatures[i];
        } else {
            if (temperatures[i] < minimum) minimum = temperatures[i];
            if (temperatures[i] > maximum) maximum = temperatures[i];
        }
    }

    for (int i = 0; i < n; ++i) {
        printf("%.1f", temperatures[i]);
        if ((i + 1) % 5 == 0 || i == n - 1) {
            printf("\n");
        } else {
            printf(" ");
        }
    }

    printf("%.1f %.1f %.1f\n", minimum, maximum, sum / n);
    return 0;
}