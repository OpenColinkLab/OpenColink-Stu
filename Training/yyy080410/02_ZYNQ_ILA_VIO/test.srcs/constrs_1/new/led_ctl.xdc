# ============================================================
#  led_ctl.xdc   EBAZ4205 板载红色 LED
#  led_ctl.led_red -> W14 (redLED, LVCMOS33)
# ============================================================

set_property -dict {PACKAGE_PIN W14 IOSTANDARD LVCMOS33} [get_ports led_red]

create_debug_core u_ila_0 ila
set_property ALL_PROBE_SAME_MU true [get_debug_cores u_ila_0]
set_property ALL_PROBE_SAME_MU_CNT 1 [get_debug_cores u_ila_0]
set_property C_ADV_TRIGGER false [get_debug_cores u_ila_0]
set_property C_DATA_DEPTH 4096 [get_debug_cores u_ila_0]
set_property C_EN_STRG_QUAL false [get_debug_cores u_ila_0]
set_property C_INPUT_PIPE_STAGES 0 [get_debug_cores u_ila_0]
set_property C_TRIGIN_EN false [get_debug_cores u_ila_0]
set_property C_TRIGOUT_EN false [get_debug_cores u_ila_0]
set_property port_width 1 [get_debug_ports u_ila_0/clk]
connect_debug_port u_ila_0/clk [get_nets [list design01_i/processing_system7_0/inst/FCLK_CLK0]]
set_property PROBE_TYPE DATA_AND_TRIGGER [get_debug_ports u_ila_0/probe0]
set_property port_width 4 [get_debug_ports u_ila_0/probe0]
connect_debug_port u_ila_0/probe0 [get_nets [list {design01_i/led_ctl_0/inst/led[0]} {design01_i/led_ctl_0/inst/led[1]} {design01_i/led_ctl_0/inst/led[2]} {design01_i/led_ctl_0/inst/led[3]}]]
create_debug_port u_ila_0 probe
set_property PROBE_TYPE DATA_AND_TRIGGER [get_debug_ports u_ila_0/probe1]
set_property port_width 26 [get_debug_ports u_ila_0/probe1]
connect_debug_port u_ila_0/probe1 [get_nets [list {design01_i/led_ctl_0/inst/cnt_1s[0]} {design01_i/led_ctl_0/inst/cnt_1s[1]} {design01_i/led_ctl_0/inst/cnt_1s[2]} {design01_i/led_ctl_0/inst/cnt_1s[3]} {design01_i/led_ctl_0/inst/cnt_1s[4]} {design01_i/led_ctl_0/inst/cnt_1s[5]} {design01_i/led_ctl_0/inst/cnt_1s[6]} {design01_i/led_ctl_0/inst/cnt_1s[7]} {design01_i/led_ctl_0/inst/cnt_1s[8]} {design01_i/led_ctl_0/inst/cnt_1s[9]} {design01_i/led_ctl_0/inst/cnt_1s[10]} {design01_i/led_ctl_0/inst/cnt_1s[11]} {design01_i/led_ctl_0/inst/cnt_1s[12]} {design01_i/led_ctl_0/inst/cnt_1s[13]} {design01_i/led_ctl_0/inst/cnt_1s[14]} {design01_i/led_ctl_0/inst/cnt_1s[15]} {design01_i/led_ctl_0/inst/cnt_1s[16]} {design01_i/led_ctl_0/inst/cnt_1s[17]} {design01_i/led_ctl_0/inst/cnt_1s[18]} {design01_i/led_ctl_0/inst/cnt_1s[19]} {design01_i/led_ctl_0/inst/cnt_1s[20]} {design01_i/led_ctl_0/inst/cnt_1s[21]} {design01_i/led_ctl_0/inst/cnt_1s[22]} {design01_i/led_ctl_0/inst/cnt_1s[23]} {design01_i/led_ctl_0/inst/cnt_1s[24]} {design01_i/led_ctl_0/inst/cnt_1s[25]}]]
set_property C_CLK_INPUT_FREQ_HZ 300000000 [get_debug_cores dbg_hub]
set_property C_ENABLE_CLK_DIVIDER false [get_debug_cores dbg_hub]
set_property C_USER_SCAN_CHAIN 1 [get_debug_cores dbg_hub]
connect_debug_port dbg_hub/clk [get_nets u_ila_0_FCLK_CLK0]
