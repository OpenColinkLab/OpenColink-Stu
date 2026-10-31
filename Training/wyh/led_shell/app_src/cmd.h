/* cmd.h - 自定义命令声明，函数签名固定为 int f(int argc, char *argv[]) */
#ifndef __CMD_H__
#define __CMD_H__

int Cmd_Led(int f_argc, char *f_argv[]);      /* led <0-5> */
int Cmd_Status(int f_argc, char *f_argv[]);   /* status */
int Cmd_Hello(int f_argc, char *f_argv[]);    /* hello */
int Cmd_Demo(int f_argc, char *f_argv[]);     /* demo */

#endif /* __CMD_H__ */
