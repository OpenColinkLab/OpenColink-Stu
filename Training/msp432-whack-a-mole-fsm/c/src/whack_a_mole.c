/**
 * @file whack_a_mole.c
 * @brief 从 MSP432 原工程提炼出的三个游戏状态及主机测试适配层。
 *
 * @details
 * 业务状态机仍保持原来的：
 * `IDLE -> START_GAME -> CHECK -> START_GAME ...`
 *
 * 本文件同时包含两种层次：
 * 1. 移植层：把全局变量和 DriverLib 依赖收进 `Proj_UserFsm`。
 * 2. 测试层：提供 `WAM_*` API、事件日志和确定性随机数，供 C 测试及网页调用。
 *
 * 阅读指针时先看 `this_p`：它指向一个完整的项目对象。状态函数第一参数虽然
 * 常被通用宏转换成 `FSM_t *`，实际调用时仍传回同一个项目对象地址。
 */

#include "whack_a_mole.h"
#include "sol_fsm.h"

#include <stddef.h>
#include <stdlib.h>
#include <string.h>

/**
 * 每次动作最多保存的事件条数。
 *
 * 这是主机教学层的环形容量上限，不是游戏规则。达到上限后 `log_event`
 * 会停止继续写入，避免错误地越过数组边界。
 */
#define WAM_EVENT_CAPACITY 128U

/**
 * 地鼠出现后的默认反应窗口，与原工程 `m_delayTime = 500` 一致。
 *
 * TA1 每 1 ms 增加一次等待令牌，所以该宏同时表示“500 个 tick”。
 */
#define WAM_DEFAULT_WINDOW_MS 500U

/**
 * 地鼠被打死后的无效键值。
 *
 * 原工程注释写“置 99”，实际代码设置为 17。17 不与九宫可击键
 * `1,2,3,5,6,7,9,10,11` 或控制键 `4,8,16` 冲突。
 */
#define WAM_DEAD_POSITION 17U

/** 开始和退出共用的 MKEY 键值。 */
#define WAM_START_KEY 16U

/** 原主循环中用于降低 PWM 占空比的导航键。 */
#define WAM_NAV_DOWN_KEY 4U

/** 原主循环中用于提高 PWM 占空比的导航键。 */
#define WAM_NAV_UP_KEY 8U

/**
 * @brief 原 `Game_Info` 的等价结构。
 *
 * 字段名保留原始拼写，方便与 `hamster_plate.h` 逐项对照。
 */
typedef struct {
    uint8_t m_nextTurn;      /**< 非零表示下一轮允许生成新地鼠。 */
    uint8_t m_isTimeOut;     /**< 非零表示当前反应窗已经超时。 */
    uint8_t m_gameLevel;     /**< 原工程保留的难度字段；当前实现未使用。 */
    uint16_t m_delayTime;    /**< 反应窗 tick 数，默认 500。 */
    uint8_t m_posion;        /**< 当前地鼠键值；原字段名保留。 */
    uint16_t m_totalScore;   /**< 总命中得分。 */
    uint16_t m_totalLost;    /**< 总失分。 */
} Game_Info;

/**
 * @brief 项目状态机对象，相当于原工程全局数据与 `proj_fsm` 的合并。
 *
 * `fsm_used` 必须放在第一个成员。这样 `(FSM_t *)this_p` 与 `this_p`
 * 指向同一个起始地址，通用派发器才能通过基类布局找到 `state_handler`。
 */
typedef struct {
    FSM_t fsm_used;                    /**< 基类：保存当前状态函数指针，必须在 offset 0。 */
    Game_Info m_gameInfo;              /**< 原游戏分数、超时和地鼠数据。 */
    uint16_t mkey_val;                 /**< 当前 MKEY 键值，0 表示无待处理按键。 */
    uint16_t g_hamsterWaitToken;       /**< 已累计的反应窗毫秒 tick。 */
    uint16_t m_spawnDelay;             /**< 本轮生成前的随机准备延时。 */
    uint16_t m_moleKeypadCode;         /**< 当前地鼠对应键值，17 表示无地鼠。 */
    int16_t m_moleHole;                /**< 九宫洞位 0..8，-1 表示无地鼠。 */
    uint32_t rng_state;                /**< 确定性 LCG 随机数状态。 */
    uint32_t round;                    /**< 已生成轮次，便于网页判断是否进入新轮。 */
    uint32_t tick_count;               /**< 主机模拟累计 tick，不等于游戏轮次。 */
    uint32_t next_event_seq;           /**< 下一条事件序号。 */
    uint32_t event_count;              /**< 当前动作已经记录的事件数量。 */
    WAM_Event events[WAM_EVENT_CAPACITY]; /**< 主机事件日志数组。 */
} Proj_UserFsm;

