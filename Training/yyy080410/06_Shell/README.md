# 06 Shell（命令注册 + 参数解析 + 串口控制 LED）

## 目标

在阶段 5「串口学生管理」的基础上，把「一行命令 → 查表 → 调用函数」做成一个可扩展的 shell：

- 命令**注册**：新增命令只需在命令表里加一行；
- 参数**解析**：按空格切成 `argc` / `argv`，支持子命令；
- 串口控制 LED：`led on` / `led off` / `led toggle`；
- 学生管理迁移为 `stu add|get|del|set|list|clr`，原来的逗号协议删除。

## 硬件与环境

| 项目 | 内容 |
|---|---|
| 开发板 | STM32F103C8T6 最小系统板（64 KB Flash / 20 KB SRAM） |
| 串口 | **USART2**：PA2 = TX，PA3 = RX |
| 电平转换 | USB 转 TTL 模块（CH340） |
| 开发工具 | STM32CubeMX 6.15 + Keil MDK 5（HAL 库 F1 1.1.10） |
| 串口参数 | 115200 / 8 数据位 / 无校验 / 1 停止位 |
| LED | 板载 PC13，**低电平点亮** |

## 接线

```
USB-TTL RXD  ←────  PA2   （PA2 是 USART2_TX）
USB-TTL TXD  ────→  PA3   （PA3 是 USART2_RX）
USB-TTL GND  ─────  GND
```

对方 RXD 接我的 TX、对方 TXD 接我的 RX，交叉连接，GND 必须共地。

> **供电注意**：本阶段调试时遇到过 `led on` 触发掉电复位（`RST:POR`）。
> 原因是板子只由 CH340 的 3.3V 供电，而 CH340 的 3.3V 输出能力很弱，
> 再加上未上电的 ST-Link 经 SWD 的 3.3V 线倒灌取电，LED 一亮电流增加就跌破复位阈值。
> 正确做法：用 CH340 的 **5V** 接板子 5V 脚（走板载 AMS1117），拔掉 3.3V 线；
> 或者直接用板子的 USB 口供电。任何时候只保留一个 3.3V 源，5V 和 3.3V 不要同时接。

## 工程结构

```
06_Shell/
├── Core/
│   ├── Inc/
│   │   ├── main.h
│   │   ├── shell.h              ← cmd_fn / Command / Shell_Exec
│   │   └── ReadLine.h
│   └── Src/
│       ├── main.c               ← 业务：cmd_stu + Cmd_* + UART_Send
│       ├── shell.c              ← 解析：命令表 + 分发
│       ├── ReadLine.c           ← 逐字节收行
│       ├── stm32f1xx_it.c
│       ├── stm32f1xx_hal_msp.c
│       └── system_stm32f1xx.c
├── Drivers/                     ← HAL 库 + CMSIS
├── MDK-ARM/aaaa.uvprojx         ← Keil 工程（打开这个）
└── aaaa.ioc                     ← CubeMX 配置
```

## Shell 是怎么工作的

### 1. 一行命令的生命周期

```
串口字节
  → UART_ReadLine() 逐字节收，遇到 '\n' 补 '\0' 并返回 1
  → main 看返回值 r
       r == 1 → Shell_Exec(line)
                  → strtok 按空格/制表符切成 argv[]
                  → 遍历命令表比对 argv[0]
                  → 命中：调用 fn(argc, argv)
                  → 没命中：return 0 → main 回 ERR,1
       r == 2 → 一行超过 63 字节 → 回 ERR,7
       r == 0 → 超时/收到 '\r' → 什么都不做
```

这里有一个容易踩的坑：**只有 `r == 1` 才能碰 `line`**。
`r == 0` 时 `line` 没被写过（或还是上一条命令的残留），`r == 2` 时 `line` 里没有 `\0`。
如果不判断 `r` 直接解析，超时后会把上一条命令重放一遍。

### 2. 命令表与函数指针

`shell.h` 定义两个类型：

```c
/* 一条命令的处理函数：argc/argv 和 main() 的约定一样 */
typedef void (*cmd_fn)(int argc, char **argv);

/* 命令表里的一行 */
typedef struct
{
    const char *name;   /* 命令名，例如 "led" */
    cmd_fn      fn;     /* 该命令对应的函数 */
    const char *help;   /* 帮助文字 */
} Command;
```

`shell.c` 里就是一张表：

```c
static const Command g_cmds[] = {
    { "help", cmd_help, "help                 list all commands" },
    { "led",  cmd_led,  "led on|off|toggle    control PC13 LED" },
    { "stu",  cmd_stu,  "stu add|get|del|set|list|clr   manage students" },
};
#define CMD_COUNT (sizeof(g_cmds) / sizeof(g_cmds[0]))
```

`cmd_fn` 把「参数表相同的函数」抽象成一个类型；表里存的是函数地址，
`g_cmds[i].fn(argc, argv)` 就是通过函数指针调用。
以后加命令 = 写一个 `void cmd_xxx(int argc, char **argv)` + 在表里加一行。

