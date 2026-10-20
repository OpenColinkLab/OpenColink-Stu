`timescale 1ns / 1ps
module A1#(
    parameter n=6
)(
    input [n-1:0] a,b,
    output [n-1:0] y
);
    generate
        genvar i;
        for(i=0;i<n;i=i+1)begin
            if (n<8)
                and_in and_in_0(
                    .a(a[i]),
                    .b(b[i]),
                    .x(y[i])
                );
            else
                assign y=a|b;
        end
    endgenerate
endmodule