/**
 * @brief 对外不透明句柄的真实定义。
 *
 * 目前只包一层项目对象，方便以后增加多个独立玩家实例而不改变公共 API。
 */
struct WAM_Game {
    Proj_UserFsm project; /**< 真正运行状态机的项目对象。 */
};

/**
 * 原工程洞号到 MKEY 键值的映射。
 *
 * 数组下标 1..9 对应九宫洞 1..9；对应值为矩阵键盘的原始键值。
 * 下标 0 只是占位，使 `pick` 可以直接从 1 开始，保持原代码可读性。
 */
static uint8_t const l_hamsterPositionArr[10] = {
    0U, 1U, 2U, 3U, 5U, 6U, 7U, 9U, 10U, 11U
};

/* 三个状态函数前置声明，便于 current_state 比较函数地址以及转移宏引用。 */
static status_t Proj_Idle(Proj_UserFsm *this_p, event_t const *evt);
static status_t Proj_StartGame(Proj_UserFsm *this_p, event_t const *evt);
static status_t Proj_Check(Proj_UserFsm *this_p, event_t const *evt);

/**
 * @brief 从外层句柄取出内部项目对象地址。
 *
 * @param game 指向不透明游戏对象。
 * @return 指向 `game->project` 的地址。
 *
 * `&game->project` 表示先通过 game 找到 project 成员，再取这个成员的地址。
 * 返回值不是新对象，而是 game 内部存储区域的地址。
 */
static Proj_UserFsm *project_from_game(WAM_Game *game)
{
    return &game->project;
}

/**
 * @brief 从只读游戏句柄取出项目对象的只读地址。
 *
 * @param game 指向不透明游戏对象，函数承诺不修改对象内容。
 * @return `Proj_UserFsm const *`，不能通过该指针写入游戏字段。
 */
static Proj_UserFsm const *project_from_game_const(WAM_Game const *game)
{
    return &game->project;
}

/**
 * @brief 计算下一个确定性伪随机数。
 *
 * @param this_p 指向可写项目对象；函数会更新其中的 `rng_state`。
 * @return 32 位伪随机数。
 *
 * 这里使用线性同余生成器 LCG。它不等同于 libc `rand()`，但相同 seed
 * 会得到相同序列，便于 C 测试和网页回放。
 */
static uint32_t random_next(Proj_UserFsm *this_p)
{
    this_p->rng_state = this_p->rng_state * 1664525UL + 1013904223UL;
    return this_p->rng_state;
}

/**
 * @brief 从当前函数指针反推公开状态编号。
 *
 * @param this_p 指向只读项目对象。
 * @return WAM_STATE_IDLE、WAM_STATE_START_GAME 或 WAM_STATE_CHECK。
 *
 * `handler` 是函数指针副本。显式转换成 `State_Handler` 后再与三个
 * 状态函数地址比较，避免 MSVC 因函数参数类型不同发出 C4113 警告。
 * 匹配不到时默认按 CHECK 处理；正常代码不应出现未知状态函数。
 */
static uint32_t current_state(Proj_UserFsm const *this_p)
{
    State_Handler handler = this_p->fsm_used.state_handler;

    if (handler == (State_Handler)Proj_Idle) {
        return WAM_STATE_IDLE;
    }
    if (handler == (State_Handler)Proj_StartGame) {
        return WAM_STATE_START_GAME;
    }
    return WAM_STATE_CHECK;
}

