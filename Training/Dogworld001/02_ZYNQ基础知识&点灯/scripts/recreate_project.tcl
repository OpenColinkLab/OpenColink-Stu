# Load this file in Vivado 2018.3, then call stage2_create 0 or 1.
# Source paths are resolved relative to this script, independent of the working directory.
set ::stage2_package_root [file dirname [file dirname [file normalize [info script]]]]

proc stage2_create {level} {
    if {$level ni {0 1}} {error "Expected 0 (LED on) or 1 (LED off)."}
    if {[current_project -quiet] ne ""} {error "Close the current project before creating this project."}
    set variant [expr {$level == 0 ? "level_0_on" : "level_1_off"}]
    set destination [file join $::stage2_package_root build $variant]
    if {[file exists $destination]} {error "Destination already exists. Reopen the existing project or use a fresh extracted package."}
    create_project led_level_$level $destination -part xc7z010clg400-1
    add_files [file join $::stage2_package_root variants $variant led_level.v]
    add_files -fileset constrs_1 [file join $::stage2_package_root constraints led_level.xdc]
    set_property top led_level [get_filesets sources_1]
    update_compile_order -fileset sources_1
    puts "Project created for level $level. Run stage2_build to generate its bitstream."
}

proc stage2_build {} {
    if {[current_project -quiet] eq ""} {error "Run stage2_create first."}
    launch_runs synth_1 -jobs 2
    wait_on_run synth_1
    if {[get_property PROGRESS [get_runs synth_1]] ne "100%"} {error "Synthesis did not complete. Inspect its log."}
    launch_runs impl_1 -to_step write_bitstream -jobs 2
    wait_on_run impl_1
    if {[get_property PROGRESS [get_runs impl_1]] ne "100%"} {error "Implementation did not complete. Inspect its log."}
    puts "Bitstream directory: [get_property DIRECTORY [get_runs impl_1]]"
}

puts "Loaded. Use stage2_create 0 for LED on, or stage2_create 1 for LED off; then stage2_build."
