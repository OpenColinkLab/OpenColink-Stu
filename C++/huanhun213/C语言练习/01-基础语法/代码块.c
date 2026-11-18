#include<stdio.h>

int main(void)
{
    int i = 1;
    printf("%d\n", i);
    {
        int i = 2;
        printf("%d\n", i);
        {
            int i = 3;
            printf("%d\n", i);
        }
    }

    return 0;
}