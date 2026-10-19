`timescale 1ns / 1ps
module UART(
    input rx,clk,rst,
    output tx
); 
    wire [7:0]data,tx_en;
    rx rx_0(
        .rx(rx),
        .clk(clk),
        .rst(rst),
        .data(data),
        .tx_en(tx_en)
    );
    tx tx_0(
        .clk(clk),
        .rst(rst),
        .tx_en(tx_en),
        .data(data),
        .tx(tx)
    );
endmodule