/**
 * @brief 清空当前动作的事件日志。
 *
 * @param this_p 指向可写项目对象。
 *
 * 每次按键或推进时间前调用，使网页一次请求只接收本次动作产生的事件。
 */
static void clear_events(Proj_UserFsm *this_p)
{
    this_p->event_count = 0U;
    this_p->next_event_seq = 0U;
}

/**
 * @brief 向事件日志追加一条记录。
 *
 * @param this_p 指向可写项目对象。
 * @param kind 事件类型。
 * @param from_state 动作前状态。
 * @param to_state 动作后状态。
 * @param signal 触发事件。
 * @param keypad 相关按键值。
 * @param score_delta 得分变化量。
 * @param lost_delta 失分变化量。
 * @param mole_hole 地鼠洞位，-1 表示无。
 * @param value 事件附加数值。
 *
 * `event = &this_p->events[index]` 取得数组元素地址；之后通过 `event->`
 * 修改真正的数组元素，而不是修改数组副本。
 */
static void log_event(
    Proj_UserFsm *this_p,
    WAM_EventKind kind,
    uint32_t from_state,
    uint32_t to_state,
    uint32_t signal,
    uint32_t keypad,
    int32_t score_delta,
    int32_t lost_delta,
    int32_t mole_hole,
    uint32_t value)
{
    uint32_t index;
    WAM_Event *event;

    if (this_p->event_count >= WAM_EVENT_CAPACITY) {
        return;
    }

    index = this_p->event_count;
    event = &this_p->events[index];
    event->seq = this_p->next_event_seq++;
    event->kind = (uint32_t)kind;
    event->from_state = from_state;
    event->to_state = to_state;
    event->signal = signal;
    event->keypad = keypad;
    event->score_delta = score_delta;
    event->lost_delta = lost_delta;
    event->mole_hole = mole_hole;
    event->value = value;
    this_p->event_count++;
}

/**
 * @brief 派发一次 IS_GAME_SIG，并在前后状态不同时记录迁移事件。
 *
 * @param this_p 指向项目对象。
 *
 * 原主循环每轮都会派发同一个业务信号。这里保留该行为，同时用
 * `before/after` 比较函数指针所代表的状态，生成网页可见的轨迹。
 */
static void dispatch_once(Proj_UserFsm *this_p)
{
    event_t event = {IS_GAME_SIG};
    uint32_t before = current_state(this_p);
    uint32_t after;

    SOL_FSM_Dispatch(&this_p->fsm_used, &event);
    after = current_state(this_p);
    if (before != after) {
        log_event(
            this_p,
            WAM_EVENT_STATE,
            before,
            after,
            IS_GAME_SIG,
            this_p->mkey_val,
            0,
            0,
            this_p->m_moleHole,
            0U);
    }
}

/**
 * @brief 清除当前地鼠，并把洞位和键值统一置为无效状态。
 *
 * @param this_p 指向项目对象。
 */
static void kill_all(Proj_UserFsm *this_p)
{
    this_p->m_gameInfo.m_posion = (uint8_t)WAM_DEAD_POSITION;
    this_p->m_moleKeypadCode = (uint16_t)WAM_DEAD_POSITION;
    this_p->m_moleHole = -1;
}

/**
 * @brief 随机选择一个九宫洞并生成地鼠数据。
 *
 * @param this_p 指向项目对象。
 *
 * `pick` 范围是 1..9，用原映射表换成 MKEY 键值。主机层不操作 GPIO，
 * 只更新洞位和键值，由网页或真实 BSP 读取这些结果。
 */
static void generate(Proj_UserFsm *this_p)
{
    uint32_t pick = (random_next(this_p) % 9U) + 1U;
    uint16_t code = l_hamsterPositionArr[pick];

    this_p->m_gameInfo.m_posion = (uint8_t)code;
    this_p->m_moleKeypadCode = code;
    this_p->m_moleHole = (int16_t)(pick - 1U);
}

