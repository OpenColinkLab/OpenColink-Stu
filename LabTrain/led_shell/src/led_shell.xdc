# -----------------------------------------------------------------------------
#  led_shell.xdc
#  EBAZ4205 (XC7Z010-CLG400-1) pin constraints
#
#  The PL side has no oscillator on this board, the 50 MHz clock comes from the
#  PS (FCLK_CLK0) and is already created by the PS7 block design, so only the
#  LED pin has to be constrained here.
# -----------------------------------------------------------------------------

set_property CFGBVS VCCO        [current_design]
set_property CONFIG_VOLTAGE 3.3 [current_design]

# on-board red LED, active low
set_property -dict { PACKAGE_PIN W14  IOSTANDARD LVCMOS33 } [get_ports { led_red }]
