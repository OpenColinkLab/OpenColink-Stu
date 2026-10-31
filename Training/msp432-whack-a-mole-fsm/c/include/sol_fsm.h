/**
 * @file sol_fsm.h
 * @brief 从 MSP432 打地鼠工程提炼出的通用事件驱动状态机接口。
 *
 * @details
 * 这套 FSM 的核心思想只有两步：
 * 1. 每个状态实现成一个签名完全相同的普通 C 函数。
 * 2. `FSM_t::state_handler` 保存“当前状态函数”的地址，事件到来时通过
 *    函数指针间接调用它。
 *
 * 阅读本文件时要始终区分两件事：
 * - `FSM_t *this_p`：指向某个 FSM 对象，也就是“对象在哪里”。
 * - `State_Handler state_handler`：指向某个状态函数，也就是“下一步执行谁”。
 *
 * 前者是对象指针，后者是函数指针，二者保存的都是地址，但指向的对象类型不同。
 *
 * @note 原始工程作者：Chsier。本文件保留原始三状态设计思路，并修正转移宏
 *       未返回 `TRAN_STATUS` 导致 EXIT/ENTRY 不执行的问题。
 */

#ifndef SOL_FSM_H
#define SOL_FSM_H
/**<
 * 头文件保护宏：同一个编译单元重复包含 `sol_fsm.h` 时，第二次内容会被跳过，
 * 避免类型和函数声明重复定义。
 */

#include <stdint.h>
/**< 提供 `uint16_t` 等固定宽度整数类型。 */

