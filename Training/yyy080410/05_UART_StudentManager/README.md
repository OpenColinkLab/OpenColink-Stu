# 05 串口学生管理（USART 协议 CRUD）

## 目标

在阶段 4「串口回显」的基础上，设计一套基于行的文本协议，通过串口命令完成学生信息的**增、删、改、查**；
正常输入返回结果，异常输入返回明确的错误码。

数据保存在 STM32 的 SRAM 中，掉电或复位后清空（本阶段不要求持久化）。

## 硬件与环境

| 项目 | 内容 |
|---|---|
| 开发板 | STM32F103C8T6 最小系统板（64 KB Flash / 20 KB SRAM） |
| 串口 | **USART2**：PA2 = TX，PA3 = RX |
| 电平转换 | USB 转 TTL 模块（CH340） |
| 开发工具 | STM32CubeMX 6.15 + Keil MDK 5（HAL 库 F1 1.1.10） |
| 串口参数 | 115200 / 8 数据位 / 无校验 / 1 停止位 |

## 接线

```
USB-TTL RXD  ←────  PA2   （PA2 是 USART2_TX）
USB-TTL TXD  ────→  PA3   （PA3 是 USART2_RX）
USB-TTL GND  ─────  GND
```

对方 RXD 接我的 TX、对方 TXD 接我的 RX，交叉连接，GND 必须共地。
烧录时先接 ST-Link，烧完拔掉 ST-Link 再接 USB-TTL（原因见阶段 4 README 的地环路问题）。

## 工程结构

```
05_UART_StudentManager/
├── Core/
│   ├── Inc/
│   │   ├── main.h
│   │   └── ReadLine.h          ← 行缓冲接口
│   └── Src/
│       ├── main.c              ← 协议分发 + 六个命令
│       ├── ReadLine.c          ← 逐字节收行（已放入工程内）
│       ├── stm32f1xx_it.c
│       ├── stm32f1xx_hal_msp.c
│       └── system_stm32f1xx.c
├── Drivers/                    ← HAL 库 + CMSIS
├── MDK-ARM/aaaa.uvprojx        ← Keil 工程（打开这个）
└── aaaa.ioc                    ← CubeMX 配置
```

> 注意：`ReadLine.c` 原来放在工程目录外（`D:\yyywork\ReadLine.c`），
> 已移入 `Core/Src/` 并同步修改了 `.uvprojx` / `.uvoptx` 中的文件路径，
> 整个目录可以独立复制、编译。

## 协议设计

### 报文格式

- 一条命令一行，以 `\n` 结束（`\r` 被忽略，兼容 `\r\n`）。
- 字段之间用**半角逗号** `,` 分隔；命令字和学号区分大小写。
- 单行最长 **63 字节**（缓冲区 64 字节，含结尾 `\0`），超出返回 `ERR,7`。
- 学号：**1~8 位纯数字**；姓名：**1~16 字节**（UTF-8 下一个汉字 3 字节）。
- 最多 **10** 条记录。

### 命令表

| 命令 | 格式 | 成功回复 | 说明 |
|---|---|---|---|
| 添加 | `ADD,<id>,<name>` | `OK,added` | 学号重复 / 已满 / 格式错时失败 |
| 查询 | `GET,<id>` | `OK,<id>,<name>` | 不存在返回 `ERR,4` |
| 删除 | `DEL,<id>` | `OK,deleted` | 用最后一条覆盖被删项，O(1) |
| 修改 | `SET,<id>,<name>` | `OK,updated` | 只改姓名，学号不可改 |
| 列表 | `LIST` | `OK,` 换行后逐行 `id,name`；空表返回 `NULL` | 每条一行，`\r\n` 结尾 |
| 清空 | `CLR` | `OK,cleared` | `stu_count = 0` |
| 未知 | 其它 | `ERR,1` | 命令字不认识 |

### 错误码

