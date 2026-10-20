#include <stdio.h>

int main() {
    int n = 0;
    int number[100];
    scanf ("%d", &n);
    for (int i = 0; i <= n-1; i++) {
        scanf ("%d", &number[i]);
    }

    int sum = 0;
    for (int i = 0; i <= n-1; i++) {
        sum += number[i];
    }
    float avg = (float)sum / n;
    printf ("%.2f", avg);
    return 0; 
}