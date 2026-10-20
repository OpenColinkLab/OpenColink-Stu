# run_app.tcl : called by run_app.cmd
# order: reset PS -> ps7_init -> program PL -> download elf -> run
# paths come from the env vars set in run_app.cmd
set bitfile $::env(BOARD_BIT)
set elffile $::env(BOARD_ELF)
set psinit  $::env(BOARD_PSINIT)

puts "bit    = $bitfile"
puts "elf    = $elffile"
puts "psinit = $psinit"

connect
catch { jtag frequency 6000000 }

# wait until hw_server has enumerated the cable and the Zynq targets
set ok 0
for {set i 1} {$i <= 40} {incr i} {
    if {[catch { set tl [targets] } e]} { set tl "" }
    if {[string match "*APU*" $tl]} { set ok 1 ; break }
    puts "  waiting for JTAG targets ... ($i)"
    after 1000
}
if {!$ok} {
    puts "ERROR: no JTAG targets, check the FT232H / hw_server"
    catch { puts [targets] }
    exit 1
}

# 1) reset the whole system
targets -set -filter {name =~ "APU*"}
rst -system
after 1500

# 2) ps7_init : PS clocks and DDR, FCLK_CLK0 comes out after this
targets -set -filter {name =~ "APU*"}
source $psinit
if {[catch { ps7_init } e]} { puts "ps7_init ERROR: $e" } else { puts "ps7_init OK" }
if {[catch { ps7_post_config } e]} { puts "ps7_post_config ERROR: $e" } else { puts "ps7_post_config OK" }

# 3) program the PL
if {[catch { targets -set -filter {name =~ "xc7z010*"} } e]} {
    puts "PL target ERROR: $e"
} else {
    if {[catch { fpga -file $bitfile } e]} { puts "FPGA PROGRAM ERROR: $e" } else { puts "FPGA PROGRAMMED" }
}

# 4) download the application and run it
targets -set -filter {name =~ "APU*"}
if {[catch { dow $elffile } e]} {
    puts "DOWNLOAD ERROR: $e"
    exit 1
}
after 500
con

puts "\n@@@@ PS_INIT + FPGA + APPLICATION RUNNING"
