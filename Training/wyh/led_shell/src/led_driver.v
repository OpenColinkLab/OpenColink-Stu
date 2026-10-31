`timescale 1ns / 1ps

module Led_Driver #(
    parameter integer CLK_HZ         = 50_000_000,  // FCLK_CLK0
    parameter integer PWM_HZ         = 1_000,       // PWM 频率
    parameter integer LED_ACTIVE_LOW = 1            // 板载灯低电平点亮
)(
    input  wire       clk,
    input  wire       rst_n,
    input  wire [3:0] ctrl,
    output wire       led
);

    // 50000 个时钟一个 PWM 周期
    localparam [15:0] PWM_PERIOD    = CLK_HZ / PWM_HZ;
    localparam [25:0] BLINK_1S_HALF = CLK_HZ / 2;   // 25M
    localparam [25:0] BLINK_2S_HALF = CLK_HZ;       // 50M

    localparam [2:0] S_OFF      = 3'd0;
    localparam [2:0] S_BLINK_1S = 3'd1;
    localparam [2:0] S_BLINK_2S = 3'd2;
    localparam [2:0] S_DIM_1    = 3'd3;
    localparam [2:0] S_DIM_2    = 3'd4;
    localparam [2:0] S_FULL     = 3'd5;

    reg [3:0] ctrl_r;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            ctrl_r <= 4'd0;
        end else begin
            ctrl_r <= ctrl;
        end
    end

    // 只认 ctrl[2:0]，其他值一律当 0
    reg [2:0] state;
    reg [2:0] state_next;

    always @(*) begin
        case (ctrl_r[2:0])
            3'd1:    state_next = S_BLINK_1S;
            3'd2:    state_next = S_BLINK_2S;
            3'd3:    state_next = S_DIM_1;
            3'd4:    state_next = S_DIM_2;
            3'd5:    state_next = S_FULL;
            default: state_next = S_OFF;
        endcase
    end

    wire state_changed = (state_next != state);

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            state <= S_OFF;
        end else begin
            state <= state_next;
        end
    end

    reg [15:0] pwm_cnt;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            pwm_cnt <= 16'd0;
        end else if (pwm_cnt == (PWM_PERIOD - 16'd1)) begin
            pwm_cnt <= 16'd0;
        end else begin
            pwm_cnt <= pwm_cnt + 16'd1;
        end
    end

    reg [25:0] blink_cnt;
    reg        blink_phase;

    // 半周期随档位变，换档时复位相位，让新档位从亮开始
    wire [25:0] blink_half = (state == S_BLINK_2S) ? BLINK_2S_HALF : BLINK_1S_HALF;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            blink_cnt   <= 26'd0;
            blink_phase <= 1'b0;
        end else if (state_changed) begin
            blink_cnt   <= 26'd0;
            blink_phase <= 1'b1;
        end else if ((state == S_BLINK_1S) || (state == S_BLINK_2S)) begin
            if (blink_cnt == (blink_half - 26'd1)) begin
                blink_cnt   <= 26'd0;
                blink_phase <= ~blink_phase;
            end else begin
                blink_cnt <= blink_cnt + 26'd1;
            end
        end else begin
            blink_cnt   <= 26'd0;
            blink_phase <= 1'b0;
        end
    end

    // 三档占空比，都是常数
    reg [15:0] duty;

    always @(*) begin
        case (state)
            S_DIM_1: duty = PWM_PERIOD / 3;
            S_DIM_2: duty = (PWM_PERIOD * 2) / 3;
            S_FULL:  duty = PWM_PERIOD;
            default: duty = 16'd0;
        endcase
    end

    reg led_on;

    always @(*) begin
        case (state)
            S_BLINK_1S, S_BLINK_2S:   led_on = blink_phase;
            S_DIM_1, S_DIM_2, S_FULL: led_on = (pwm_cnt < duty);
            default:                  led_on = 1'b0;
        endcase
    end

    // W14 低电平点亮
    assign led = LED_ACTIVE_LOW ? ~led_on : led_on;

endmodule
