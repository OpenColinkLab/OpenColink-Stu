#include <stdio.h>

int main() {
    int n;
    int A[100000];
    long long sum = 0;                              //sum用于储存单个子数列的和
    long long maxsum;                               //maxsum用于储存目前找到的最大子数列和
    scanf ("%d", &n);
    for (int i = 0; i <= n-1; i++) {
        scanf ("%d", &A[i]);
    }
    maxsum = A[0];                                  //先用第一个元素初始化，防止全负数序列时答案为0

    for (int i = 1; i <= n; i++) {                  //i为子数列元素数
        for (int j = 1; j <= n+1-i; j++) {          //j为第几组组数列，n+1-i是子数列的总个数
            sum = 0;                                //每算一个新的子数列前，先把sum清零
            for (int k = 1; k <= i; k++) {          //k是子数列内部的“第几个”元素
                sum += A[j+k-2];
            }
            if (sum > maxsum) {                     //每算完一个子数列，就和当前最大值比较
                maxsum = sum;
            }
        }
    }

    printf ("%lld\n", maxsum);
    return 0;
}