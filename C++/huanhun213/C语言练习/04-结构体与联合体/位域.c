#include <stdio.h>

int main(void)
{
    typedef struct 
    {
        int a:2;
        int b:2;
        int c:3;
    } Test;

    Test test;
    test.a = 1;
    test.b = 3;
    test.c = 3;

    printf("%d\n", (int)sizeof(Test));
    printf("%d %d %d", test.a, test.b, test.c);
    
    return 0;
}