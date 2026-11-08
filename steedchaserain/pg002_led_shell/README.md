功能
help：列出命令
hello：打印 `Hello World`
led 0：熄灭
led 1：1s 周期闪烁
led 2：2s 周期闪烁
led 3：PWM 100%
led 4：PWM 50%
led 5：PWM 10%
status：显示软件缓存的当前模式

代码来源
cmd.c / cmd.h      Shell 命令框架，移植: wyh/led_shell
uart.c / uart.h       参照wyh/led_shell后自己实现
led.c / led.h          参照wyh/led_shell后自己实现
main.c                  参照wyh/led_shell后自己实现
helloworld.c/.h    参照wyh/led_shell后自己实现
pg002.v               PL LED 逻辑
