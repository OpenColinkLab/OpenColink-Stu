#include<stdio.h>
#include<stdlib.h>

typedef struct 
{
    int x;
    int y;
}point;

int main(int argc, char const *argv[])
{
    point *p;
    p = (point *)malloc(sizeof(point));

    p->x = 10;
    p->y = 10;

    printf("%d, %d/n", p->x, p->y);

    return 0;
}