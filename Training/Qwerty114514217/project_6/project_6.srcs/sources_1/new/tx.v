`timescale 1ns / 1ps
module tx(
    input clk,rst,tx_en,[7:0] data,
    output tx
 ); 
    reg [3:0]state;
    reg [8:0]tcount;
    reg [7:0]data_inner;
    always@(posedge clk,negedge rst)begin
        if(~rst) state<=4'd0;
        else if(tx_en) state<=4'd1;
        else if(state==4'd10&tcount==9'd326) state<=4'b0;
        else if(tcount==9'd433) state<=state+4'b1;
    end
    always@(posedge clk,negedge rst)begin
        if(~rst) tcount<=9'd0;
        else if(state==4'd0|tcount==9'd433) tcount<=9'b0;
        else tcount<=tcount+9'd1;
    end
    always@(posedge clk,negedge rst)begin
        if(~rst) data_inner<=8'b11111111;
        else if(tx_en) data_inner<=data;
        else if((state>=4'd2)&(state<=4'd9)&(tcount==9'd433)) data_inner<={1'b1,data_inner[7:1]};
    end
    assign tx=data_inner[0]&~(state==4'b1);
endmodule
