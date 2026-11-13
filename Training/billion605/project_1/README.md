# project_1 — Zynq PS 最小系统工程（Hello World）

EBAZ4205（Zynq-7010）上的第一个上板实验：只启用 PS 端，通过 **UART1** 打印 `Hello World`，验证开发板、串口、SDK 下载链路是否打通。

## 硬件平台

| 项目 | 说明 |
| --- | --- |
| 开发板 | EBAZ4205（矿板改） |
| 芯片 | `xc7z010clg400-1`（PS: 双核 Cortex-A9 + PL: Artix-7） |
| 串口 | PS UART1 → MIO 24/25，`115200 8N1` |
| 时钟 | PS `FCLK_CLK0` = 50 MHz（本实验 PS 单独运行，PL 逻辑为空） |

## 开发环境

- Vivado **2018.3**
- Xilinx SDK **2018.3**
- 目标器件 `xc7z010clg400-1`

## 目录结构

```
project_1/
├── project_1.xpr                                  Vivado 工程文件
├── project_1.srcs/
│   └── sources_1/bd/design_1/
│       ├── design_1.bd                            Block Design（PS7 + 复位，UART1 使能）
│       ├── design_1.bxml                          BD 导出副本
│       ├── design_1_ooc.xdc                       BD 的 OOC 约束
│       └── hdl/design_1_wrapper.v                 BD 顶层 wrapper
└── project_1.sdk/
    └── urat/                                      SDK 应用工程
        ├── .cproject / .project                   Eclipse 工程配置
        └── src/
            ├── helloworld.c                       * 应用主程序（打印 Hello World）
            ├── lscript.ld                         链接脚本
            ├── platform.c / platform.h             Xilinx 模板：初始化缓存、UART
            ├── platform_config.h
            └── Xilinx.spec
```

> 标 `*` 的文件为实验涉及的应用代码，其余为 Xilinx 模板或工程配置。

## 未提交的内容（均可重新生成）

`*.cache/`、`*.runs/`、`*.sim/`、`*.hw/`、`*.ip_user_files/`、BD 下的 `ip/`、`ipshared/`、`synth/`、`sim/`，以及 SDK 的 `urat_bsp/`、`*_hw_platform_*/`、`Debug/`、`webtalk/`、`*.hdf` 等构建产物，均已由仓库根目录 `.gitignore` 排除。

## 复现步骤

1. Vivado 2018.3 打开 `project_1.xpr`（工程原路径为 `D:/Vivado/project/project_1`，移动后 Vivado 会提示更新路径，确认即可）
2. 若提示 Block Design 输出缺失，右键 `design_1` → **Generate Output Products**，再 **Create HDL Wrapper**
3. **Generate Bitstream**（可选，本实验 PL 无逻辑）
4. **Export Hardware** → 勾选 Include bitstream，导出 `.hdf`
5. SDK 2018.3 打开 `project_1.sdk`，对 `urat` 工程 **Build** → **Program FPGA** → **Run**
6. 串口终端接 **115200 8N1**，应看到：

```
Hello World
```

## 说明

本工程为训练营入门实验，用于确认 PS 端最小系统（DDR、UART）与下载流程正常，后续实验在此基础上增加 PL 逻辑与 PS-PL 交互。
