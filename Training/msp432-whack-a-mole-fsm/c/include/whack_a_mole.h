/**
 * @file whack_a_mole.h
 * @brief 打地鼠状态机的主机测试与 DLL 公共接口。
 *
 * @details
 * 本头文件不暴露 `Proj_UserFsm` 的内部布局，外部只能通过 `WAM_Game *` 句柄
 * 操作游戏。这样网页桥接层无法绕过状态机直接改分数或地鼠位置。
 *
 * 指针层次：
 * - `WAM_Game *game`：指向一个不透明游戏对象。
 * - `WAM_Snapshot *snapshot`：指向调用者提供的输出结构。
 * - `WAM_Event *events`：指向调用者提供的事件数组。
 *
 * 所有输出函数都采用“调用者提供缓冲区”的方式，避免在接口层再次动态分配内存。
 */

#ifndef WHACK_A_MOLE_H
#define WHACK_A_MOLE_H
/**< 防止同一编译单元重复包含本头文件。 */

#include <stdint.h>
/**< 提供固定宽度整数类型，保证 DLL 与 Python ctypes 的字段宽度一致。 */

#ifdef _WIN32
#define WAM_API __declspec(dllexport)
#else
#define WAM_API
#endif
/**<
 * 共享库导出宏。
 *
 * - 在 Windows 下，`__declspec(dllexport)` 告诉 MSVC 把后面的函数放进 DLL
 *   导出表，`ctypes.WinDLL` 才能按名字找到它们。
 * - 在非 Windows 平台，宏展开为空；若以后改为 GCC/Clang 构建，可再定义
 *   `__attribute__((visibility("default")))`。
 */

