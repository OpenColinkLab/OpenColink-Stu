#include "help_cmd.h"
#include "elshell/elcmd.h"
#include "elshell/elhash.h"   // 遍历宏和 el_hash_node_t 在这里
#include "elshell/elio.h"

static el_cmdd_0p_t fg_cmdHelp;
static el_para_type_t fg_cmdHelpParaType[ELSHELL_CMD_PARAMETER_MAXNUM] = {0};
static char fg_cmdHelpIx[] = "help";
static char fg_cmdHelpHelp[] = "/help, list all commands";

static void Help_Cmd_Call(void)
{
    el_hash_node_t *tp_node_ptr = NULL;
    el_hash_node_t *tp_tmp_ptr = NULL;

    elprintf((const uint8_t *)"--- commands ---\n\r");

    el_hash_table_foreach_safe(g_el_cmd_hashTable_ptr, tp_node_ptr, tp_tmp_ptr)
    {
        el_cmdd_8p_t *tp_cmd_ptr = (el_cmdd_8p_t *)tp_node_ptr->m_val_ptr;

        elprintf((const uint8_t *)"/%s  %s\n\r",
                 tp_cmd_ptr->m_cmdIx,
                 (tp_cmd_ptr->m_cmdHelp_ptr == NULL) ? "no desc" : tp_cmd_ptr->m_cmdHelp_ptr);
    }
}

el_err_t Help_Cmd_Init(void)
{
    return el_cmd_reg(&fg_cmdHelp,
                      fg_cmdHelpIx,
                      e_elCmdType_call,
                      Help_Cmd_Call,
                      fg_cmdHelpHelp,
                      0,
                      fg_cmdHelpParaType);
}
