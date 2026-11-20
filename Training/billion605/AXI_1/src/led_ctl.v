`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Module Name : led_ctl  （顶层）
// Description : 把 AXI GPIO 的 32 位控制字翻译成 LED 行为
//
//   对应教材 3.5 节：
//     M_AXI_GP0 -> axi_interconnect -> AXI GPIO
//       -> gpio_io_o[31:0] -> led_ctl.ctrl -> led -> 端口 led_red -> 红灯 W14
//
//   本模块只做三件事：拆位、例化子模块、按模式选输出。具体时序逻辑都在子模块里：
//
//       tick_gen   时基：clk -> ms_tick(1ms)
//       blink_gen  闪烁：ms_tick + period -> blink
//
//   控制字 ctrl[31:0] 定义：
//     bit[0]     EN      1 = 使能，0 = 强制熄灭
//     bit[2:1]   MODE    0 = 常亮  1 = 闪烁  （2、3 保留，当前按熄灭处理）
//     bit[15:8]  PERIOD  1..255，MODE=1 时为半周期毫秒数（频率 = 500/PERIOD Hz）
//     其余位保留，写任何值都不影响输出
//
//   blink 计数器是自由运行的，模式切换只改选择器，不重置计数器，
//   所以从"闪"切到"常亮"不会卡在半亮，切回来也是接着原来的相位走。
//
//   EBAZ4205 的 LED 是灌电流接法：输出低电平才亮，顶层统一取反
//////////////////////////////////////////////////////////////////////////////////

module led_ctl #(
    parameter integer CLK_HZ = 50_000_000
)(
    input  wire        clk,
    input  wire [31:0] ctrl,
    output wire        led
);

    /* ---------------- 1. 控制字拆位 + 限幅 ---------------- */
    wire       en     = ctrl[0];
    wire [1:0] mode   = ctrl[2:1];
    wire [7:0] period = (ctrl[15:8] == 8'd0) ? 8'd1 : ctrl[15:8];   // 0 会变成一直翻，兜成 1

    /* ---------------- 2. 时基 ---------------- */
    wire ms_tick;     // 1ms 单周期脉冲

    tick_gen #(
        .CLK_HZ  (CLK_HZ),
        .TICK_HZ (10_000),
        .MS_DIV  (10)
    ) u_tick (
        .clk     (clk),
        .tick    (),          // 100us 脉冲本层用不到，ms_tick 已在子模块内由它分频得到
        .ms_tick (ms_tick)
    );

    /* ---------------- 3. 闪烁 ---------------- */
    wire blink;

    blink_gen u_blink (
        .clk     (clk),
        .ms_tick (ms_tick),
        .period  (period),
        .blink   (blink)
    );

    /* ---------------- 4. 按模式选输出 ---------------- */
    reg led_on;                         // 1 = 亮（逻辑亮，不是引脚电平）
    always @(*) begin
        if (!en) begin
            led_on = 1'b0;
        end else begin
            case (mode)
                2'd0:    led_on = 1'b1;        // 常亮
                2'd1:    led_on = blink;       // 闪烁
                default: led_on = 1'b0;        // 2、3 保留 -> 熄灭
            endcase
        end
    end

    /* ---------------- 5. 灌电流接法：逻辑亮 -> 输出 0 ---------------- */
    assign led = ~led_on;

endmodule
