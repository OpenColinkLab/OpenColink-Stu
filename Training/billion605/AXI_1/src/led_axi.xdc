## ============================================================
## AXI_1 工程引脚约束
##
## 两路 LED，各证明一件事：
##   led_red   -> W14 红灯：PS -> AXI Interconnect -> AXI GPIO(32bit)
##                          -> led_ctl.ctrl -> led_ctl.led -> W14
##                          灯的行为由 C 代码决定，证明 PS 真的在写寄存器
##   led_green -> W13 绿灯：FCLK_CLK0 -> led_blink（纯 PL 逻辑）
##                          烧完比特流就自己闪，证明 PL 配置成功
##
## 端口名来自 BD 里 create_bd_port -dir O led_red / led_green
## EBAZ4205 的 LED 是灌电流接法，输出 0 = 亮，1 = 灭
## 两个模块内部都已取反，所以 C 里写 EN=1 就是亮
## ============================================================

set_property -dict { PACKAGE_PIN W14  IOSTANDARD LVCMOS33 } [get_ports {led_red}]
set_property -dict { PACKAGE_PIN W13  IOSTANDARD LVCMOS33 } [get_ports {led_green}]
