# PG002 Day 1 作业：ZYNQ PS Hello World

**学员**：chentc857

## 任务内容

在 EBAZ4205 矿板（XC7Z010-CLG400-1）上完成 ZYNQ PS 最小系统搭建，
通过 SDK 运行 Hello World 裸机程序，串口输出 `Hello World`。

## 开发环境

| 工具 | 版本 |
| --- | --- |
| Vivado | 2018.3 |
| Xilinx SDK | 2018.3 |
| 目标器件 | xc7z010clg400-1 |

## 完成内容

1. 新建 Vivado 工程，器件选择 `xc7z010clg400-1`
2. 创建 Block Design，添加 ZYNQ7 Processing System：
   - 保留 DDR、FIXED_IO 接口
   - 使能 M_AXI_GP0
   - 使能 FCLK_CLK0，并连接到 M_AXI_GP0_ACLK
   - 使能 UART1（串口输出用）
3. Generate Output Products → Create HDL Wrapper → 导出硬件（含 bitstream）
4. Launch SDK，新建 Application Project（Hello World 模板），编译通过

## 遇到的问题及解决

**问题**：SDK 新建 Hello World 工程时报错 `requires a Uart IP`，无法创建。

**原因**：Block Design 中 ZYNQ PS 没有使能任何 UART 外设，
而 Hello World 模板需要通过 UART 打印，所以拒绝创建。

**解决**：回到 Vivado，双击 ZYNQ PS → Peripheral I/O Pins 中使能 UART1
（MIO 24/25）→ 重新生成 → 重新导出硬件 → SDK 中重新建工程，编译通过。

## 文件说明

- `helloworld.c`：SDK Hello World 应用源码（本目录核心提交文件）
