# ============================================================
#  led_ctl.xdc   EBAZ4205 板载红色 LED
#  led_ctl.led_red -> W14 (redLED, LVCMOS33)
# ============================================================

set_property -dict { PACKAGE_PIN W14 IOSTANDARD LVCMOS33 } [get_ports { led_red }]
