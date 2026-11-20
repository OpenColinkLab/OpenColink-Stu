`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Module Name : tick_gen
// Description : 时基发生器 —— 从系统时钟分出两档时间基准
//
//   tick    : 100 us 单周期脉冲（10 kHz），本设计里只作为 1ms 的中间分频级
//   ms_tick : 1 ms 单周期脉冲，闪烁计时的步进
//
//   这里只用整数分频计数器，综合出来是加法器 + 比较器，不会有除法器：
//     TICK_DIV 由 CLK_HZ / TICK_HZ 在综合期算成常数
//
//   参数改动时的约束：CLK_HZ 必须等于 BD 里 FCLK_CLK0 的实际频率
//////////////////////////////////////////////////////////////////////////////////

module tick_gen #(
    parameter integer CLK_HZ  = 50_000_000,   // 输入时钟频率
    parameter integer TICK_HZ = 10_000,       // tick 频率，默认 100us
    parameter integer MS_DIV  = 10            // 几个 tick = 1ms
)(
    input  wire clk,
    output wire tick,                         // 100us 脉冲
    output wire ms_tick                       // 1ms 脉冲
);

    localparam integer TICK_DIV = CLK_HZ / TICK_HZ;   // 50MHz -> 5000

    /* ---------------- 100us 分频 ---------------- */
    reg [15:0] tick_cnt = 16'd0;
    always @(posedge clk) begin
        if (tick_cnt == TICK_DIV - 1) tick_cnt <= 16'd0;
        else                          tick_cnt <= tick_cnt + 1'b1;
    end

    assign tick = (tick_cnt == TICK_DIV - 1);

    /* ---------------- tick 再分频得到 1ms ---------------- */
    reg [3:0] ms_div = 4'd0;
    reg       ms_q   = 1'b0;
    always @(posedge clk) begin
        if (tick) begin
            if (ms_div == MS_DIV - 1) begin
                ms_div <= 4'd0;
                ms_q   <= 1'b1;
            end else begin
                ms_div <= ms_div + 1'b1;
                ms_q   <= 1'b0;
            end
        end else begin
            ms_q <= 1'b0;
        end
    end

    assign ms_tick = ms_q;

endmodule
