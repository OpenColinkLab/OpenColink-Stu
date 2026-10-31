#include <stdio.h>

int main()
{
    int n, x;
    int arr[100];
    int res[100];
    int cnt = 0;

    scanf("%d", &n);
    for(int i = 0; i < n; i++)
    {
        scanf("%d", &arr[i]);
    }
    scanf("%d", &x);

    for(int i = 0; i < n; i++)
    {
        if(arr[i] != x)
        {
            res[cnt++] = arr[i];
        }
    }

    if(cnt == 0)
    {
        printf("NULL\n");
    }
    else
    {
        for(int i = 0; i < cnt; i++)
        {
            if(i > 0)
                printf(" ");
            printf("%d", res[i]);
        }
        printf("\n");
    }
    return 0;
}
