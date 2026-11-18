# 01 STM32 GPIO 点灯与闪烁

## 目标

完成 STM32 开发环境搭建，理解 GPIO 配置流程，实现 LED 按程序控制点亮、闪烁。

## 硬件与环境

| 项目 | 内容 |
|---|---|
| 开发板 | STM32F103C8T6 最小系统板 |
| 板载 LED | PC13（低电平点亮） |
| 开发环境 | Keil MDK 5 + STM32 标准外设库（SPL） |
| 下载器 | ST-Link V2 |

## 工程结构

```
01_STM32_GPIO/
├── Library/          标准外设库（ST 官方）
├── start/            启动文件、CMSIS 内核文件（ST 官方）
├── user/
│   ├── main.c        ← 本次作业的核心代码
│   ├── stm32f10x_it.c
│   ├── stm32f10x_conf.h
│   └── stm32f10x_it.h
├── new.uvprojx       Keil 工程文件（打开这个）
└── new.uvoptx
```

编译：用 Keil 打开 `new.uvprojx`，按 F7 编译。

## 实现思路

GPIO 初始化遵循「**开时钟 → 填结构体 → 调用 Init**」三步：

1. `RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE)` —— 使能 GPIOC 时钟
   （外设的时钟不打开，后面写任何配置寄存器都无效）
2. 填充 `GPIO_InitTypeDef`：`GPIO_Mode = GPIO_Mode_Out_PP`（推挽输出）、
   `GPIO_Pin = GPIO_Pin_13`、`GPIO_Speed = GPIO_Speed_50MHz`
3. `GPIO_Init(GPIOC, &GPIO_InitStructure)` —— 把配置写入寄存器

闪烁的本质是「亮 → 等 → 灭 → 等」无限循环，难点在于「等」：
单片机上没有现成的 `sleep`，需要一个**软件延时**函数靠空转消耗时间。

```c
void Delay_ms(uint32_t ms)
{
    uint32_t i;
    while (ms--)
        for (i = 0; i < 7200; i++);   // 空循环，约 1ms
}
```

## 现象

上电后板载 LED 持续闪烁（半周期约 100ms）。

## 遇到的问题及解决

1. **首次烧录后 LED 常亮，不闪**

   `while (1)` 循环里两次调用都写成了 `GPIO_ResetBits`，引脚电平从头到尾没有变化。
   改为一次 `GPIO_SetBits` + 一次 `GPIO_ResetBits` 后恢复正常闪烁。

   > 教训：写「交替」逻辑时，两个动作必须成对检查——一个是 Set，一个是 Reset。

2. **软件延时不准**

   `7200` 次空转只是经验值，实际延时与主频、编译器优化等级都有关。
   属于预期行为，后续会用定时器实现精确延时（定时器不占用 CPU，且时间准确）。

3. **烧录器型号不匹配**

   首次购买的 ST-Link 与开发板不兼容，无法识别。
   更换为正确型号后下载正常。

## 备注

工程目录结构（Library / start / user）按标准库教程搭建，`main.c` 中代码为本人编写。
