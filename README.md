<p align="center">
  <img src="Training/docs/OpenColink-horizontal.png" alt="OpenColink" width="360">
</p>

<h1 align="center">OpenColink 学生项目仓库</h1>

<p align="center">
  按技术方向归档成员项目、开发记录与培训文档
</p>

---

## 仓库简介

本仓库用于集中管理 OpenColink 成员在学习与项目实践过程中产生的代码、工程和文档。

仓库统一采用下面的组织方式：

```text
技术方向 / 贡献者 / 项目
```

这样既能按技术领域查找内容，也能保留每位贡献者的独立目录。共享培训文档不归入个人目录。

## 技术方向

| 技术方向 | 目录 | 主要内容 |
| --- | --- | --- |
| 规培与 Zynq 开发 | [`Training`](Training/) | Zynq PS+PL、Serial Shell、Verilog、FPGA 灯控及培训文档 |
| 树莓派 | [`RaspberryPi`](RaspberryPi/) | Python 传感器采集、视觉识别与拼图程序 |
| STM32 | [`STM32`](STM32/) | STM32F103 Keil 工程、LED、PWM、ADC 与闭环控制 |
| C++ | [`C++`](C%2B%2B/) | C++ 练习程序 |
| Python | [`Python`](Python/) | Python 基础练习与小工具 |

## 项目导航

### Training

| 贡献者 | 项目 | 说明 |
| --- | --- | --- |
| 17L-PKX | [`LabTrain/test`](Training/17L-PKX/LabTrain/test/) | EBAZ4205 Zynq LED 控制与 letter-shell 串口命令工程 |
| Qwerty114514217 | [`project_4`](Training/Qwerty114514217/project_4/) | Vivado 数字逻辑练习工程 |
| Qwerty114514217 | [`project_6`](Training/Qwerty114514217/project_6/) | UART 发送与接收练习工程 |
| wyh | [`led_shell`](Training/wyh/led_shell/) | PS+PL LED 控制、手写命令解析与仿真验证工程 |
| chentc857 | [PG002-Day1](Training/chentc857/PG002-Day1/) | Zynq PS Hello World 串口输出作业 |

共享培训资料位于：

- [`文档与接线说明`](Training/docs/README.md)：JTAG 接线注意事项及文档索引
- [`traindoc.docx`](Training/docs/traindoc.docx)：Zynq 开发基础与 Shell 移植培训文档
- [`FormattExample.pdf`](Training/docs/FormattExample.pdf)：文档格式示例
- [`购买参考`](Training/docs/购买参考/)：开发板及外设购买参考图片

### RaspberryPi

| 贡献者 | 项目 | 说明 |
| --- | --- | --- |
| 17L-PKX | [`RaspberryPi_example`](RaspberryPi/17L-PKX/RaspberryPi_example/) | Raspberry Pi 4B 通过 I2C 读取 AHT20 温湿度传感器 |
| huanhun213 | [`基于树莓派的拼图程序.py`](RaspberryPi/huanhun213/基于树莓派的拼图程序.py) | 基于视频流与几何识别的 A4 拼图程序 |

### STM32

`STM32/billion605/JL-0100` 中包含以下 Keil 工程：

1. [按键控制 LED](STM32/billion605/JL-0100/STM32/1-按键控制LED/)
2. [PWM 控制 LED](STM32/billion605/JL-0100/STM32/2-PWM控制LED/)
3. [电位器控制 LED 亮度](STM32/billion605/JL-0100/STM32/3-电位器控制LED亮度/)
4. [光敏传感器数据采集](STM32/billion605/JL-0100/STM32/4-光敏传感器数据采集/)
5. [光照反馈闭环控制](STM32/billion605/JL-0100/STM32/5-光照反馈闭环控制/)

### C++

| 贡献者 | 文件 | 说明 |
| --- | --- | --- |
| ZardFan334 | [`2work.cpp`](C++/ZardFan334/2work.cpp) | C++ 练习程序 |
| ZardFan334 | [未命名1.cpp](C++/ZardFan334/未命名1.cpp) | 使用辗转相除法计算两个非负整数的最大公约数 |
| ZardFan334 | [4.cpp](C++/ZardFan334/4.cpp) | C++ 练习程序 |
| ZardFan334 | [最后结果.cpp](C++/ZardFan334/最后结果.cpp) | 实现加减乘除和取模的计算器程序 |

### Python

| 贡献者 | 文件 | 说明 |
| --- | --- | --- |
| 114514gyh1111 | [`九九乘法倒叙版.py`](Python/114514gyh1111/九九乘法倒叙版.py) | 倒序输出九九乘法表 |
| 114514gyh1111 | [`会员充值系统.py`](Python/114514gyh1111/会员充值系统.py) | 会员充值练习程序 |

## 完整目录

```text
OpenColink-Stu/
├── Training/
│   ├── 17L-PKX/
│   │   └── LabTrain/test/
│   ├── Qwerty114514217/
│   │   ├── project_4/
│   │   ├── project_6/
│   │   ├── project_6.xpr
│   │   └── IP.7z
│   ├── wyh/
│   │   └── led_shell/
│   ├── chentc857/
│   │   └── PG002-Day1/
│   └── docs/
│       ├── FormattExample.pdf
│       ├── OpenColink-horizontal.png
│       ├── traindoc.docx
│       └── 购买参考/
├── RaspberryPi/
│   ├── 17L-PKX/RaspberryPi_example/
│   └── huanhun213/
├── STM32/
│   └── billion605/JL-0100/STM32/
├── C++/
│   └── ZardFan334/
├── Python/
│   └── 114514gyh1111/
├── .gitignore
└── README.md
```

## 开发环境参考

| 项目类型 | 推荐环境 |
| --- | --- |
| Zynq PS+PL | Vivado 2018.3、Xilinx SDK 2018.3 |
| STM32 | Keil MDK，打开工程中的 `.uvprojx` 文件 |
| Raspberry Pi | Raspberry Pi OS、Python 3、`smbus2` |
| Python 练习 | Python 3 |
| C++ | 支持 C++11 及以上的编译器 |

具体接线、编译和运行方法请优先查看对应项目目录中的 `README.md` 或说明文档。

## 获取仓库

```bash
git clone https://github.com/OpenColinkLab/OpenColink-Stu.git
cd OpenColink-Stu
```

## 贡献规范

1. 新项目放入对应技术方向目录。
2. 再建立以贡献者名称命名的子目录。
3. 每个项目尽量包含独立的 `README.md`，写明功能、环境、接线和运行方法。
4. 提交前删除或忽略编译产物，例如 Vivado 的 `.cache`、`.runs`、`.sim`、`.ip_user_files`，以及 Keil 的 `Objects`、`Listings` 等目录。
5. 不要在仓库根目录直接提交个人项目；共享文档统一放在 `Training/docs/`。

通用构建产物过滤规则见 [`.gitignore`](.gitignore)。

## 说明

- 本仓库用于学习和交流，各项目代码风格与实现方式可能不同。
- 工程中的芯片型号、引脚和硬件连接请以对应项目说明为准。
- 引用或修改他人项目时，请保留原贡献者目录并注明来源。