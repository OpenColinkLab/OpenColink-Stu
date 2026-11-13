
#include "led_cmd.h"          // 借到 Led_Cmd_Init 的对外声明
#include "elshell/elcmd.h"    // 借到 el_cmdd_1p_t、el_cmd_reg、e_elParaType_size32
#include "elshell/elio.h"     // 借到 elprintf
#include "xparameters.h"      // 借到 XPAR_LED_AXI_CTRL_0_BASEADDR（0x43C00000）
#include "xil_io.h"           // 借到 Xil_Out32


static el_cmdd_1p_t fg_cmdLed;				//登记一个1个参数的命令描述结构体
static el_para_type_t fg_cmdLedParaType[ELSHELL_CMD_PARAMETER_MAXNUM] = {
    e_elParaType_size32, e_elParaType_none, e_elParaType_none, e_elParaType_none,
    e_elParaType_none,   e_elParaType_none, e_elParaType_none, e_elParaType_none};	//参数描述表，虽然只使用一个，但是框架按照8个参数读取，其它就写空
static char fg_cmdLedIx[] = "led";				//命令名称
static char fg_cmdLedHelp[] = "/led -d32 <mode>, mode 0..4";		//help

#define LED_MODE_MAX (4U)

static void Led_Cmd_Call(void *f_param_ptr);			//声明回调函数

static void Led_Cmd_Call(void *f_param_ptr)				//void *意在说明这就是一个地址，后面的参数太杂了，没法定义我摆烂了
{
    uint32_t tp_mode = 0;

    if (f_param_ptr == NULL)							//判断非空
    {
        return;
    }

    tp_mode = *(uint32_t *)f_param_ptr;					//直接解引用取值，从参数地址取，只用到了第一个，根据参数描述表，这个是e_elParaType_size32，32位
    													//这就是"参数类型表里写 size32"的兑现时刻：框架按 32 位整数解析了 "3"，存进缓冲区；你按 32 位整数取出来。两边类型必须一致，否则读到的字节会被错误解释（比如 float 和 uint32_t 共用 4 个字节，但解释方式完全不同）。
    if (tp_mode > LED_MODE_MAX)							//合法性判断
    {
        elprintf((const uint8_t *)"led: mode must be 0..%d\n\r", (int32_t)LED_MODE_MAX);
        return;
    }

    Xil_Out32(XPAR_LED_AXI_CTRL_0_BASEADDR, tp_mode);		//执行
    elprintf((const uint8_t *)"led: mode = %d\n\r", (int32_t)tp_mode);
}

el_err_t Led_Cmd_Init(void)
{
    return el_cmd_reg(&fg_cmdLed,        // 1. 登记表地址
                      fg_cmdLedIx,       // 2. 命令名 "led"
                      e_elCmdType_call,  // 3. 这是"调用函数"型命令
                      Led_Cmd_Call,      // 4. 被调用的函数
                      fg_cmdLedHelp,     // 5. 帮助信息
                      1,                 // 6. 参数个数
                      fg_cmdLedParaType);// 7. 参数类型表
}