/**
 * @brief IDLE 状态处理函数。
 *
 * @param this_p 指向当前项目对象；`->` 通过该指针修改项目字段。
 * @param evt 指向只读事件；`evt->signal` 表示本次是 ENTRY、EXIT 还是业务事件。
 * @return 发生开始转移时返回 TRAN_STATUS；其他情况返回已处理或忽略。
 *
 * IDLE 只负责两件事：
 * - 收到键值 16 时清零分数并启动 START_GAME。
 * - 没收到开始键时保证九宫盘无地鼠。
 */
status_t Proj_Idle(Proj_UserFsm *this_p, event_t const *evt)
{
    /* 生命周期信号本身没有业务动作，但必须明确返回 HANDLED。 */
    switch (evt->signal) {
    case ENTRY_SIG:
    case EXIT_SIG:
        return HANDLED_STATUS;

    case IS_GAME_SIG:
        /* 16 是开始键：先初始化本轮需要的全部状态，再触发转移。 */
        if (this_p->mkey_val == WAM_START_KEY) {
            this_p->mkey_val = 0U;
            this_p->m_gameInfo.m_totalScore = 0U;
            this_p->m_gameInfo.m_totalLost = 0U;
            this_p->m_gameInfo.m_nextTurn = 1U;
            log_event(
                this_p,
                WAM_EVENT_START,
                WAM_STATE_IDLE,
                WAM_STATE_START_GAME,
                IS_GAME_SIG,
                WAM_START_KEY,
                0,
                0,
                -1,
                0U);
            /*
             * 宏先把 fsm_used.state_handler 改成 Proj_StartGame，
             * 逗号右侧再产生 TRAN_STATUS，并由 return 交回派发器。
             */
            return SOL_FSM_Tran(this_p, Proj_StartGame);
        }
        /* 非开始键时保持待机，同时清掉可能残留的显示状态。 */
        kill_all(this_p);
        return HANDLED_STATUS;

    default:
        return IGNORED_STATUS;
    }
}

/**
 * @brief START_GAME 状态处理函数。
 *
 * @param this_p 指向项目对象。
 * @param evt 指向只读事件。
 * @return 退出游戏或生成完成后返回 TRAN_STATUS。
 *
 * START_GAME 有两条业务路径：
 * - `nextTurn != 0`：真正生成下一只地鼠。
 * - `nextTurn == 0`：只补完循环，不重置当前地鼠。
 */
status_t Proj_StartGame(Proj_UserFsm *this_p, event_t const *evt)
{
    switch (evt->signal) {
    case ENTRY_SIG:
    case EXIT_SIG:
        return HANDLED_STATUS;

    case IS_GAME_SIG:
        /* 生成过程中也允许 16 退出，退出动作优先于生成判断。 */
        if (this_p->mkey_val == WAM_START_KEY) {
            this_p->mkey_val = 0U;
            log_event(
                this_p,
                WAM_EVENT_QUIT,
                WAM_STATE_START_GAME,
                WAM_STATE_IDLE,
                IS_GAME_SIG,
                WAM_START_KEY,
                0,
                0,
                this_p->m_moleHole,
                0U);
            return SOL_FSM_Tran(this_p, Proj_Idle);
        }

        /* 只有 nextTurn 被置位时，才允许开始全新一轮。 */
        if (this_p->m_gameInfo.m_nextTurn) {
            /* 先锁住本轮，防止同一轮被重复生成。 */
            this_p->m_gameInfo.m_nextTurn = 0U;

            /*
             * 生成前随机延时范围 500..1900 ms，步进 100 ms。
             * 这个延时与后面的 500 ms 反应窗口不是同一个计时阶段。
             */
            this_p->m_spawnDelay = (uint16_t)(((random_next(this_p) % 15U) + 5U) * 100U);
            this_p->mkey_val = 0U;
            generate(this_p);

            /* 新地鼠出现时清掉旧超时和旧等待令牌，重新开始 500 ms 倒计时。 */
            this_p->m_gameInfo.m_isTimeOut = 0U;
            this_p->g_hamsterWaitToken = 0U;
            this_p->round++;
            log_event(
                this_p,
                WAM_EVENT_SPAWN,
                WAM_STATE_START_GAME,
                WAM_STATE_CHECK,
                IS_GAME_SIG,
                this_p->m_moleKeypadCode,
                0,
                0,
                this_p->m_moleHole,
                this_p->m_spawnDelay);
            return SOL_FSM_Tran(this_p, Proj_Check);
        }

        /*
         * nextTurn 为假时只进入 CHECK，不生成新股。原工程按键 4/8
         * 经过 CHECK 后会走这条路径，从而保持当前地鼠和计时不变。
         */
        return SOL_FSM_Tran(this_p, Proj_Check);

    default:
        return IGNORED_STATUS;
    }
}

