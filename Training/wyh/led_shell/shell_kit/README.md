# shell_kit —— 把 letter-shell 3.2.4 搬进你自己的 Zynq 工程

这个包里只有 **shell 源码 + 移植层**，不含 Vivado 工程、不含 bitstream。
用途：你已经有一个能跑的 Zynq 裸机工程（PS7 + DDR + UART），想把命令行搬进去。

---

## 0. 先搞清楚两种用法

| 你的情况 | 要做的事 |
|---|---|
| 我就用做好的 `Led_Shell` 工程 | **什么都不用加**，`run\run_app.cmd` 直接跑，`zynq:/$ ` 提示符就出来了 |
| 我要新建一个 Vivado 工程，还要这种命令行 | 按下面 1~7 步加一次，大约 10 分钟 |

---

## 1. 包里的文件

```
shell_kit\
  shell_upstream\            ← 上游 letter-shell 3.2.4 原样代码（只有 shell_cfg.h 改过）
    shell.c                  1834 行  核心：解析、历史、Tab、按键
    shell.h                    472 行  对外 API + SHELL_EXPORT_CMD 宏
    shell_cfg.h                207 行  配置（tick、缓冲区、用户名、历史条数）
    shell_ext.c                791 行  printf/exec 等扩展，必须一起编
    shell_ext.h
  port\                      ← 移植层（要动手改的就是这里）
    shell_port.c/.h          read/write 钩子、毫秒 tick、延时、shellInit
    cmd.c/.h                 4 条示例命令：led / status / hello / demo
    uart.c/.h                PS UART1 轮询驱动 115200（可换成你自己的）
  lscript_fragment.txt       ← 要粘进链接脚本的 6 行
  lscript.ld.example         ← 改好的完整链接脚本，可对照
```

---

## 2. 前提：新工程得具备什么

1. PS7 里 **UART1 打开，MIO24/MIO25，115200 8N1**（或你自己改 `uart.h` 里的设备号/波特率）；
2. **Export Hardware 时勾上 include bitstream** → 得到 `system.hdf`；
3. SDK 里建一个 Application Project（`Empty Application` 就行），BSP 自动生成 `xparameters.h`。

---

## 3. 第 1 步：拷文件

