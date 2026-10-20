#include <stdio.h>

int main()
{
    float a;
    scanf("%f", &a);

    float volume = a * a * a;

    float gold = volume * 19.32f;
    float silver = volume * 10.53f;
    float copper = volume * 8.90f;

    printf("%.2f\n", gold);
    printf("%.2f\n", silver);
    printf("%.2f\n", copper);

    return 0;
}