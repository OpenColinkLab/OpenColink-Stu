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

if {![file exists [file join $sdk_dir $app_name ".cproject"]]} {
    puts "== create application $app_name"
    createapp -name $app_name -hwproject $hw_name -proc ps7_cortexa9_0 \
        -os standalone -lang c -app {Empty Application} -bsp $bsp_name
    importsources -name $app_name -path [file join $proj_dir "app_src"]

    # the "Empty Application" template always creates an empty README.txt,
    # it is not used by the build, remove it to keep the source folder clean
    file delete -force [file join $sdk_dir $app_name "src" "README.txt"]
}

# -----------------------------------------------------------------------------
# 1b. refresh the sources inside the SDK application
#
# importsources above only runs once, when the application is created.  Editing
# app_src/ afterwards would therefore never reach the build.  Copying the
# sources on every run keeps app_src/ as the single source of truth, and it is
# also what puts the patched lscript.ld (the one that defines
# _shell_command_start / _shell_command_end) into the application: the
# "Empty Application" template always generates its own default linker script.
# -----------------------------------------------------------------------------
set app_src_dir [file join $proj_dir "app_src"]
set sdk_src_dir [file join $sdk_dir $app_name "src"]
file mkdir $sdk_src_dir
foreach src_file [glob -nocomplain -directory $app_src_dir *.c *.h *.ld] {
    file copy -force $src_file $sdk_src_dir
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
