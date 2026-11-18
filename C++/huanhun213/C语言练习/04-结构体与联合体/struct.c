#include <stdio.h>

typedef struct
{
    int x;
    int y;
}point;

int main(void)
{
    point p;
    p.x = 10;
    p.y = 5;
    printf("%d/n", p.x);
    printf("%d/n", p.y);
    
    return 0;
}