/**
 * @brief CHECK 状态处理函数。
 *
 * @param this_p 指向项目对象。
 * @param evt 指向只读事件。
 * @return 退出、超时、命中或错击时返回 TRAN_STATUS；其他分支返回相应状态。
 *
 * 判定顺序不能被随意调换：
 * 1. 16 先决定是否退出。
 * 2. 超时优先于命中，避免已超时的一轮再次加分。
 * 3. 命中比分错击优先。
 * 4. 导航键 4/8 只补循环，不影响当前地鼠。
 */
status_t Proj_Check(Proj_UserFsm *this_p, event_t const *evt)
{
    /* 先复制按键值，后续分支不会因中途清空 mkey_val 而丢失本地判断依据。 */
    uint16_t key;

    switch (evt->signal) {
    case ENTRY_SIG:
    case EXIT_SIG:
        return HANDLED_STATUS;

    case IS_GAME_SIG:
        key = this_p->mkey_val;

        /* 退出具有最高优先级，任何其他超时或命中条件都不再处理。 */
        if (key == WAM_START_KEY) {
            this_p->mkey_val = 0U;
            log_event(
                this_p,
                WAM_EVENT_QUIT,
                WAM_STATE_CHECK,
                WAM_STATE_IDLE,
                IS_GAME_SIG,
                key,
                0,
                0,
                this_p->m_moleHole,
                0U);
            kill_all(this_p);
            return SOL_FSM_Tran(this_p, Proj_Idle);
        }

        /* 计时器已经置超时：记一次失败、清鼠并允许下一轮。 */
        if (this_p->m_gameInfo.m_isTimeOut) {
            this_p->m_gameInfo.m_isTimeOut = 0U;
            log_event(
                this_p,
                WAM_EVENT_TIMEOUT,
                WAM_STATE_CHECK,
                WAM_STATE_START_GAME,
                IS_GAME_SIG,
                key,
                0,
                1,
                this_p->m_moleHole,
                0U);
            if (this_p->m_gameInfo.m_totalLost < 9999U) {
                this_p->m_gameInfo.m_totalLost++;
            }
            kill_all(this_p);
            this_p->m_gameInfo.m_nextTurn = 1U;
            return SOL_FSM_Tran(this_p, Proj_StartGame);
        }

        /* 按键值与当前地鼠键值完全一致，判定为命中。 */
        if (key == this_p->m_moleKeypadCode) {
            this_p->mkey_val = 0U;
            log_event(
                this_p,
                WAM_EVENT_HIT,
                WAM_STATE_CHECK,
                WAM_STATE_START_GAME,
                IS_GAME_SIG,
                key,
                1,
                0,
                this_p->m_moleHole,
                0U);
            if (this_p->m_gameInfo.m_totalScore < 9999U) {
                this_p->m_gameInfo.m_totalScore++;
            }
            kill_all(this_p);
            this_p->m_gameInfo.m_nextTurn = 1U;
            return SOL_FSM_Tran(this_p, Proj_StartGame);
        }

        /*
         * 排除 0（无按键）、16（退出）、4/8（导航键）后，其余有效按键
         * 都视为错误打击。保持原工程判定顺序。
         */
        if (key != 0U &&
            key != WAM_START_KEY &&
            key != WAM_NAV_DOWN_KEY &&
            key != WAM_NAV_UP_KEY) {
            this_p->mkey_val = 0U;
            log_event(
                this_p,
                WAM_EVENT_MISS,
                WAM_STATE_CHECK,
                WAM_STATE_START_GAME,
                IS_GAME_SIG,
                key,
                0,
                1,
                this_p->m_moleHole,
                0U);
            if (this_p->m_gameInfo.m_totalLost < 9999U) {
                this_p->m_gameInfo.m_totalLost++;
            }
            kill_all(this_p);
            this_p->m_gameInfo.m_nextTurn = 1U;
            return SOL_FSM_Tran(this_p, Proj_StartGame);
        }

        /*
         * 4/8 由原主循环在 FSM 外处理 PWM。这里只记录忽略事件，并在
         * START_GAME(nextTurn=0) 与 CHECK 之间补一次循环，不生成新股。
         */
        if (key == WAM_NAV_DOWN_KEY || key == WAM_NAV_UP_KEY) {
            log_event(
                this_p,
                WAM_EVENT_IGNORE,
                WAM_STATE_CHECK,
                WAM_STATE_START_GAME,
                IS_GAME_SIG,
                key,
                0,
                0,
                this_p->m_moleHole,
                key);
        }
        return SOL_FSM_Tran(this_p, Proj_StartGame);

    default:
        return IGNORED_STATUS;
    }
}