把下面 9 个文件拷进 **`<你的工程>.sdk\<应用名>\src\`**（平铺，不要建子目录）：

```
shell_upstream\shell.c  shell.h  shell_cfg.h  shell_ext.c  shell_ext.h
port\shell_port.c  shell_port.h  cmd.c  cmd.h  uart.c  uart.h
```

拷完 **在 SDK 里点一下工程名，按 F5 刷新**（或 Project → Refresh）。
不刷新的话 SDK 生成的 `sources.mk` 里没有这些文件，等于没加，链接会报 `undefined reference to shellInit`。

---

## 4. 第 2 步：改链接脚本（最容易漏的一步）

打开 `src\lscript.ld`，找到 `.text : {` 段，在 `*(.gnu.linkonce.armextab.*)` 这一行**之后**插入：

```ld
   . = ALIGN(4);
   _shell_command_start = .;
   KEEP (*(SORT_BY_NAME(shellCommand)))
   _shell_command_end   = .;
```

（原文见 `lscript_fragment.txt`，改好的完整例子见 `lscript.ld.example` 第 54~66 行。）

**为什么必须加**：`SHELL_EXPORT_CMD()` 把命令放进 `shellCommand` 段，链接器默认丢弃"没人引用"的段，`KEEP` 才留得住；两个符号是 `shellInit()` 扫描命令表的起点和终点。
**漏了的症状**：能进 shell、提示符正常，但敲任何命令都是 `command not found`，`help` 是空的。

---

> 换到别的工程时，port/shell_port.c 里通常只需要改 Uart_GetChar() / Uart_PutChar() 这两个调用（其余都是 letter-shell 的胶水代码，与硬件无关）。Shell_PortGetInstance() 别删——第 5 节要用。

## 5. 第 3 步：main.c 里接线（4 行）

```c
#include "shell.h"
#include "shell_port.h"
#include "uart.h"

int main(void)
{
    Uart_Init();                              /* 1. 先把串口跑起来 */
    /* ... 你自己的外设初始化 ... */
    Shell_PortInit();                         /* 2. 填 read/write、挂缓冲、打提示符 */
    for (;;) {
        shellTask(Shell_PortGetInstance());   /* 3. 主循环里一直转 */
    }
    return 0;
}
```

> ### ⚠️ 这里不能写 `shellTask(shellGetCurrent())`
>
> `shellGetCurrent()` 只在**命令函数执行期间**返回有效指针——它靠 `shellList[i]->status.isActive` 判断，
> 而 `isActive` 是 `shellRun()` 里临时置 1、命令跑完清 0 的。
> 在主循环里调用它**永远返回 NULL**，`shellTask(NULL)` 会解引用空指针，随后 PC 飞到一个
> 不存在的地址（实测落在 `0xE6000000`），撞进取指异常处理器 `Xil_PrefetchAbortHandler` 死循环。
> 症状极具迷惑性：**banner 和提示符都正常打印，但按回车、打字毫无反应**。
>
> 正确写法就是上面那句 `shellTask(Shell_PortGetInstance())`，
> 等价于 letter-shell 官方 demo 的 `shellTask(&shell)`。
> 包里的 `port/shell_port.c` 已经提供这个 getter，不用自己写。
>
> 反过来，`shellPrint(shellGetCurrent(), ...)` 写在**命令函数内部**（见第 8 节示例）是**对的**，
> 因为那时 `isActive == 1`。别把这两处搞混。

第 4 处接线在 `shell_cfg.h`（包里**已经改好**，新工程直接拷过去就行）：

```c
extern int Shell_GetTickMs(void);
#define SHELL_GET_TICK()  Shell_GetTickMs()
```

不接这个的话：双击 Tab 出不来帮助、方向键历史记录判定异常 —— 因为 shell 靠 tick 算"两次按键间隔 200 ms"。

---

## 6. 第 4 步：编译 + 验证

Build 通过后，在 `<工程>.sdk\<应用名>\Debug\` 下执行（路径按你 SDK 的 gcc 位置改）：

```powershell
$nm = "C:\Xilinx\SDK\2018.3\gnu\aarch32\nt\gcc-arm-none-eabi\bin\arm-none-eabi-nm.exe"
& $nm -n .\*.elf | Select-String "_shell_command"
```

看到两行、**地址不一样**就对了：

```
00110308 T _shell_command_start
00110468 T _shell_command_end      ← 比上面大，说明段里有东西
```

两个地址相等 = 命令表是空的 = 第 2 步的 KEEP 没生效。

---

## 7. 第 5 步：上板

```powershell
cd <工程>\run
.\run_app.cmd          # 里面依次做 rst -system → ps7_init → fpga -file → dow → con
```

串口（Xshell / PuTTY / MobaXterm，**115200 8N1、无流控**）应该看到：

```
@@@@ Led_Shell : letter-shell 3.2.4 port @@@@
  UART1 MIO24/MIO25  115200 8N1
  PL  : Led_Driver state machine + 1 kHz PWM
  cmd : help / hello / led <0-5> / status / demo
  tip : Tab completes, Up/Down = history

zynq:/$
```

---

## 8. 换成你自己的命令

三步，都在 `cmd.c` 里：

```c
/* ① 写函数：SHELL_TYPE_CMD_MAIN 的签名固定是 (argc, argv) */
int Cmd_Motor(int f_argc, char *f_argv[])
{
    if (f_argc < 2) { shellPrint(shellGetCurrent(), "usage: motor <0-3>\r\n"); return -1; }
    /* 你的硬件操作 */
    return 0;
}

/* ② 注册（放在文件末尾）：desc 里不要写逗号！宏会把参数拼成初始化列表 */
SHELL_EXPORT_CMD(SHELL_CMD_PERMISSION(0) | SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN),
                 motor, Cmd_Motor, set motor speed 0-3);

/* ③ 重新 Build，Tab 一下就能补全 motor */
```

> 为什么 desc 不能带逗号：`SHELL_EXPORT_CMD` 里用 `#_desc` 把描述字符串化，宏展开时逗号会被当成参数分隔符。

---

## 9. 四个常见坑

| 现象 | 原因 | 处理 |
|---|---|---|
| 敲命令全 `command not found`，`help` 空 | 链接脚本没加 KEEP | 回到第 2 步 |
| 链接报 `undefined reference to shellInit` | 文件没被编进去 | SDK 里按 F5 刷新 → Clean → Build |
| 双击 Tab 没反应、历史记录怪 | `SHELL_GET_TICK()` 没接 | 看第 5 步最后那段 |
| 收到的字是乱码 / 一半 | 波特率或时钟不对 | UART 115200 + PS 的 UART 时钟 100 MHz；终端也要 115200 8N1 |

---

## 10. 两个可调参数

```c
/* shell_port.h：行缓冲 512 字节（命令行和历史记录都从这块里分），单条命令够用 50 字符左右 */
#define SHELL_PORT_BUFFER_SIZE 512U

/* shell_cfg.h：历史记录条数（每条占 1 个指针 + 原行拷贝） */
#define SHELL_HISTORY_MAX_NUMBER 8
```

RAM 富裕可以加到 1024（单条命令约 113 字符），代价是一个全局数组多 512 B `bss`。
