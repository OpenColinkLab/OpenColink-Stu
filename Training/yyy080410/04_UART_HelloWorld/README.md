# 04 串口 Hello World（USART 收发与 printf 重定向）

## 目标

掌握 USART 初始化、串口收发，实现 **PC 端发送数据可收到回显**。

## 硬件与环境

| 项目 | 内容 |
|---|---|
| 开发板 | STM32F103C8T6 最小系统板 |
| 串口 | **USART2**：PA2 = TX，PA3 = RX |
| 电平转换 | USB 转 TTL 模块（CH340） |
| 开发工具 | STM32CubeMX 6.15 + Keil MDK 5（HAL 库） |
| 串口参数 | 115200 / 8 数据位 / 无校验 / 1 停止位 |

## 接线

```
USB-TTL RXD  ←────  PA2   （PA2 是 USART2_TX）
USB-TTL TXD  ────→  PA3   （PA3 是 USART2_RX）
USB-TTL GND  ─────  GND
```

规律：**对方 RXD 接我的 TX，对方 TXD 接我的 RX，交叉连接；GND 必须共地。**

## 工程结构

```
04_UART_HelloWorld/
├── Core/Src/
│   ├── main.c      ← 回显主循环
│   └── usart.c     ← USART2 初始化
├── Drivers/        HAL 库 + CMSIS
├── MDK-ARM/aaaa.uvprojx   Keil 工程（打开这个）
└── aaaa.ioc        CubeMX 配置文件
```

## 实现思路

**① 串口配置（CubeMX 生成）**

```c
huart2.Instance          = USART2;
huart2.Init.BaudRate     = 115200;
huart2.Init.WordLength   = UART_WORDLENGTH_8B;
huart2.Init.StopBits     = UART_STOPBITS_1;
huart2.Init.Parity       = UART_PARITY_NONE;
huart2.Init.Mode         = UART_MODE_TX_RX;
```

引脚由 `HAL_UART_MspInit` 配置：PA2 复用推挽（TX），PA3 输入（RX）。

**② 回显逻辑**

```c
uint8_t ch;
if (HAL_UART_Receive(&huart2, &ch, 1, 10) == HAL_OK)
{
    HAL_UART_Transmit(&huart2, &ch, 1, 10);
}
```

四个参数：`句柄 / 数据存放地址 / 字节数 / 超时(ms)`。
超时设为 10ms，收不到就返回 `HAL_TIMEOUT`，不会阻塞主循环。

**③ printf 重定向（可选，本工程未使用）**

HAL 库下把 `fputc` 改写成往串口发一个字节，`printf` 就会输出到串口。
**注意 Keil 中必须勾选 `Use MicroLIB`**，否则 `printf` 会走半主机模式，什么都不发。

## 现象

在串口助手中发送 `aa`，接收区立刻返回 `aa`；发送 `bb` 返回 `bb`。

## 遇到的问题及解决

1. **串口收不到任何数据，但代码、接线、波特率都正确**

   这是本次耗时最久的问题。最终发现：**拔掉 ST-Link 后串口立刻正常**。

   原因：ST-Link 与 USB-TTL 同时连接时，
   两者的 GND 经电脑 USB 形成**地环路（ground loop）**，
   同时两个 3.3V 电源并联可能互相灌电流，
   导致串口信号电平判据错乱——芯片在发数据，接收端却判成无效。

   **解决**：先接 ST-Link 烧录，**拔掉 ST-Link**，再接 USB-TTL 调试串口。
   更好的做法是 ST-Link 只接 `SWDIO / SWCLK / GND`，不接 3.3V。

   > 附带收获：CH340 模块上的第二颗 LED 是**数据活动指示灯**。
   > 两个灯都亮 = 有数据在流动；只有一个亮 = 通电但无数据。
   > 这可以当作"链路是否通"的快速判断依据。

2. **串口助手一直空白，误判为芯片未发送**

   当时接收模式是 `ASCII`，而实际收到的是连续的 `0x00`
   （引脚悬空或被拉到低电平时的典型现象），
   `0x00` 在 ASCII 下显示为空白，看起来像"什么都没收到"。
   **解决**：排查时切到 `HEX` 模式，能看到真实的字节流。

3. **只接 RXD 能通，接上 TXD 就不通**

   一开始怀疑是 5V 电平灌入或线序错误，
   实际原因是**插第二根线时把第一根顶松了**（杜邦线母头弹片夹力不足）。
   **解决**：重插到底、换线，两根线不要并排挤压。

4. **`while` 循环里同时跑呼吸灯和串口，导致互相干扰**

   呼吸灯的两段延时合计约 2 秒，这期间不会去接收串口数据，输入被丢弃。
   **解决**：调试阶段一次只保留一个功能；两者要共存时应改用中断接收。

5. **换 USB-TTL 模块后串口助手依然空白**

   更换模块后 Windows 会分配**新的 COM 号**，
   串口助手仍连接旧的端口，实际没连到设备上，且不会有任何提示。
   **解决**：设备管理器中确认当前 COM 号，重新选择。

6. **编译报错：`expected '}'`，错误位置指向文件末尾**

   注释掉一段包含 `}` 的代码，把 `while` 的闭合括号一起注释了。
   括号不配平的错误往往不指向真正出错的行，需要自己数括号。

## 调试方法小结

串口不工作时，按这个顺序排查（本次实战验证有效）：

1. **环回测试**：一根线短接 USB-TTL 的 TXD 和 RXD，发送数据看能否收回
   → 判断问题在电脑侧还是设备侧
2. **换线 / 重插**：杜邦线是头号故障源
3. **看模块指示灯**：判断数据是否在流动
4. **切 HEX 模式**：避免 `0x00` 显示为空白的假象
5. **最后才怀疑代码**

## 备注

工程由 CubeMX 生成（HAL 库）。阶段 3 使用的是 USART1 / PA9-PA10，
本阶段改用 USART2 / PA2-PA3，用于验证对串口外设的独立配置能力。
