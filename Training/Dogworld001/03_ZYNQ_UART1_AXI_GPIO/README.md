# Zynq 规培第 3 和第 4 项

在 EBAZ4205 上用 Vivado 和 Xilinx SDK 2018.3 完成两项裸机实验。

| 验收项目 | 上板结果 |
| --- | --- |
| 3. PS UART1 输出 Hello World | PuTTY 在 COM4 以 115200、8N1、无流控收到 `Hello World` |
| 4. PS 经 AXI-Lite 控制 PL LED | Cortex-A9 核 0 运行 Xilinx GPIO 示例，W14 红灯反复亮灭，输出 `0` 时亮、`1` 时灭 |
