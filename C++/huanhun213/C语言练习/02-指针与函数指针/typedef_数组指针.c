#include <stdio.h>

typedef int (*POINT_TO_ARR)[3];

int main(void)
{
    int arr[] = {
        1, 2, 3
    };
    POINT_TO_ARR ptr;
    ptr = &arr;
    for(int i=0;i<3;i++){
        printf("%d ", (*ptr)[i]);
    }

    return 0;
}