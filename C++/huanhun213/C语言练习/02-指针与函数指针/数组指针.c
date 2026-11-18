#include<stdio.h>

int main(int argc, char *argv[])
{
    int arr[][3] = {
        {1, 2, 3},
        {1, 2, 30},
        {1, 2, 3}
    };

    int (*p)[3] = arr;

    for(int i=0;i<3;i++){
        for(int j=0;j<3;j++){
            printf("%d ",*(*(p+i)+j));
        }
        printf("\n");
    }

    return 0;
}