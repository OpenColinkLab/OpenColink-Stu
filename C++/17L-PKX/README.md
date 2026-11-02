# 状态机纸牌魔术（C 语言控制台原型）

使用 C 语言实现的 52 张扑克牌状态机程序。牌组只保存点数，花色可在展示层补充；程序通过固定状态转移表驱动洗牌、查看首尾、选取见证牌、盖牌、选牌、翻牌、排序和最终展示。

## 功能

- 初始化 52 张扑克牌，点数范围为 A～K，每个点数 4 张
- 使用 Fisher–Yates 算法洗牌
- 使用状态转移表管理流程
- 记录首牌、尾牌、用户点击位置和牌面朝向
- 支持连续点击事件驱动状态切换
- 为网页或图形界面预留点击接口 `receive_click()`

## 状态流程

```text
IDLE -> READ -> SAME -> ROTATE -> PICK -> FINISH -> SEQU -> SELECT -> TURN
```

| 状态 | 说明 |
|---|---|
| `IDLE` | 初始化并洗牌 |
| `READ` | 记录首尾牌 |
| `SAME` | 找出与首尾同点数的见证牌 |
| `ROTATE` | 将其余牌翻到背面 |
| `PICK` | 等待用户选牌 |
| `FINISH` | 确认用户选择 |
| `SEQU` | 以点击牌为切点重新整理牌堆 |
| `SELECT` | 确定夹心结构 |
| `TURN` | 呈现最终结果 |

## 文件说明

| 文件 | 说明 |
|---|---|
| `fsm.h` | 状态、事件、全局变量和函数声明 |
| `fsm.c` | 牌组初始化、洗牌、状态处理函数和状态机调度 |
| `main.c` | 控制台入口和输入演示 |

## 编译运行

### Windows（MinGW-w64）

```bat
gcc -std=c11 -Wall -Wextra fsm.c main.c -o magic.exe
magic.exe
```

### Linux / macOS

```bash
gcc -std=c11 -Wall -Wextra fsm.c main.c -o magic
./magic
```

## 说明

- `main.c` 提供控制台入口，当前主要演示初始化、洗牌和状态机调度。
- `receive_click(int idx)` 可用于接入网页按钮或其他图形界面的点击事件。
- 牌组数据中不包含花色，显示时可为每个点数补充四种花色。