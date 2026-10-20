#include <stdio.h>

int main() {
    int s = 0;
    scanf ("%d", &s);
    int a = s - 3500;
    int tax = 0;

    if (a <= 0) {
        tax = 0;
    }
    else if (a > 35000) {
        tax = (a - 35000) * 0.30;      
        tax += 26000 * 0.25;           
        tax += 4500 * 0.20;            
        tax += 3000 * 0.10;            
        tax += 1500 * 0.03;            
    }
    else if (a > 9000) {
        tax = (a - 9000) * 0.25;
        tax += 4500 * 0.20;
        tax += 3000 * 0.10;
        tax += 1500 * 0.03;
    }
    else if (a > 4500) {
        tax = (a - 4500) * 0.20;
        tax += 3000 * 0.10;
        tax += 1500 * 0.03;
    }
    else if (a > 1500) {
        tax = (a - 1500) * 0.10;
        tax += 1500 * 0.03;
    }
    else {
        tax = a * 0.03;
    }

    printf ("%d\n", s-tax);
    return 0;
}
