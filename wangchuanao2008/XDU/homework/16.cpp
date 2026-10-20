#include <stdio.h>

int main()
{
    int m, n;
    scanf("%d %d", &m, &n);

    float total = n;
    float discount = 10.0f;

    if (m == 1)
    {
        if (n >= 500)
            discount = 8.0f;
        else if (n >= 350)
            discount = 8.5f;
        else if (n >= 200)
            discount = 9.0f;
    }
    else
    {
        if (n >= 500)
            discount = 9.0f;
        else if (n >= 350)
            discount = 9.5f;
    }

    float bill = total * discount / 10;
    float saving = total - bill;

    if (m == 1)
        printf("yes ");
    else
        printf("no ");

    printf("%.1f %.1f %.1f\n", total, bill, saving);

    return 0;
}