#ifdef __cplusplus
extern "C" {
#endif
/**< 允许 C++ 按 C 链接规则使用这些导出函数。 */

/**
 * @brief 对外可见的三个稳定状态编号。
 *
 * 编号值同时被 Python 桥接层和网页状态图使用，因此显式从 0 开始赋值。
 */
typedef enum {
    WAM_STATE_IDLE = 0,    /**< 空闲：等待键值 16 开始游戏。 */
    WAM_STATE_START_GAME,  /**< 开始一轮：生成地鼠并复位计时数据。 */
    WAM_STATE_CHECK        /**< 检查：处理超时、命中、错击和退出。 */
} WAM_State;

/**
 * @brief 事件日志类型。
 *
 * 这些事件不是 FSM 输入信号，而是 C 状态机执行后生成的可观察记录，
 * 用于主机测试、网页轨迹和教学演示。
 */
typedef enum {
    WAM_EVENT_NONE = 0, /**< 无事件，保留为无效值。 */
    WAM_EVENT_STATE,    /**< 状态发生迁移。 */
    WAM_EVENT_START,    /**< 玩家按开始键。 */
    WAM_EVENT_SPAWN,    /**< 新地鼠已生成。 */
    WAM_EVENT_HIT,      /**< 命中地鼠。 */
    WAM_EVENT_MISS,     /**< 错击地鼠盘。 */
    WAM_EVENT_TIMEOUT,  /**< 500 ms 反应窗耗尽。 */
    WAM_EVENT_QUIT,     /**< 玩家退出游戏。 */
    WAM_EVENT_RESET,    /**< 状态机复位。 */
    WAM_EVENT_IGNORE    /**< 收到导航键等不影响本轮结果的输入。 */
} WAM_EventKind;

/**
 * @brief 某一时刻的只读游戏快照。
 *
 * 所有字段固定为 32 位，便于 Python ctypes 精确镜像结构布局。
 * `mole_hole == -1` 表示当前没有地鼠。
 */
typedef struct {
    uint32_t state;               /**< WAM_State 状态编号。 */
    uint32_t score;               /**< 累计命中得分。 */
    uint32_t lost;                /**< 累计错击与超时次数。 */
    int32_t mole_hole;            /**< 地鼠洞位 0..8；-1 表示无地鼠。 */
    uint32_t mole_code;           /**< 地鼠对应的 MKEY 键值；17 表示无效值。 */
    uint32_t keypad;              /**< 当前仍待处理的按键值；0 表示无按键。 */
    uint32_t reaction_window_ms;  /**< 反应窗长度，原机初始化为 500 ms。 */
    uint32_t wait_token;          /**< 反应窗内已累计的 tick 数。 */
    uint32_t remaining_ms;        /**< 当前估算的剩余反应时间。 */
    uint32_t spawn_delay_ms;      /**< 本轮地鼠出现前的随机准备延时。 */
    uint32_t next_turn;           /**< 非零表示 StartGame 应生成下一只地鼠。 */
    uint32_t timed_out;           /**< 非零表示计时器已经置超时标志。 */
    uint32_t tick_count;          /**< 主机模拟累计推进的毫秒 tick 数。 */
    uint32_t round;               /**< 已经生成的轮次编号。 */
} WAM_Snapshot;

/**
 * @brief 单条可观察事件。
 *
 * `value` 字段的含义随 `kind` 改变：
 * - SPAWN：地鼠出现前的随机延时毫秒数；
 * - IGNORE：被忽略的按键值；
 * - RESET：本次复位使用的随机种子；
 * - 其他事件：通常为 0。
 */
typedef struct {
    uint32_t seq;         /**< 本次动作中的事件序号。 */
    uint32_t kind;        /**< WAM_EventKind 事件类型。 */
    uint32_t from_state;  /**< 动作前状态编号。 */
    uint32_t to_state;    /**< 动作后状态编号。 */
    uint32_t signal;      /**< 触发动作的 FSM 信号。 */
    uint32_t keypad;      /**< 相关 MKEY 键值。 */
    int32_t score_delta;  /**< 本次事件造成的得分变化。 */
    int32_t lost_delta;   /**< 本次事件造成的失分变化。 */
    int32_t mole_hole;    /**< 相关地鼠洞位；-1 表示无。 */
    uint32_t value;       /**< 按事件类型解释的附加数值。 */
} WAM_Event;

/**
 * @brief 不透明游戏对象。
 *
 * 声明成不完整类型后，调用者只能持有 `WAM_Game *`，不能访问内部字段。
 * 这种设计强制所有状态变化都经过状态处理函数和公共 API。
 */
typedef struct WAM_Game WAM_Game;

/**
 * @brief 返回 C 桥接接口版本。
 * @return 当前固定返回 1；Python 加载 DLL 后用它检查 ABI 是否匹配。
 */
WAM_API uint32_t WAM_ApiVersion(void);

/**
 * @brief 动态创建并初始化一个游戏对象。
 * @param seed 随机种子；0 会被内部替换为 1。
 * @return 成功返回对象地址，内存不足返回 NULL。
 *
 * @warning 这是主机教学便利接口。MCU 端应使用静态对象，避免动态分配。
 */
WAM_API WAM_Game *WAM_Create(uint32_t seed);

/**
 * @brief 销毁由 `WAM_Create` 创建的游戏对象。
 * @param game 游戏对象指针；允许传 NULL。
 */
WAM_API void WAM_Destroy(WAM_Game *game);

/**
 * @brief 原地复位状态机、分数、地鼠、随机源和事件日志。
 * @param game 游戏对象指针；允许传 NULL。
 * @param seed 新随机种子；0 会被替换为 1。
 */
WAM_API void WAM_Reset(WAM_Game *game, uint32_t seed);

/**
 * @brief 向 C 状态机提交一个 MKEY 键值。
 * @param game 游戏对象指针。
 * @param keypad 键值；16 表示开始或退出，4/8 为导航键。
 *
 * @details 本函数模拟原主循环的一次完整输入处理：设置按键、派发事件，
 * 必要时再补一次派发，让 START_GAME 立即完成生成。
 */
WAM_API void WAM_PressKey(WAM_Game *game, uint32_t keypad);

/**
 * @brief 推进主机模拟时间。
 * @param game 游戏对象指针。
 * @param elapsed_ms 要推进的毫秒数；内部按 1 ms tick 累计。
 *
 * @details 达到 500 ms 反应窗后只置超时标志，再由状态机统一处理，
 * 对应原始 TA1 中断与主循环之间的职责分工。
 */
WAM_API void WAM_AdvanceTime(WAM_Game *game, uint32_t elapsed_ms);

/**
 * @brief 把当前游戏状态写入调用者提供的快照结构。
 * @param game 只读游戏对象指针。
 * @param snapshot 指向输出结构；不能为 NULL。
 */
WAM_API void WAM_GetSnapshot(WAM_Game const *game, WAM_Snapshot *snapshot);

/**
 * @brief 返回最后一次动作产生的事件数量。
 * @param game 只读游戏对象指针。
 * @return 事件数量；game 为 NULL 时返回 0。
 */
WAM_API uint32_t WAM_GetEventCount(WAM_Game const *game);

/**
 * @brief 复制事件数组的一段到调用者缓冲区。
 * @param game 只读游戏对象指针。
 * @param start 起始事件下标。
 * @param events 指向输出数组。
 * @param capacity 输出数组可容纳的元素数量。
 * @return 实际复制数量；不会超过剩余事件数和 capacity。
 */
WAM_API uint32_t WAM_CopyEvents(
    WAM_Game const *game,
    uint32_t start,
    WAM_Event *events,
    uint32_t capacity);

/**
 * @brief 清空事件日志，并把事件序号重置为 0。
 * @param game 游戏对象指针；允许传 NULL。
 */
WAM_API void WAM_ClearEvents(WAM_Game *game);

/**
 * @brief 把状态编号转换为稳定英文名称。
 * @param state 状态编号。
 * @return 指向静态字符串的只读指针；调用者不得释放或修改。
 */
WAM_API char const *WAM_StateName(uint32_t state);

/**
 * @brief 把事件类型编号转换为稳定英文名称。
 * @param kind 事件类型编号。
 * @return 指向静态字符串的只读指针；调用者不得释放或修改。
 */
WAM_API char const *WAM_EventKindName(uint32_t kind);

#ifdef __cplusplus
}
#endif
/**< 结束 C++ 的 C 链接声明区域。 */

#endif
/**< 结束头文件保护。 */