#ifdef __cplusplus
extern "C" {
#endif
/**<
 * 允许 C++ 编译单元包含本头文件。`extern "C"` 让 C++ 按 C 的规则生成函数名，
 * 避免 C/C++ 链接时因名称修饰不同而找不到符号。
 */

/**
 * @brief 状态机信号类型。
 *
 * 信号只是事件分类编号，不携带业务数据。业务数据放在项目子结构体中，
 * 例如按键值、地鼠位置和分数。
 */
typedef uint16_t sig_t;

/**
 * @brief 通用 FSM 信号枚举。
 */
typedef enum {
    INIT_SIG = 0,  /**< 初始化信号；本精简版保留编号，但初始化入口主要使用 ENTRY。 */
    ENTRY_SIG,     /**< 进入状态信号；派发器在状态切换后发送给新状态。 */
    EXIT_SIG,      /**< 退出状态信号；派发器在状态切换前发送给旧状态。 */
    IS_GAME_SIG    /**< 原工程的业务事件；主循环反复派发它来驱动游戏。 */
} SolSignal;

/**
 * @brief 一次状态机事件。
 *
 * 原工程事件结构只保存 `signal`，按键等变化从全局变量读取。提炼版保留这个
 * 最小事件结构，并把业务数据放进 `Proj_UserFsm`，便于建立多个测试实例。
 */
typedef struct {
    sig_t signal; /**< 当前事件信号，例如 ENTRY_SIG 或 IS_GAME_SIG。 */
} event_t;

/**
 * @brief 状态处理函数的返回值。
 *
 * 派发器只关心是否发生了状态切换，因此 `TRAN_STATUS` 是最关键的值。
 */
typedef enum {
    TRAN_STATUS = 0,  /**< 处理器已通过转移宏修改 state_handler，需要执行 EXIT/ENTRY。 */
    HANDLED_STATUS,   /**< 事件已被处理，但当前状态没有变化。 */
    IGNORED_STATUS,   /**< 当前状态不处理这个信号。 */
    INIT_STATUS       /**< 初始化相关状态；为兼容原始设计保留。 */
} status_t;

typedef struct FSM_t FSM_t;
/**< 前置声明：允许下面的函数指针在结构体完整定义之前引用 `FSM_t`。 */

/**
 * @brief 状态处理函数指针类型。
 *
 * 把类型从中间拆开阅读：
 * @code
 * typedef status_t (*State_Handler)(FSM_t *this_p, event_t const *evt);
 * @endcode
 *
 * - `State_Handler` 是一个“指向函数”的类型。
 * - 被指向的函数返回 `status_t`。
 * - 第一个参数 `this_p` 指向 FSM 对象。
 * - 第二个参数 `evt` 指向只读事件对象，函数内部不能修改原事件。
 *
 * 普通函数名出现在表达式中时，会退化为该函数的地址。因此可以写：
 * @code
 * this_p->state_handler = My_State;
 * @endcode
 * 也可以显式写成 `&My_State`，二者在现代 C 中表达同一个函数地址。
 */
typedef status_t (*State_Handler)(FSM_t *this_p, event_t const *evt);

/**
 * @brief 通用状态机对象。
 *
 * 这个结构体不保存“状态编号”，而是直接保存当前状态函数的地址。
 * 因此切换状态本质上是给函数指针重新赋值。
 */
struct FSM_t {
    State_Handler state_handler; /**< 指向当前状态处理函数；事件派发时调用它。 */
};

/**
 * @brief 切换状态，并返回给派发器的转移状态。
 *
 * @param this_p 指向 FSM 基类对象。通常是项目子结构体中位于 offset 0 的
 *               `FSM_t` 成员，或者由项目对象转换得到的 `FSM_t *`。
 * @param target 目标状态的函数名。函数名会自动转换为函数地址；宏内部再把
 *               它强制转换成统一的 `State_Handler` 类型。
 *
 * @return 整个逗号表达式的值是 `TRAN_STATUS`。正确的调用方式必须是：
 * @code
 * return SOL_FSM_Tran(this_p, Proj_Check);
 * @endcode
 *
 * @details
 * 宏在预处理阶段只做文本替换。假设调用：
 * @code
 * return SOL_FSM_Tran(this_p, Proj_Check);
 * @endcode
 * 会大致展开为：
 * @code
 * return (((FSM_t *)(this_p))->state_handler =
 *             (State_Handler)(Proj_Check), TRAN_STATUS);
 * @endcode
 *
 * 按顺序理解：
 * 1. `(FSM_t *)(this_p)`：把项目对象地址转换为 FSM 基类指针。转换后仍指向
 *    同一个内存地址，只是编译器按 `FSM_t` 布局访问它。
 * 2. `((FSM_t *)(this_p))->state_handler`：先解引用得到 FSM 对象，再访问其中
 *    的函数指针成员。`p->member` 等价于 `(*p).member`。
 * 3. `state_handler = (State_Handler)(target)`：把目标函数地址写入函数指针槽位。
 *    赋值表达式本身的值是“赋值后的函数指针”。
 * 4. 中间的逗号是 C 的逗号运算符，不是函数参数分隔符。逗号左侧先执行并丢弃
 *    其值，右侧 `TRAN_STATUS` 后执行，整个表达式的最终值是 `TRAN_STATUS`。
 *    因此必须把这个宏放在 `return` 后面，派发器才会收到转移结果。
 *
 * @warning 原工程只写了 `SOL_FSM_Tran(Proj_Check);`，随后又把局部返回值设为
 *          `HANDLED_STATUS`。函数指针虽然被修改，但派发器不知道发生了转移，
 *          所以旧状态的 EXIT 和新状态的 ENTRY 都不会执行。
 *
 * @warning 原始设计把项目处理函数强制转换为 `State_Handler`，但项目函数第一
 *          参数实际是项目子结构体指针。很多嵌入式 ABI 上两种指针表示相同，
 *          可以运行；严格按 C 标准，使用不兼容函数指针类型调用属于未定义行为。
 *          若用于高可靠性项目，建议增加统一签名的包装函数，避免该强制转换。
 */
#define SOL_FSM_Tran(this_p, target)                                           \
    (((FSM_t *)(this_p))->state_handler = (State_Handler)(target), TRAN_STATUS)

/**
 * @brief 构造 FSM，把初始状态函数写入 `state_handler`。
 * @param this_p 指向待构造的 FSM 对象。
 * @param initial 初始状态函数地址。
 */
void SOL_FSM_Handler_Ctor(FSM_t *this_p, State_Handler initial);

/**
 * @brief 构造一个事件对象，只设置信号值。
 * @param evt 指向待修改的事件对象。
 * @param initial 初始信号。
 */
void SOL_FSM_Sig_Ctor(event_t *evt, sig_t initial);

/**
 * @brief 初始化状态机，向初始状态发送一次 ENTRY_SIG。
 * @param this_p 指向已经设置好 `state_handler` 的 FSM 对象。
 */
void SOL_FSM_Init(FSM_t *this_p);

/**
 * @brief 把事件交给当前状态；若发生转移，再执行旧状态 EXIT 和新状态 ENTRY。
 * @param this_p 指向 FSM 对象。
 * @param evt 指向只读事件对象。
 */
void SOL_FSM_Dispatch(FSM_t *this_p, event_t const *evt);

#ifdef __cplusplus
}
#endif
/**< 结束 C++ 的 C 链接声明区域。 */

#endif
/**< 结束头文件保护。 */
