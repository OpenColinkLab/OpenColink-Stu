# 03 PWM 调光（定时器 PWM 输出 + 占空比控制）

## 目标

理解定时器与 PWM 原理，学会配置占空比，实现 LED 亮度可随占空比平滑变化的**呼吸灯**。

## 硬件与环境

| 项目 | 内容 |
|---|---|
| 开发板 | STM32F103C8T6 最小系统板 |
| PWM 输出 | **PA6（TIM3_CH1）** |
| 外接 LED | PA6 → 1kΩ 电阻 → LED 正极，LED 负极 → GND |
| 开发工具 | STM32CubeMX 6.15 + Keil MDK 5（HAL 库） |

## 工程结构

```
03_PWM_Dimmer/
├── Core/
│   ├── Inc/            头文件
│   └── Src/
│       ├── main.c      ← 呼吸灯主循环
│       ├── tim.c       ← TIM3 时基与 PWM 通道配置
│       └── gpio.c
├── Drivers/            HAL 库 + CMSIS
├── MDK-ARM/pwm.uvprojx Keil 工程（打开这个）
└── pwm.ioc             CubeMX 配置文件
```

## 实现思路

**① 定时器参数**

```c
htim3.Init.Prescaler = 72 - 1;    // 72MHz / 72 = 1MHz，即每 1µs 计一次数
htim3.Init.Period    = 100 - 1;   // 数 0~99，共 100 次 → 周期 100µs = 10kHz
```

PWM 频率 = `72MHz ÷ 72 ÷ 100 = 10kHz`，远高于人眼分辨能力（>100Hz 就不闪）。

**② PWM 通道**

```c
sConfigOC.OCMode     = TIM_OCMODE_PWM1;      // CNT < CCR 输出有效电平
sConfigOC.Pulse      = 50;                   // CCR，初始占空比 50%
sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;  // 高电平有效
HAL_TIM_PWM_ConfigChannel(&htim3, &sConfigOC, TIM_CHANNEL_1);
```

因为 `ARR + 1 = 100`，所以 **CCR 的数值直接就是占空比百分比**。

**③ 引脚必须配成复用推挽**

```c
GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;   // 不是普通的 Out_PP
```

"复用"表示引脚交给定时器控制，不再受 `HAL_GPIO_WritePin` 影响。

**④ 启动与调光**

```c
HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);   // 必须显式启动，否则只配置不输出

for (int i = 0; i <= 100; i++) {            // 渐亮
    __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, i);
    HAL_Delay(10);
}
for (int i = 100; i >= 0; i--) {            // 渐暗
    __HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, i);
    HAL_Delay(10);
}
```

一个完整呼吸周期约 **2 秒**。

## 现象

PA6 上的 LED 从全灭**缓慢变亮**到最亮，再**缓慢变暗**回全灭，循环往复。

## 遇到的问题及解决

1. **LED 完全不亮，改 CCR 也没反应**

   `HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);` 被注释掉了。
   CubeMX 生成的代码只完成**配置**，不会**启动**定时器和输出通道，
   必须自己调用 `HAL_TIM_PWM_Start`。这一行漏了，前面配得再对也没有波形。

2. **写递减循环时写成了 `for (int i = 0; i <= 100; i--)`**

   `i` 从 0 开始一直减小，条件 `i <= 100` 永远成立 → 死循环，
   `CCR` 变成负数后被转成极大值，灯恒定最亮。
   递减循环的「起点、条件、步长」三件套必须一起改：`i = 100; i >= 0; i--`。

3. **主循环写在 `USER CODE BEGIN WHILE` 里，重新生成代码后结构错乱**

   CubeMX 只用 `USER CODE BEGIN/END` 之间的内容做保护，
   `while (1) {` 和 `}` 属于它生成的骨架。自己重写骨架会导致括号错配。
   **正确做法**：`while (1) {` 保持生成的样子，自己的逻辑写在 `USER CODE BEGIN 3` 下面。

4. **注释掉代码时把结构性括号一起注释了**

   一段包含 `}` 的代码被 `/* */` 包住后，`while` 少了一个闭合括号，
   编译报 "expected '}'"，错误位置却指向文件末尾，非常难找。
   **教训**：注释代码前先确认里面有没有结构性的括号。

## 备注

工程由 CubeMX 生成（HAL 库），与阶段 1 的标准库（SPL）工程属不同体系。
