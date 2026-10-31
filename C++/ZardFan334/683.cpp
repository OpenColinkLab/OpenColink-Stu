#include <stdio.h>

int main()
{
    int n;
    int x[30], y[30];
    scanf("%d", &n);
    for(int i = 0; i < n; i++)
    {
        scanf("%d", &x[i]);
    }

    for(int i = 0; i < n; i++)
    {
        if(i == 0 || i == 1)
        {
            y[i] = (x[0] + x[1] + x[2]) / 3;
        }
        else if(i == n - 1)
        {
            y[i] = (x[n-3] + x[n-2] + x[n-1]) / 3;
        }
        else
        {
            y[i] = (x[i-1] + x[i] + x[i+1]) / 3;
        }
    }

    for(int i = 0; i < n; i++)
    {
        if(i > 0)
            printf(" ");
        printf("%d", y[i]);
    }
    printf("\n");
    return 0;
}
