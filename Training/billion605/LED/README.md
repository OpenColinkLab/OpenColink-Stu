# LED — PL 端 LED 闪烁实验（Zynq PS + PL 协同）

EBAZ4205（Zynq-7010）实验二：在 PL 端用纯逻辑实现 1 Hz 方波，驱动板载红灯闪烁。PS 端只负责提供时钟（`FCLK_CLK0` = 50 MHz），不参与控制。

## 硬件平台

| 项目 | 说明 |
| --- | --- |
| 开发板 | EBAZ4205（矿板改） |
| 芯片 | `xc7z010clg400-1`（PS: 双核 Cortex-A9 + PL: Artix-7） |
| 被控对象 | 板载红灯 → FPGA 引脚 **W14**（LVCMOS33，低电平点亮） |
| PS 时钟 | `FCLK_CLK0` = 50 MHz，送入 PL 作为 `led_blink` 的工作时钟 |

## 开发环境

- Vivado **2018.3**
- 目标器件 `xc7z010clg400-1`

## 设计原理

`led_blink.v` 是一个参数化的分频器：

```verilog
module led_blink #(
    parameter integer CLK_HZ   = 50_000_000,   // 输入时钟频率
    parameter integer BLINK_HZ = 1             // 期望闪烁频率
)(input wire clk, output wire led);
```

- 半周期计数阈值 `HALF = CLK_HZ / (2 * BLINK_HZ)` = 25,000,000，即在 50 MHz 下计 0.5 s 翻转一次
- 计数器到阈值后清零并翻转 `state`，输出 `led = ~state`
- 灯为**低电平点亮**，因此取反保证上电瞬间为「灭」→「亮」交替

`led_on.v` 是常亮测试模块（`assign led = 1'b0`），用于快速验证管脚与板子是否正常。

## 系统结构

```
processing_system7_0 (PS7)  --FCLK_CLK0(50MHz)-->  led_blink_0 (PL, 模块引用)
                                                          |
                                                          v  led_0  ->  pin W14 -> 板载红灯
```

Block Design `design_1` 包含两个单元：PS7（仅提供时钟，M_AXI 未使用）和 `led_blink`（Module Reference 方式加入，参数默认 1 Hz）。顶层为 `design_1_wrapper`，对外端口名是 `led_0`。

## 目录结构

```
LED/
├── LED.xpr                                        Vivado 工程文件
├── .gitignore                                     忽略 Vivado 生成物
├── LED.srcs/
│   ├── sources_1/
│   │   ├── new/
│   │   │   ├── led_blink.v                        * PL 闪烁逻辑（参数化分频）
│   │   │   └── led_on.v                           * PL 常亮测试模块
│   │   └── bd/design_1/
│   │       ├── design_1.bd                        Block Design（PS7 + led_blink）
│   │       ├── design_1.bxml                      BD 导出副本
│   │       ├── design_1_ooc.xdc                   BD 的 OOC 约束
│   │       └── hdl/design_1_wrapper.v             BD 顶层 wrapper
│   │   └── bd/mref/led_blink/                     模块引用元数据（重开 BD 需要）
│   │       ├── component.xml
│   │       └── xgui/led_blink_v1_0.tcl
│   └── constrs_1/new/
│       └── led_blink.xdc                          * 管脚约束：led_0 -> W14
```

> 标 `*` 的文件为本次实验编写的内容；其余为 Xilinx 生成或 BD 元数据。

## 复现步骤

1. Vivado 2018.3 打开 `LED.xpr`（原路径 `D:/Vivado/project/LED`，移动后确认路径更新）
2. 若 BD 输出缺失：右键 `design_1` → **Generate Output Products** → **Create HDL Wrapper**
3. **Generate Bitstream**
4. **Export Hardware**（Include bitstream）→ 生成 `.hdf`
5. 连接 JTAG，**Open Hardware Manager** → **Program Device** 下载 bit 流
6. 板上红灯应以 **1 Hz（亮 0.5 s / 灭 0.5 s）** 闪烁

## 调参

修改 `led_blink` 的 `BLINK_HZ` 参数即可改变频率（如 `BLINK_HZ = 2` 为 2 Hz）；修改 `CLK_HZ` 可适配其他输入时钟。注意 `HALF` 需落在 32 位计数器范围内。
