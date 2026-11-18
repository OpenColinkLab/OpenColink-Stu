#include <stdio.h>
#include <stdlib.h>

#define NUM 3

typedef struct 
{
    char name[128];
    int score;
}Stu;

int main(void)
{
    Stu stu[NUM];
    Stu sb;
    printf("请开始录入学生成绩：(名字 成绩)\n");
    for(int i=0;i<NUM;i++){
        scanf("%s %d", stu[i].name, &stu[i].score);
    }

    FILE *ptr;
    if((ptr = fopen("score.txt", "w")) == NULL){
        printf("文件打开失败\n");
        exit(EXIT_FAILURE);
    }

    fwrite(stu, NUM * sizeof(Stu), NUM, ptr);
    fclose(ptr);

    if((ptr = fopen("score.txt", "r")) == NULL){
        printf("文件打开失败\n");
        exit(EXIT_FAILURE);
    }

    fseek(ptr, sizeof(Stu), SEEK_SET);
    fread(&sb, sizeof(Stu), 1, ptr);

    printf("name:%s, score:%d\n", sb.name, sb.score);
    fclose(ptr);

    return 0;
}
