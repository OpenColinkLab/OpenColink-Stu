# =============================================================
#  AXI_1 软件侧：建/复用 SDK 工程并编译
#
#  源文件全部在 D:/Project/AXI_1/src 下，构建时拷进 SDK 工程的 src/：
#    main.c          LED 驱动 + 两条 shell 命令（SHELL_EXPORT_CMD 导出）
#    shell_port.c/h  letter-shell 的读写函数移植层
#    shell/*.c|h     letter-shell 3.2.4 原始库文件（不要改，要升级整个替换）
#
#  额外做一件 letter-shell 在 GCC 下必须做的事：
#    往 lscript.ld 里插入 shellCommand 段和 _shell_command_start/_end 两个符号，
#    否则 shellInit 算出来的命令表长度是 0，help 里一条命令都没有。
# =============================================================

set root {D:/Project/AXI_1}
set sdk  {D:/Project/AXI_1/AXI_1.sdk}
set hdf  {D:/Project/AXI_1/AXI_1.hdf}
set app  {led_axi}

if {![file exists $hdf]} { puts "ERROR: hdf missing"; exit 1 }

puts "\[1/5\] setws"
setws $sdk

puts "\[2/5\] hardware project"
set hwlist ""
catch {set hwlist [getprojects -type hw]}
puts "    existing hw: $hwlist"
if {[llength $hwlist] == 0} {
    createhw -name hw_0 -hwspec $hdf
    set hw_0 hw_0
} else {
    set hw_0 [lindex $hwlist 0]
}

puts "\[3/5\] application project"
set applist ""
catch {set applist [getprojects -type app]}
puts "    existing app: $applist"

if {[lsearch -exact $applist $app] < 0} {
    set created 0
    foreach tpl {{Empty Application} {Hello World}} {
        if {$created} { continue }
        puts "    try template: $tpl"
        if {[catch {createapp -name $app -hwproject $hw_0 -proc ps7_cortexa9_0 -app $tpl -lang C -os standalone} err]} {
            puts "      failed: [lindex [split $err "\n"] 0]"
        } else {
            puts "      OK: $tpl"
            set created 1
        }
    }
    if {!$created} { puts "NO_TEMPLATE"; exit 1 }
} else {
    puts "    reuse existing project: $app"
}

puts "\[4/5\] copy sources"
set dst $sdk/$app/src
file mkdir $dst

# 清掉上一轮的 .c/.h，避免残留文件参与编译（lscript.ld / README.txt 不动）
foreach old [glob -nocomplain $dst/*.c] { file delete -force $old }
foreach old [glob -nocomplain $dst/*.h] { file delete -force $old }

set copied {}
foreach f [concat [glob $root/src/*.c] [glob $root/src/*.h] \
                 [glob $root/src/shell/*.c] [glob $root/src/shell/*.h]] {
    file copy -force $f $dst/
    lappend copied [file tail $f]
}
puts "    [join $copied {, }]"

puts "\[5/5\] patch lscript.ld"
set ld $dst/lscript.ld
if {![file exists $ld]} {
    puts "ERROR: lscript.ld missing"
    exit 1
}
set fh [open $ld r]
set txt [read $fh]
close $fh

if {[string first "_shell_command_start" $txt] >= 0} {
    puts "    already patched"
} else {
    set idx [string first ".rodata1" $txt]
    if {$idx < 0} {
        puts "ERROR: cannot find .rodata1 in lscript.ld"
        exit 1
    }
    set nl  [string last "\n" [string range $txt 0 [expr {$idx - 1}]]]
    set pos [expr {$nl + 1}]
    set block ".shellCommand ALIGN(4) : \{\n   _shell_command_start = .;\n   KEEP (*(shellCommand))\n   . = ALIGN(4);\n   _shell_command_end = .;\n\} > ps7_ddr_0\n\n"

    # 不用 string replace（部分 Tcl 版本 first>last 的插入语义不生效），手工拼接
    set new ""
    if {$pos > 0} {
        append new [string range $txt 0 [expr {$pos - 1}]]
    }
    append new $block
    append new [string range $txt $pos end]

    set fh [open $ld w]
    puts -nonewline $fh $new
    close $fh

    # 回读校验
    set fh [open $ld r]
    set back [read $fh]
    close $fh
    if {[string first "_shell_command_start" $back] < 0} {
        puts "ERROR: lscript.ld patch did not stick"
        exit 1
    }
    puts "    inserted .shellCommand before .rodata1"
}

puts "\[build\]"
set elf $sdk/$app/Debug/$app.elf

# 先删掉旧 ELF：编译失败时 make 不会覆盖它，留着会误判成功
if {[file exists $elf]} { file delete -force $elf }

projects -build -type all

if {[file exists $elf]} {
    puts "ELF_OK: $elf ([file size $elf] bytes)"
} else {
    puts "ELF_MISSING"
    exit 1
}
exit 0
