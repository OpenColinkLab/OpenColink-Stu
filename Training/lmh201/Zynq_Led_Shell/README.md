# Led_Shell — Zynq PS+PL 串口命令行控制 LED

EBAZ4205（Zynq-7010）上的 PS-PL 协同实验：PS 侧移植 **letter-shell 3.2.4**，
串口敲命令；命令经 **AXI GPIO** 写入控制字，PL 侧的 `M_Led_Ctrl` 驱动板载红灯。

## 硬件平台

| 项目 | 说明 |
| --- | --- |
| 开发板 | EBAZ4205（矿板改） |
| 芯片 | `xc7z010clg400-1`（PS: 双核 Cortex-A9 + PL: Artix-7） |
| 板载 LED | 红 **W14**，`LVCMOS33`，**低电平点亮** |
| 串口 | PS UART1 → MIO 24/25，`115200 8N1` |
| PL 时钟 | PS `FCLK_CLK0` = 50 MHz |
| PL 复位 | `proc_sys_reset` 的 `peripheral_aresetn`（异步断言、同步释放） |
| 下载线 | JTAG（J8 14-pin）+ USB-TTL（J7） |

## 开发环境

- Vivado **2018.3**
- Xilinx SDK **2018.3**
- 目标器件 `xc7z010clg400-1`

## 设计说明

Block Design 结构：

```
ZYNQ7 PS ──M_AXI_GP0──► ps7_0_axi_periph ──► axi_gpio (0x41200000)
                                                     │ gpio_io_o[0:0]
                                                     ▼
                                              M_Led_Ctrl ──► led_red_or ──► W14
     └─FCLK_CLK0 / peripheral_aresetn ───────────►
```

`M_Led_Ctrl` 的控制字位域：

| 位 | 含义 |
| --- | --- |
| `ctrl_iw` | 1 = 亮，0 = 灭（RTL 内取反输出，适配低电平点亮） |

## 命令

| 命令 | 作用 |
| --- | --- |
| `help` | 列出所有命令 |
| `led on` | 红灯亮 |
| `led off` | 红灯灭 |

## 目录结构

```
Led_Shell/
├── Led_Shell.xpr                               Vivado 工程文件
├── srcs/
│   ├── constrs_1/
│   │   └── ebaz4205.xdc                        * 引脚约束 W14 / LVCMOS33
│   └── sources_1/
│       ├── led_shell_top/
│       │   └── led_shell_top.v                 * 顶层（只例化 BD wrapper）
│       ├── m_led_ctrl/
│       │   ├── m_led_ctrl.v                    * PL 侧灯控（控制字 → LED 电平）
│       │   └── m_led_ctrl.vh                   * 模块宏头文件
│       └── bd/led_shell_bd/
│           ├── led_shell_bd.bd                 Block Design（PS7 + Interconnect + AXI GPIO + M_Led_Ctrl）
│           ├── led_shell_bd.bxml               BD 导出副本
│           ├── led_shell_bd_ooc.xdc            BD 的 OOC 约束
│           ├── hdl/led_shell_bd_wrapper.v      BD 顶层 wrapper
│           └── hw_handoff/                     led_shell_bd.hwh + led_shell_bd_bd.tcl（可重建 BD）
└── sdk/
    └── led_shell/                              SDK 应用工程
        ├── .cproject / .project                Eclipse 工程配置
        └── src/
            ├── user/
            │   ├── main.c                      * 应用主程序（初始化 + shell 主循环）
            │   ├── main.h
            │   └── led_cmd.c                   * led 命令（SHELL_EXPORT_CMD）
            ├── driver/led/
            │   ├── led_drv.c                   * AXI GPIO 读写
            │   └── led_drv.h
            ├── shell/
            │   ├── shell_port.c                * 移植层（UART1 ↔ shell）
            │   ├── shell_port.h
            │   ├── shell.c / shell.h           letter-shell 3.2.4
            │   ├── shell_cfg.h                 * shell 配置（已按裸机修改）
            │   ├── shell_cmd_list.c / shell_ext.c / shell_ext.h
            ├── lscript.ld                      * 链接脚本（含 shellCommand 段）
            ├── platform.c / platform.h         Xilinx 模板：初始化缓存、UART
            ├── platform_config.h
            └── Xilinx.spec
```

> 标 `*` 的是本实验自己写的部分（含改过的配置），其余为 Xilinx 模板或第三方组件。

## 关键实现

**1. 链接脚本必须有 `shellCommand` 段**，否则 `help` 命令列表为空：

```ld
.shell_cmd :
{
   . = ALIGN(4);
   _shell_command_start = .;
   KEEP (*(SORT_BY_NAME(shellCommand)))
   _shell_command_end   = .;
   . = ALIGN(4);
} > ps7_ddr_0
```

**2. `shell_cfg.h` 裸机改动**：`SHELL_TASK_WHILE=0`、`SHELL_ENTER_CR=1`、
`SHELL_MAX_NUMBER=1`、`SHELL_PRINT_BUFFER=256`、
`SHELL_GET_TICK()=shell_get_tick_ms()`、`SHELL_CLS_WHEN_LOGIN=0`

**3. UART 用 BSP 的 `XUartPs_Send` / `XUartPs_Recv`**，不要用裸寄存器轮询 `TXEMPTY`

## 未提交的内容（均可重新生成）

`*.cache/`、`*.runs/`、`*.sim/`、`*.hw/`、`*.ip_user_files/`、BD 下的 `ip/`、`ipshared/`、`synth/`、`sim/`，
以及 SDK 的 `led_shell_bsp/`、`*_hw_platform_*/`、`Debug/`、`webtalk/`、`*.hdf`、`*.bit`，
均已由仓库根目录 `.gitignore` 排除。

## 复现步骤

1. Vivado 打开 `Led_Shell.xpr`，提示更新路径时确认
2. 若提示 Block Design 输出缺失：右键 `led_shell_bd` → **Generate Output Products** → **Create HDL Wrapper**（覆盖）
3. **Run Synthesis** → **Run Implementation** → **Generate Bitstream**
4. **Export Hardware**，勾选 Include bitstream
5. SDK 新建 Application Project（Empty Application），把 `sdk/led_shell/src/` 复制进去，
   Include 路径加 `src/user`、`src/driver/led`、`src/shell`
6. **Program FPGA**（先下 bit）→ **Run As → Launch on Hardware**（再下 elf）
7. 串口终端 `115200 8N1`，应看到 letter-shell 欢迎信息和 `letter:/$` 提示符，再敲 `help`