| 码 | 含义 | 触发场景 |
|---|---|---|
| `ERR,1` | 未知命令 | 命令字不在上表内 |
| `ERR,2` | 参数缺失 | `ADD,1001`、`SET,1001`、`DEL` |
| `ERR,3` | 学号重复 | 添加已存在的学号 |
| `ERR,4` | 学号不存在 | `GET` / `DEL` / `SET` 找不到 |
| `ERR,5` | 容量已满 | 已有 10 条时继续 `ADD` |
| `ERR,6` | 格式错误 | 学号非 1~8 位数字；姓名为空或 ≥17 字节 |
| `ERR,7` | 一行超长 | 单行超过 63 字节 |

### 会话示例

```
> CLR
OK,cleared
> ADD,1001,张三
OK,added
> ADD,1002,李四
OK,added
> LIST
OK,
1001,张三
1002,李四
> SET,1002,王五
OK,updated
> GET,1002
OK,1002,王五
> DEL,1001
OK,deleted
> LIST
OK,
1002,王五
> ADD,1001
ERR,2
> ADD,1001,张三
OK,added
> ADD,1001,赵六
ERR,3
> GET,9999
ERR,4
> ADD,123456789,张三
ERR,6
> CLR
OK,cleared
> LIST
NULL
```

## 实现思路

**① 行缓冲（ReadLine.c）**

每 10 ms 取一个字节，`\r` 直接丢弃，`\n` 时补 `\0` 并返回 1；
缓冲区满时清空下标并返回 2，主循环据此回 `ERR,7`。
用 `static uint8_t idx` 保存跨调用的状态，不需要动态内存。

**② 命令分发（HandleCommand）**

`strtok(line, ",")` 取出命令字，`strcmp` 依次比对；
参数再用 `strtok(NULL, ",")` 逐个取。未命中任何分支回 `ERR,1`。

**③ 数据结构**

```c
typedef struct {
    char id[ID_LEN];      /* 9：8 位学号 + '\0' */
    char name[NAME_LEN];  /* 17：16 字节姓名 + '\0' */
} Student;

Student students[MAX_STU];  /* 10 条，共 260 字节 */
uint8_t stu_count;          /* 逻辑长度，只有 0 ~ count-1 有效 */
```

**④ 增删改查**

- **查**：`FindById` 线性扫描 `0 ~ stu_count-1`，返回指针或 `NULL`。
- **增**：依次检查 参数 → 学号格式 → 姓名长度 → 重复 → 容量，再 `strcpy` 两条字段、`stu_count++`。
- **删**：`int idx = s - students;` 指针相减求下标，用 `students[stu_count-1]` 覆盖它，再 `stu_count--`。
  学生列表无顺序要求，不需要循环前移；被删位置在尾部残留的数据不在有效区间内，无需清零。
  单条记录时 `idx == stu_count-1`，是自赋值，不会越界；`FindById` 成功已保证 `stu_count ≥ 1`。
- **改**：`FindById` 找到后直接 `strcpy(s->name, name)`，同样先做姓名长度检查。
- **清**：`stu_count = 0` 即可，数组内容不用动。

**⑤ 边界检查**

`strcpy` 不做边界检查，所有写入前都必须自己确认长度：

- 学号：`len == 0 || len >= ID_LEN` → `ERR,6`，再逐字符检查 `'0' ~ '9'`；
- 姓名：`strlen(name) == 0 || strlen(name) >= NAME_LEN` → `ERR,6`；
- 参数指针为 `NULL`（缺字段）→ `ERR,2`，**先判空再 `strlen`**，否则 `strlen(NULL)` 会 HardFault。

**⑥ 数据存放位置**

`students` 和 `stu_count` 是全局变量，位于 SRAM（`0x20000000` 起）的 `.bss` / `.data` 段。
`students` 占 260 字节；启动代码会把 `.bss` 清零，所以**每次复位 `stu_count` 都回到 0**。
SRAM 是易失的：断电即丢；是否随 USB-TTL 掉电取决于板子由谁供电。

## 验收用例

