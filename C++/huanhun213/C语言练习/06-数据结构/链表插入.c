#include <stdio.h>
#include <stdlib.h>

struct Node
{
    int num;
    struct Node *next;
};

void insert(struct Node **head, int value)
{
    struct Node *current;
    struct Node *previous = NULL;
    struct Node *new;

    current = *head;
    while(current != NULL && current->num < value){
        previous = current;
        current = current->next;
    }

    new = (struct Node *)malloc(sizeof(struct Node));
    if(new == NULL){
        printf("内存分配失败");
        exit(1);
    }

    new->num = value;
    new->next = current;
    
    if(previous != NULL){
        previous->next = new;
    }
    else{
        *head = new;
    }
}

void delete(struct Node **head, int value)
{
    struct Node *previous;
    struct Node *current;
    
    previous = NULL;
    current = *head;

    while(current != NULL && current->num != value){
        previous = current;
        current = current->next;
    }

    if(current == NULL){
        printf("没找到\n");
        return;
    }
    else{
        if(previous == NULL){
            *head = current->next;
        }
        else{
            previous->next = current->next;
        }
        free(current);
    }
}

void printNode(struct Node *head)
{
    struct Node *temp = head;
    while(temp != NULL){
        printf("%d ", temp->num);
        temp = temp->next;
    }
    printf("\n");

}

int main(void)
{
    struct Node *head = NULL;
    int input = 0;
    while (1)
    {
        printf("请输入一个值：");
        scanf("%d", &input);
        if(input == -1){
            break;
        }
        insert(&head, input);
        printNode(head);
    } 

    while(1)
    {
        printf("请输入要删除的数：");
        scanf("%d", &input);
        if(input == -1){
            break;
        }
        delete(&head, input);
        printNode(head);
    }
    
    return 0;
}