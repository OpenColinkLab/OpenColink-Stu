#include <stdio.h>

int main() {
    int n = 0;
    scanf ("%d", &n);
    int nums[20];
    for (int i = 0; i <= n; i++) {
        scanf ("%d", &nums[i]);
    }

    int sum = nums[0];
    int absmax = nums[1];
    int maxnum = 1;
    for (int i = 1; i <= n; i++) {
        sum += nums[i];
        if (nums[i] < absmax) {
            absmax = nums[i];
            maxnum = i;
        }
    }

    printf ("%d %d\n", sum, maxnum);
    return 0;
}
