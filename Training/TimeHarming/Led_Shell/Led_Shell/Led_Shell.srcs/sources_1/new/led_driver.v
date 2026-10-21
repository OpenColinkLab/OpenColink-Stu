//------------------------------------------------------------------------------
/* //---------------------------------------------------------------------------
 * Organization: XDU
 * Engineer:     TimeHarming
 * E-mail:       3452579613@qq.com
 *
 * Create Date:  26-10-21
 * File Name:    led_driver.v
 * Module Name:  Led_Driver
 * Target Devices: xc7z010clg400-1
 * Tool Versions:  Vivado 2018.3
 *
 * Versions   | Modify
 * -----------+-----------------
 * v-alpha    | 26-10-21
 * -----------+-----------------
 * Description:
 *   6 状态机 + 1 kHz PWM，实现 LED 熄灭 / 1s 闪烁 / 2s 闪烁 /
 *   三档亮度（33% / 67% / 100%）。由 PS 侧经 AXI GPIO 下发 ctrl[2:0] 控制。
 *
 *   状态转移表：
 *     ctrl[2:0]=0 -> f_led_off_s      灭
 *     ctrl[2:0]=1 -> f_led_blink1_s   1s 周期闪烁
 *     ctrl[2:0]=2 -> f_led_blink2_s   2s 周期闪烁
 *     ctrl[2:0]=3 -> f_led_dim1_s     PWM 33%
 *     ctrl[2:0]=4 -> f_led_dim2_s     PWM 67%
 *     ctrl[2:0]=5 -> f_led_full_s     PWM 100%
 *     6 / 7 / 其它 -> f_led_off_s
 *
 */ //---------------------------------------------------------------------------
//------------------------------------------------------------------------------

