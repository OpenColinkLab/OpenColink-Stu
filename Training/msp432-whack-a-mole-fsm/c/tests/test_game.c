/**
 * @file test_game.c
 * @brief 打地鼠 C 状态机的主机单元测试。
 *
 * 每个测试函数都创建一个独立 `WAM_Game` 实例，通过公开 API 操作状态机，
 * 再读取快照检查行为。测试不依赖 Keil、DriverLib、MSP432 硬件或系统时间。
 */

#include "whack_a_mole.h"

#include <assert.h>
#include <stdio.h>
#include <string.h>

/** 九宫地鼠可能对应的全部 MKEY 键值。 */
static uint32_t valid_codes[9] = {1U, 2U, 3U, 5U, 6U, 7U, 9U, 10U, 11U};

/**
 * @brief 判断某键值是否属于九宫地鼠有效键。
 * @param code 待检查键值。
 * @return 属于有效范围返回 1，否则返回 0。
 */
static int contains_code(uint32_t code)
{
    size_t i;
    for (i = 0U; i < 9U; i++) {
        if (valid_codes[i] == code) {
            return 1;
        }
    }
    return 0;
}

/**
 * @brief 验证新建对象处于 IDLE，且没有地鼠和分数。
 */
static void test_initial_state(void)
{
    WAM_Game *game = WAM_Create(7U);
    WAM_Snapshot snapshot;

    assert(game != NULL);
    WAM_GetSnapshot(game, &snapshot);
    assert(snapshot.state == WAM_STATE_IDLE);
    assert(snapshot.mole_hole == -1);
    assert(snapshot.score == 0U);
    assert(snapshot.lost == 0U);
    WAM_Destroy(game);
}

/**
 * @brief 验证开始键能生成地鼠，命中后加 1 分并进入下一轮。
 */
static void test_start_and_hit(void)
{
    WAM_Game *game = WAM_Create(1234U);
    WAM_Snapshot snapshot;

    WAM_PressKey(game, 16U);
    WAM_GetSnapshot(game, &snapshot);
    assert(snapshot.state == WAM_STATE_CHECK);
    assert(snapshot.round == 1U);
    assert(snapshot.mole_hole >= 0 && snapshot.mole_hole < 9);
    assert(contains_code(snapshot.mole_code));
    assert(snapshot.spawn_delay_ms >= 500U && snapshot.spawn_delay_ms <= 1900U);
    assert(snapshot.spawn_delay_ms % 100U == 0U);

    /* 使用刚读取到的地鼠键值，模拟玩家正确击中当前洞。 */
    WAM_PressKey(game, snapshot.mole_code);
    WAM_GetSnapshot(game, &snapshot);
    assert(snapshot.state == WAM_STATE_CHECK);
    assert(snapshot.score == 1U);
    assert(snapshot.lost == 0U);
    assert(snapshot.round == 2U);
    WAM_Destroy(game);
}

/**
 * @brief 验证点击非当前地鼠键值会增加失分并生成下一轮。
 */
static void test_wrong_key(void)
{
    WAM_Game *game = WAM_Create(3U);
    WAM_Snapshot snapshot;
    uint32_t wrong_code;
    size_t i;

    WAM_PressKey(game, 16U);
    WAM_GetSnapshot(game, &snapshot);
    wrong_code = valid_codes[0];
    for (i = 0U; i < 9U; i++) {
        if (valid_codes[i] != snapshot.mole_code) {
            wrong_code = valid_codes[i];
            break;
        }
    }

    WAM_PressKey(game, wrong_code);
    WAM_GetSnapshot(game, &snapshot);
    assert(snapshot.score == 0U);
    assert(snapshot.lost == 1U);
    assert(snapshot.round == 2U);
    WAM_Destroy(game);
}

/**
 * @brief 验证 499 ms 尚未超时，第 500 ms 才触发失分和下一轮。
 */
