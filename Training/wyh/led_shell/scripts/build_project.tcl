# -----------------------------------------------------------------------------
#  scripts/build_project.tcl
#  Rebuild the whole Vivado project (RTL + block design + constraints) and
#  generate everything needed to program the board.
#
#  Usage (Vivado 2018.3, from the project root or anywhere):
#      vivado -mode batch -source scripts/build_project.tcl
#
#  Output:
#      Led_Shell.xpr                  Vivado project
#      Led_Shell.runs/impl_1/*.bit    bitstream
#      system.hdf                     hardware description for SDK
#      run/Led_Shell_Top.bit          bitstream copy
#      run/ps7_init.tcl               PS initialisation for the JTAG flow
# -----------------------------------------------------------------------------
set script_dir [file dirname [file normalize [info script]]]
set proj_dir   [file normalize [file join $script_dir ".."]]
set proj_name  "Led_Shell"
set part_name  "xc7z010clg400-1"
set bd_name    "led_shell_bd"
set rtl_dir    [file join $proj_dir "src"]
set run_dir    [file join $proj_dir "run"]

source [file join $script_dir "ps7_cfg.tcl"]

proc echo_step {f_msg} {
    puts "\n==== $f_msg ===="
}

echo_step "project directory : $proj_dir"

# -----------------------------------------------------------------------------
# 1. Project
# -----------------------------------------------------------------------------
set xpr_file [file join $proj_dir "$proj_name.xpr"]
if {[file exists $xpr_file]} {
    open_project $xpr_file
} else {
    create_project $proj_name $proj_dir -part $part_name
}
set_property target_language Verilog [current_project]
set_property source_mgmt_mode None [current_project]

# -----------------------------------------------------------------------------
# 2. RTL sources and constraints
# -----------------------------------------------------------------------------
foreach f [list [file join $rtl_dir "led_driver.v"] \
                [file join $rtl_dir "led_shell_top.v"]] {
    if {[llength [get_files -quiet $f]] == 0} {
        add_files -norecurse -fileset sources_1 $f
    }
}
set xdc_file [file join $rtl_dir "led_shell.xdc"]
if {[llength [get_files -quiet $xdc_file]] == 0} {
    add_files -norecurse -fileset constrs_1 $xdc_file
}
update_compile_order -fileset sources_1

