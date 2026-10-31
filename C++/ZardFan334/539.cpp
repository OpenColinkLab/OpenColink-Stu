#include <stdio.h>

void moveZeroes(int nums[], int n) {
    int slow = 0;
    for (int fast = 0; fast < n; fast++) {
        if (nums[fast] != 0) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    for (int i = slow; i < n; i++) {
        nums[i] = 0;
    }
}

int main() {
    int n;
    scanf("%d", &n);
    int nums[10000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    moveZeroes(nums, n);

   
    for (int i = 0; i < n; i++) {
        if(i > 0) printf(" ");
        printf("%d", nums[i]);
    }
    printf("\n");
    return 0;
}
