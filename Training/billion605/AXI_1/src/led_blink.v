`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Module Name: led_blink
// Description: 纯 PL 逻辑的闪烁灯，不依赖 PS 参与
//              这一路接绿灯 W13（端口 led_green），用来证明 PL 侧逻辑是活的
//              PS 侧的 AXI GPIO -> led_ctl 接红灯 W14（端口 led_red），由 C 代码控制
//
// CLK_HZ   : 输入时钟频率，必须和 BD 里 FCLK_CLK0 的实际频率一致
// BLINK_HZ : 闪烁频率，1 表示 0.5 秒亮 / 0.5 秒灭
//////////////////////////////////////////////////////////////////////////////////

module led_blink #(
    parameter integer CLK_HZ   = 50_000_000,
    parameter integer BLINK_HZ = 1
)(
    input  wire clk,
    output wire led
);
    // 数到 HALF 个时钟周期就是半个闪烁周期
    localparam integer HALF = CLK_HZ / (2 * BLINK_HZ);

    reg [31:0] cnt   = 32'd0;
    reg        state = 1'b0;

    always @(posedge clk) begin
        if (cnt == HALF - 1) begin
            cnt   <= 32'd0;
            state <= ~state;
        end else begin
            cnt   <= cnt + 1'b1;
        end
    end

    // EBAZ4205 的 LED 是灌电流接法，输出低电平才亮
    assign led = ~state;
endmodule
