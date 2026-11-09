//------------------------------------------------------------------
// Organization : XDU
// Engineer     : 
// E-mail       : 
// Cnblogs      : 
//------------------------------------------------------------------
// Create Date  : 2026-11-06 22:00:00
// File Name    : led_shell_top.v
// Module Name  : Led_Shell_Top
// Target Devices: XC7Z010-CLG400-1
// Tool Versions: Vivado 2018.3
//------------------------------------------------------------------
// Versions | Modify
//------------------------------------------------------------------
// v-alpha  | 26-11-06  初版：仅例化 BD wrapper，引出板级端口
// v-alpha  | 26-11-07  规范修订：补文件头、端口映射说明与 doxygen 注释
//------------------------------------------------------------------
// Description:
//   顶层文件。只例化 BD 生成的 wrapper（BD 名 led_shell_bd），把板级
//   端口引出来；新增模块一律加在 BD 内部，不在此处例化，以免打乱
//   BD 的地址映射与时钟域。
//
//   端口映射：
//     BD 外部端口 led_red -> wrapper led_red -> 本模块 led_red_ow
//     -> XDC 约束 PACKAGE_PIN W14 / LVCMOS33
//------------------------------------------------------------------
`timescale 1ns/1ps

//------------------ Include ------------------//
//------------------ Global Define ------------//
//------------------ Private Define -----------//

module Led_Shell_Top (
    // Output
    output wire led_red_ow     // 板载红灯，接 W14
);

  //------------------ IP Core Instantiation --------//
  /**
   * @brief  BD 顶层 wrapper 例化
   * @note   wrapper 由 Vivado 自动生成，名称固定为 led_shell_bd_wrapper；
   *        重新生成 BD 不会改变该名称，可放心依赖
   */
  led_shell_bd_wrapper led_shell_bd_wrapper_inst (
      .led_red (led_red_ow)
  );

  //------------------ Private Undefine -----------//

endmodule