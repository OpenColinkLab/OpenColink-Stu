/**
 * @file  cmd.c
 * @brief A very small command parser.  The line is cut into words by spaces,
 *        the first word is looked up in the command table and the rest of the
 *        words are passed to the command as arguments.
 *
 *        Commands:
 *            help           list all commands
 *            led <0-5>      change the LED action
 *            status         show the current LED mode
 */
#include "cmd.h"
#include "led.h"
#include "uart.h"
#include "helloworld.h"

#define CMD_MAX_ARGS    4
#define CMD_TABLE_SIZE  (sizeof(fg_cmdTable) / sizeof(fg_cmdTable[0]))

typedef int (*Cmd_Func_t)(int f_argc, char *f_argv[]);

typedef struct {
    const char *m_name;     /* command name */
    Cmd_Func_t  m_func;     /* handler */
    const char *m_help;     /* one line help text */
} Cmd_Item_t;

static int Cmd_Help(int f_argc, char *f_argv[]);
static int Cmd_Hello(int f_argc, char *f_argv[]);
static int Cmd_Led(int f_argc, char *f_argv[]);
static int Cmd_Status(int f_argc, char *f_argv[]);
static int Str_Equal(const char *f_left, const char *f_right);

/* command table */
static const Cmd_Item_t fg_cmdTable[] = {
    { "help",   Cmd_Help,   "list all commands" },
    { "hello",  Cmd_Hello,  "print Hello World (prerequisite task)" },
    { "led",    Cmd_Led,    "led <0-5> : 0 off, 1 blink 1s, 2 blink 2s, 3/4/5 pwm 1/2/3" },
    { "status", Cmd_Status, "show the current LED mode" }
};

/**
 * @brief  Split the line into words and call the matching command
 * @param  f_line  a zero terminated line
 * @return 0 on success, -1 on error
 */
int Cmd_Execute(char *f_line)
{
    char *argv[CMD_MAX_ARGS];
    char *tp_ptr;
    int   tp_argc = 0;
    int   ix_cmd;

    tp_ptr = f_line;
    while ((*tp_ptr != '\0') && (tp_argc < CMD_MAX_ARGS)) {
        while ((*tp_ptr == ' ') || (*tp_ptr == '\t')) {
            tp_ptr++;
        }
        if (*tp_ptr == '\0') {
            break;
        }
        argv[tp_argc] = tp_ptr;
        tp_argc++;
        while ((*tp_ptr != '\0') && (*tp_ptr != ' ') && (*tp_ptr != '\t')) {
            tp_ptr++;
        }
        if (*tp_ptr != '\0') {
            *tp_ptr = '\0';
            tp_ptr++;
        }
    }

    if (tp_argc == 0) {
        return -1;
    }

    for (ix_cmd = 0; ix_cmd < (int)CMD_TABLE_SIZE; ix_cmd++) {
        if (Str_Equal(fg_cmdTable[ix_cmd].m_name, argv[0])) {
            return fg_cmdTable[ix_cmd].m_func(tp_argc, argv);
        }
    }

    Uart_PutString("unknown command: ");
    Uart_PutString(argv[0]);
    Uart_PutString("\r\n");
    return -1;
}

/**
 * @brief  Compare two strings
 * @param  f_left  first string
 * @param  f_right second string
 * @return 1 when equal, 0 otherwise
 */
static int Str_Equal(const char *f_left, const char *f_right)
{
    while ((*f_left != '\0') && (*f_right != '\0')) {
        if (*f_left != *f_right) {
            return 0;
        }
        f_left++;
        f_right++;
    }
    return (*f_left == *f_right) ? 1 : 0;
}

/**
 * @brief  help : list all commands
 */
static int Cmd_Help(int f_argc, char *f_argv[])
{
    int ix_cmd;

    (void)f_argc;
    (void)f_argv;

    Uart_PutString("commands:\r\n");
    for (ix_cmd = 0; ix_cmd < (int)CMD_TABLE_SIZE; ix_cmd++) {
        Uart_PutString("  ");
        Uart_PutString(fg_cmdTable[ix_cmd].m_name);
        Uart_PutString(" - ");
        Uart_PutString(fg_cmdTable[ix_cmd].m_help);
        Uart_PutString("\r\n");
    }
    return 0;
}

/**
 * @brief  led <0-5> : change the LED action
 */
static int Cmd_Led(int f_argc, char *f_argv[])
{
    int tp_mode;

    if (f_argc != 2) {
        Uart_PutString("usage: led <0-5>\r\n");
        return -1;
    }

    /* only one decimal digit is accepted */
    if ((f_argv[1][0] < '0') || (f_argv[1][0] > '9') || (f_argv[1][1] != '\0')) {
        Uart_PutString("mode must be a number from 0 to 5\r\n");
        return -1;
    }

    tp_mode = (int)(f_argv[1][0] - '0');
    if (Led_SetMode(tp_mode) != 0) {
        Uart_PutString("mode must be a number from 0 to 5\r\n");
        return -1;
    }

    Uart_PutString("led mode = ");
    Uart_PutChar((char)('0' + tp_mode));
    Uart_PutString("\r\n");
    return 0;
}

/**
 * @brief  hello : print Hello World on the UART (prerequisite task)
 */
static int Cmd_Hello(int f_argc, char *f_argv[])
{
    (void)f_argc;
    (void)f_argv;

    Hello_World_Print();
    return 0;
}

/**
 * @brief  status : show the current LED mode
 */
static int Cmd_Status(int f_argc, char *f_argv[])
{
    (void)f_argc;
    (void)f_argv;

    Uart_PutString("led mode = ");
    Uart_PutChar((char)('0' + Led_GetMode()));
    Uart_PutString("\r\n");
    return 0;
}
