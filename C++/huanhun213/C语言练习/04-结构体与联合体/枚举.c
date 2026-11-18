#include <stdio.h>
#include <time.h>

int main(void)
{
    enum Week {sun, mon, tue, wes,thu, fri, sta};
    enum Week today;

    struct tm *p;
    time_t t;

    time(&t);
    p = localtime(&t);

    today = p->tm_wday;

    switch(today)
    {
        case sun:
        case mon:
        case tue:
        case wes:
        case thu:
        case fri:
            printf("干活\n");
            break;
        case sta:
            printf("放假\n");
            break;
        default:
            printf("error\n");
            break;
    }

}