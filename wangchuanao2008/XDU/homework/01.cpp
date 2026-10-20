#include <stdio.h>
#define PI 3.1415926

int main(){
    float r_iron;
    float r_gold;
    scanf ("%f %f", &r_iron, &r_gold);
    float m_iron = 7.86 * 4/3 * PI * (r_iron / 20) * (r_iron / 20) * (r_iron / 20);
    float m_gold = 19.3 * 4/3 * PI * (r_gold / 20) * (r_gold / 20) * (r_gold / 20);
    printf ("%.3f %.3f",m_iron, m_gold);
    return 0;
}





