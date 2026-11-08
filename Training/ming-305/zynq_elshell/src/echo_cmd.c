#include "echo_cmd.h"
#include "elshell/elcmd.h"
#include "elshell/elio.h"     // 借到 elprintf


static el_cmdd_1p_t fg_cmdEcho;				//登记一个1个参数的命令描述结构体
static el_para_type_t fg_cmdEchoParaType[ELSHELL_CMD_PARAMETER_MAXNUM] = {
		e_elParaType_string, e_elParaType_none, e_elParaType_none, e_elParaType_none,
    e_elParaType_none,   e_elParaType_none, e_elParaType_none, e_elParaType_none};	//参数描述表，虽然只使用一个，但是框架按照8个参数读取，其它就写空
static char fg_cmdEchoIx[] = "echo";				//命令名称
static char fg_cmdEchoHelp[] = "/echo -s <string>";		//help

static void Echo_Cmd_Call(void *f_param_ptr);			//声明回调函数

static void Echo_Cmd_Call(void *f_param_ptr)				//void *意在说明这就是一个地址，后面的参数太杂了，没法定义我摆烂了
{
	char* f_ptr;

    if (f_param_ptr == NULL)							//判断非空
    {
        return;
    }

    f_ptr=(char*)f_param_ptr;

    elprintf((const uint8_t *)" %s\n\r", (char*)f_ptr);
}

el_err_t Echo_Cmd_Init(void)
{
    return el_cmd_reg(&fg_cmdEcho,        // 1. 登记表地址
    				  fg_cmdEchoIx,       // 2. 命令名 "echo"
                      e_elCmdType_call,  // 3. 这是"调用函数"型命令
                      Echo_Cmd_Call,      // 4. 被调用的函数
                      fg_cmdEchoHelp,     // 5. 帮助信息
                      1,                 // 6. 参数个数
                      fg_cmdEchoParaType);// 7. 参数类型表
}