/**
 * @brief 返回当前 C 桥接接口版本。
 *
 * @return 固定返回 1。Python 加载 DLL 后调用此函数，防止 C 与 ctypes
 *         结构体布局发生不兼容时继续运行。
 */
uint32_t WAM_ApiVersion(void)
{
    return 1U;
}

/**
 * @brief 分配并初始化一个游戏对象。
 *
 * @param seed 随机种子；0 会由 `WAM_Reset` 替换为 1。
 * @return 指向游戏对象的指针；分配失败返回 NULL。
 *
 * `calloc(1, sizeof(*game))` 会把整个对象清零。`sizeof(*game)` 表示
 * “game 所指向对象的类型大小”，比手写结构体长度更不容易随字段变化出错。
 */
WAM_Game *WAM_Create(uint32_t seed)
{
    WAM_Game *game = (WAM_Game *)calloc(1U, sizeof(*game));

    if (game == NULL) {
        return NULL;
    }
    WAM_Reset(game, seed);
    return game;
}

/**
 * @brief 释放游戏对象。
 *
 * @param game 由 `WAM_Create` 返回的指针；NULL 也可安全传给 free。
 */
void WAM_Destroy(WAM_Game *game)
{
    free(game);
}

/**
 * @brief 原地复位整个游戏对象。
 *
 * @param game 游戏对象指针；允许 NULL。
 * @param seed 随机种子；0 会替换为 1。
 *
 * 复位顺序很重要：
 * 1. 先清零所有字段和旧状态。
 * 2. 恢复随机源与 Game_Info 默认值。
 * 3. 把初始状态函数地址放入 `fsm_used.state_handler`。
 * 4. 发送 ENTRY_SIG。
 */
void WAM_Reset(WAM_Game *game, uint32_t seed)
{
    Proj_UserFsm *this_p;

    if (game == NULL) {
        return;
    }

    this_p = project_from_game(game);
    /* 清除分数、旧函数指针、旧事件和所有计时数据。 */
    memset(game, 0, sizeof(*game));
    this_p->rng_state = (seed == 0U) ? 1U : seed;
    this_p->m_gameInfo.m_delayTime = WAM_DEFAULT_WINDOW_MS;
    this_p->m_gameInfo.m_posion = (uint8_t)WAM_DEAD_POSITION;
    this_p->m_moleKeypadCode = (uint16_t)WAM_DEAD_POSITION;
    this_p->m_moleHole = -1;

    /*
     * Proj_Idle 的函数参数类型是 Proj_UserFsm *，而 state_handler 需要
     * State_Handler。这里沿用原工程的继承式强制转换，调用时仍传入同一个地址。
     */
    SOL_FSM_Handler_Ctor(&this_p->fsm_used, (State_Handler)Proj_Idle);
    SOL_FSM_Init(&this_p->fsm_used);
    log_event(
        this_p,
        WAM_EVENT_RESET,
        WAM_STATE_IDLE,
        WAM_STATE_IDLE,
        INIT_SIG,
        0U,
        0,
        0,
        -1,
        seed);
}

