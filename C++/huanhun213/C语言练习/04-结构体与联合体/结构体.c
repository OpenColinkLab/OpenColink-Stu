#include <stdio.h>
#include <stdlib.h>


struct Data
{
    int year;
};
struct Book
{
    char title[128];
    struct Data data;
    int price;
};
void GetInput(struct Book *book)
{
    printf("请输入书名：");
    scanf("%s", (*book).title);
    printf("请输入年: ");
    scanf("%d", &book->data.year);
    printf("请输入价格：");
    scanf("%d", &(*book).price);

}

int main(void)
{
    struct Book *book;
    book = (struct Book *)malloc(sizeof(struct Book));
    if(book == NULL){
        printf("内存分配失败\n");
        exit(1);
    }
    GetInput(book);

    printf("%s\n", (*book).title);
    free(book);
    return 0;
}

