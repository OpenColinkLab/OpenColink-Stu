#include<stdio.h>
#include<string.h>

typedef int (*cmd_func)(int argc, char *argv[]);

typedef struct
{
    const char *name;
    cmd_func func;
    const char *desc;
}cmd_t;

int cmd_hello(int argc, char *argv[])
{
    printf("Hello\n");
    return 0;
}

int cmd_goodbye(int argc, char *argv[])
{
    printf("GoodBye\n");
    return 0;
}

cmd_t Table[] = {
    {"hello", cmd_hello, "say hello"},
    {"goodbye", cmd_goodbye, "say goodbye"}
};

#define CMD_SIZE (sizeof(Table) / sizeof(Table[0]))

void run_command(char *line)
{
    char *argv[8];
    int argc = 0;
    char *p = strtok(line, " ");
    while(p){
        argv[argc++] = p;
        p = strtok(NULL, " ");
    }

    if(argc == 0) return;

    for(int i = 0; i < CMD_SIZE; i++){
        if(strcmp(argv[0], Table[i].name) == 0){
            Table[i].func(argc, argv);
            return;
        }
    }

    printf("command not found: %s\n", argv[0]);
}