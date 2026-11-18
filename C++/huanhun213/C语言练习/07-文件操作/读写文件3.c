#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct
{
    char name[128];
    int price;
}Book;

int main(void)
{
    Book *book_w = NULL;
    Book *book_r = NULL;
    book_w = (Book *)malloc(sizeof(Book));
    if(book_w == NULL){
        printf("内存分配失败\n");
        exit(1);
    }
    strcpy(book_w->name, "我的大学");
    book_w->price = 123;

    FILE *ptr;
    if((ptr = fopen("file.txt", "w")) == NULL){
        printf("文件打开失败\n");
        exit(EXIT_FAILURE);
    }

    fwrite(book_w, sizeof(Book), 1, ptr);
    fclose(ptr);

    if((ptr = fopen("file.txt", "r")) == NULL){
        printf("文件打开失败\n");
        exit(EXIT_FAILURE);
    }

    fread(book_r, sizeof(Book), 1, ptr);
    printf("name:%s, price:%d\n", book_r->name, book_r->price);

    return 0;
}