# 任务 4：PS 通过 AXI-Lite 控制 PL 侧的 LED

工程位置：`D:\Project\AXI_1`　器件：`xc7z010clg400-1`（EBAZ4205 / XC7Z010）　工具：Vivado + SDK 2018.3

---

## 一、任务目标与数据流

PS（ARM Cortex-A9）用 C 代码，通过 **AXI-Lite** 总线写入 **PL 里的寄存器**，改变 LED 的行为。

```
用户在串口助手输入命令
  -> PS 端 Shell 解析命令          (main.c 的 shell 层)
    -> LED 驱动写 AXI-Lite 寄存器  (main.c 的驱动层)
      -> PL 端 led_ctl 状态机解释控制字
        -> 端口 led_red -> 板载红灯 W14 呈现常亮 / 闪烁
```

板上有两路灯，分工不同，看灯就能判断故障停在哪一层：

| 灯 | 引脚 | 驱动链 | 作用 |
|---|---|---|---|
| 红灯 | **W14**（`led_red`） | `axi_gpio_0` → `led_ctl_0` | 32 位控制字由 C 代码决定，证明 PS 真的在写寄存器 |
| 绿灯 | **W13**（`led_green`） | `FCLK_CLK0` → `led_blink_0` | 纯 PL 逻辑自闪，不经过 CPU，证明 PL 配置成功 |

绿灯自闪而红灯不动 → PL 活着，问题在 PS 侧（elf 没下、地址错、总线不通）；
两灯都不亮 → 比特流没下去，或者板子根本没跑起来。

灌电流接法（输出 **0 = 亮**，1 = 灭），IO 标准 LVCMOS33。两个模块内部都已取反，所以 C 里写 `EN=1` 就是亮。

---

## 二、硬件结构（Block Design：design_1）

```
ARM Cortex-A9 (PS)
  M_AXI_GP0
    -> ps7_0_axi_periph (AXI Interconnect，连接自动化自动插入)
      -> axi_gpio_0  @ 0x4120_0000   (32 位，全输出)
        -> gpio_io_o[31:0] -> led_ctl_0/ctrl
          -> led_ctl_0/led -> led_red -> 红灯 W14   (PS 控制)

  FCLK_CLK0 (50 MHz)
    -> led_ctl_0/clk
    -> led_blink_0/clk
      -> led_blink_0/led -> led_green -> 绿灯 W13   (PL 自闪)

  rst_ps7_0_50M (Processor System Reset) 由连接自动化自动插入
```

BD 内的实例：`processing_system7_0`、`ps7_0_axi_periph`、`rst_ps7_0_50M`、`axi_gpio_0`、`led_ctl_0`、`led_blink_0`。

### PS 关键配置

| 配置项 | 值 | 说明 |
|---|---|---|
| UART1 | **MIO 24 .. 25** | EBAZ4205 的调试串口，配错串口打不出字 |
| UART 时钟 | 100 MHz | 默认值，波特率 115200 8N1 |
| M_AXI_GP0 | Enabled | PS 访问 PL 的通道 |
| FCLK_CLK0 | 50 MHz | 给 AXI、led_ctl、led_blink 共用，也是两个模块的分频基准 |
| DDR | MT41K128M16 JT-125 / 16 Bit | 板载 DDR3，高地址 0x0FFF_FFFF |

### 引脚约束（`src/led_axi.xdc`）

```tcl
set_property -dict { PACKAGE_PIN W14  IOSTANDARD LVCMOS33 } [get_ports {led_red}]
set_property -dict { PACKAGE_PIN W13  IOSTANDARD LVCMOS33 } [get_ports {led_green}]
```

---

## 三、控制字定义（`src/led_ctl.v`）

### 3.1 PL 侧模块划分

`led_ctl` 只当顶层，时序逻辑全部拆到两个子模块里，各自一个源文件：

```
led_ctl                    顶层：拆位 + 例化 + 按模式选输出（无计数器）
├── u_tick   : tick_gen    时基：clk -> ms_tick(1ms)
└── u_blink  : blink_gen   闪烁：ms_tick + period -> blink
```

| 文件 | 模块 | 端口 | 职责 |
|---|---|---|---|
| `src/led_ctl.v` | `led_ctl` | `clk` / `ctrl[31:0]` / `led` | 拆控制字、限幅、例化子模块、模式选择、极性取反 |
| `src/tick_gen.v` | `tick_gen` | `clk` → `tick` / `ms_tick` | 整数分频出 100 µs 与 1 ms 两种单周期脉冲 |
| `src/blink_gen.v` | `blink_gen` | `clk` `ms_tick` `period` → `blink` | 每 `period` 毫秒翻转一次，占空比固定 50% |

这样拆的两个好处：

