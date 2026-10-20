`timescale 1ns / 1ps
//======================================================================
//  led_ctl.v
//  EBAZ4205 (XC7Z010-1CLG400I) —— 红色 LED 控制模块
//
//  输出：
//      led_red   ->  W14   (板载 redLED, LVCMOS33)
//
//  控制字 ctrl[31:0]（来自 AXI GPIO，32bit / All Outputs）：
//      ctrl[2:0]   功能选择
//          0 = 灭
//          1 = 闪烁，周期 1 秒    (1.0 Hz)
//          2 = 闪烁，周期 2 秒    (0.5 Hz)
//          3 = 常亮，亮度 1 档    (约 33%)
//          4 = 常亮，亮度 2 档    (约 67%)
//          5 = 常亮，亮度 3 档    (100%)
//          6,7 = 保留（按灭处理）
//      ctrl[31:3]  保留
//
//  时钟 : FCLK_CLK0 = 50 MHz
//  复位 : FCLK_RESET0_N（低有效）
//
//  例：ctrl = 0x00000001 -> 1 秒周期闪烁
//      ctrl = 0x00000002 -> 2 秒周期闪烁
//      ctrl = 0x00000003 -> 亮度 1 档
//      ctrl = 0x00000004 -> 亮度 2 档
//      ctrl = 0x00000005 -> 亮度 3 档（最亮）
//      ctrl = 0x00000000 -> 灭
//======================================================================

module led_ctl #(
    parameter integer CLK_HZ = 50_000_000,   // 输入时钟频率 (Hz)
    parameter integer PWM_HZ = 1_000         // PWM 频率 (Hz)，1kHz 肉眼不闪
)(
    input  wire        clk,      // FCLK_CLK0
    input  wire        rst_n,    // FCLK_RESET0_N，低有效
    input  wire [31:0] ctrl,     // 来自 AXI GPIO 的 32bit 输出
    output reg         led_red   // -> W14
);

    /*------------------------------------------------------------------
     * 参数换算
     *   PWM_PERIOD = CLK_HZ / PWM_HZ    -> 1kHz @50MHz = 50000
     *   1 秒周期闪烁：半周期 = CLK_HZ / 2 = 0.5s
     *   2 秒周期闪烁：半周期 = CLK_HZ     = 1.0s
     *-----------------------------------------------------------------*/
    localparam integer PWM_PERIOD = CLK_HZ / PWM_HZ;        // 50000
    localparam integer DUTY_1     = PWM_PERIOD / 3;         // 约 33%
    localparam integer DUTY_2     = (PWM_PERIOD / 3) * 2;   // 约 67%
    localparam integer DUTY_3     = PWM_PERIOD;             // 100%

    wire [2:0] func = ctrl[2:0];

    /*------------------------------------------------------------------
     * 1. PWM 计数器：固定频率自由运行
     *-----------------------------------------------------------------*/
    reg [31:0] pwm_cnt;

    always @(posedge clk or negedge rst_n)
        if (!rst_n)                         pwm_cnt <= 32'd0;
        else if (pwm_cnt >= PWM_PERIOD - 1) pwm_cnt <= 32'd0;
        else                                pwm_cnt <= pwm_cnt + 32'd1;

    /*------------------------------------------------------------------
     * 2. 闪烁计数器
     *    半周期长度直接由参数 CLK_HZ 算出：
     *      1 秒档 -> 半周期 CLK_HZ/2   (亮 0.5s / 灭 0.5s)
     *      2 秒档 -> 半周期 CLK_HZ     (亮 1.0s / 灭 1.0s)
     *-----------------------------------------------------------------*/
    wire [31:0] blink_half = (func == 3'd2) ? CLK_HZ : (CLK_HZ / 2);
    wire        is_blink   = (func == 3'd1) || (func == 3'd2);

    reg [31:0] blink_cnt;
    reg        blink_ph;

    always @(posedge clk or negedge rst_n)
        if (!rst_n) begin
            blink_cnt <= 32'd0;
            blink_ph  <= 1'b0;
        end else if (blink_cnt >= blink_half - 1) begin
            blink_cnt <= 32'd0;
            blink_ph  <= ~blink_ph;
        end else begin
            blink_cnt <= blink_cnt + 32'd1;
        end

    /*------------------------------------------------------------------
     * 3. 亮度档位 -> PWM 比较值
     *-----------------------------------------------------------------*/
    reg [31:0] duty;

    always @(*) begin
        case (func)
            3'd3:    duty = DUTY_1;
            3'd4:    duty = DUTY_2;
            3'd5:    duty = DUTY_3;
            default: duty = 32'd0;
        endcase
    end

    wire pwm_on = (pwm_cnt < duty);

    /*------------------------------------------------------------------
     * 4. 输出选择（寄存一拍，避免组合逻辑毛刺直接打到引脚）
     *-----------------------------------------------------------------*/
    always @(posedge clk or negedge rst_n)
        if (!rst_n) begin
            led_red <= 1'b0;
        end else begin
            case (func)
                3'd1,
                3'd2:    led_red <= blink_ph;   // 1s / 2s 周期闪烁
                3'd3,
                3'd4,
                3'd5:    led_red <= pwm_on;     // 3 档亮度
                default: led_red <= 1'b0;       // 灭 / 保留
            endcase
        end

endmodule