#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Book
{
    char title[128];
    int price;
    struct Book *next;
};

void getInput(struct Book *book)
{
    printf("请输入书名：");
    scanf("%s", book ->title);
    printf("请输入价格：");
    scanf("%d", &book->price);

}

void addBook_head(struct Book **library)
{
    struct Book *temp;
    struct Book *book;
    book = (struct Book *)malloc(sizeof(struct Book));
    if(book == NULL){
        printf("内存分配失败");
        exit(1);
    }
    temp = *library;
    getInput(book);
    *library = book;
    book->next = temp;
}

void addBook_tail(struct Book **library)
{
    struct Book *book;
    static struct Book *tail;
    book = (struct Book *)malloc(sizeof(struct Book));
    if(book == NULL){
        printf("内存分配失败\n");
        exit(1);
    }
    getInput(book);

    if(*library != NULL){
        tail->next = book;
        book->next = NULL;
    }
    else{
        *library = book;
        book->next = NULL;
    }
    tail = book;
}

struct Book*searchBook(struct Book *library, char *tar)
{
    struct Book *book = library;
    
    while(book != NULL){
        if(strcmp(book->title, tar)){
            book = book->next;
        }
        else{
            return book;
        }
    }
    printf("没找到\n");
    return NULL;
}

void printLibrary(struct Book *library)
{
    int count = 1;
    struct Book *index = library;
    while(index != NULL){
        printf("Book%d, title:%s, price:%d\n", count, index->title, index->price);
        index = index->next;
        count ++;
    }
    
}
void printBook(struct Book *book)
{
    printf("书名：%s, 价格：%d\n", book->title, book->price);
}

void freeLibrary(struct Book **library)
{
    struct Book *temp;
    while((*library)->next != NULL){
        temp = *library;
        *library = (*library)->next;
        free(temp);
    }
}

int main(void)
{
    char c;
    struct Book *library = NULL;
    struct Book *tail = NULL;

    while(1){
        printf("是否要添加书籍(Y/N)？");
        do
        {
            scanf("%c", &c);
        } while (c != 'N' && c != 'Y');
        if(c == 'Y'){
            addBook_head(&library);
        }
        else{
            break;
        }
    }
        
    printf("是否要广播书籍(Y/N)？");
    do
    {
        scanf("%c", &c);
    } while (c != 'N' && c != 'Y');
    if(c == 'Y'){
        printLibrary(library);
    }
    printf("请输入你要找的书名：");
    char s[128];
    struct Book *tar;
    scanf("%s", s);
    tar = searchBook(library, s);
    if(tar != NULL){
        printBook(tar);
    }

    freeLibrary(&library);

    return 0;
}