/**
 * @brief 向状态机提交一个按键值，并模拟主循环的立即补派发。
 *
 * @param game 游戏对象指针；允许 NULL。
 * @param keypad MKEY 键值。
 *
 * 一次输入可能经过两个状态：
 * - IDLE 收到 16：先切到 START_GAME。
 * - START_GAME 随即在下一次主循环生成地鼠并切到 CHECK。
 */
void WAM_PressKey(WAM_Game *game, uint32_t keypad)
{
    Proj_UserFsm *this_p;

    if (game == NULL) {
        return;
    }

    this_p = project_from_game(game);
    clear_events(this_p);
    this_p->mkey_val = (uint16_t)keypad;

    /* 第一次派发让当前状态处理按键；它可能通过转移宏改写 state_handler。 */
    dispatch_once(this_p);

    /* 原主循环下一轮会立刻再次派发，使 START_GAME 真正生成或补循环。 */
    if (current_state(this_p) == WAM_STATE_START_GAME) {
        dispatch_once(this_p);
    }

    /*
     * 原主循环在 FSM 派发之后，用独立 PWM 分支消费 4/8。
     * 主机版没有 PWM，但仍模拟“外部层消费按键”的边界，避免键值残留。
     */
    if (keypad == WAM_NAV_DOWN_KEY || keypad == WAM_NAV_UP_KEY) {
        this_p->mkey_val = 0U;
    }
}

/**
 * @brief 按 1 ms 粒度推进主机模拟时间。
 *
 * @param game 游戏对象指针；允许 NULL。
 * @param elapsed_ms 本次推进的毫秒数；0 直接返回。
 *
 * 该函数对应原 TA1 中断：
 * - 每 tick 增加等待令牌；
 * - 达到反应窗长度后只置 `m_isTimeOut`；
 * - 随后回到类似主循环的派发阶段处理超时。
 */
void WAM_AdvanceTime(WAM_Game *game, uint32_t elapsed_ms)
{
    Proj_UserFsm *this_p;
    uint32_t i;

    if (game == NULL || elapsed_ms == 0U) {
        return;
    }

    this_p = project_from_game(game);
    clear_events(this_p);

    /* 每次循环代表 Timer_A1 的 1 ms CCR0 中断。 */
    for (i = 0U; i < elapsed_ms; i++) {
        this_p->g_hamsterWaitToken++;
        this_p->tick_count++;
        if (this_p->g_hamsterWaitToken >= this_p->m_gameInfo.m_delayTime) {
            this_p->g_hamsterWaitToken = 0U;
            this_p->m_gameInfo.m_isTimeOut = 1U;
        }
    }

    /* 中断只置标志；真正失分和状态切换仍由 CHECK 状态完成。 */
    if (this_p->m_gameInfo.m_isTimeOut &&
        current_state(this_p) == WAM_STATE_CHECK) {
        dispatch_once(this_p);

        /* 超时处理会先转 START_GAME，再补一次派发生成下一轮。 */
        if (current_state(this_p) == WAM_STATE_START_GAME) {
            dispatch_once(this_p);
        }
    }
}

/**
 * @brief 把游戏内部状态复制到调用者提供的快照结构。
 *
 * @param game 只读游戏对象指针。
 * @param snapshot 指向可写输出结构。
 *
 * 这里是深拷贝式的“值复制”：snapshot 得到的是当前数值，不是内部字段指针。
 * 调用者后续修改 snapshot 不会影响状态机。
 */