static void test_timeout(void)
{
    WAM_Game *game = WAM_Create(99U);
    WAM_Snapshot snapshot;

    WAM_PressKey(game, 16U);
    WAM_AdvanceTime(game, 499U);
    WAM_GetSnapshot(game, &snapshot);
    assert(snapshot.lost == 0U);
    assert(snapshot.state == WAM_STATE_CHECK);

    WAM_AdvanceTime(game, 1U);
    WAM_GetSnapshot(game, &snapshot);
    assert(snapshot.lost == 1U);
    assert(snapshot.round == 2U);
    assert(snapshot.state == WAM_STATE_CHECK);
    WAM_Destroy(game);
}

/**
 * @brief 验证游戏中的键值 16 能返回 IDLE，并清除当前地鼠。
 */
static void test_quit(void)
{
    WAM_Game *game = WAM_Create(44U);
    WAM_Snapshot snapshot;

    WAM_PressKey(game, 16U);
    WAM_PressKey(game, 16U);
    WAM_GetSnapshot(game, &snapshot);
    assert(snapshot.state == WAM_STATE_IDLE);
    assert(snapshot.mole_hole == -1);
    WAM_Destroy(game);
}

/**
 * @brief 验证导航键 4 不会改变分数、轮次或当前地鼠。
 */
static void test_navigation_key_does_not_score(void)
{
    WAM_Game *game = WAM_Create(8U);
    WAM_Snapshot before;
    WAM_Snapshot after;

    WAM_PressKey(game, 16U);
    WAM_GetSnapshot(game, &before);
    WAM_PressKey(game, 4U);
    WAM_GetSnapshot(game, &after);
    assert(after.score == before.score);
    assert(after.lost == before.lost);
    assert(after.round == before.round);
    assert(after.mole_hole == before.mole_hole);
    WAM_Destroy(game);
}

/**
 * @brief 验证相同 seed 会生成相同洞位和相同准备延时。
 */
static void test_seed_is_reproducible(void)
{
    WAM_Game *left = WAM_Create(2026U);
    WAM_Game *right = WAM_Create(2026U);
    WAM_Snapshot left_snapshot;
    WAM_Snapshot right_snapshot;

    WAM_PressKey(left, 16U);
    WAM_PressKey(right, 16U);
    WAM_GetSnapshot(left, &left_snapshot);
    WAM_GetSnapshot(right, &right_snapshot);
    assert(left_snapshot.mole_hole == right_snapshot.mole_hole);
    assert(left_snapshot.spawn_delay_ms == right_snapshot.spawn_delay_ms);
    WAM_Destroy(left);
    WAM_Destroy(right);
}

/**
 * @brief 验证开始动作的事件日志同时包含 START、SPAWN 和 STATE 记录。
 */
static void test_events_include_actions_and_transitions(void)
{
    WAM_Game *game = WAM_Create(5U);
    WAM_Event events[16];
    uint32_t count;
    uint32_t i;
    int saw_start = 0;
    int saw_spawn = 0;
    int saw_state = 0;

    WAM_PressKey(game, 16U);
    count = WAM_GetEventCount(game);
    assert(count > 0U);
    assert(WAM_CopyEvents(game, 0U, events, 16U) == count);
    for (i = 0U; i < count; i++) {
        saw_start |= events[i].kind == WAM_EVENT_START;
        saw_spawn |= events[i].kind == WAM_EVENT_SPAWN;
        saw_state |= events[i].kind == WAM_EVENT_STATE;
    }
    assert(saw_start && saw_spawn && saw_state);
    WAM_Destroy(game);
}

/**
 * @brief C 测试入口，依次执行全部状态机场景。
 * @return 所有断言通过时返回 0。
 */
int main(void)
{
    assert(WAM_ApiVersion() == 1U);
    assert(strcmp(WAM_StateName(WAM_STATE_CHECK), "CHECK") == 0);
    test_initial_state();
    test_start_and_hit();
    test_wrong_key();
    test_timeout();
    test_quit();
    test_navigation_key_does_not_score();
    test_seed_is_reproducible();
    test_events_include_actions_and_transitions();
    puts("All C state-machine tests passed.");
    return 0;
}
