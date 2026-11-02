# 原始工程与衍生说明

## 来源

- 原始工程：OpenColinkLab MSP432P401R 打地鼠教学工程
- 原始作者：Chsier（保留在原始源码文件头）
- 原始 Keil 工程：`Comp_Application`，MSP432P401R
- 原始文件时间：2021-09 至 2022-04
- 当前发布位置：`OpenColinkLab/OpenColink-Stu` 仓库的 `Training/msp432-whack-a-mole-fsm/`
- 关键源文件：
  - `original/Library/sol_driver/project/inc/fsm.h`
  - `original/Library/sol_driver/project/src/fsm.c`
  - `original/Library/sol_driver/project/inc/hamster_plate.h`
  - `original/Library/sol_driver/project/src/hamster_plate.c`
  - `original/Library/sol_driver/project/src/project_main.c`
  - `original/Library/sol_driver/bsp/src/bsp_interrupt.c`
  - `original/Source/main.c`

## 原版权声明

原始源码头部的声明为：

1. 不会将此代码以及此代码的衍生代码用作商业用途。
2. 在转载和发布此代码和此代码的衍生代码时会注明原出处。

本目录中的 `c/`、`web/`、`server/` 和测试代码包含对原始状态机、游戏规则、键位映射与常量行为的提炼或衍生实现。上述原始使用限制继续适用于相应衍生部分。

`original/` 保留了原始源码、文件头作者信息和版权声明。发布时未包含本地虚拟环境、构建输出、缓存、Keil 用户界面配置、第三方 PDF 参考资料及机器相关绝对路径。

## 提炼版修正说明

提炼版保留三状态结构和原游戏行为，同时修复转移宏未返回 `TRAN_STATUS`、生命周期事件混入按键判断、不可复现随机源、无符号边界恒真等问题。具体对照见 `web/lesson.html` 的“从 Keil 工程提炼到可测试 C”章节。