`timescale 1ns / 1ps

module Led_Driver #(
    parameter integer CLK_HZ = 50_000_000,   // FCLK_CLK0 (Hz)
    parameter integer PWM_HZ = 1_000         // PWM 频率 (Hz)
)(
    input  wire        clk_iw,      // 50 MHz
    input  wire        rst_niw,     // 低有效复位
    input  wire [31:0] ctrl_iw32,   // 来自 AXI GPIO
    output reg         led_ow       // -> W14
);

    /*------------------------------------------------------------------
     * 0. 参数换算（50 MHz 下）
     *    PWM_PERIOD = 50 000 拍  -> 1 kHz
     *    1s 闪烁半周期 = 25 000 000 拍
     *    2s 闪烁半周期 = 50 000 000 拍
     *----------------------------------------------------------------*/
    localparam integer PWM_PERIOD    = CLK_HZ / PWM_HZ;
    localparam integer DUTY_1        = PWM_PERIOD / 3;
    localparam integer DUTY_2        = (PWM_PERIOD / 3) * 2;
    localparam integer DUTY_3        = PWM_PERIOD;      //三个占空比
    localparam integer BLINK_HALF_1S = CLK_HZ / 2;
    localparam integer BLINK_HALF_2S = CLK_HZ;

    /*------------------------------------------------------------------
     * 1. FSM 状态定义（PG001 2.3.4：前缀 f_，后缀 _s）
     *----------------------------------------------------------------*/
    localparam [2:0] f_led_off_s    = 3'd0;
    localparam [2:0] f_led_blink1_s = 3'd1;
    localparam [2:0] f_led_blink2_s = 3'd2;
    localparam [2:0] f_led_dim1_s   = 3'd3;
    localparam [2:0] f_led_dim2_s   = 3'd4;
    localparam [2:0] f_led_full_s   = 3'd5;

    /*------------------------------------------------------------------
     * 2. ctrl 打一拍
     *    PS 写 AXI GPIO 与 PL 的 50 MHz 是【异步】的，
     *    必须同步一级，否则 ctrl 变化的瞬间可能采到亚稳态。
     *    这一级不能省。
     *----------------------------------------------------------------*/
    reg [31:0] fg_ctrl_r32;

    always @(posedge clk_iw or negedge rst_niw) begin
        if (!rst_niw) begin
            fg_ctrl_r32 <= 32'd0;
        end else begin
            fg_ctrl_r32 <= ctrl_iw32;
        end
    end

    /*------------------------------------------------------------------
     * 3. 状态寄存器
     *----------------------------------------------------------------*/
    reg [2:0] fg_curState_r3;

    always @(posedge clk_iw or negedge rst_niw) begin
        if (!rst_niw) begin
            fg_curState_r3 <= f_led_off_s;
        end else begin
            case(fg_ctrl_r32[2:0])
                3'd0:       fg_curState_r3 <= f_led_off_s;
                3'd1:       fg_curState_r3 <= f_led_blink1_s;
                3'd2:       fg_curState_r3 <= f_led_blink2_s;
                3'd3:       fg_curState_r3 <= f_led_dim1_s;
                3'd4:       fg_curState_r3 <= f_led_dim2_s;
                3'd5:       fg_curState_r3 <= f_led_full_s;
                default:    fg_curState_r3 <= f_led_off_s;
            endcase
        end
    end

    /*------------------------------------------------------------------
     * 4. PWM 计数器：0 ~ PWM_PERIOD-1 自由运行
     *----------------------------------------------------------------*/
    reg [31:0] fg_pwmCnt_r32;

    always @(posedge clk_iw or negedge rst_niw) begin
        if (!rst_niw) begin
            fg_pwmCnt_r32 <= 32'd0;
        end else if (fg_pwmCnt_r32 >= PWM_PERIOD - 1) begin
            fg_pwmCnt_r32 <= 32'd0;
        end else begin
            fg_pwmCnt_r32 <= fg_pwmCnt_r32 + 32'd1;
        end
    end

    /*------------------------------------------------------------------
     * 5. 闪烁计数器 + 相位
     *----------------------------------------------------------------*/
    reg [31:0] fg_blinkCnt_r32;
    reg        fg_blinkPh_r;

    /* 按当前状态选半周期长度 */
    wire [31:0] fg_blinkHalf_sig32 = (fg_curState_r3 == f_led_blink2_s) ? BLINK_HALF_2S : BLINK_HALF_1S;

    /* 当前是否处于闪烁状态 */
    wire fg_isBlink_sig = (fg_curState_r3 == f_led_blink1_s) || (fg_curState_r3 == f_led_blink2_s);

    always @(posedge clk_iw or negedge rst_niw) begin
        if (!rst_niw) begin
            fg_blinkCnt_r32 <= 32'd0;
            fg_blinkPh_r    <= 1'b1;
        end else if (!fg_isBlink_sig) begin
            /* 非闪烁状态：计数清零、相位回"亮"，保证下次进闪烁从"亮"开始 */
            fg_blinkCnt_r32 <= 32'd0;
            fg_blinkPh_r    <= 1'b1;
        end else if (fg_blinkCnt_r32 >= fg_blinkHalf_sig32 - 1) begin
            fg_blinkCnt_r32 <= 32'd0;
            fg_blinkPh_r    <= ~fg_blinkPh_r;
        end else begin
            fg_blinkCnt_r32 <= fg_blinkCnt_r32 + 32'd1;
        end
    end

    /*------------------------------------------------------------------
     * 6. 占空比选择
     *----------------------------------------------------------------*/
    reg [31:0] fg_duty_r32;

    always @(*) begin
        case (fg_curState_r3)
            f_led_dim1_s:   fg_duty_r32 = DUTY_1;
            f_led_dim2_s:   fg_duty_r32 = DUTY_2;
            f_led_full_s:   fg_duty_r32 = DUTY_3;
            default:        fg_duty_r32 = 32'd0;
        endcase
    end

    wire fg_pwmOn_sig = (fg_pwmCnt_r32 < fg_duty_r32);

    /*------------------------------------------------------------------
     * 7. 输出寄存器（PG001 2.6.3：输出用 reg）
     *----------------------------------------------------------------*/
    always @(posedge clk_iw or negedge rst_niw) begin
        if (!rst_niw) begin
            led_ow <= 1'b0;
        end else begin
            case (fg_curState_r3)
                f_led_blink1_s,
                f_led_blink2_s: begin
                    led_ow <= fg_blinkPh_r;
                end
                f_led_dim1_s,
                f_led_dim2_s,
                f_led_full_s:begin
                    led_ow <= fg_pwmOn_sig;
                end
                default: led_ow <= 1'b0;
            endcase
        end
    end

endmodule