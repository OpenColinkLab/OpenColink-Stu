#------------------------------------------------------------------
# File Name    : ebaz4205.xdc
# Board        : EBAZ4205 (XC7Z010-1CLG400)
# Tool Versions: Vivado 2018.3
#------------------------------------------------------------------
# Versions | Modify
#------------------------------------------------------------------
# v-alpha  | 26-11-07  Initial version
#------------------------------------------------------------------
# Description:
#   Board level pin constraints. led_red_ow is the top level output
#   port of Led_Shell_Top, connected to on-board red LED W14.
#------------------------------------------------------------------

#---------------- Board LED -----------------#
set_property PACKAGE_PIN W14      [get_ports led_red_ow]
set_property IOSTANDARD LVCMOS33  [get_ports led_red_ow]