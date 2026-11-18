#include<stdio.h>

#define MAXNUM 100
typedef int ElemType;

typedef struct 
{
    ElemType data[MAXNUM];
    int Length;
}SqeList;

void InitSqe(SqeList *L)
{
    L -> Length = 0;
}

int appendSqe(SqeList *L, ElemType data)
{
    if(L->Length >= MAXNUM){
        printf("数据已满\n");
        return 0;
    }
    L->data[L->Length] = data;
    L->Length += 1;
    return 1;
}

void ListSqe(SqeList *L)
{
    for (int i = 0; i < L->Length; i++) {
        printf("%d ", L->data[i]);
    }
    printf("/n");
}

int main(int argc, char const *argv[])
{
    SqeList List;
    InitSqe(&List);

    printf("已使用内存%d\n", List.Length);
    printf("内存占用%zu\n",sizeof(List.data));

    appendSqe(&List, 44);
    appendSqe(&List, 44);
    appendSqe(&List, 44);

    ListSqe(&List);

    return 0;
}