表是 `static const`，编译期就确定，放在 Flash 里，不占 RAM。

### 3. 参数约定

- `argv[0]` 是命令名，`argv[1]` 起才是参数；`argc` **包含命令名**。
- 最多 `CMD_MAX_ARGS = 8` 段，多出来的直接丢弃（不报错、不越界）。
- 分隔符只有空格和制表符，**没有引号、没有转义**：名字里不能带空格。
- 命令和子命令**区分大小写**，统一用小写。
- 取 `argv[n]` 之前必须先确认 `argc > n`，否则 `argv[n]` 是未初始化的指针。

### 4. 返回值约定

| `Shell_Exec` 返回 | 含义 | main 的处理 |
|---|---|---|
| 1 | 已处理（包括空行） | 不回应 |
| 0 | 不认识 | 回 `ERR,1` |

## 命令表

| 命令 | 格式 | 成功回复 | 说明 |
|---|---|---|---|
| 帮助 | `help` | 每行「名字 + 说明」 | 遍历命令表打印 |
| LED | `led on` / `led off` / `led toggle` | `OK,led on` / `OK,led off` / `OK,led toggled` | PC13 低电平点亮 |
| 学生 | `stu <子命令> ...` | 见下表 | 迁移自阶段 5 |

### stu 子命令

| 子命令 | 格式 | 成功回复 |
|---|---|---|
| 添加 | `stu add <id> <name>` | `OK,added` |
| 查询 | `stu get <id>` | `OK,<id>,<name>` |
| 删除 | `stu del <id>` | `OK,deleted` |
| 修改 | `stu set <id> <name>` | `OK,updated` |
| 列表 | `stu list` | `OK,` 换行后逐行 `id,name`；空表只回 `NULL` |
| 清空 | `stu clr` | `OK,cleared` |

参数个数在 `cmd_stu` 里检查：`add` / `set` 至少 4 段，`get` / `del` 至少 3 段，
不够回 `ERR,2`；学号格式、重复、容量等仍由 `Cmd_*` 判断。

### 错误码

| 码 | 含义 | 触发场景 |
|---|---|---|
| `ERR,1` | 未知命令 / 子命令 | `foo`、`stu foo` |
| `ERR,2` | 参数缺失 | `stu add 1001`、`stu get` |
| `ERR,3` | 学号重复 | `stu add` 已存在的学号 |
| `ERR,4` | 学号不存在 | `get` / `del` / `set` 找不到 |
| `ERR,5` | 容量已满 | 已有 10 条时再 `add` |
| `ERR,6` | 格式错误 | 学号非 1~8 位数字；姓名为空或 ≥17 字节 |
| `ERR,7` | 一行超长 | 单行超过 63 字节 |

另外 `led` 的参数错误回 `ERR: unknown option`，不带参数回 `usage: led on|off|toggle`；
`stu` 不带子命令回 `usage: stu add|get|del|set|list|clr`。

## 与阶段 5 的差异

| | 05 | 06 |
|---|---|---|
| 分隔符 | 逗号 `,` | 空格 / 制表符 |
| 命令 | `ADD,1001,张三` | `stu add 1001 张三` |
| 分发方式 | `HandleCommand` 里 if-else | 命令表 + 函数指针 |
| 新增命令 | 改分发函数 | 表里加一行 |
| LED | 无 | `led on/off/toggle` |
| 未知命令 | 兜底回 `ERR,1` | `Shell_Exec` 返回 0，main 回 `ERR,1` |

`HandleCommand` 已删除；旧的逗号写法不再生效（会回 `ERR,1`）。

## 会话示例

```
> help
help                 list all commands
led on|off|toggle    control PC13 LED
stu add|get|del|set|list|clr   manage students
> led on
OK,led on
> stu add 1001 张三
OK,added
> stu list
OK,
1001,张三
> stu get 1001
OK,1001,张三
> stu set 1001 李四
OK,updated
> stu del 1001
OK,deleted
> stu list
NULL
> stu foo
ERR,1
> foo
ERR,1
```

## 实现要点

1. **函数指针 typedef**：`cmd_fn` 是「指向 `void f(int, char **)` 的指针」的类型名；
   表里的 `fn` 字段用它，调用时 `fn(argc, argv)` 自动解引用。
2. **表驱动**：命令名、函数、帮助在同一行维护，`help` 直接遍历表，
   不会出现「加了命令忘了写帮助」。
3. **先判数量再取参数**：`argc < 2` 时 `argv[1]` 根本没赋值，必须先判 `argc` 再 `strcmp`。
4. **分层**：`shell.c` 只负责解析和分发；`main.c` 放业务（`cmd_stu`、`Cmd_*`、`UART_Send`），
   `shell.c` 用 `extern` 声明 `cmd_stu`。这样 shell 引擎不用知道学生数据长什么样。
