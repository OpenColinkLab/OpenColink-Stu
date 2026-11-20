# 第 2 项验收记录

任务：能在 Vivado 中建立工程、添加约束、生成比特流，并让 PL 端 LED 受逻辑控制。

| 检查内容 | 记录 | 证据 |
| --- | --- | --- |
| 开发板与器件 | EBAZ4205；工程器件 xc7z010clg400-1 | 原工程 XPR 与构建报告 |
| 开发软件 | Vivado 2018.3 | 原工程与原构建日志 |
| 顶层模块 | led_level | rtl/led_level.v |
| 输出约束 | led_red → W14，LVCMOS33 | constraints/led_level.xdc |
| 比特流生成 | 原日志显示 Bitgen Completed Successfully | evidence/reports/original_build_log.txt |
| 设计规则检查 | 0 Errors、1 Warning；ZPS7-1 PS7 block required | 原 DRC 报告，未隐藏警告 |
| 输出 0 | 板载红灯亮 | [亮灯源码](../variants/level_0_on/led_level.v) · [亮灯照片](../evidence/photos/01_level0_led_on.jpeg) |
| 输出 1 | 板载红灯灭 | [灭灯源码](../variants/level_1_off/led_level.v) · [灭灯照片](../evidence/photos/02_level1_led_off.jpeg) |
| 有效电平 | 低电平有效 | 由用户反馈的两次上板结果确认 |

本次实现在 PL 配置中输出固定高低电平，没有时钟、计数器、闪烁、PS 程序或 AXI 控制。上述扩展不作为本次已实现内容。

两张实拍显示了板载红灯的亮灭，输出电平根据实验记录对应。灭灯照片中的 Vivado Hardware Manager 显示器件状态为 `Programmed`。源码、约束、工程、原比特流和构建日志均已归档。

原工程当前源码为输出 1。包中输出 0 的源码由当前原文件只修改赋值语句得到；没有在本次打包过程中编译出新的输出 0 比特流。现存原 bit 保留原名含义，不把它冒充成两种电平的两个版本。
