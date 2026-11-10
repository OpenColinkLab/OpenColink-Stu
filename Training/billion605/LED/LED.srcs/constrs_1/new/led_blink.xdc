## EBAZ4205 板载红灯约束
## 顶层是 design_1_wrapper，BD 里 Make External 自动生成的端口名是 led_0（不是 led）
## 如果以后在 BD 里把端口改名成 led，这里要同步改回 led

set_property -dict { PACKAGE_PIN W14  IOSTANDARD LVCMOS33 } [get_ports {led_0}]
