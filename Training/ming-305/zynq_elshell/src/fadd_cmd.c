#include "fadd_cmd.h"
#include "elshell/elcmd.h"
#include "elshell/elio.h"     // 借到 elprintf

static el_cmdd_2p_t fg_cmdFadd;				//登记一个2个参数的命令描述结构体
static el_para_type_t fg_cmdFaddParaType[ELSHELL_CMD_PARAMETER_MAXNUM] = {
		e_elParaType_float, e_elParaType_float, e_elParaType_none, e_elParaType_none,
    e_elParaType_none,   e_elParaType_none, e_elParaType_none, e_elParaType_none};	//参数描述表，虽然只使用2个，但是框架按照8个参数读取，其它就写空
static char fg_cmdFaddIx[] = "fadd";				//命令名称
static char fg_cmdFaddHelp[] = "/fadd -f <float> -f <float>";		//help

static void Fadd_Cmd_Call(void *f_param_ptr_1,void *f_param_ptr_2)	;			//声明回调函数

static void Fadd_Cmd_Call(void *f_param_ptr_1,void *f_param_ptr_2)				//void *意在说明这就是一个地址，后面的参数太杂了，没法定义我摆烂了
{
	float f_1,f_2,sum;

    if ((f_param_ptr_1 == NULL)||(f_param_ptr_2 == NULL))							//判断非空
    {
        return;
    }

    f_1=*(float*)f_param_ptr_1;
    f_2=*(float*)f_param_ptr_2;
    sum=f_1+f_2;

    elprintf((const uint8_t *)" %f\n\r", sum);
}

el_err_t Fadd_Cmd_Init(void)
{
	//把地址信息传给他用于注册
    return el_cmd_reg(&fg_cmdFadd,        // 1. 登记表地址
    				  fg_cmdFaddIx,       // 2. 命令名 "fadd"
                      e_elCmdType_call,  // 3. 这是"调用函数"型命令
                      Fadd_Cmd_Call,      // 4. 被调用的函数
                      fg_cmdFaddHelp,     // 5. 帮助信息
                      2,                 // 6. 参数个数
                      fg_cmdFaddParaType);// 7. 参数类型表
}
