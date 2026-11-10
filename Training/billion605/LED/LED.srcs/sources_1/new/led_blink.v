`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Company: 
// Engineer: 
// 
// Create Date: 2026/11/06 21:28:38
// Design Name: 
// Module Name: led_blink
// Project Name: 
// Target Devices: 
// Tool Versions: 
// Description: 
// 
// Dependencies: 
// 
// Revision:
// Revision 0.01 - File Created
// Additional Comments:
// 
//////////////////////////////////////////////////////////////////////////////////


module led_blink #(
    parameter integer CLK_HZ   = 50_000_000,
    parameter integer BLINK_HZ = 1
)(
    input  wire clk,
    output wire led
);
    localparam integer HALF = CLK_HZ / (2 * BLINK_HZ);
    reg [31:0] cnt   = 32'd0;
    reg        state = 1'b0;

    always @(posedge clk) begin
        if (cnt == HALF - 1) begin
            cnt <= 32'd0;  state <= ~state;
        end else begin
            cnt <= cnt + 1'b1;
        end
    end

    assign led = ~state;
endmodule
