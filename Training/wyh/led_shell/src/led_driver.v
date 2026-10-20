// -----------------------------------------------------------------------------
// Organization : Lab training project
// Engineer     : WenYH
// Create Date  : 2026-10-18
// File Name    : led_driver.v
// Module Name  : Led_Driver
// Target       : xc7z010clg400-1 (EBAZ4205)
// Tool Version : Vivado 2018.3
//
// Versions | Modify
// ------------------
// v1.0     | 2026-10-18 | first version
// ------------------
// Description :
//   The PS writes a 4-bit control word into an AXI GPIO.  This module turns
//   that control word into the three LED actions required by the training
//   task: 1 s blink, 2 s blink and PWM dimming with three brightness levels.
//   A small state machine selects the action, a free running counter makes
//   the 1 kHz PWM and a second counter makes the blink phase.
// -----------------------------------------------------------------------------
`timescale 1ns / 1ps

module Led_Driver #(
    parameter integer CLK_HZ         = 50_000_000,  // input clock = PS FCLK_CLK0
    parameter integer PWM_HZ         = 1_000,       // PWM frequency
    parameter integer LED_ACTIVE_LOW = 1            // EBAZ4205 on-board LED: 0 = lit
)(
    input  wire       clk,     // 50 MHz from PS
    input  wire       rst_n,   // active low reset from PS
    input  wire [3:0] ctrl,    // control word from AXI GPIO
    output wire       led      // LED pin
);

    // ------------------------------------------------------------------------
    // Constant calculation
    //   PWM_PERIOD    = 50 MHz / 1 kHz = 50000 clocks
    //   blink phase   = half of the blink period
    // ------------------------------------------------------------------------
    localparam [15:0] PWM_PERIOD    = CLK_HZ / PWM_HZ;   // 50000
    localparam [25:0] BLINK_1S_HALF = CLK_HZ / 2;        // 0.5 s = 25000000
    localparam [25:0] BLINK_2S_HALF = CLK_HZ;            // 1.0 s = 50000000

    // state encoding
    localparam [2:0] S_OFF      = 3'd0;
    localparam [2:0] S_BLINK_1S = 3'd1;
    localparam [2:0] S_BLINK_2S = 3'd2;
    localparam [2:0] S_DIM_1    = 3'd3;
    localparam [2:0] S_DIM_2    = 3'd4;
    localparam [2:0] S_FULL     = 3'd5;

    // ------------------------------------------------------------------------
    // 1. Synchronize the control word
    //    The PS writes the AXI GPIO register asynchronously to clk, so the
    //    value is registered once before it is used by the state machine.
    // ------------------------------------------------------------------------
    reg [3:0] ctrl_r;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            ctrl_r <= 4'd0;
        end else begin
            ctrl_r <= ctrl;
        end
    end

    // ------------------------------------------------------------------------
    // 2. State machine
    //    ctrl[2:0] selects the target state.  Bits above bit 2 are ignored.
    // ------------------------------------------------------------------------
    reg [2:0] state;
    reg [2:0] state_next;

    always @(*) begin
        case (ctrl_r[2:0])
            3'd1:    state_next = S_BLINK_1S;
            3'd2:    state_next = S_BLINK_2S;
            3'd3:    state_next = S_DIM_1;
            3'd4:    state_next = S_DIM_2;
            3'd5:    state_next = S_FULL;
            default: state_next = S_OFF;      // 0 and all reserved values
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

    // ------------------------------------------------------------------------
    // 3. PWM counter, free running, 1 kHz
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // 4. Blink counter and phase
    //    The half period depends on the current state, the phase is reset when
    //    the state changes so every new blink starts with the LED lit.
    // ------------------------------------------------------------------------
    reg [25:0] blink_cnt;
    reg        blink_phase;

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

    // ------------------------------------------------------------------------
    // 5. PWM duty of each dimming state
    //    level 1 = 1/3, level 2 = 2/3, level 3 = 100 %
    // ------------------------------------------------------------------------
    reg [15:0] duty;

    always @(*) begin
        case (state)
            S_DIM_1: duty = PWM_PERIOD / 3;        // 16666 / 50000 = 33 %
            S_DIM_2: duty = (PWM_PERIOD * 2) / 3;  // 33333 / 50000 = 67 %
            S_FULL:  duty = PWM_PERIOD;            // 100 %
            default: duty = 16'd0;
        endcase
    end

    // ------------------------------------------------------------------------
    // 6. Output select
    // ------------------------------------------------------------------------
    reg led_on;   // 1 = lit

    always @(*) begin
        case (state)
            S_BLINK_1S, S_BLINK_2S:   led_on = blink_phase;
            S_DIM_1, S_DIM_2, S_FULL: led_on = (pwm_cnt < duty);
            default:                  led_on = 1'b0;
        endcase
    end

    // EBAZ4205 LED is low active, change LED_ACTIVE_LOW to 0 for high active
    assign led = LED_ACTIVE_LOW ? ~led_on : led_on;

endmodule