1. **每个模块只依赖一个时钟和一个使能脉冲**，看单个文件就能确认它的行为，不用在 100 行里跳来跳去
2. **子模块都是自由运行的**，模式切换只改最后那个选择器，不重置任何计数器 —— 从「闪烁」切「常亮」不会卡在半亮

综合后的层次（`verify_hw.tcl` 可查）：

```
design_1_i/led_ctl_0/inst            -> led_ctl
design_1_i/led_ctl_0/inst/u_tick     -> tick_gen
design_1_i/led_ctl_0/inst/u_blink    -> blink_gen
```

### 3.2 控制字位域

AXI GPIO 是 32 位全输出，写进 `GPIO_DATA` 的值原封不动送到 `led_ctl.ctrl`。位域：

| 位域 | 名称 | 含义 |
|---|---|---|
| `bit[0]` | EN | 1 = 使能，0 = 强制熄灭 |
| `bit[2:1]` | MODE | 0 常亮 / 1 闪烁（2、3 保留，当前按熄灭处理） |
| `bit[15:8]` | PERIOD | 1..255，MODE=1 时为半周期毫秒数（频率 ≈ 500/PERIOD Hz） |

`bit[31:16]` 全部保留，写任何值都不影响输出（PWM 模式已从设计中移除，原来的 `DUTY` 位因此空出来了）。

PL 内部只有整数分频计数器和比较器，**不综合出除法器**，所以改控制字立刻生效，不需要重综合。

对应关系（C 与 Verilog 必须一致，改一边就要改另一边）：

```c
#define CTRL_EN          (1u << 0)
#define CTRL_MODE(m)     (((u32)(m) & 0x3u) << 1)
#define CTRL_PERIOD(ms)  (((u32)(ms) & 0xFFu) << 8)
```

---

## 四、软件结构（`src/`）

分四层，层间职责单一：

| 层 | 文件 / 函数 | 干什么 |
|---|---|---|
| 串口移植层 | `shell_port.c` 的 `shellPortWrite/Read` | 按 letter-shell 3.1+ 原型 `signed short fn(char*, unsigned short)` 包装 XUartPs，读非阻塞、写等 FIFO |
| Shell 层 | `shell/` 目录（letter-shell 3.2.4 原库，**未改动核心**） | 行编辑、Tab 补全、历史记录、切词、查表、权限 |
| 命令导出 | `main.c` 里 `SHELL_EXPORT_CMD(...)` | 展开为 `section("shellCommand")` 常量，链接器自动收进命令表 |
| 驱动层 | `led_commit()` / `led_status()` | 把"我要什么行为"翻译成 32 位控制字写下去 |

### 串口命令

| 命令 | 作用 | 示例 |
|---|---|---|
| `help` | 列出命令（库自带） | `help` |
| `led on` | 常亮 | `led on` |
| `led off` | 熄灭 | `led off` |
| `led blink <ms>` | 闪烁，参数是半周期 | `led blink 100` → 约 5 Hz |
| `led status` | 打印控制字 + 写后回读比对 | `led status` |
| `led raw 0x…` | 直接写控制字 | `led raw 0x00010201` |
| `reg` | 打印 GPIO_DATA / GPIO_TRI | `reg` |

`led status` 里的 `readback` 是**写后回读**，相等就打 `OK (bus is alive)`；不等说明总线不通或地址错。

提示符是 letter-shell 原生格式 `letter:/$`。交互特性：**Tab 补全命令**、**↑↓ 翻历史**、**Ctrl+A/E/U/K 行编辑**。

### letter-shell 3.2.4 在 GCC 下必须做的两件事

1. **`lscript.ld` 收集段**：命令宏展开成 `section("shellCommand")`，GCC 需要链接脚本提供边界符号。
   `scripts/build_sw.tcl` 会在每次构建前自动在 `.rodata1` 前插入：

   ```ld
   .shellCommand ALIGN(4) : {
      _shell_command_start = .;
      KEEP (*(shellCommand))
      . = ALIGN(4);
      _shell_command_end = .;
   } > ps7_ddr_0
   ```

   `shellInit` 拿这两个符号算命令条数（当前 21 条 × 16 B = 336 B）。
2. **默认用户**：`shellInit` 内部会解引用 `SHELL_DEFAULT_USER` 查到的命令项，找不到就是空指针。
   `main.c` 里导出了 `SHELL_EXPORT_USER(..., letter, , default user)`（密码为空），这条**不能删**。

### 对库做的唯一补丁

`shell/shell_ext.h` 顶部加了一行 `#include <stddef.h>`：3.2.4 用了 `size_t` 却没引入该头，
Keil/IAR 能编过，`arm-none-eabi-gcc` 报 `unknown type name`。升级库时记得保留。

