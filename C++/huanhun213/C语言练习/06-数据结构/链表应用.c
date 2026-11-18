#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 1024

struct People 
{
    char name[128];
    long num;
    struct People *next;
};

struct People *pool = NULL;
int count;

void printPeo(struct People *peo);

void getInput(struct People *peo)
{
    printf("请输入联系人姓名：");
    scanf("%s", peo->name);
    printf("请输入联系人电话：");
    scanf("%ld", &peo->num);

}

void addPeople(struct People **head)
{
    struct People *peo;
    struct People *temp;

    if(pool != NULL){
        peo = pool;
        pool = pool->next;
        count--;
    }
    else{
        peo = (struct People *)malloc(sizeof(struct People));
        if(peo ==NULL){
            printf("内存分配失败\n");
            exit(1);
        }
    }
    
    getInput(peo);

    temp = *head;
    *head = peo;
    peo->next = temp;

}

void searchPeo(struct People *head)
{
    char name[128];
    printf("请输入要查找的人名：");
    scanf("%s", name);

    struct People *index;
    index = head;

    while(index != NULL){
        if(!strcmp(index->name, name)){
           printPeo(index);
           return;
        }
        index = index->next;
    }
    printf("没找到\n");
}

void changePeo(struct People *head)
{
    char name[128];
    long num=0;
    printf("请输入要改变的人名：");
    scanf("%s", name);
    
    struct People *index;
    index = head;
    while(index != NULL){
        if(!strcmp(index->name, name)){
            printf("请输入新的电话号码：");
            scanf("%ld", &num);
            index->num = num;
            return;
        }
        index = index->next;
    }
    printf("人名不存在\n");
}

void delPeo(struct People **head)
{
    char name[128];
    printf("请输入要删除的联系人：");
    scanf("%s", name);

    struct People *previous;
    struct People *current;
    current = *head;
    previous = NULL;
    while(current != NULL && (strcmp(current->name, name) != 0)){
        previous = current;
        current = current->next;
    }
    if(current == NULL){
        printf("人名不存在\n");
    }
    else{
        if(previous == NULL){
            *head = current->next;
        }
        else{
            previous->next = current->next;
        }
        if(count < MAX){
            if(pool != NULL){
                struct People *temp = pool;
                pool = current;
                current->next = temp;
            }
            else{
                pool = current;
                current->next = NULL;
            }
            count ++;
        }
        else{
            free(current);
        }
    }
}

void printPeo(struct People *peo)
{
    if(peo != NULL){
        printf("人名：%s, 电话号码：%ld\n", peo->name, peo->num);
    }
}

void printList(struct People *head)
{
    struct People *index;
    index = head;
    while(index != NULL){
        printPeo(index);
        index = index->next;
    }
}

void freeList(struct People **head)
{
    struct People *temp;
    while((*head) != NULL){
        temp = *head;
        *head = (*head)->next;
        free(temp);
    }
}

void freePool(void)
{
    struct People *temp;
    while(pool != NULL){
        temp = pool;
        pool = pool->next;
        free(temp);
    }
}

int main(void)
{
    int input = 0;
    struct People *head = NULL;
    int running = 1;

    printf("1:添加联系人\n"
           "2:查找已有联系人\n"
           "3:更改已有联系人\n"
           "4:删除已有联系人\n"
           "5:显示通讯录\n"
           "6:退出通讯录\n");
    while(running){
        printf("请输入指令：");
        if (scanf("%d", &input) != 1) {     
            while (getchar() != '\n') ;
            printf("请输入有效的数字指令\n");
            continue;
        }
        switch (input)
        {
        case 1:
            addPeople(&head);
            break;
        case 2:
            searchPeo(head);
            break;
        case 3:
            changePeo(head);
            break;
        case 4:
            delPeo(&head);
            break;
        case 5:
            printList(head);
            break;
        case 6:
            running = 0;
            break;
        default:
            break;
        }
    }

    freeList(&head);
    freePool();
    
    return 0;
}