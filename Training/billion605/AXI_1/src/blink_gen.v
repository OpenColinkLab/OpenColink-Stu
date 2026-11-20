`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Module Name : blink_gen
// Description : 闪烁发生器 —— 每 period 毫秒翻转一次输出电平
//
//   输入 ms_tick 是 1ms 单周期脉冲，模块只在这个脉冲到来的那一拍动计数器，
//   其余时间保持不动，所以不需要额外的分频器。
//
//   period 单位 ms，占空比固定 50%（亮一半、暗一半）。
//   频率关系：完整周期 = 2 × period，故 f = 500 / period (Hz)
//     period=250 -> 2 Hz      period=50 -> 10 Hz
//
//   只有 ms_tick 有效时才考虑 period 的变化，避免 mid-count 改参数造成毛刺。
//////////////////////////////////////////////////////////////////////////////////

module blink_gen (
    input  wire       clk,
    input  wire       ms_tick,        // 1ms 单周期脉冲
    input  wire [7:0] period,         // 半周期，单位 ms，最小 1
    output reg        blink = 1'b0    // 1 = 亮
);

    reg [7:0] cnt = 8'd0;

    always @(posedge clk) begin
        if (ms_tick) begin
            if (cnt + 8'd1 >= period) begin
                cnt   <= 8'd0;
                blink <= ~blink;
            end else begin
                cnt <= cnt + 8'd1;
            end
        end
    end

endmodule
