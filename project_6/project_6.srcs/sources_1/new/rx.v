`timescale 1ns / 1ps
module rx(
    input rx,clk,rst,
    output reg [7:0] data,
    output reg tx_en
);
    reg [3:0]state;//状态
    reg rx1,rx2;
    reg [8:0]tcount;//计时（单位为时钟周期）
    always@(posedge clk,negedge rst)begin
        if(~rst) begin
            rx1=0;
            rx2<=0;
        end
        else begin
            rx1<=rx;
            rx2<=rx1;
        end
    end
    always@(posedge clk,negedge rst)begin
        if(~rst) state<=4'd0;
        else if((state==4'd0)&rx1&~rx2) state<=4'd1;//开始传入数据
        else if(state==4'd10&tcount==9'd326) state<=4'b0;
        else if(tcount==433) state<=state+4'b1;
    end
    always@(posedge clk,negedge rst)begin
        if(~rst) tcount<=9'd0;
        else if(state==4'd0|tcount==9'd433) tcount<=9'b0;
        else tcount<=tcount+9'd1;
    end
    always@(posedge clk,negedge rst)begin
        if(~rst) data<=8'b11111111;
        else if((state>=4'd2)&(state<=4'd9)&(tcount==9'd217)) data<={rx2,data[7:1]};
    end
    always@(posedge clk,negedge rst)begin
        if(~rst) tx_en<=1'b0;
        else if((tcount==9'd326)&state==4'd10) tx_en<=1'b1;
        else tx_en<=1'b0;
    end
endmodule
