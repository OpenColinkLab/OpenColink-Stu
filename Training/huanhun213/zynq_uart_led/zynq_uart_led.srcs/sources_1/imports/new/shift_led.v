`timescale 1ns / 1ps

module led_ctl (
    input           clk,        
    input           rst_n,      
    input  [31:0]   ctrl,       
    output [1:0]    led         
);


reg  [27:0]  cnt;         
wire  [27:0] div;         
wire         shift_en;    
reg  [1:0]   led_reg;     


assign div = (ctrl[27:0] == 28'd0) ? 28'd1 : ctrl[27:0];


always @(posedge clk or negedge rst_n) begin
    if(!rst_n) begin
        cnt <= 28'd0;
    end
    else if(cnt >= div) begin
        cnt <= 28'd0;
    end
    else begin
        cnt <= cnt + 1'b1;
    end
end


assign shift_en = (cnt == div) ? 1'b1 : 1'b0;


always @(posedge clk or negedge rst_n) begin
    if(!rst_n) begin
        led_reg <= 2'b01;                      // 复位后 led[0] 有效
    end
    else if(shift_en) begin
        case(ctrl[30:28])
            3'b000: led_reg <= {led_reg[0], led_reg[1]};   // 两灯轮流
            3'b001: led_reg <= {led_reg[1], led_reg[0]};   // 反向轮流
            3'b010: led_reg <= ~led_reg;                   // 两灯交替闪
            3'b011: led_reg <= 2'b01;                      // 固定单灯常亮
            default: led_reg <= {led_reg[0], led_reg[1]};  // 默认轮流
        endcase
    end
end

assign led = ctrl[31] ? ~led_reg : 2'b11;

endmodule