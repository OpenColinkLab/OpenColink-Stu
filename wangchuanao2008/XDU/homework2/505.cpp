#include <stdio.h>

int main()
{
    long long m, n;
    scanf("%lld %lld", &m, &n);

    long long ans = m * (m + 1) / 2 * n * (n + 1) / 2;

    printf("%lld\n", ans);

    return 0;
}