### 加一条新命令

在任意 `.c` 文件里写一行宏即可，不改数组、不改初始化函数：

```c
SHELL_EXPORT_CMD(SHELL_CMD_PERMISSION(0)|SHELL_CMD_TYPE(SHELL_TYPE_CMD_MAIN),
                 mycmd, cmdMy, my first command);
```

注意 `_desc` 会被 `#` 字符串化，**描述里不能出现逗号**。

看懂这 40 行，再看 `main.c` 就只是「同样三句话，多了人机界面」。

---

## 五、AXI 到底"控制"在哪

AXI GPIO 被映射进 PS 的地址空间，CPU 用普通内存访问就能读写它：

| 偏移 | 寄存器 | 作用 |
|---|---|---|
| `0x00` | GPIO_DATA | 32 位输出值，直接送到 `led_ctl.ctrl` |
| `0x04` | GPIO_TRI | 方向，**0 = 输出** |

C 里看起来只有三句话：

```c
XGpio_Initialize(&Gpio, XPAR_AXI_GPIO_0_DEVICE_ID);   /* 定位到 0x41200000 */
XGpio_SetDataDirection(&Gpio, 1, 0x0);                /* 写 TRI，全输出 */
XGpio_DiscreteWrite(&Gpio, 1, ctrl);                  /* 写 DATA，控制字进 PL */
```

展开成机器指令就是一条 32 位 store：`*(volatile u32*)0x41200000 = ctrl;`
CPU 一旦访问这个地址，`M_AXI_GP0` 就会发一笔 AXI4-Lite 写事务（AW → W → B），互连把它送到 `axi_gpio_0`。AXI 只是搬运工，使用者只需要关心"写哪个地址、写什么值"。

---

## 六、构建与下载

```
:: 1. 硬件（改过 BD / 改过 PL 源码才需要跑，约 2 分钟）
D:\Vivado\Vivado\2018.3\bin\vivado.bat -mode batch -source D:\Project\AXI_1\scripts\build_hw_v5.tcl

:: 2. 软件
D:\Vivado\SDK\2018.3\bin\xsct.bat D:\Project\AXI_1\scripts\build_sw.tcl

:: 3. 下载并运行（保持 180 s，期间看串口）
D:\Vivado\SDK\2018.3\bin\xsct.bat D:\Project\AXI_1\scripts\run_on_hw.tcl
```

### 本次构建结果（2026-11-15 17:13，删除 PWM 后）

| 项目 | 结果 |
|---|---|
| 比特流 | `AXI_1.runs/impl_1/design_1_wrapper.bit`，2,083,852 B |
| 硬件描述 | `AXI_1.hdf`，332,942 B |
| 应用程序 | `AXI_1.sdk/led_axi/Debug/led_axi.elf`，363,792 B（比自建 shell 版多约 106 KB，主要是 newlib 的 vsnprintf + shell 库本体） |
| WNS / WHS | **+13.486 ns / +0.067 ns**（无时序违例） |
| DRC | 0 违例 |
| 时钟 | `clk_fpga_0` = 20 ns（50 MHz） |
| 引脚 | `led_red → W14`、`led_green → W13`，均 LVCMOS33 |
| 资源 | LUT 550、FF 722（删 PWM 前是 LUT 568，少 18 个） |
| GPIO 地址 | `XPAR_AXI_GPIO_0_BASEADDR = 0x41200000`，位宽 32 |

> WHS 只有 +0.067 ns，是这颗器件上 AXI 路径的正常水平（时钟偏斜占掉了大部分余量），不影响功能。

上电后串口（115200 8N1）应看到：

```
==================================================
 Task 4 : PS -> AXI-Lite -> PL ctrl reg -> LED
 Board  : EBAZ4205 / XC7Z010
 GPIO   : 0x41200000   UART: 0xE0001000  115200 8N1
==================================================
 type 'help' to list commands
  ctrl      : 0x00000000
  readback  : 0x00000000  OK (bus is alive)
  en        : 0
  mode      : steady
  period    : 0 ms

z7>
```

然后敲 `led blink 250`、`led on`、`led off`，红灯行为应立刻跟着变。

---

## 七、调试顺序（按教材 3.8）

| 现象 | 先查什么 |
|---|---|
| 串口无输出 | COM 口、115200 8N1、MIO24/25、elf 是否下载（只下比特流 ARM 是空的） |
| 绿灯不闪 | 比特流没下成功，或 `led_blink_0/clk` 没接到 FCLK_CLK0 —— 先解决这个，PL 都没配置好下面不用查 |
| 绿灯闪、红灯不动 | 命令有回显但灯不动：`led_red` 是否绑到 W14、GPIO 地址是否 0x41200000、`led_ctl_0/ctrl` 是否接上 `gpio_io_o` |
| `readback` 是 MISMATCH | BSP 的 `xparameters.h` 与当前 hdf 不一致（改过 PS 配置就必须重导 hdf） |
| 灯常亮不灭 | 灌电流极性搞反了：`led_ctl` 里 `assign led = ~led_on` 不能丢 |
| 串口乱码 | 先确认波特率，再查时钟和终端编码（本程序输出全 ASCII） |

