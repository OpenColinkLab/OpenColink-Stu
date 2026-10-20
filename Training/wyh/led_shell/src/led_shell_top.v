// -----------------------------------------------------------------------------
// Organization : Lab training project
// Engineer     : WenYH
// Create Date  : 2026-10-18
// File Name    : led_shell_top.v
// Module Name  : Led_Shell_Top
// Target       : xc7z010clg400-1 (EBAZ4205)
// Tool Version : Vivado 2018.3
//
// Versions | Modify
// ------------------
// v1.0     | 2026-10-18 | first version
// ------------------
// Description :
//   Top level of the project.  It brings the PS (built in the block design
//   led_shell_bd) and the LED driver together:
//
//       PS UART1 <-> shell  ->  AXI GPIO  ->  Led_Driver  ->  W14 (red LED)
//
//   The block design exports three signals for the PL side:
//       pl_clk     : PS FCLK_CLK0, 50 MHz
//       pl_rst_n   : PS peripheral reset, active low
//       ctrl[3:0]  : output register of the AXI GPIO
// -----------------------------------------------------------------------------
`timescale 1ns / 1ps

module Led_Shell_Top (
    // ---- PS DDR3 ----
    inout  [14:0] DDR_addr,
    inout  [2:0]  DDR_ba,
    inout         DDR_cas_n,
    inout         DDR_ck_n,
    inout         DDR_ck_p,
    inout         DDR_cke,
    inout         DDR_cs_n,
    inout  [3:0]  DDR_dm,
    inout  [31:0] DDR_dq,
    inout  [3:0]  DDR_dqs_n,
    inout  [3:0]  DDR_dqs_p,
    inout         DDR_odt,
    inout         DDR_ras_n,
    inout         DDR_reset_n,
    inout         DDR_we_n,
    // ---- PS fixed IO (MIO, clock, reset) ----
    inout         FIXED_IO_ddr_vrn,
    inout         FIXED_IO_ddr_vrp,
    inout  [53:0] FIXED_IO_mio,
    inout         FIXED_IO_ps_clk,
    inout         FIXED_IO_ps_porb,
    inout         FIXED_IO_ps_srstb,
    // ---- PL LED ----
    output        led_red
);

    // ------------------------------------------------------------------------
    // Block design (PS7 + AXI GPIO)
    // ------------------------------------------------------------------------
    wire       pl_clk;
    wire       pl_rst_n;
    wire [3:0] ctrl;

    led_shell_bd_wrapper u_ps (
        .DDR_addr          (DDR_addr),
        .DDR_ba            (DDR_ba),
        .DDR_cas_n         (DDR_cas_n),
        .DDR_ck_n          (DDR_ck_n),
        .DDR_ck_p          (DDR_ck_p),
        .DDR_cke           (DDR_cke),
        .DDR_cs_n          (DDR_cs_n),
        .DDR_dm            (DDR_dm),
        .DDR_dq            (DDR_dq),
        .DDR_dqs_n         (DDR_dqs_n),
        .DDR_dqs_p         (DDR_dqs_p),
        .DDR_odt           (DDR_odt),
        .DDR_ras_n         (DDR_ras_n),
        .DDR_reset_n       (DDR_reset_n),
        .DDR_we_n          (DDR_we_n),
        .FIXED_IO_ddr_vrn  (FIXED_IO_ddr_vrn),
        .FIXED_IO_ddr_vrp  (FIXED_IO_ddr_vrp),
        .FIXED_IO_mio      (FIXED_IO_mio),
        .FIXED_IO_ps_clk   (FIXED_IO_ps_clk),
        .FIXED_IO_ps_porb  (FIXED_IO_ps_porb),
        .FIXED_IO_ps_srstb (FIXED_IO_ps_srstb),
        .ctrl              (ctrl),
        .pl_clk            (pl_clk),
        .pl_rst_n          (pl_rst_n)
    );

    // ------------------------------------------------------------------------
    // LED driver
    // ------------------------------------------------------------------------
    Led_Driver #(
        .CLK_HZ         (50_000_000),
        .PWM_HZ         (1_000),
        .LED_ACTIVE_LOW (1)
    ) u_led (
        .clk   (pl_clk),
        .rst_n (pl_rst_n),
        .ctrl  (ctrl),
        .led   (led_red)
    );

endmodule
