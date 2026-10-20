/**
 * @file  cmd.h
 * @brief Shell command parser interface.
 */
#ifndef __CMD_H__
#define __CMD_H__

/**
 * @brief  Execute one command line
 * @param  f_line  a zero terminated line without the trailing CR/LF
 * @return 0 on success, -1 on parse or usage error
 */
int Cmd_Execute(char *f_line);

#endif /* __CMD_H__ */
