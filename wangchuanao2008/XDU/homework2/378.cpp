#include <stdio.h>
#include <math.h>

int main() {
    int n;
    scanf ("%d", &n);

    int a = 1;
    int nums[31];
    for (int i = 30; i >= 1; i--) {
        if (n >= pow(2, i)) {
            n = n - pow(2, i);
            nums[a] = pow(2, i);
            a++;
        }
    }

    if (n != 0) printf("%d", -1);
    else {
        printf("%d", nums[1]);
        for (int i = 2; i <= a - 1; i++) {
            printf(" %d", nums[i]);
        }
    }
    return 0;
}
    
