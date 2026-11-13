//------------------------------------------------------------------
// Organization : XDU
// Engineer     : 
// E-mail       : 
// Cnblogs      : 
//------------------------------------------------------------------
// Create Date  : 2026-11-06 22:00:00
// File Name    : m_led_ctrl.v
// Module Name  : M_Led_Ctrl
// Target Devices: XC7Z010-CLG400-1
// Tool Versions: Vivado 2018.3
//------------------------------------------------------------------
// Versions | Modify
//------------------------------------------------------------------
// v-alpha  | 26-11-06  初版：AXI GPIO bit0 控红灯常亮/闪烁
// v-alpha  | 26-11-07  规范修订 + 低电平点亮取反
// v-alpha  | 26-11-08  ctrl_iw 改为纯电平控制（不闪烁），语义清晰：
//                        ctrl=1 亮，ctrl=0 灭
//------------------------------------------------------------------
// Description:
//   红灯控制模块。ctrl_iw = 1 时红灯亮，ctrl_iw = 0 时红灯灭。
//   EBAZ4205 板载红灯 W14 为低电平点亮，输出取反。
//
//   端口上的 X_INTERFACE_* 属性供 IP Integrator 识别 clk/rst 类型，
//   缺少时 BD 会报 41-1731 Type mismatch。
//------------------------------------------------------------------
`timescale 1ns/1ps

//------------------ Include ------------------//
`include "m_led_ctrl.vh"

//------------------ Global Define ------------//
//------------------ Private Define -----------//

module M_Led_Ctrl (
  // Input
  (* X_INTERFACE_INFO = "xilinx.com:signal:clock:1.0 clk CLK" *)
  (* X_INTERFACE_PARAMETER = "XIL_INTERFACENAME clk, ASSOCIATED_RESET rst_n_iw, FREQ_HZ 50000000" *)
  input  wire clk_iw,        // 50MHz from FCLK_CLK0
  (* X_INTERFACE_INFO = "xilinx.com:signal:reset:1.0 rst_n RST" *)
  input  wire rst_n_iw,      // active low, from peripheral_aresetn
  input  wire ctrl_iw,       // AXI GPIO bit0
  // Output
  output reg  led_red_or     // to board LED W14 (active low)
);

  //------------------ Internal Logic --------------//
  /**
   * @brief  红灯输出 = ctrl 取反（W14 低电平点亮）
   * @param  ctrl_iw
   *         有效参数：
   *         - \b 1'b1  常亮
   *         - \b 1'b0  常灭
   * @return None
   * @note   ctrl_iw 是纯电平控制，不再依赖内部计数器；
   *         时钟仍接入以保持时序一致性
   */
  always @(posedge clk_iw or negedge rst_n_iw) begin
    if (rst_n_iw == 1'b0) begin
      led_red_or <= 1'b1;          // 复位灭
    end
    else begin
      led_red_or <= ~ctrl_iw;      // ctrl=1 亮，ctrl=0 灭
    end
  end

  //------------------ Private Undefine -----------//

endmodule