module led_ctrl(
	input					sclk,
	input 					s_rst_n,
	input  			[3:0]	key,
	output   wire			led 
);

//mode define
parameter 	[3:0]	mode_off  = 4'd0;
parameter 	[3:0]	mode_1s   = 4'd1;
parameter 	[3:0]	mode_2s   = 4'd2;
parameter 	[3:0]	mode_high  = 4'd3;
parameter 	[3:0]	mode_mid  = 4'd4;
parameter 	[3:0]	mode_low = 4'd5;
			
//internal variable
reg [25:0] blink_cnt;
reg [15:0] pwm_cnt;
reg 	   led_ctrl;
//
always @(posedge sclk or negedge s_rst_n) begin
	if(!s_rst_n)
		blink_cnt <= 26'd0;
	else if(blink_cnt == 26'd49_999_999)
		blink_cnt <= 26'd0;
	else 
		blink_cnt <= blink_cnt + 1'b1;
	
    if(!s_rst_n) 
		pwm_cnt <= 16'd0;
	else if(pwm_cnt >= 16'd49_999)
        pwm_cnt <= 16'd0;
    else
        pwm_cnt <= pwm_cnt + 1'b1;
end

always @(posedge sclk or negedge s_rst_n) begin
	if(!s_rst_n)
		led_ctrl <= 1'b0;
		
	else begin
		case (key)
			mode_off: begin
				led_ctrl <= 1'b0;
			end
		
			mode_1s: begin
				if (blink_cnt >= 26'd24_999_999) 
					led_ctrl <= 1'b0;
				else	
					led_ctrl <= 1'b1;
			end
		
			mode_2s: begin
				if (blink_cnt >= 26'd49_999_999)
					led_ctrl  	<= ~led_ctrl;
			end
			mode_high:   led_ctrl <= (pwm_cnt < 16'd50_000);
			mode_mid:   led_ctrl <= (pwm_cnt < 16'd25_000);
			mode_low:	led_ctrl <= (pwm_cnt < 16'd5_000);
			default:   	led_ctrl <= 1'b0;
			
		endcase
	end
end

assign led = ~led_ctrl;

endmodule