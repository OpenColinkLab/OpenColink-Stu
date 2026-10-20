// -----------------------------------------------------------------------------
//  tb_led_driver.v : self checking testbench for Led_Driver
//
//  CLK_HZ / PWM_HZ are scaled down so that the counters stay small:
//      CLK_HZ = 100, PWM_HZ = 1  ->  PWM period    = 100 clocks
//                                    1 s blink half =  50 clocks
//                                    2 s blink half = 100 clocks
//  The logic only uses the ratio, so this checks the real behaviour.
// -----------------------------------------------------------------------------
`timescale 1ns / 1ps

module tb_led_driver;

    reg        clk;
    reg        rst_n;
    reg  [3:0] ctrl;
    wire       led;

    integer errors = 0;
    integer tp_high;
    integer tp_low;
    integer ix_cnt;
    integer tp_cnt;

    Led_Driver #(
        .CLK_HZ         (100),
        .PWM_HZ         (1),
        .LED_ACTIVE_LOW (0)      // 1 = lit in simulation
    ) dut (
        .clk   (clk),
        .rst_n (rst_n),
        .ctrl  (ctrl),
        .led   (led)
    );

    always #5 clk = ~clk;

    // wait n rising edges
    task wait_cycles(input integer f_num);
        integer ix_i;
        begin
            for (ix_i = 0; ix_i < f_num; ix_i = ix_i + 1) begin
                @(posedge clk);
            end
        end
    endtask

    // measure the length of one high phase and the following low phase
    task measure_blink(output integer f_high, output integer f_low);
        begin
            f_high = 0;
            f_low  = 0;
            while (led !== 1'b1) begin
                @(posedge clk);
            end
            while (led === 1'b1) begin
                @(posedge clk);
                f_high = f_high + 1;
            end
            while (led === 1'b0) begin
                @(posedge clk);
                f_low = f_low + 1;
            end
        end
    endtask

    // count how many clocks the LED is high during f_num clocks
    task count_high(input integer f_num, output integer f_high);
        begin
            f_high = 0;
            for (ix_cnt = 0; ix_cnt < f_num; ix_cnt = ix_cnt + 1) begin
                @(posedge clk);
                if (led === 1'b1) begin
                    f_high = f_high + 1;
                end
            end
        end
    endtask

    task check_range(input integer f_value, input integer f_min,
                     input integer f_max, input [255:0] f_name);
        begin
            if ((f_value < f_min) || (f_value > f_max)) begin
                $display("FAIL : %0s = %0d, expected %0d .. %0d",
                         f_name, f_value, f_min, f_max);
                errors = errors + 1;
            end else begin
                $display("PASS : %0s = %0d", f_name, f_value);
            end
        end
    endtask

    initial begin
        clk   = 1'b0;
        rst_n = 1'b0;
        ctrl  = 4'd0;

        wait_cycles(5);
        rst_n = 1'b1;
        wait_cycles(5);

        // ---------------- mode 0 : off ----------------
        ctrl = 4'd0;
        wait_cycles(5);
        tp_cnt = 0;
        for (ix_cnt = 0; ix_cnt < 200; ix_cnt = ix_cnt + 1) begin
            @(posedge clk);
            if (led !== 1'b0) tp_cnt = tp_cnt + 1;
        end
        check_range(tp_cnt, 0, 0, "mode0 high clocks");

        // ---------------- mode 1 : 1 s blink, half period 50 ----------------
        ctrl = 4'd1;
        wait_cycles(3);
        measure_blink(tp_high, tp_low);
        check_range(tp_high, 48, 52, "mode1 blink high");
        check_range(tp_low,  48, 52, "mode1 blink low");

        // ---------------- mode 2 : 2 s blink, half period 100 ----------------
        ctrl = 4'd2;
        wait_cycles(3);
        measure_blink(tp_high, tp_low);
        check_range(tp_high, 98, 102, "mode2 blink high");
        check_range(tp_low,  98, 102, "mode2 blink low");

        // ---------------- mode 3 : PWM 33 % ----------------
        ctrl = 4'd3;
        wait_cycles(3);
        count_high(100, tp_cnt);
        check_range(tp_cnt, 31, 35, "mode3 duty /100");

        // ---------------- mode 4 : PWM 66 % ----------------
        ctrl = 4'd4;
        wait_cycles(3);
        count_high(100, tp_cnt);
        check_range(tp_cnt, 64, 68, "mode4 duty /100");

        // ---------------- mode 5 : PWM 100 % ----------------
        ctrl = 4'd5;
        wait_cycles(3);
        count_high(100, tp_cnt);
        check_range(tp_cnt, 100, 100, "mode5 duty /100");

        // ---------------- mode 6 : reserved -> off ----------------
        ctrl = 4'd6;
        wait_cycles(3);
        count_high(100, tp_cnt);
        check_range(tp_cnt, 0, 0, "mode6 high clocks");

        $display("---------------------------------------------");
        if (errors == 0) begin
            $display("SIMULATION PASSED");
        end else begin
            $display("SIMULATION FAILED : %0d error(s)", errors);
        end
        $finish;
    end

endmodule
