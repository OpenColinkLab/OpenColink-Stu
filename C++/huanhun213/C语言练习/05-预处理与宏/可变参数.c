#include<stdio.h>
#include<stdarg.h>

int sum(int n, ...)
{
    int sum = 0;
    va_list vap;
    va_start(vap, n);
    for(int i=0;i<n;i++){
        sum += va_arg(vap, int);
    }
    va_end(vap);

    return sum;
}

int main(int argc, char *argv[])
{
    int res;
    res = sum(3, 1, 2, 5);

    printf("%d\n", res);

    return 0;
}