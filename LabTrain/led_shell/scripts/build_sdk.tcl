# -----------------------------------------------------------------------------
#  scripts/build_sdk.tcl
#  Create the SDK hardware platform / BSP / application when they are missing,
#  compile everything and copy the .elf to run/.
#
#  Usage (Xilinx SDK 2018.3):
#      xsct scripts/build_sdk.tcl
#
#  This script has to run AFTER scripts/build_project.tcl, because it needs
#  system.hdf and run/ps7_init.tcl.
# -----------------------------------------------------------------------------
set script_dir [file dirname [file normalize [info script]]]
set proj_dir   [file normalize [file join $script_dir ".."]]
set sdk_dir    [file join $proj_dir "Led_Shell.sdk"]
set hdf_file   [file join $proj_dir "system.hdf"]
set run_dir    [file join $proj_dir "run"]

if {![file exists $hdf_file]} {
    error "system.hdf not found, run scripts/build_project.tcl first"
}

file mkdir $sdk_dir
setws $sdk_dir

set hw_name  "led_shell_hw_platform"
set bsp_name "led_shell_bsp"
set app_name "led_shell"

# -----------------------------------------------------------------------------
# 1. hardware platform / BSP / application
# -----------------------------------------------------------------------------
if {![file exists [file join $sdk_dir $hw_name ".project"]]} {
    puts "== create hardware platform $hw_name"
    createhw -name $hw_name -hwspec $hdf_file
}

if {![file exists [file join $sdk_dir $bsp_name ".project"]]} {
    puts "== create BSP $bsp_name"
    createbsp -name $bsp_name -hwproject $hw_name -proc ps7_cortexa9_0 -os standalone
}

# The application project is part of the repository.  A fresh workspace does
# not know it, so import it before building.
if {[lsearch -exact [getprojects -type app] $app_name] < 0} {
    if {![file exists [file join $sdk_dir $app_name ".cproject"]]} {
        error "application project '$app_name' not found in $sdk_dir - it should be part of the repository"
    }
    puts "== import application $app_name"
    importprojects [file join $sdk_dir $app_name]
}

# -----------------------------------------------------------------------------
# 2. build and copy the elf
# -----------------------------------------------------------------------------
puts "== build projects"
projects -build

set elf_file [file join $sdk_dir $app_name "Debug" "$app_name.elf"]
if {![file exists $elf_file]} {
    error "elf file was not generated : $elf_file"
}
file mkdir $run_dir
file copy -force $elf_file [file join $run_dir "$app_name.elf"]

puts "\n==== SDK build finished : run/$app_name.elf ===="
