#include <stdio.h>

int main() {
    int n = 0;
    int a[100];
    int cha = 0;
    int zengjian[100];
    int zhedian = 0;
    scanf ("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf ("%d", &a[i]); //数组有n个数据
    }
    for (int i = 0; i < n - 1; i++) {
        cha = a[i+1] - a[i];
        if (cha > 0)zengjian[i] = 1; 
        if (cha < 0)zengjian[i] = 0;   //数组有n-1个数据    
    }
    for (int i = 0; i < n - 2; i++) {
        if (zengjian[i+1] != zengjian[i]) {
            zhedian++;
        }
    }
    printf ("%d", zhedian);
    return 0;
}