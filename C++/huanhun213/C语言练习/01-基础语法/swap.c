#include <stdio.h>

void swap(int *m, int *n)
{
    int temp = *m;
    *m = *n;
    *n = temp;
    printf("m=%d, n=%d", *n, *m); 
}

int main(void)
{
    int m = 4;
    int n = 5;
    swap(&m, &n);
    return 0;
}