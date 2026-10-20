#include <stdio.h>

int main() {
    float usage = 0;
    scanf ("%f", &usage);
    float cost = 0;

    if (usage <= 110) cost = usage * 0.5;
    else if (usage <= 210) cost = 55 + (usage-110) * 0.55;
    else cost = 110 + (usage-210) * 0.7;

    printf ("%.2f", cost);
    return 0;
}