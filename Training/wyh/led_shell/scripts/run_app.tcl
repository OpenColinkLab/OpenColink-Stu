# -----------------------------------------------------------------------------
#  scripts/run_app.tcl
#  Bring up the EBAZ4205 over JTAG:
#      1) reset the whole system
#      2) ps7_init / ps7_post_config   -> PS clocks, DDR, FCLK_CLK0 to the PL
#      3) download the application as a FLAT BINARY into DDR (0x00100000)
#      4) program the PL with the bitstream
#      5) point the CPU at the entry address and run it
#
#  Why a flat binary + explicit PC instead of "dow <elf>" ?
#      On this board the JTAG link is 6 flying wires at 1 MHz.  Downloading the
#      ELF directly fails with
#          DOWNLOAD ERROR: Code 16 ... Format {Invalid context}
#          Memory write error at 0x100000. MMU page translation fault
#      Writing a flat binary with "dow -data" and setting PC manually is
#      reliable at 1 MHz (at 6 MHz the writes fault - signal integrity).
#
#  Normally called by scripts/run_app.cmd, which sets:
#      BOARD_BIT, BOARD_BIN, BOARD_ELF, BOARD_PSINIT
#
#  ASCII only on purpose: XSCT on Windows reads scripts with the system code
#  page, non-ASCII text would be garbled.
# -----------------------------------------------------------------------------
set bitfile $::env(BOARD_BIT)
set binfile $::env(BOARD_BIN)
set elffile $::env(BOARD_ELF)
set psinit  $::env(BOARD_PSINIT)
# entry address: normally 0x00100000 (default Zynq lscript.ld origin).
# run_app.cmd can override it with BOARD_ENTRY for other projects.
if {[info exists ::env(BOARD_ENTRY)]} {
    set entry $::env(BOARD_ENTRY)
} else {
    set entry 0x00100000
}

puts "BIT    = $bitfile"
puts "BIN    = $binfile"
puts "ELF    = $elffile"
puts "PSINIT = $psinit"
puts "ENTRY  = $entry"

connect
targets -set -filter {name =~ "APU*"}
catch { jtag frequency 1000000 }

# wait until hw_server has enumerated the cable and the Zynq targets
set ok 0
for {set i 1} {$i <= 40} {incr i} {
    if {[catch { set tl [targets] } e]} { set tl "" }
    if {[string match "*APU*" $tl]} { set ok 1 ; break }
    puts "  waiting for JTAG targets ... ($i)"
    after 1000
}
if {!$ok} {
    puts "ERROR: no JTAG targets found."
    puts "       If the FT232H dropped off the USB, unplug it, wait 5 s, plug it back."
    catch { puts [targets] }
    exit 1
}
puts "TARGETS = $tl"

puts "\n---- 1) reset system ----"
targets -set -filter {name =~ "APU*"}
rst -system
after 1500

puts "\n---- 2) ps7_init (PS clocks + DDR) ----"
targets -set -filter {name =~ "APU*"}
source $psinit
if {[catch { ps7_init } e]} { puts "ps7_init ERROR: $e" ; exit 1 } else { puts "ps7_init OK" }
if {[catch { ps7_post_config } e]} { puts "ps7_post_config ERROR: $e" } else { puts "ps7_post_config OK" }

puts "\n---- 3) download the application (flat binary) ----"
if {[catch { dow -data $binfile $entry } e]} {
    puts "DOWNLOAD ERROR: $e"
    exit 1
}
puts "DOWNLOADED to $entry"
if {[catch { set v [mrd $entry 4] } e]} { puts "MRD ERROR: $e" } else { puts $v }

puts "\n---- 4) program the PL ----"
if {[catch { targets -set -filter {name =~ "xc7z010*"} } e]} {
    puts "PL target ERROR: $e"
} else {
    if {[catch { fpga -file $bitfile } e]} { puts "FPGA PROGRAM ERROR: $e" } else { puts "FPGA PROGRAMMED" }
}

puts "\n---- 5) set PC and run ----"
if {[catch { targets -set -filter {name =~ "*MPCore #0*"} } e]} {
    puts "CORE target ERROR: $e"
} else {
    catch { stop }
    if {[catch { rwr pc $entry } e]} { puts "set PC ERROR: $e" } else { puts "PC = $entry" }
    catch { rwr cpsr 0x000001d3 }
    after 300
}
targets -set -filter {name =~ "APU*"}
if {[catch { con } e]} { puts "CON ERROR: $e" ; exit 1 }
after 800
catch { puts [targets] }

puts "\n@@@@ PS_INIT + FPGA + APPLICATION RUNNING"
puts "     (serial terminal : 115200 8N1, type 'help')"
