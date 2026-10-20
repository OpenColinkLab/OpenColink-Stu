#include <stdio.h>

int main() {
    float usage = 0;
    char level;
    float extra = 0;
    float bill = 0;

    scanf ("%f", &usage);

    if (usage <= 110) {
        level = 'A';
        bill = usage * 0.5;
        extra = 0;
    }
    else if (usage <= 210) {
        level = 'B';
        extra = usage - 110;
        bill = 55 + extra * 0.55;
    }
    else if (usage <= 400) {
        level = 'C';
        extra = usage - 210;
        bill = 110 + extra * 0.7;
    }
    else {
        level = 'D';
        extra = usage - 400;
        bill = 243 + extra * 1.0;
    }

    printf ("%.2f %c %.2f", bill, level, extra);
    return 0;
}