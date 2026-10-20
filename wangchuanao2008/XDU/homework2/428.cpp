#include <stdio.h>

int main() {
    float salary;
    scanf ("%f", &salary);
    float fee = 0;

    if (salary <= 3000) fee = salary * 0.005;
    else if (salary <= 5000) fee = salary * 0.01;
    else if (salary <= 10000) fee = salary * 0.015;
    else fee = salary * 0.02;

    printf ("%.1f", fee);
    return 0;
}