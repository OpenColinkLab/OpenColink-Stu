
/*
高地址
┌──────────────────────┐
│      栈 Stack         │  ↓ 向下增长（局部变量、函数参数、返回地址）
│        ···            │
│                       │
│        ···            │
│      堆 Heap          │  ↑ 向上增长（malloc / calloc / realloc）
├──────────────────────┤
│      BSS 段           │  未初始化（或=0）的全局/静态变量，自动清零
├──────────────────────┤
│      Data 数据段      │  已初始化的全局变量、静态变量
├──────────────────────┤
│   Rodata 只读常量区    │  字符串字面量、const 只读数据
├──────────────────────┤
│      Text 代码区      │  函数的机器指令，只读
└──────────────────────┘
低地址
*/
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *ptr1 = NULL;
    int *ptr2 = NULL;

    ptr1 = (int *)malloc(sizeof(int));
    ptr2 = (int *)malloc(sizeof(int));

    printf("Stack ptr1:%p ,ptr2:%p\n", &ptr1, &ptr2);
    printf("Heap ptr1:%p, ptr2:%p\n", ptr1, ptr2);

    ptr1 = (int *)realloc(ptr1, 10 * sizeof(int));
    printf("Heap ptr1:%p, ptr2:%p\n", ptr1, ptr2);

    return 0;
    
}