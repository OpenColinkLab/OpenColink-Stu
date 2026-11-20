# =============================================================
#  AXI_1 硬件改造 v5：删除 PWM 模块后重建
#
#  与 v4 的差别：pwm_gen.v 已从 src/ 删除，led_ctl 不再例化它。
#  module reference 会把旧层次缓存在工程里，所以必须：
#     1) 从工程 fileset 里 remove 掉 pwm_gen.v（文件已不存在，否则综合报找不到）
#     2) 删掉 led_ctl_0 再重新实例化，把新的层次（只剩 tick_gen / blink_gen）带进来
#
#  用法：vivado -mode batch -source build_hw_v5.tcl
# =============================================================

set root {D:/Project/AXI_1}

puts "\[1/7\] open project"
open_project $root/AXI_1.xpr
open_bd_design [get_files design_1.bd]

# ---------- 1. 摘掉 pwm_gen.v ----------
puts "\[2/7\] drop pwm_gen.v from project"
set stale [get_files -quiet $root/src/pwm_gen.v]
if {[llength $stale] > 0} {
    remove_files $stale
    puts "      removed from fileset"
} else {
    puts "      not in fileset"
}
if {[llength [get_files -quiet *pwm_gen*]] > 0} {
    puts "      WARN still referenced: [get_files -quiet *pwm_gen*]"
}
update_compile_order -fileset sources_1

# ---------- 2. 重新实例化 led_ctl_0 ----------
puts "\[3/7\] drop old led_ctl_0"
if {[llength [get_bd_cells -quiet led_ctl_0]] > 0} {
    delete_bd_objs [get_bd_cells led_ctl_0]
    puts "      removed"
}

puts "\[4/7\] recreate led_ctl_0"
create_bd_cell -type module -reference led_ctl led_ctl_0

connect_bd_net [get_bd_pins axi_gpio_0/gpio_io_o]           [get_bd_pins led_ctl_0/ctrl]
connect_bd_net [get_bd_pins led_ctl_0/led]                  [get_bd_ports led_red]
connect_bd_net [get_bd_pins processing_system7_0/FCLK_CLK0] [get_bd_pins led_ctl_0/clk]

regenerate_bd_layout
puts "      validate -> [validate_bd_design]"
save_bd_design

# ---------- 3. 重生成 wrapper ----------
puts "\[5/7\] regenerate wrapper"
make_wrapper -files [get_files design_1.bd] -top -import -force
set_property top design_1_wrapper [current_fileset]
update_compile_order -fileset sources_1

puts "      --- BD ports ---"
foreach p [get_bd_ports] { puts "        $p" }

# ---------- 4. 实现 + 比特流 ----------
puts "\[6/7\] synth + impl + bitstream"
reset_run synth_1
launch_runs impl_1 -to_step write_bitstream -jobs 4
wait_on_run impl_1

set st [get_property STATUS [get_runs impl_1]]
puts "      impl status : $st"
if {[string match "*ERROR*" $st]} { error "impl failed: $st" }

puts "      WNS         : [get_property STATS.WNS [get_runs impl_1]]"
puts "      WHS         : [get_property STATS.WHS [get_runs impl_1]]"

set bit [glob -nocomplain $root/AXI_1.runs/impl_1/*.bit]
if {$bit eq ""} { error "bitstream NOT generated" }
puts "      bitstream   : $bit"

# ---------- 5. 导出 hdf ----------
puts "\[7/7\] export hdf"
write_hwdef  -force -file "$root/AXI_1.hwdef"
write_sysdef -force -hwdef "$root/AXI_1.hwdef" -bitfile $bit -file "$root/AXI_1.hdf"
puts "      hdf         : $root/AXI_1.hdf  exists=[file exists $root/AXI_1.hdf]"

puts "DONE_OK"
close_project
exit 0
