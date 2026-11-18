# 02 Zynq PS+PL：ILA 与 VIO 在线调试

## 目标

在 EBAZ4205（XC7Z010）上完成 PL 逻辑设计，用 **ILA** 抓取 FPGA 内部信号波形，
用 **VIO** 实时读写板卡信号，掌握 Vivado 的在线调试流程。

## 硬件与环境

| 项目 | 内容 |
|---|---|
| 开发板 | EBAZ4205 矿板（XC7Z010-CLG400-1） |
| 下载器 | Digilent JTAG-HS3 |
| 开发工具 | Vivado 2018.3 + Xilinx SDK 2018.3 |
| 板载 LED | 红色 **W14**、绿色 **W13**，**低电平点亮** |

> JTAG 接线：`VREF` 必须接排线的**红色端**。

## 工程结构

```
02_ZYNQ_ILA_VIO/
├── test.xpr                        Vivado 工程（打开这个）
├── test.srcs/
│   ├── sources_1/new/led_ctl.v     PL 逻辑：4 位循环移位
│   ├── constrs_1/new/led_ctl.xdc   引脚约束 + ILA 调试约束
│   └── sources_1/bd/design01/
│       └── design01.bd             Block Design
└── test.sdk/ps_hello/src/          PS 侧程序（用于启动 PS、配置时钟）
```

> 打开工程时若提示找不到 `design01_wrapper.v`，右键 `design01.bd` →
> `Create HDL Wrapper` → 选 `Let Vivado manage wrapper and auto-update` 即可重新生成。

## 实现思路

**① Block Design 结构**

```
ZYNQ7 PS ──FCLK_CLK0──┬──> led_ctl_0/clk
                      ├──> vio_0/clk
                      └──> proc_sys_reset / AXI 互联
        ──M_AXI_GP0───> AXI GPIO ──> led_ctl_0/ctrl
VIO probe_out0[25:0] ──> led_ctl_0/period_in
```

**② PL 逻辑（led_ctl.v）**

4 位循环移位寄存器，每 `period_in` 个时钟循环左移一位：

```verilog
led <= {led[2:0], led[3]};      // 1110 -> 1101 -> 1011 -> 0111 -> 1110
led_red <= led[0];              // 板载 LED 低电平点亮
```

移位周期由 VIO 的 `probe_out0` 决定（26 位，默认 0 时回落到 5000 万 = 1 秒）。

**③ ILA 插桩方式**

在 HDL 中给信号加 `(* mark_debug = "true" *)`，
综合后用 `Flow Navigator → SYNTHESIS → Set Up Debug` 向导插入 ILA 核：

- 采样深度 `4096`
- 时钟域 `FCLK_CLK0`（50MHz）
- 观测信号：`led[3:0]`、`cnt_1s[25:0]`

## 现象

- 板载红灯**每 4 秒亮 1 秒**（`led[0]` 每 4 拍出现一次 0）
- ILA 能捕获到 `led[3:0]` 的状态跳变和 `cnt_1s` 的累加
- VIO 中修改 `probe_out0` 的值，**灯速立即变化，无需重新综合/下载**：

| VIO 值（十六进制） | 十进制 | 现象 |
|---|---|---|
| `04C4B40` | 5,000,000 | 移位 0.1 秒，灯明显变快 |
| `2FAF080` | 50,000,000 | 移位 1 秒（默认速度） |
| `7A120` | 500,000 | 移位 10ms，快到像常亮偏暗 |

## 遇到的问题及解决

1. **只烧 bitstream，PL 完全不工作**

   现象：灯不亮、任何逻辑都不跑。原因：Zynq 的 PL 没有独立晶振，
   时钟靠 PS 的 `FCLK_CLK0` 提供。只用 JTAG 配置 PL 时 PS 没有启动，
   `FCLK` 无输出，且 `FCLK_RESET0_N` 一直有效，模块被摁在复位态。

   **解决**：用 SDK 跑一次程序（执行 `ps7_init` 配置 PS 时钟树），之后 PL 才正常工作。
   这也是为什么规培 Day1 是「PS Hello World」而不是「PL 点灯」——Zynq 的必经之路。

2. **BD 中的模块引用不能例化 IP**

   在 `led_ctl.v` 里直接例化 `vio_0`，综合报
   `ERROR: [Synth 8-439] module 'vio_0' not found`。
   原因：`module_ref` 类型的 IP 是**脱离上下文（OOC）单独综合**的，看不到项目里的其他 IP。

   **解决**：VIO 放到 Block Design 层，`led_ctl` 开一个 `period_in` 输入端口，
   在 BD 里把 `vio_0/probe_out0` 连过去。

3. **改了 HDL，但现象完全没变**

   现象：反复生成 bitstream、重新下载，行为始终是旧版本。
   原因：Vivado 顶部出现 `Module references are out-of-date` 横幅，
   Block Design 没有同步 HDL 的改动，综合用的是旧模块。

   **解决**：点横幅里的 `Refresh Changed Modules`，再 `Generate Output Products`。

4. **VIO 改值后自动变回原值**

   原因有两层：一是 `set_property OUTPUT_VALUE` 之后必须 `commit_hw_vio` 才真正写进芯片；
   二是值格式不对会被拒绝，而**错误信息只出现在 Tcl Console，不弹窗**。
   26 位探针要求**定长十六进制字符串（7 字符）**，如 `"04C4B40"`，
   写成 `0x4C4B40` 或十进制都会报 "value is too large"。

5. **ILA 波形窗口几乎全是平的**

   采样深度 4096、时钟 50MHz，一次只能抓约 **82 微秒**，
   而移位是 1 秒一次，窗口内自然看不到完整过程。属正常现象。
   想看密一点的波形，用 VIO 把移位周期调小。

## 备注

工程基于仓库中 `Training/17L-PKX/LabTrain/test` 复制并修改：
`led_ctl.v` 重写为循环移位逻辑，新增 VIO 控制通路。
