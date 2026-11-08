/*---------------------------*\
			Include
\*---------------------------*/
#include "elshell.h"
#include "elq.h"
#include "elio.h"

#ifdef __cplusplus
extern "C"
{
#endif // Compatible C++

#ifdef DEBUG_LOCAL_LOG_OUTPUT
#undef DEBUG_LOCAL_LOG_OUTPUT
#endif
#ifdef LOCAL_PRINTF
#undef LOCAL_PRINTF
#endif
#define DEBUG_LOCAL_LOG_OUTPUT 1
#if (DEBUG_LOCAL_LOG_OUTPUT == 1)
#define LOCAL_PRINTF elprintf
#else
#define LOCAL_PRINTF
#endif

	/*-------------------------------------------------------*\
						  Static PV
	\*-------------------------------------------------------*/

	/**
	 * @brief 鍛戒护娴佹帴鏀剁紦鍐插尯
	 * @note 姝ょ紦鍐插尯渚濋潬涓柇鎴栬疆璇㈡帴鏀剁敤鎴峰瓧绗﹀懡浠�,涓ょ闇�瑕佷复鐣屽尯淇濇姢
	 */
	static elq_elrecv_t fg_elrecvq;
	static elq_elrecv_t *fg_elrecvq_ptr = &fg_elrecvq;

	/**
	 * @brief EL Shell鐘舵��
	 * @param fg_curStatus
	 *        鏈夋晥鍙傛暟:
	 *        - \b e_elshellStatus_err
	 *        - \b e_elshellStatus_idle
	 *        - \b e_elshellStatus_getting
	 *        - \b e_elshellStatus_got
	 * @note
	 */
	static el_shell_status_t fg_curStatus = e_elshellStatus_idle;

	/**
	 * @brief 鍛戒护鏄惁姝ｅ湪澶勭悊
	 * @note 鐢变簬姣忎唤鍛戒护鍙傛暟缂撳啿鍖轰粎涓�浠�,鍥犳鍚屼竴鍛戒护涓嶅彲閲嶅叆
	 */
	static el_bool_t fg_isCmdProcBusy = EL_FALSE;

	/**
	 * @brief 寰呭鐞嗗懡浠ら槦鍒�
	 * @note 宸茬粡鏂█瀹屾瘯鐨勫懡浠や細杩涘叆姝ら槦鍒楃瓑寰呭鐞�
	 */
	static elq_elproc_t fg_elCmdWaitProcQ;
	static elq_elproc_t *fg_elCmdWaitProcQ_ptr = &fg_elCmdWaitProcQ;

	/*-------------------------------------------------------*\
					Static fun declaration
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
					Static function body
	\*-------------------------------------------------------*/

	/*-------------------------------------------------------*\
					Extern function body
	\*-------------------------------------------------------*/

	/**
	 * @brief 鍒濆鍖朎LShell
	 * @param f_xxx xxx
	 *        鏈夋晥鍙傛暟:
	 *        - \b XXX
	 * @return None
	 * @note
	 */
	el_err_t ELShell_Init(void)
	{

		el_err_t r = e_el_eok;
		// 鍒濆鍖栧瓧绗︽帴鏀堕槦鍒�
		eladp_elcrtsec_start();
		elq_init(fg_elrecvq_ptr, ELSHELL_RX_QUEUE_SIZE);
		if (fg_elrecvq_ptr->m_q_errCode != EL_QEOK)
		{
			eladp_elcrtsec_end();
			return e_el_error;
		}

		// 鍒濆鍖栧懡浠ゅ緟鎵ц闃熷垪
		elq_init(fg_elCmdWaitProcQ_ptr, ELSHELL_CMD_WAIT_PROC_QUEUE_SIZE);
		if (fg_elCmdWaitProcQ_ptr->m_q_errCode != EL_QEOK)
		{
			eladp_elcrtsec_end();
			return e_el_error;
		}

		// 鍒濆鍖栨帴鏀跺拰鎵ц鐘舵�佹満鐘舵��
		fg_curStatus = e_elshellStatus_idle;
		fg_isCmdProcBusy = EL_FALSE;

		// 鍒濆鍖栧懡浠ゅ搱甯岃〃
		r = _el_cmd_init();
		if (r != e_el_eok)
		{
			eladp_elcrtsec_end();
			return e_el_error;
		}
		eladp_elcrtsec_end();

		return e_el_eok;
	}

	/**
	 * @brief 灏嗘帴鏀跺埌鐨勫瓧绗︽祦鍏ラ槦 fg_elrecvq_ptr 骞跺鐞嗗懡浠ょ姸鎬佹満
	 * @param f_c 鎺ユ敹鍒扮殑鍗曚釜瀛楃
	 *        鏈夋晥鍙傛暟:
	 *        - \b f_c: 浠绘剰瀛楃锛岄�氬父涓轰覆鍙ｆ帴鏀剁殑瀛楄妭锛屾敮鎸� ES_C_SOC ('/') ES_C_EOC ('\r') 绛夋帶鍒跺瓧绗�
	 * @return el_err_t 鎿嶄綔缁撴灉
	 *         - \b e_el_eok: 瀛楃鍏ラ槦鎴栧鐞嗘垚鍔�
	 *         - \b e_el_evalid: 鍛戒护鏍煎紡閿欒(濡傜己灏� ES_C_LBOOC)
	 *         - \b e_el_error: 闃熷垪鎿嶄綔澶辫触鎴栧懡浠ゆ棤鏁�
	 *         - \b e_el_e::鍛戒护缂撳啿鍖烘弧(涓婁竴鍛戒护鏈鐞嗗畬鎴�)
	 * @note
	 *       - 璇ュ嚱鏁板湪涓柇涓婁笅鏂囦腑鎵ц锛屽簲灏介噺鍑忓皯澶勭悊鏃堕棿
	 *       - 涓嶅缓璁緭鍑鸿皟璇曚俊鎭�(浠呭缓璁繚鐣欓敊璇緭鍑�)
	 *       - 渚濊禆 fg_elrecvq_ptr(鎺ユ敹闃熷垪)鍜� fg_elCmdWaitProcQ_ptr(寰呮墽琛屽懡浠ら槦鍒�)
	 *       - 鐘舵�佹満鏀寔浠ヤ笅鐘舵��:
	 *         - \b e_elshellStatus_idle: 绌洪棽锛岀瓑寰呭懡浠よ捣濮嬪瓧绗� ES_C_SOC
	 *         - \b e_elshellStatus_getting: 姝ｅ湪鏀堕泦鍛戒护瀛楃
	 *         - \b e_elshellStatus_got: 鍛戒护瀹屾暣鎺ユ敹锛屽噯澶囧鐞�
	 *         - \b e_elshellStatus_err: 閿欒鐘舵�侊紝闇�閲嶇疆
	 *       - 鍛戒护鏍煎紡:`[SOC][CMD][SBP][SOP][PF][SBP][P0]...[SBP][SOP][PF][SBP][Pn][LBOOC][EOC]`,[LBOOC]鍙兘涓嶅瓨鍦�
	 *       - 鑻ヤ笂涓�鍛戒护鏈墽琛屽畬锛屽悓涓�鍛戒护浼氳Е鍙戦敊璇�(鏃犻澶栫紦鍐插尯)
	 *       - 浣跨敤 eladp_elcrtsec_start/end 杩涜涓寸晫鍖轰繚鎶わ紝纭繚绾跨▼瀹夊叏
	 *       - 閿欒澶勭悊鍚庢竻绌烘帴鏀堕槦鍒楀苟閲嶇疆鐘舵�佷负 idle
	 */
	el_err_t ELShell_Recv_Enq(char f_c)
	{
		eladp_elcrtsec_start(recv);

		if (fg_curStatus == e_elshellStatus_err)
		{
			// 鍑虹幇閿欒娓呴櫎鐩稿叧缂撳啿鍖�,娓呴櫎闃熷垪閿欒,閲嶇疆鐘舵�佹満
			fg_elrecvq_ptr->m_q_errCode = EL_QEOK;
			elq_clean(fg_elrecvq_ptr);
			if (fg_elrecvq_ptr->m_q_errCode != EL_QEOK)
			{
				eladp_elcrtsec_end(recv);
				LOCAL_PRINTF("ERR: EL Recv Q Clr\n\r");
				return e_el_error;
			}
			// 鍥炲埌idle鐘舵��
			fg_curStatus = e_elshellStatus_idle;
			// idle 绱ф帴鐫�灏变細鎵ц鎵�浠ヤ笉鐢ㄦ媴蹇冧涪鏁版嵁
		}

		if (fg_curStatus == e_elshellStatus_idle)
		{
			// 杩欓噷灏辩畻姝ｅ湪鎵ц鍛戒护涔熷厑璁歌幏鍙栦笅涓�涓懡浠�,鐩稿綋浜庢湁涓�涓懡浠ょ紦鍐插尯
			if (f_c == ES_C_SOC)
			{
				fg_curStatus = e_elshellStatus_getting;
				// getting 绱ф帴鐫�灏变細鎵ц鎵�浠ヤ笉鐢ㄥ湪杩欓噷鍏ラ槦
			}
			else
			{
				fg_curStatus = e_elshellStatus_idle;
				eladp_elcrtsec_end(recv);
				// LOCAL_PRINTF("DBG: EL Drop Char\n\r");
				return e_el_eok;
			}
		}

		// ES_C_SOC 鍜� ES_C_EOC 涔熻鍙�
		if (fg_curStatus == e_elshellStatus_getting)
		{
			char lastChar = '\0';

			if (f_c == ES_C_EOC)
			{
				lastChar = elq_peek_rear(fg_elrecvq_ptr); // 绌洪槦鍑洪槦涓�0
				if (ES_C_LBOOC != '\0')
				{
					if (lastChar != ES_C_LBOOC)
					{
						fg_curStatus = e_elshellStatus_err;
						eladp_elcrtsec_end(recv);
						return e_el_evalid;
					}
				}
				elq_enq(fg_elrecvq_ptr, f_c);
				if (fg_elrecvq_ptr->m_q_errCode != EL_QEOK)
				{
					fg_curStatus = e_elshellStatus_err;
					eladp_elcrtsec_end(recv);
					return e_el_error;
				}
				fg_curStatus = e_elshellStatus_got;
			}
			else
			{
				elq_enq(fg_elrecvq_ptr, f_c);
				if (fg_elrecvq_ptr->m_q_errCode != EL_QEOK)
				{
					fg_curStatus = e_elshellStatus_err;
					eladp_elcrtsec_end(recv);
					return e_el_error;
				}
			}
		}

		if (fg_curStatus == e_elshellStatus_got)
		{
			if (fg_isCmdProcBusy == EL_TRUE)
			{
				// 濡傛灉涓婁竴鏉″懡浠よ繕鏈墽琛屽畬姣曞張鏉ヤ簡涓�鏉℃柊鐨勫懡浠�(涓轰簡鍓╁唴瀛樻病鎼炵紦鍐插尯)鍒欐姤閿�
				fg_curStatus = e_elshellStatus_err;
				eladp_elcrtsec_end(recv);
				return e_el_efull;
			}
			else
			{
				// 瀹氫綅骞舵牎楠屽懡浠�
				char *cmdStartInBuf_ptr = EL_NULL;
				uint32_t cmdLen = 0;
				cmdLen = elbufgets_cmd(fg_elrecvq_ptr->m_elemArr_ptr, fg_elrecvq_ptr->m_cap, &cmdStartInBuf_ptr);
				if (cmdStartInBuf_ptr == EL_NULL)
				{
					fg_curStatus = e_elshellStatus_err;
					eladp_elcrtsec_end(recv);
					LOCAL_PRINTF("ERR: EL CMD Gets\n\r");
					return e_el_error;
				}
				// 瑙ｆ瀽骞跺皢鍛戒护閫佸叆寰呮墽琛岄槦鍒�
				el_cmdd_8p_t *tarCmdd_ptr;
				el_cmd_get_para(cmdStartInBuf_ptr, cmdLen, &tarCmdd_ptr);
				if (tarCmdd_ptr == EL_NULL)
				{
					fg_curStatus = e_elshellStatus_err;
					eladp_elcrtsec_end(recv);
					LOCAL_PRINTF("ERR: EL CMD Unknow\n\r");
					return e_el_error;
				}
				tarCmdd_ptr->ms_flags.m_cmdStatus = e_elCmdStatus_needToExecute;
				elq_enq(fg_elCmdWaitProcQ_ptr, tarCmdd_ptr);
				if (fg_elCmdWaitProcQ_ptr->m_q_errCode != EL_QEOK)
				{
					fg_curStatus = e_elshellStatus_err;
					eladp_elcrtsec_end(recv);
					LOCAL_PRINTF("ERR: EL CMD En WaitProcQ\n\r");
					return e_el_error;
				}

				// 鐘舵�佸綊浣峣dle
				// LOCAL_PRINTF("DBG: EL CMD Got\n\r");
				elq_clean(fg_elrecvq_ptr);
				if (fg_elrecvq_ptr->m_q_errCode != EL_QEOK)
				{
					eladp_elcrtsec_end(recv);
					LOCAL_PRINTF("ERR: EL Reset\n\r");
					return e_el_error;
				}
				fg_curStatus = e_elshellStatus_idle;
			}
		}

		// 閿欒鐘舵�佸綊浣�
		if (fg_curStatus != e_elshellStatus_err &&
			fg_curStatus != e_elshellStatus_idle &&
			fg_curStatus != e_elshellStatus_getting &&
			fg_curStatus != e_elshellStatus_got)
		{
			fg_curStatus = e_elshellStatus_err;
		}

		eladp_elcrtsec_end(recv);
		return e_el_eok;
	}

	/**
	 * @brief 鎵ц寰呮墽琛屽懡浠ら槦鍒椾腑鐨勫懡浠�
	 * @param None
	 * @return el_err_t 鎵ц缁撴灉
	 *         - \b e_el_eok: 鍛戒护鎵ц鎴愬姛鎴栭槦鍒椾负绌�
	 *         - \b e_el_error: 鍛戒护鍑洪槦澶辫触鎴栧懡浠ゆ墽琛屽け璐�
	 * @note
	 *       - 闇�瑕佺‘淇� fg_elCmdWaitProcQ_ptr 宸插垵濮嬪寲瀹屾垚
	 *       - 鏈嚱鏁板彲鐢变富鍑芥暟鎴栦富绾跨▼浠诲姟璋冪敤锛屼笉寤鸿鐢辨椂闂磋疆浠诲姟璋冪敤锛屼互閬垮厤涓柇闃诲
	 *       - 浣跨敤涓寸晫鍖轰繚鎶�(eladp_elcrtsec_start/end)纭繚闃熷垪鎿嶄綔鐨勭嚎绋嬪畨鍏�
	 *       - 渚濊禆 el_cmd_exe 鍑芥暟鎵ц鍏蜂綋鍛戒护锛屾墽琛岀粨鏋滃瓨鍌ㄥ湪 cmdRetrun_ptr
	 *       - 姣忔璋冪敤浠呭鐞嗗緟鎵ц闃熷垪涓殑涓�涓懡浠�(灏藉彲鑳介槻姝㈡嫢濉�)
	 *       - 鑻ラ槦鍒椾负绌猴紝鐩存帴杩斿洖鎴愬姛
	 *       - 宓屽叆寮忕幆澧冿紝闇�纭繚 fg_elCmdWaitProcQ_ptr 鐨勫唴瀛樻湁鏁堟��
	 */
	el_err_t ELShell_Dispatch(void)
	{
		el_err_t r = e_el_eok;
		uint32_t qUsedCnt = 0;
		el_cmdd_8p_t *tmpCmdd_ptr = EL_NULL;
		void *cmdRetrun_ptr = NULL;

		eladp_elcrtsec_start(deq);
		qUsedCnt = elq_get_used(fg_elCmdWaitProcQ_ptr);
		if (qUsedCnt == 0)
		{
			eladp_elcrtsec_end(deq);
			return e_el_eok;
		}
		tmpCmdd_ptr = elq_deq(fg_elCmdWaitProcQ_ptr);
		if (tmpCmdd_ptr == EL_NULL)
		{
			eladp_elcrtsec_end(deq);
			return e_el_error;
		}
		eladp_elcrtsec_end(deq);

		r = el_cmd_exe(tmpCmdd_ptr, &cmdRetrun_ptr);
		if (r != e_el_eok)
		{
			return e_el_error;
		}

		return e_el_eok;
	}

#ifdef __cplusplus
}
#endif // Compatible C++
