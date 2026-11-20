# 验证引脚绑定、时钟、地址映射是否真的落到硬件上
open_project {D:/Project/AXI_1/AXI_1.xpr}
open_run impl_1

puts "=== IO 绑定 ==="
foreach p {led_red led_green} {
    if {[llength [get_ports -quiet $p]] > 0} {
        puts "  $p -> PACKAGE_PIN=[get_property PACKAGE_PIN [get_ports $p]]  IOSTANDARD=[get_property IOSTANDARD [get_ports $p]]"
    } else {
        puts "  $p 不存在"
    }
}

puts "=== led_ctl 内部子模块 ==="
foreach c [get_cells -hier -quiet -filter {REF_NAME =~ *tick_gen* || REF_NAME =~ *blink_gen*}] {
    puts "  [get_property NAME $c]  ->  [get_property REF_NAME $c]"
}
puts "=== pwm_gen 应已不存在 ==="
set left [get_cells -hier -quiet -filter {REF_NAME =~ *pwm*}]
puts "  [llength $left] 个 pwm 相关 cell"

puts "=== 源码文件里还有 pwm_gen.v 吗 ==="
puts "  project files: [llength [get_files -quiet *pwm_gen*]] 个引用"

puts "=== 时钟 ==="
foreach c [get_clocks -quiet *] {
    puts "  $c : period=[get_property PERIOD $c] ns"
}

puts "=== 未约束端口 ==="
set un [get_ports -quiet -filter {IS_LOC_FIXED == 0}]
puts "  [llength $un] 个端口没有固定位置"

puts "=== 时序 ==="
set wns [get_property SLACK [get_timing_paths -delay_type max -max_paths 1]]
set whs [get_property SLACK [get_timing_paths -delay_type min -max_paths 1]]
puts "  WNS=$wns  WHS=$whs"

puts "=== 资源占用 ==="
puts "  LUT  : [llength [get_cells -hier -filter {PRIMITIVE_TYPE =~ LUT*}]]"
puts "  FF   : [llength [get_cells -hier -filter {REF_NAME =~ FD* || REF_NAME =~ FDR* || REF_NAME =~ FDE*}] ]"
exit 0