5. **复用**：`stu` 不重写 CRUD，只做参数个数检查，然后调用 05 里的
   `Cmd_Add` / `Cmd_Get` / `Cmd_Del` / `Cmd_Set` / `Cmd_List` / `Cmd_Clr`。

## 验收用例

| # | 发送 | 期待 |
|---|---|---|
| 1 | `help` | 三行：help / led / stu |
| 2 | `led on` → `led off` → `led toggle` | 三条 `OK,...`，LED 状态正确 |
| 3 | `led` / `led abc` | usage / `ERR: unknown option` |
| 4 | `stu list`（空表） | `NULL` |
| 5 | `stu add 1001 张三` → `stu list` | `OK,added` → `OK,` + `1001,张三` |
| 6 | 同一学号再 `stu add` | `ERR,3` |
| 7 | `stu get 1001` | `OK,1001,张三` |
| 8 | `stu set 1001 李四` → `stu get 1001` | `OK,updated` → `OK,1001,李四` |
| 9 | `stu del 1001` → `stu del 1001` | `OK,deleted` → `ERR,4` |
| 10 | `stu add 1001` / `stu get` | `ERR,2` |
| 11 | `stu add 123456789 x`（9 位学号） | `ERR,6` |
| 12 | `stu foo` / `foo` | `ERR,1` |
| 13 | 加满 10 条（不同学号）后第 11 条 | `ERR,5` |
| 14 | 单行 > 63 字节 | `ERR,7` |
| 15 | 发完命令静置 10 秒 | 串口不再输出（验证没有重复执行） |
| 16 | `ADD,1001,张三` | `ERR,1`（旧协议已移除） |

## 遇到的问题及解决

1. **编译报 3 个错：`missing closing quote` / `expected a ","` / `expected a "}"`**

   命令表里的帮助文字写成了中文，文件是 UTF-8，而 armcc 按 GBK 解析源码，
   中文出现在**字符串字面量**里会把引号吞掉（中文注释不受影响）。
   **解决**：命令表的 help 改成英文；源码里的中文注释保留。

2. **`Shell_Exec` 里第一条命令总能匹配，后面的都不行**

   `return 1;` 写在了 `for` 循环内、`if` 外，第一圈没命中就直接返回了。
   **解决**：把 `return 1;` 挪进 `if (strcmp(...) == 0)` 里面。

3. **`help` 少显示最后一条命令**

   循环条件写成 `i < CMD_COUNT - 1`，漏了最后一项。
   **解决**：改成 `i < CMD_COUNT`。

4. **删掉兜底后，串口每 10ms 自动刷 `NULL`**

   主循环把 `if (r == 1)` 一起删了。`UART_ReadLine` 超时返回 0 时 `line` 还是上一条命令的残留，
   `Shell_Exec` 又执行了一遍。
   **解决**：恢复「`r == 1` 才解析」，`r == 2` 回 `ERR,7`。

5. **发 `led on` 时偶尔复位，串口出现 `BOOT v5`**

   加复位标志诊断后看到 `RST:POR RST:PIN`：POR 置位说明 VDD 跌破复位阈值。
   当时板子只由 CH340 的 3.3V 供电，且未上电的 ST-Link 还挂在 SWD 上倒灌取电，
   LED 一亮电流增加就掉电。
   **解决**：改用 5V 供电（走板载 AMS1117），拔掉 ST-Link 排线；任何时候只保留一个 3.3V 源。

6. **`stu list` 回 `ERR,1`，重新下载后回 `NULL`**

   和阶段 5 的 `SET` 一样：只 Build 没 Download，芯片里跑的还是旧固件。
   **解决**：Build 后必须 Download；看到 `BOOT v5` 再发命令。

## 已知限制

- **命令区分大小写**：`LED`、`STU` 不认识。
- **参数不能含空格**：`stu add 1001 张 三` 只会存下「张」；要支持得加引号解析。
- **最多 8 段参数**：超出部分被丢弃。
- **没有历史、退格、Tab 补全**：纯行模式，编辑交给串口助手。
- **帮助文字用英文**：受 armcc 的 GBK 源码解析限制；若要中文，需把源文件转 GBK 或换编译器。
- **数据不持久化**：学生表在 SRAM，复位清零。
- **启动诊断**：`main.c` 里保留了 `RST:...` 打印，正式发布时可以删掉。

## 备注

- 阶段 6 的任务定义见规培计划：「实现一个简单的 Shell，能注册命令、解析参数，并通过串口命令控制 LED」。
- 本工程由阶段 5 扩展而来，串口、时钟、学生数据结构未改动；
  新增 `shell.c` / `shell.h`，修改 `main.c` 和 Keil 工程文件。
- 编译产物（`MDK-ARM/aaaa/`、`*.axf`、`*.hex`、`*.map` 等）已被 `.gitignore` 忽略。
