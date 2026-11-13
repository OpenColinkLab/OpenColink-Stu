
#include "ledr_cmd.h"          // 借到 Ledr_Cmd_Init 的对外声明
#include "elshell/elcmd.h"    // 借到 el_cmdd_0p_t、el_cmd_reg
#include "elshell/elio.h"     // 借到 elprintf
#include "xparameters.h"      // 借到 XPAR_LED_AXI_CTRL_0_BASEADDR（0x43C00000）
#include "xil_io.h"           // 借到 Xil_In32


static el_cmdd_0p_t fg_cmdLedr;				//登记一个0个参数的命令描述结构体
static el_para_type_t fg_cmdLedrParaType[ELSHELL_CMD_PARAMETER_MAXNUM] = {
		e_elParaType_none, e_elParaType_none, e_elParaType_none, e_elParaType_none,
    e_elParaType_none,   e_elParaType_none, e_elParaType_none, e_elParaType_none};	//参数描述表，虽然只使用一个，但是框架按照8个参数读取，其它就写空
static char fg_cmdLedrIx[] = "ledr";				//命令名称
static char fg_cmdLedrHelp[] = "/ledr, no param, read back current mode";		//help


static void Ledr_Cmd_Call(void);			//声明回调函数

static void Ledr_Cmd_Call(void)				//void *意在说明这就是一个地址，后面的参数太杂了，没法定义我摆烂了
{
    uint32_t tp_mode = 0;

    tp_mode=Xil_In32(XPAR_LED_AXI_CTRL_0_BASEADDR );		//执行
    elprintf((const uint8_t *)"ledr: mode = %d\n\r", (int32_t)tp_mode);
}

el_err_t Ledr_Cmd_Init(void)
{
    return el_cmd_reg(&fg_cmdLedr,        // 1. 登记表地址
                      fg_cmdLedrIx,       // 2. 命令名 "led"
                      e_elCmdType_call,  // 3. 这是"调用函数"型命令
                      Ledr_Cmd_Call,      // 4. 被调用的函数
                      fg_cmdLedrHelp,     // 5. 帮助信息
                      0,                 // 6. 参数个数
                      fg_cmdLedrParaType);// 7. 参数类型表
}
