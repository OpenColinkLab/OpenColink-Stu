#include <stdio.h>
#include <stdlib.h>

#define MAX(x, y) (((x) > (y)) ? (x) : (y))

int main(void)
{
    int a, b;
    printf("Input two numbers: ");
    scanf("%d%d", &a, &b);

    printf("%d\n", MAX(a, b));
    return 0;
    
}