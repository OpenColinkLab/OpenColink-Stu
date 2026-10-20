#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 0;
    scanf ("%d", &n);
    int nums[n];
    for (int i = 0; i <= n-1; i++) {
        scanf ("%d", &nums[i]);
    }
    int target = 0;
    scanf ("%d", &target);

    for (int i = 1; i <= n-1; i++) {
        for (int j = 0; j <= n-2; j++) {
            int temp = 0;
            if (nums[j] > nums[j+1]) {
                temp = nums[j+1];
                nums[j+1] = nums[j];
                nums[j] = temp;
            }
        }
    }

    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i <= n-3; i++) {
        int left = i+1;
        int right = n-1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if (sum == target) {
                printf ("%d", sum);
                return 0;
            }
            if (abs(sum - target) < abs(best - target)) best = sum;
            if (sum > target) right--;
            if (sum < target) left++;
        }
    }

    printf ("%d", best);
    return 0;
}