| # | 发送 | 期待 |
|---|---|---|
| 1 | `CLR` → `LIST` | `OK,cleared` → `NULL` |
| 2 | `ADD,1001,张三` → `GET,1001` | `OK,added` → `OK,1001,张三` |
| 3 | 同一学号再 `ADD` | `ERR,3` |
| 4 | `SET,1001,李四` → `GET,1001` | `OK,updated` → `OK,1001,李四` |
| 5 | `DEL,9999` / `SET,9999,x` | `ERR,4` |
| 6 | `ADD,1001` / `SET,1001` | `ERR,2` |
| 7 | `ADD,abc,王五`、`ADD,123456789,张三`、17 字节姓名 | `ERR,6` |
| 8 | 加满 10 条后第 11 条 | `ERR,5` |
| 9 | `FOO` | `ERR,1` |
| 10 | 单行 > 63 字节 | `ERR,7` |
| 11 | 删到空后 `LIST` | `NULL` |
| 12 | 删中间 / 删最后 / 只剩一条时删 | 结果正确，无越界 |

## 遇到的问题及解决

1. **发 `SET` 一直回 `ERR,1`**

   代码里分支、函数都写了，但芯片里跑的还是旧固件——Keil 只 Build 没 Download。
   `ERR,1` 是「命令字不认识」，说明根本没进 `SET` 分支；如果进了分支，只会回 `ERR,3` 或 `OK,added`。
   **解决**：Build 之后必须 Download，并在初始化后加一句 `UART_Send("BOOT v4\r\n");`，
   每次复位先看到版本号，确认新固件在跑。

2. **`SET` 改完没反应，一句回复都没有**

   `Cmd_Set` 里 `if (strlen(name) ...)` 少了一个右括号，导致后面的
   `strcpy` 和 `OK,updated` 全被包进 `if` 里、且位于 `return` 之后，成了死代码。
   **解决**：在长度检查的 `return` 后就闭合 `if`，更新逻辑放到 `if` 外面。

3. **9 位学号能添加成功，但姓名变空**

   `Cmd_Add` 只检查了「非空 + 纯数字」，没检查上限。
   `strcpy` 把 9 位学号 + `\0` 共 10 字节写进 `id[9]`，多出的 `\0` 覆盖了 `name[0]`。
   再长就会跨过整个 `Student`，覆盖下一条记录。
   **解决**：加 `len >= ID_LEN` 判断，统一回 `ERR,6`。

4. **把 `Cmd_Set` 写成了 `Cmd_Add`**

   分发分支里复制粘贴没改函数名，`SET` 变成了「新增」，
   表现是 `ERR,3`（重复）或 `OK,added`，而不是修改。
   教训：新增分支后，先确认「调的是哪个函数」，再看函数内部。

## 已知限制与可扩展

- **掉电不保存**：数据只在 SRAM。需要持久化时可写内部 Flash 最后一页（1 KB 页，先擦后写）或外挂 EEPROM（如 AT24C02）。
- **LIST 为多行输出**：若验收要求单行分号分隔（`OK,1001,张三;1002,李四`），需改 `Cmd_List`。
- **超长行的尾巴**：返回 `ERR,7` 后缓冲区已清空，但该行剩余字节仍会被当成新行解析，可能出现第二条 `ERR,1`。
  可在 `ReadLine` 中加「丢弃到行尾」状态。
- **固定容量**：10 条写死在 `MAX_STU`，可改为动态数组或链表。
- **中文编码**：姓名按字节原样存储，GBK / UTF-8 都能工作，但串口助手与发送端编码需一致，否则显示乱码。

## 备注

- 阶段 5 的任务定义见规培计划：「设计简单通信协议，实现学生信息的增、删、改、查；按协议指令操作后，返回结果正确且异常输入有提示」。
- 本工程由阶段 4 的 CubeMX 工程扩展而来，串口、时钟等初始化未改动。
- 编译产物（`Objects/`、`*.axf`、`*.hex`、`*.map` 等）已被上级目录的 `.gitignore` 忽略。