# -----------------------------------------------------------------------------
# 3. Block design
#      processing_system7_0 : PS (DDR3, UART1 on MIO24/25, FCLK_CLK0 = 50 MHz)
#      axi_gpio_0           : AXI-Lite -> 4 bit output register
#      auto generated       : interconnect, protocol converter, reset block
#    Exported to the PL side: pl_clk, pl_rst_n, ctrl[3:0]
# -----------------------------------------------------------------------------
if {[llength [get_files -quiet "$bd_name.bd"]] == 0} {
    echo_step "create block design"

    create_bd_design $bd_name

    create_bd_cell -type ip -vlnv xilinx.com:ip:processing_system7:5.5 processing_system7_0
    set_property -dict $PS7_CFG [get_bd_cells processing_system7_0]

    create_bd_cell -type ip -vlnv xilinx.com:ip:axi_gpio:2.0 axi_gpio_0
    set_property -dict [list CONFIG.C_GPIO_WIDTH {4} \
                              CONFIG.C_ALL_OUTPUTS {1} \
                              CONFIG.C_IS_DUAL {0}] [get_bd_cells axi_gpio_0]

    # AXI connection: creates the interconnect, the AXI3/AXI4 converter and the
    # proc_sys_reset block, and wires all clocks / resets
    apply_bd_automation -rule xilinx.com:bd_rule:axi4 -config [list \
        Clk_master {Auto} Clk_slave {Auto} Clk_xbar {Auto} \
        Master {/processing_system7_0/M_AXI_GP0} Slave {/axi_gpio_0/S_AXI} \
        ddr_seg {Auto} intc_ip {New AXI Interconnect} master_apm {0}] \
        [get_bd_intf_pins axi_gpio_0/S_AXI]

    assign_bd_address -target_address_space /processing_system7_0/Data \
        [get_bd_addr_segs axi_gpio_0/S_AXI/Reg]

    # PS interfaces to the outside world.  Vivado 2018.3 names the new external
    # interface ports "DDR_0" / "FIXED_IO_0", rename them to the usual names so
    # that the wrapper ports are DDR_xxx / FIXED_IO_xxx as used by the top file.
    make_bd_intf_pins_external [get_bd_intf_pins processing_system7_0/DDR]
    make_bd_intf_pins_external [get_bd_intf_pins processing_system7_0/FIXED_IO]
    foreach p [get_bd_intf_ports -quiet -filter {NAME =~ "DDR*"}] {
        if {[get_property name $p] ne "DDR"} {
            set_property name DDR $p
        }
    }
    foreach p [get_bd_intf_ports -quiet -filter {NAME =~ "FIXED_IO*"}] {
        if {[get_property name $p] ne "FIXED_IO"} {
            set_property name FIXED_IO $p
        }
    }

    # PL side ports used by led_shell_top.v
    create_bd_port -dir O pl_clk
    connect_bd_net [get_bd_pins processing_system7_0/FCLK_CLK0] [get_bd_ports pl_clk]

    create_bd_port -dir O -from 3 -to 0 ctrl
    connect_bd_net [get_bd_pins axi_gpio_0/gpio_io_o] [get_bd_ports ctrl]

    set rst_cell [get_bd_cells -hierarchical -filter {VLNV =~ "*proc_sys_reset*"}]
    create_bd_port -dir O pl_rst_n
    connect_bd_net [get_bd_pins $rst_cell/peripheral_aresetn] [get_bd_ports pl_rst_n]

    validate_bd_design
    save_bd_design
}

# Generate the block design output products (IP, wrapper, ...).  Needed when
# the project is used from a clean git clone, because .gitignore does not store
# the generated folders.
set bd_file [lindex [get_files -quiet "$bd_name.bd"] 0]
echo_step "generate block design output products"
generate_target all $bd_file

set wrapper_file [make_wrapper -files [get_files $bd_file] -top]
if {[llength [get_files -quiet $wrapper_file]] == 0} {
    add_files -norecurse $wrapper_file
}

update_compile_order -fileset sources_1
set_property top Led_Shell_Top [current_fileset]
update_compile_order -fileset sources_1

# -----------------------------------------------------------------------------
# 4. Synthesis, implementation and bitstream
# -----------------------------------------------------------------------------
echo_step "run synthesis and implementation"
reset_run synth_1
reset_run impl_1
launch_runs impl_1 -to_step write_bitstream -jobs 8
wait_on_run impl_1

if {[get_property PROGRESS [get_runs impl_1]] ne "100%"} {
    error "implementation failed, open the project and check the run logs"
}

# -----------------------------------------------------------------------------
# 5. Export hardware and copy the programming files
# -----------------------------------------------------------------------------
echo_step "export hardware"
file mkdir $run_dir

write_hwdef -force -file [file join $proj_dir "system.hdf"]

set impl_dir [get_property DIRECTORY [get_runs impl_1]]
file copy -force [file join $impl_dir "Led_Shell_Top.bit"] [file join $run_dir "Led_Shell_Top.bit"]

set ps7_init_files [glob -nocomplain [file join $proj_dir \
        "${proj_name}.srcs" "sources_1" "bd" $bd_name "ip" "*" "ps7_init.tcl"]]
if {[llength $ps7_init_files] == 0} {
    error "ps7_init.tcl was not generated"
}
file copy -force [lindex $ps7_init_files 0] [file join $run_dir "ps7_init.tcl"]

puts "\n==== build finished : bitstream + system.hdf + run/ are ready ===="
close_project
