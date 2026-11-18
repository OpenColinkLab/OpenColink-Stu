#include <stdio.h>
#include <stdlib.h>


int main(int argc, char const *argv[])
{
    int *arr = (int *)malloc(sizeof(int) * 5);
    for(int i=0; i < 5; i ++){
        arr[i] = i;
    }
    for(int i=0; i < 5; i++){
        printf("%s/n", arr[i]);
    }

    free(arr);
    return 0;
}

