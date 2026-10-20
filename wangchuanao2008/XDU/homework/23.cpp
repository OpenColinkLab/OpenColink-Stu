#include <stdio.h>

int main() {
    int N;
    scanf ("%d", &N);
    int day = N / 86400;
    int remainning = N - day*86400;
    int hour = remainning / 3600;
    int remainning_2 = remainning - hour*3600;
    int minute = remainning_2 / 60;
    int second = remainning_2 - minute*60;
    printf("%d %d %d %d",day,hour,minute,second);
    return 0;
}