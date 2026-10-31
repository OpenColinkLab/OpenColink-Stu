/**
 * @file sol_fsm.c
 * @brief 通用 FSM 构造、初始化和事件派发实现。
 *
 * @details 本文件只负责“什么时候调用哪个状态函数”，不包含打地鼠业务。
 * 游戏规则全部位于 `whack_a_mole.c`，这样通用状态机可以被其他项目复用。
 */

#include "sol_fsm.h"

/**
 * 进入事件的静态常量对象。
 *
 * `event_t const` 表示事件内容只读；派发器把它的地址传给状态函数。
 * 所有状态共享同一个不可变 ENTRY 事件，不需要每次重新构造。
 */
static event_t const entry_evt = {ENTRY_SIG};

/**
 * 退出事件的静态常量对象。
 *
 * 与 `entry_evt` 相同，内容只读。真正需要传数据时常量事件仍然只传信号，
 * 业务数据由状态对象自身保存。
 */
static event_t const exit_evt = {EXIT_SIG};

/**
 * @brief 设置 FSM 的初始状态处理函数。
 *
 * @param this_p 指向 FSM 对象。该指针本身可修改，但不会在这里改成别的地址；
 *               通过 `this_p->` 修改的是它指向对象里的 `state_handler`。
 * @param initial 初始状态函数地址。
 *
 * @details 本函数只写函数指针，不自动发送 ENTRY_SIG。调用者完成构造后，
 * 还需要调用 `SOL_FSM_Init` 才表示“正式进入初始状态”。
 */
void SOL_FSM_Handler_Ctor(FSM_t *this_p, State_Handler initial)
{
    this_p->state_handler = initial;
}

/**
 * @brief 设置事件对象的信号值。
 *
 * @param evt 指向可写事件对象。
 * @param initial 要写入的信号编号。
 *
 * @note `evt` 是普通对象指针，不是函数指针。`evt->signal` 等价于
 *       `(*evt).signal`，表示先访问事件对象，再访问它的字段。
 */
void SOL_FSM_Sig_Ctor(event_t *evt, sig_t initial)
{
    evt->signal = initial;
}

/**
 * @brief 初始化状态机，向当前状态派发一次进入事件。
 *
 * @param this_p 指向已经完成构造的 FSM 对象。
 *
 * @details
 * `this_p->state_handler` 是函数指针，`this_p->state_handler(this_p, &entry_evt)`
 * 表示通过函数指针发起一次间接调用：
 * - 把 `this_p` 原样作为第一个参数传回状态函数。
 * - 把 `&entry_evt`，即只读 ENTRY 事件的地址，作为第二个参数。
 *
 * 前面的 `(void)` 表示明确丢弃返回值，避免 `/W4` 报告未使用表达式结果。
 * 初始化时通常不关心 ENTRY 处理函数返回的是 HANDLED 还是 IGNORED。
 */
void SOL_FSM_Init(FSM_t *this_p)
{
    (void)this_p->state_handler(this_p, &entry_evt);
}

/**
 * @brief 派发一次事件，并在发生转移时执行完整的 EXIT → ENTRY 生命周期。
 *
 * @param this_p 指向 FSM 对象。
 * @param evt 指向只读事件。这里的两个 `const` 含义不同：
 *            - `event_t const *`：不能通过该指针修改它指向的事件内容；
 *            - 若写成 `event_t const * const`，则连指针本身也不能改。
 *
 * @details
 * 派发分四步：
 * 1. 复制当前 `state_handler` 到局部变量 `previous`。
 * 2. 通过 `previous` 调用旧状态处理函数。
 * 3. 如果返回 `TRAN_STATUS`，说明旧状态已经用转移宏改写了
 *    `this_p->state_handler`；此时旧句柄仍保存在 `previous` 中。
 * 4. 先调用 `previous(..., EXIT)` 清理旧状态，再调用新的
 *    `state_handler(..., ENTRY)` 进入新状态。
 *
 * @warning 如果第 1 步不保存 `previous`，处理器切换后 `state_handler` 已经指向
 *          新状态，就无法再把 EXIT 信号发送给旧状态。
 */
void SOL_FSM_Dispatch(FSM_t *this_p, event_t const *evt)
{
    /* 复制的是函数地址，不是 FSM 对象；previous 与 state_handler 指向同一函数。 */
    State_Handler previous = this_p->state_handler;

    /* 通过函数指针间接调用当前状态处理函数，并把返回状态保存下来。 */
    status_t result = previous(this_p, evt);

    if (result == TRAN_STATUS) {
        /* 转移宏已经改过 state_handler，因此必须用 previous 通知旧状态退出。 */
        (void)previous(this_p, &exit_evt);

        /* 读取已经更新的 state_handler，把 ENTRY 发送给新状态。 */
        (void)this_p->state_handler(this_p, &entry_evt);
    }
}
