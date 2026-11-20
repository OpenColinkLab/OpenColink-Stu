`timescale 1ns / 1ps
//======================================================================
//  led_ctl.v
//  EBAZ4205 (XC7Z010-1CLG400) -- 4-bit circular shift LED
//
//  本版改动：不再使用 rst_n（原因见下）
//
//  为什么去掉 rst_n：
//      Block Design 里 led_ctl.rst_n 接的是 proc_sys_reset 的
//      peripheral_aresetn，而它的 ext_reset_in 来自 PS 的
//      FCLK_RESET0_N。只用 JTAG 配置 PL、PS 没有启动程序时，
//      FCLK_RESET0_N 一直有效，复位永远不释放，
//      模块被长期摁在复位态，led 恒定输出 1 -> 灯永远灭。
//
//      改为依靠 FPGA 配置时的寄存器初值（initial）：
//          led = 4'b1110，配置完成即生效，不需要复位。
//
//  预期结果（用于定位问题）：
//      灯每 4 秒亮 1 秒  -> 时钟和 LED 通路都正常
//      灯常亮不闪        -> LED 通路正常，但 FCLK_CLK0 没有跳变
//      灯完全不亮        -> W14 引脚或 LED 硬件有问题
//======================================================================

module led_ctl #(
    parameter integer CLK_HZ = 50_000_000,   // input clock (Hz)
    parameter integer PWM_HZ = 1_000         // reserved, unused
)(
    input  wire        clk,      // FCLK_CLK0
    input  wire        rst_n,    // not used in this version
    input  wire [31:0] ctrl,     // from AXI GPIO (unused)
    input  wire [25:0] period_in,// from VIO probe_out0, shift period
    output reg         led_red   // -> W14, ACTIVE LOW (0 = ON)
);

    localparam [25:0] SHIFT_MAX = CLK_HZ;   // 1 Hz shift (default)

    /*------------------------------------------------------------------
     * VIO 控制：period_in 来自 Block Design 里的 VIO probe_out0
     *   在 Hardware Manager 的 hw_vio 窗口里改这个值，
     *   就能实时改变移位快慢，不需要重新综合/下载。
     *-----------------------------------------------------------------*/

    /* 防止 VIO 初值为 0 时周期变成 0（下溢保护） */
    (* mark_debug = "true" *) wire [25:0] shift_max =
        (period_in == 26'd0) ? SHIFT_MAX : period_in;

    /* configuration-time initial values, no reset needed */
    (* mark_debug = "true" *) reg [25:0] cnt_1s = 26'd0;
    (* mark_debug = "true" *) reg [3:0]  led     = 4'b1110;

    /* one-second counter + circular left shift */
    always @(posedge clk) begin
        if (cnt_1s >= shift_max - 1) begin
            cnt_1s <= 26'd0;
            led    <= {led[2:0], led[3]};
        end else begin
            cnt_1s <= cnt_1s + 26'd1;
        end
    end

    /* output: on-board LED is ACTIVE LOW */
    always @(posedge clk)
        led_red <= led[0];

endmodule
