# 调试记录

这个文件记一下做这个工程时实际踩到的坑，免得以后再遇到又查一遍。

## 1. Vivado 综合失败，只报 implementation failed

- **现象**：在中文目录（比如桌面`规培相关文件`）里跑 `build_project.tcl`，综合跑到一半直接失败，
  run 日志里只有 "implementation failed"，`synth_1` 连 `runme.log` 都没生成。
- **原因**：Vivado 2018.3 的综合子进程不认中文路径，子进程启动就挂了。
- **解决**：把整个工程放到纯英文路径（例如 `C:\OpenColink-Stu\LabTrain\led_shell`）再编译。

## 2. SDK 重新建了 hw_platform / BSP 之后，应用工程编不出 elf

- **现象**：换了工作区（或者从 Git 克隆）之后跑 `build_sdk.tcl`，BSP 能编，
  但 `Debug/led_shell.elf` 没生成。
- **原因**：仓库里带的 `Led_Shell.sdk/led_shell` 工程不会被新工作区自动识别，
  没有被 `projects -build` 编进去。
- **解决**：脚本里先 `importprojects` 把应用工程导入工作区再 build（`build_sdk.tcl` 已处理）。

## 3. 板子烧了 bit 灯不亮

- **现象**：Vivado 里 Program Device 成功，但 LED 不动、串口也没输出。
- **原因**：EBAZ4205 的 PL 侧没有晶振，`FCLK_CLK0` 要靠 PS 先跑 `ps7_init` 才有时钟；
  只烧 PL 相当于 PL 没有时钟。
- **解决**：用 `scripts\run_app.cmd`，顺序是 `rst -system` -> `ps7_init`/`ps7_post_config`
  -> `fpga -file` -> `dow elf` -> `con`。

## 4. LED 亮灭逻辑可能和预期相反

- **现象**：写 0 反而亮。
- **原因**：EBAZ4205 上红灯（W14）是低电平点亮。
- **解决**：`led_driver.v` 里用 `LED_ACTIVE_LOW` 参数控制，默认 1（低电平点亮）；
  换高电平点亮的板子改成 0。

## 5. 串口终端没反应

- **现象**：脚本显示 RUNNING 了，但串口终端一片空白。
- **排查**：先确认 115200 8N1、COM 口正确；再按一下回车（提示符已经打出来了）；
  最后检查命令里有没有空格（`led 3` 而不是 `led3`）。

## 6. 仿真里 mode1 的高电平读出来是 49 个时钟，不是 50

- **现象**：TB 里测 1s 闪烁的高电平宽度，实测 49 个时钟（按比例缩放后的值）。
- **原因**：计数器从 0 开始、换模式那一拍会复位相位，边界上差一拍很正常。
- **解决**：TB 用 ±2 个时钟的容差判断（`check_range`），不卡死具体数值。

## 7. 后续想做的事

- ctrl=6 呼吸灯、ctrl=7 SOS 灯（`led_driver.v` 里留了 TODO）；
- UART 从轮询改成中断接收；
- 把 bit + elf 打包成 boot.bin 写进 Flash，实现上电自启动。
