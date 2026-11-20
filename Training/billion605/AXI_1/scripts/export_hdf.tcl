# =============================================================
#  只重导 hdf（综合实现已完成，不想再跑一遍时用）
#  用法：vivado -mode batch -source export_hdf.tcl
# =============================================================

set root {D:/Project/AXI_1}

open_project $root/AXI_1.xpr

set bit [lindex [glob -nocomplain $root/AXI_1.runs/impl_1/*.bit] 0]
if {$bit eq ""} { error "no bitstream" }
puts "bit = $bit"

write_hwdef  -force -file "$root/AXI_1.hwdef"
write_sysdef -force -hwdef "$root/AXI_1.hwdef" -bitfile $bit -file "$root/AXI_1.hdf"

puts "hdf = $root/AXI_1.hdf  exists=[file exists $root/AXI_1.hdf]  size=[file size $root/AXI_1.hdf]"
puts "HDF_OK"
close_project
exit 0
