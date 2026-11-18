#include "main.h"
#include "shell.h"
#include <string.h>

#define CMD_MAX_ARGS 8

/* ---- 命令函数：签名必须和 cmd_fn 一致 ---- */
static void cmd_help(int argc, char **argv);
static void cmd_led(int argc, char **argv);

/* 学生管理命令定义在 main.c（它要直接访问 students 数组），这里只做声明 */
extern void cmd_stu(int argc, char **argv);

/* ---- 命令表：以后加命令，只需要在这里加一行 ---- */
static const Command g_cmds[] = {
    { "help", cmd_help, "help                 list all commands" },
    { "led",  cmd_led,  "led on|off|toggle    control PC13 LED" },
    { "stu",  cmd_stu,  "stu add|get|del|set|list|clr   manage students" },
};
#define CMD_COUNT (sizeof(g_cmds) / sizeof(g_cmds[0]))

/* ---- help：把所有命令列出来 ---- */
static void cmd_help(int argc, char **argv)
{
		for (int i=0;i<CMD_COUNT;i++){
         UART_Send(g_cmds[i].name);
         UART_Send("  ");
         UART_Send(g_cmds[i].help);
         UART_Send("\r\n");
		}
}

/* ---- led：控制 PC13（低电平点亮） ---- */
static void cmd_led(int argc, char **argv)
{
    if (argc < 2){
		UART_Send("usage: led on|off|toggle\r\n"); return;
		}
		if(strcmp(argv[1],"on")==0){
			UART_Send("OK,led on\r\n");
		HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_RESET);
}
		else if (strcmp(argv[1],"off")==0){
			HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_SET);
		UART_Send("OK,led off\r\n");}
		else if(strcmp(argv[1],"toggle")==0){
		HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
		UART_Send("OK,led toggled\r\n");}
		else UART_Send("ERR: unknown option\r\n");
		

}

/* ---- 分发：查表 + 调用函数指针 ---- */
int Shell_Exec(char *line)
{
    char *argv[CMD_MAX_ARGS];
    int argc = 0;

    /* 按空格 / 制表符把整行切成若干段 */
    char *tok = strtok(line, " \t");
    while (tok != NULL && argc < CMD_MAX_ARGS) {
        argv[argc++] = tok;
        tok = strtok(NULL, " \t");
    }

    if (argc == 0) {
        return 1;              /* 空行：当作已处理，不回应 */
    }

    for (int i=0;i<CMD_COUNT;i++){
			if(strcmp(argv[0], g_cmds[i].name) == 0){
		g_cmds[i].fn(argc, argv);
			return 1;}
		}
	

    return 0;       
}