void WAM_GetSnapshot(WAM_Game const *game, WAM_Snapshot *snapshot)
{
    Proj_UserFsm const *this_p;
    uint32_t remaining;

    if (game == NULL || snapshot == NULL) {
        return;
    }

    this_p = project_from_game_const(game);

    /* 尚未超时时，剩余时间 = 总反应窗 - 已累计 token。 */
    remaining = (this_p->g_hamsterWaitToken < this_p->m_gameInfo.m_delayTime)
        ? (uint32_t)this_p->m_gameInfo.m_delayTime - this_p->g_hamsterWaitToken
        : 0U;
    if (this_p->m_gameInfo.m_isTimeOut) {
        remaining = 0U;
    }

    snapshot->state = current_state(this_p);
    snapshot->score = this_p->m_gameInfo.m_totalScore;
    snapshot->lost = this_p->m_gameInfo.m_totalLost;
    snapshot->mole_hole = this_p->m_moleHole;
    snapshot->mole_code = this_p->m_moleKeypadCode;
    snapshot->keypad = this_p->mkey_val;
    snapshot->reaction_window_ms = this_p->m_gameInfo.m_delayTime;
    snapshot->wait_token = this_p->g_hamsterWaitToken;
    snapshot->remaining_ms = remaining;
    snapshot->spawn_delay_ms = this_p->m_spawnDelay;
    snapshot->next_turn = this_p->m_gameInfo.m_nextTurn;
    snapshot->timed_out = this_p->m_gameInfo.m_isTimeOut;
    snapshot->tick_count = this_p->tick_count;
    snapshot->round = this_p->round;
}

/**
 * @brief 返回当前动作产生的事件数量。
 *
 * @param game 只读游戏对象指针；NULL 返回 0。
 */
uint32_t WAM_GetEventCount(WAM_Game const *game)
{
    if (game == NULL) {
        return 0U;
    }
    return project_from_game_const(game)->event_count;
}

/**
 * @brief 从事件数组复制最多 `capacity` 条记录到调用者缓冲区。
 *
 * @param game 只读游戏对象指针。
 * @param start 起始下标；大于等于事件总数时返回 0。
 * @param events 指向调用者提供的输出数组。
 * @param capacity 输出数组容量。
 * @return 实际复制条数。
 *
 * `&this_p->events[start]` 取得源数组指定元素地址；
 * `sizeof(*events)` 表示一个元素的大小，二者结合计算完整字节数。
 */
uint32_t WAM_CopyEvents(
    WAM_Game const *game,
    uint32_t start,
    WAM_Event *events,
    uint32_t capacity)
{
    Proj_UserFsm const *this_p;
    uint32_t available;
    uint32_t count;

    if (game == NULL || events == NULL || capacity == 0U) {
        return 0U;
    }

    this_p = project_from_game_const(game);
    if (start >= this_p->event_count) {
        return 0U;
    }

    available = this_p->event_count - start;
    count = (available < capacity) ? available : capacity;
    memcpy(events, &this_p->events[start], (size_t)count * sizeof(*events));
    return count;
}

/**
 * @brief 清空当前动作的事件记录。
 *
 * @param game 游戏对象指针；允许 NULL。
 */
void WAM_ClearEvents(WAM_Game *game)
{
    if (game != NULL) {
        clear_events(project_from_game(game));
    }
}

/**
 * @brief 把状态枚举编号转换为只读英文名称。
 *
 * @param state 状态编号。
 * @return 指向静态字符串常量的只读指针。
 */
char const *WAM_StateName(uint32_t state)
{
    switch (state) {
    case WAM_STATE_IDLE:
        return "IDLE";
    case WAM_STATE_START_GAME:
        return "START_GAME";
    case WAM_STATE_CHECK:
        return "CHECK";
    default:
        return "UNKNOWN";
    }
}

/**
 * @brief 把事件类型编号转换为只读英文名称。
 *
 * @param kind WAM_EventKind 事件编号。
 * @return 指向静态字符串常量的只读指针。
 */
char const *WAM_EventKindName(uint32_t kind)
{
    switch (kind) {
    case WAM_EVENT_STATE:
        return "STATE";
    case WAM_EVENT_START:
        return "START";
    case WAM_EVENT_SPAWN:
        return "SPAWN";
    case WAM_EVENT_HIT:
        return "HIT";
    case WAM_EVENT_MISS:
        return "MISS";
    case WAM_EVENT_TIMEOUT:
        return "TIMEOUT";
    case WAM_EVENT_QUIT:
        return "QUIT";
    case WAM_EVENT_RESET:
        return "RESET";
    case WAM_EVENT_IGNORE:
        return "IGNORE";
    default:
        return "NONE";
    }
}
