#include <stdio.h>
#define PI 3.1415926

int main() {
    int d, h;
    scanf("%d %d", &d, &h);
    float m_iron, m_gold;
    float r = d;
    m_iron = (PI * r * r * h * 7.86 * 1/3) / 1000;
    m_gold = (PI * r * r * h * 19.3 * 1/3) / 1000;
    printf ("%d %d", (int)m_iron, (int)m_gold);
    return 0;
}