# Raspberry Pi 4B + AHT20 温湿度采集示例

本示例使用 Raspberry Pi 4B 的 I2C1 总线读取 AHT20 温湿度传感器，并通过 Python 将原始数据解析为摄氏温度和相对湿度。

## 1. 文件说明

| 文件 | 说明 |
| --- | --- |
| `AHT20_test.py` | AHT20 初始化、触发测量、读取原始数据和温湿度解析示例 |
| `README.md` | 硬件连接、环境配置、运行方法和常见问题说明 |

## 2. 硬件连接

AHT20 使用标准 I2C 接口，接线如下：

| AHT20 引脚 | Raspberry Pi 4B | 40 针物理引脚 | 说明 |
| --- | --- | ---: | --- |
| VCC | 3V3 | 1 | 3.3 V 电源 |
| SDA | GPIO2 / SDA1 | 3 | I2C1 数据线 |
| SCL | GPIO3 / SCL1 | 5 | I2C1 时钟线 |
| GND | GND | 6 | 共地 |

```text
Raspberry Pi 4B                  AHT20
Pin 1  (3V3)        ----------   VCC
Pin 3  (GPIO2/SDA)  ----------   SDA
Pin 5  (GPIO3/SCL)  ----------   SCL
Pin 6  (GND)        ----------   GND
```

注意事项：

- 树莓派 GPIO 为 3.3 V 电平，AHT20 的 SDA/SCL 不能直接使用 5 V 上拉。
- GPIO2/GPIO3 在树莓派板上已有 1.8 kΩ 上拉，一般不需要额外添加上拉电阻。
- 如果使用 5 V 供电的 AHT20 模块，请确认模块带有 3.3 V 电平转换，或者额外使用 I2C 电平转换器。
- 多个 I2C 设备可以共用 SDA、SCL、电源和地，但设备地址不能冲突。

## 3. 环境配置

### 3.1 开启 I2C

```bash
sudo raspi-config
```

进入：

```text
Interface Options -> I2C -> Yes
```

然后重启：

```bash
sudo reboot
```

### 3.2 安装依赖

```bash
sudo apt update
sudo apt install -y python3-pip i2c-tools
python3 -m pip install smbus2
```

如果系统提示 externally-managed-environment，建议使用虚拟环境：

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install smbus2
```

### 3.3 检查设备地址

```bash
i2cdetect -y 1
```

正常情况下应能看到 AHT20 的地址 `0x38`：

```text
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- 38 -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
```

如果看不到 `0x38`，请先检查电源、GND、SDA/SCL 是否接反，以及 I2C 是否已开启。

## 4. 运行程序

```bash
cd RaspberryPi_example
python3 AHT20_test.py
```

程序启动后会先初始化 AHT20，然后每秒读取一次温湿度：

```text
init finish!

温度：25.3 | 湿度：48.7
温度：25.4 | 湿度：48.6
温度：25.4 | 湿度：48.5
```

按 `Ctrl+C` 退出。

## 5. AHT20 读取流程

AHT20 是命令型 I2C 传感器，不是简单的寄存器读取设备。程序中的主要流程如下：

### 5.1 初始化/校准

上电后等待 40 ms，然后检查状态字节的校准位：

```text
状态字节 bit3 = 1  -> 已校准
状态字节 bit3 = 0  -> 未校准
```

如果未校准，发送初始化命令：

```text
0xBE 0x08 0x00
```

等待约 10 ms，并检查 busy 位 `bit7` 是否清零。

### 5.2 触发测量

发送触发命令：

```text
0xAC 0x33 0x00
```

等待至少 80 ms，或者轮询状态字节的 busy 位，直到 `bit7 = 0`。

### 5.3 读取原始数据

连续读取 6 个字节：

```text
status + humidity[19:0] + temperature[19:0]
```

其中湿度和温度各占 20 bit，共 5 个数据字节。程序中的解析公式为：

```python
humi_raw = (data[1] << 12) | (data[2] << 4) | (data[3] >> 4)
humi = humi_raw / 0x100000 * 100.0

temp_raw = ((data[3] & 0x0F) << 16) | (data[4] << 8) | data[5]
temp = temp_raw / 0x100000 * 200.0 - 50.0
```

AHT20 还可以在第 7 个字节返回 CRC 校验数据。本示例没有启用 CRC，普通温湿度采集可以省略。

## 6. 常见问题

| 现象 | 可能原因 | 处理方法 |
| --- | --- | --- |
| `i2cdetect` 看不到 `0x38` | 接线错误、未开启 I2C、供电异常 | 检查 VCC/GND/SDA/SCL，确认 I2C 已开启 |
| `Remote I/O error` | 设备未响应或地址错误 | 用 `i2cdetect -y 1` 确认地址 |
| 状态字节为 `0x10` | 校准位 `bit3` 为 0 | 检查初始化命令是否发送了完整的 `0xBE 0x08 0x00` |
| 温湿度明显不合理 | 未校准、读取时序错误或数据错位 | 检查 busy 位和 6 字节数据格式 |
| `ModuleNotFoundError: smbus2` | 未安装依赖 | 执行 `python3 -m pip install smbus2` |
| `NameError: i2c_msg` | 缺少导入 | 使用 `from smbus2 import SMBus, i2c_msg` |

## 7. 使用 Adafruit 库的简化写法

如果不需要自己处理底层协议，可以使用 Adafruit 的 AHTx0 库：

```bash
python3 -m pip install adafruit-blinka adafruit-circuitpython-ahtx0
```

```python
import board
import adafruit_ahtx0

i2c = board.I2C()
sensor = adafruit_ahtx0.AHTx0(i2c)

print(sensor.temperature)
print(sensor.relative_humidity)
```

注意类名是 `AHTx0`，不是 `AHT20`。

## 8. 参考资料

- AHT20 数据手册：<https://files.seeedstudio.com/wiki/Grove-AHT20_I2C_Industrial_Grade_Temperature_and_Humidity_Sensor/AHT20-datasheet-2020-4-16.pdf>
- Raspberry Pi GPIO 文档：<https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#gpio>
- smbus2 文档：<https://smbus2.readthedocs.io/>
