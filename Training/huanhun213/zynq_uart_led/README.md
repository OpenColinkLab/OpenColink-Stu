# zynq_uart_led — Zynq PS+PL 串口命令行控制 LED

EBAZ4205（Zynq-7010）上的 PS-PL 协同实验：PS 侧移植 **letter-shell 3.2.4**，
串口敲命令；命令经 **AXI GPIO** 写入控制字，PL 侧的 `led_ctl` 按控制字驱动板载红/绿 LED。

## 硬件平台

| 项目 | 说明 |
| --- | --- |
| 开发板 | EBAZ4205（矿板改） |
| 芯片 | `xc7z010clg400-1`（PS: 双核 Cortex-A9 + PL: Artix-7） |
| 板载 LED | 红 **W14**、绿 **W13**，`LVCMOS33`，**低电平点亮** |
| 串口 | PS UART1 → MIO 24/25，`115200 8N1` |
| PL 时钟 | PS `FCLK_CLK0` = 100 MHz |
| PL 复位 | `proc_sys_reset` 的 `peripheral_aresetn`（异步断言、同步释放） |
| 下载线 | FT232H（JTAG） |

## 开发环境

- Vivado **2017.3**
- Xilinx SDK **2017.3**
- 目标器件 `xc7z010clg400-1`

## 设计说明

Block Design 结构：

```
ZYNQ7 PS ──M_AXI_GP0──► axi_interconnect ──► axi_gpio (0x41200000)
                                                     │ gpio_io_o[31:0]
                                                     ▼
                                              led_ctl ──► led_0[1:0] ──► W14 / W13
     └─FCLK_CLK0 / peripheral_aresetn ───────────►
```

`led_ctl` 的控制字位域：

| 位 | 含义 |
| --- | --- |
| `ctrl[31]` | 总使能，1 = 亮，0 = 全灭 |
| `ctrl[30:28]` | 模式：0 两灯轮流 / 1 反向轮流 / 2 交替闪 / 3 单灯常亮 |
| `ctrl[27:0]` | 分频值，100 MHz 下 `50000000` ≈ 1 Hz |

## 命令

| 命令 | 作用 |
| --- | --- |
| `help` | 列出所有命令 |
| `led 0` | 两灯轮流 |
| `led 1` | 反向轮流 |
| `led 2` | 交替闪 |
| `led 3` | 单灯常亮 |
| `led off` | 全灭 |

## 目录结构

```
zynq_uart_led/
├── zynq_uart_led.xpr                           Vivado 工程文件
├── zynq_uart_led.srcs/
│   ├── sources_1/
│   │   ├── bd/design_1/
│   │   │   ├── design_1.bd                     Block Design（PS7 + AXI GPIO + led_ctl）
│   │   │   ├── design_1.bxml                   BD 导出副本
│   │   │   ├── design_1_ooc.xdc                BD 的 OOC 约束
│   │   │   └── hdl/design_1_wrapper.v          BD 顶层 wrapper
│   │   └── imports/new/shift_led.v             * PL 侧 led_ctl（控制字 → LED 波形）
│   └── constrs_1/new/led.xdc                   * 引脚约束 W14 / W13
└── zynq_uart_led.sdk/
    └── uart_led/                               SDK 应用工程
        ├── .cproject / .project                Eclipse 工程配置
        └── src/
            ├── helloworld.c                    * 应用主程序（shell + led 命令）
            ├── lscript.ld                      * 链接脚本（含 shellCommand 段）
            ├── shell.c / shell.h               letter-shell 3.2.4
            ├── shell_cfg.h                     shell 配置
            ├── shell_cmd_list.c / shell_companion.c / shell_ext.c / shell_ext.h
            ├── platform.c / platform.h         Xilinx 模板：初始化缓存、UART
            ├── platform_config.h
            └── Xilinx.spec
```

> 标 `*` 的是本实验自己写的部分，其余为 Xilinx 模板或第三方组件。

## 未提交的内容（均可重新生成）

`*.cache/`、`*.runs/`、`*.sim/`、`*.hw/`、`*.ip_user_files/`、BD 下的 `ip/`、`ipshared/`、`synth/`、`sim/`，
以及 SDK 的 `uart_led_bsp/`、`*_hw_platform_*/`、`Debug/`、`webtalk/`、`*.hdf`、`*.bit`，
均已由仓库根目录 `.gitignore` 排除。

## 复现步骤

1. Vivado 打开 `zynq_uart_led.xpr`，提示更新路径时确认
2. 若提示 Block Design 输出缺失：右键 `design_1` → **Generate Output Products** → **Create HDL Wrapper**（覆盖）
3. **Run Synthesis** → **Run Implementation** → **Generate Bitstream**
4. **Export Hardware**，勾选 Include bitstream，导出 `.hdf`
5. SDK 打开工程，**Update Hardware Specification** → **Re-generate BSP** → Build
6. **Program FPGA**（先下 bit）→ **Run As → Launch on Hardware**（再下 elf）
7. 串口终端 `115200 8N1`，应看到 `letter shell 3.2.4 ready`，再敲 `help`

## 调试记录

| 现象 | 原因 | 解决 |
| --- | --- | --- |
| 实现跑几小时不结束 | 上次残留的 `vivado.exe` 占着 `impl_1/runme.log`，新任务打不开日志一直等 | 结束所有 `vivado.exe` 后重跑，40 秒完成 |
| `[Coretcl 2-1280]` module_ref 升级警告 | 改了 `led_ctl` 的端口宽度（8 位 → 2 位），BD 里的实例还是旧接口 | 删掉 BD 里的 `led_ctl_0` 重新 Add Module，再改端口宽度 |
| `write_bitstream` 报 `NSTD-1` / `UCIO-1` | 工程里一个 XDC 都没有，LED 引脚未约束 | 加 `led.xdc`，W14/W13 + LVCMOS33 |
| 编译报 `XPAR_XUARTPS_1_DEVICE_ID` 未定义 | BSP 里只启用 UART1，Xilinx 把它重编号成第 0 个 uartps 实例 | 改用 `XPAR_XUARTPS_0_DEVICE_ID` |
| 命令有回显但灯不动 | bit 没下载，或 `ctrl[31]` 没置位 | 先 Program FPGA；控制字按位域拼装 |