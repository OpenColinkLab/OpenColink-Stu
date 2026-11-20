# =============================================================
#  AXI_1 下载运行脚本
#  作用：复位 PS -> 下比特流 -> ps7_init -> 下 elf -> 启动
#        并保持会话 180 秒，期间可以用串口看输出
#  用法：xsct.bat D:/Project/AXI_1/scripts/run_on_hw.tcl
# =============================================================

set root {D:/Project/AXI_1}
set sdk  {D:/Project/AXI_1/AXI_1.sdk}
set bit  [lindex [glob -nocomplain $root/AXI_1.runs/impl_1/*.bit] 0]
set elf  {D:/Project/AXI_1/AXI_1.sdk/led_axi/Debug/led_axi.elf}

if {$bit eq ""} { puts "ERROR: no bitstream"; exit 1 }
if {![file exists $elf]} { puts "ERROR: no elf"; exit 1 }

puts "bit : $bit"
puts "elf : $elf"

connect
after 1000

puts "=== targets ==="
puts [targets]

puts "=== reset PS ==="
targets -set -nocase -filter {name =~ "*APU*"}
rst -system
after 1000

puts "=== program PL ==="
targets -set -nocase -filter {name =~ "*xc7z010*"}
fpga -file $bit
after 500

puts "=== ps7_init ==="
targets -set -nocase -filter {name =~ "*APU*"}
source $sdk/hw_0/ps7_init.tcl
ps7_init
ps7_post_config

puts "=== download elf ==="
targets -set -nocase -filter {name =~ "*Cortex-A9 MPCore #0*"}
catch {bpremove -all}
rst -processor
dow $elf

puts "=== run ==="
set ok 0
for {set i 0} {$i < 6} {incr i} {
    con
    after 600
    set s [state]
    puts "  con #$i -> $s"
    if {[string match "*Running*" $s]} { set ok 1; break }
}
if {!$ok} { puts "WARN: cpu still not running" }

puts "=== keep alive 180s, watch the serial port ==="
for {set t 0} {$t < 18} {incr t} {
    after 10000
    set gpio [mrd -value 0x41200000]
    puts "  t=[expr {$t*10}]s  GPIO_DATA=$gpio  state=[state]"
}
puts "DONE"
exit 0