---

## 八、脚本说明

| 脚本 | 作用 |
|---|---|
| `scripts/build_hw_v5.tcl` | **改硬件用这个**：从工程摘掉 `pwm_gen.v`、删旧 `led_ctl_0` 重新实例化（把子模块层次一起打包）、重跑实现出 bit + hdf |
| `scripts/build_sw.tcl` | 建/复用 SDK 工程，编译出 elf |
| `scripts/run_on_hw.tcl` | 复位 PS → 下比特流 → ps7_init → 下 elf → 运行并保持 180 s |
| `scripts/verify_hw.tcl` | 查两个 LED 的引脚绑定、`led_ctl` 内部子模块、确认无 `pwm` 残留、时钟、时序、资源（只读检查） |
| `scripts/export_hdf.tcl` | 只重导 hdf（综合已做完、只改了导出时不想重跑全流程时用） |

> 改 `led_ctl` 或它子模块的源码，**必须重跑 `build_hw_v5.tcl`**。原因是 BD 里的 `led_ctl_0` 是 module reference，层次被缓存在工程里，光改 `src/` 下的 .v 不会自动生效——脚本里那句「删掉再重建」就是干这个的。

> **历史脚本**（`build_hw.tcl`、`build_hw_v2/v3/v4.tcl`、`refresh_sdk_hw.tcl`）已删除，跑它们会重建出旧结构或直接报错。改硬件只认 `build_hw_v5.tcl`。

---

## 九、注意

- **只点 Program Device 不会打印任何东西**：PL 配好后两个 ARM 核是空的，必须再下载 elf。
- **串口号会变**：取决于插在哪个 USB 口，以串口助手下拉框为准。
- `src/led_blink.v` **参与综合**（`led_blink_0` → 绿灯 W13），它的参数 `CLK_HZ` 必须与 FCLK_CLK0 实际频率一致，否则闪的频率不对。
- 改过 BD 之后必须重新导出 hdf 再编软件，否则 `xparameters.h` 里的地址/位宽是旧的；SDK 里的 `hw_0` 也要跟着换（旧工作区已清理，需要时直接用 `build_sw.tcl` 重建）。

### 已知限制（不是 bug，但会被误认为 bug）

- `led status` 里的 `period` 打印的是**生效值**：控制字写 0 时 PL 会兜成 1 ms，串口会额外标 `(0 clamped to 1 in PL)`。开机时 `ctrl=0`，看到这一行是正常的。
- `led raw` 可以写入 `MODE=2/3`，这两个是保留模式，**灯会保持熄灭**，串口会打 `note: mode 2/3 is reserved`。不要把它当成硬件坏了。
- 串口一行超过 95 个字符时多余部分会被丢弃（`g_line[96]`），命令行本身用不到这么长。
- **尚未上板实测**：所有验证都来自 Vivado 的时序/DRC/引脚反查和 SDK 编译，真机行为（串口、灯色、极性）等插上板子才能最终确认。

---

## 十、对照教材 3.8.1 的自检

1. **有没有给 AXI 总线接口设置地址？**
   有。`axi_gpio_0` 由 BD 分配到 `0x4120_0000`，Address Editor 可查，BSP 生成的 `XPAR_AXI_GPIO_0_BASEADDR` 与之一致。
2. **灯控 .v 要不要放进 .bd 一起打包？**
   要。`led_ctl.v` 通过 `create_bd_cell -type module -reference` 实例化成 `led_ctl_0`，和 PS7 一起综合进同一个比特流。
3. **要实现 AXI 通信需要哪几个模块、怎么接？**
   AXI 这条链五个：`processing_system7_0`（PS，开 M_AXI_GP0）、`ps7_0_axi_periph`（Interconnect，连接自动化插入）、`axi_gpio_0`（AXI 从设备，32 位全输出）、`led_ctl_0`（自己写的灯控逻辑）、`rst_ps7_0_50M`（复位）。另外 `led_blink_0` 是挂在 FCLK 上的参照灯，不参与 AXI。接法见 `build_hw_v5.tcl`。
4. **地址写死还是用结构体？**
   用 BSP 宏 `XPAR_AXI_GPIO_0_BASEADDR`，换板子或改地址后重新导出 hdf 就会自动跟着变，不写死。
