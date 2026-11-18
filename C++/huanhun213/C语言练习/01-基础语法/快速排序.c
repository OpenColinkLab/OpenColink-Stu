#include <stdio.h>

void swap(int *a, int *b)
{
    int temp = *a;
    *a = *b;
    *b = temp;
}

int partition(int arr[], int left, int right)
{
    int mid = left + (right - left) / 2;
    int pivot = arr[mid];
    int i = left, j = right;

    while(i <= j){
        while(arr[i] < pivot) i++;
        while(arr[j] > pivot) j --;

        if(i <= j){
            swap(&arr[i], &arr[j]);
            i ++;
            j --;
        }
    }
    return i;
}

void quick_sort(int arr[], int left, int right)
{
    if(left >= right){
        return;
    }
    int pos = partition(arr, left, right);
    quick_sort(arr, left, pos - 1);
    quick_sort(arr, pos, right);
}

int main(void)
{
    int arr[] = {12, 45, 85, 25, 465, 1, 20};
    int n = sizeof(arr) / sizeof(arr[0]);
    quick_sort(arr, 0, n - 1);

    for(int i = 0; i < n; i++){
        printf("%d ", arr[i]);
    }

    return 0;
}