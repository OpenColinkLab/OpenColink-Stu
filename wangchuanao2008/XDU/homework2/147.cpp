#include <stdio.h>

int main() {
    int nums[1000];
    int n = 0;
    while (1) {
        scanf ("%d", &nums[n]);
        if (nums[n] == 0) break;
        n++;
    }

    int sum = 0;
    for (int i = 0; i <= n; i++) {
        if (nums[i] % 2 == 1) sum += nums[i];
    }

    printf ("%d", sum);
    return 0;
}