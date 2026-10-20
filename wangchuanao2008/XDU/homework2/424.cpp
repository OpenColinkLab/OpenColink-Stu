#include <stdio.h>

int leap(int x) {
    if ((x % 100 != 0 && x % 4 == 0) || x % 400 == 0) return 1;
    else return 0;
}

int main() {
    int year, month, day, hour, minute, second;
    scanf ("%d %d %d %d %d %d", &year, &month, &day, &hour, &minute, &second);


    second++;
    if (second == 60) {
        second = 0;
        minute++;
    }
        if (minute == 60) {
        minute = 0;
        hour++;
    }
    if (hour == 24) {
        hour = 0;
        day++;
    } 

    if ((day == 32) && (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12)) {
        day = 1;
        month++;
    }
    if ((day == 31) && (month == 4 || month == 6 || month == 9 || month == 11)) {
        day = 1;
        month++;
    }
    if ((day == 29) && (month == 2) && (leap(year) == 0)) {
        day = 1;
        month++;
    }
    if ((day == 30) && (month == 2) && (leap(year) == 1)) {
        day = 1;
        month++;
    }

    if (month == 13) {
        month = 1;
        year++;
    }


    printf ("%d\n%d\n%d\n%d\n%d\n%d\n", year, month, day, hour, minute, second);
    return 0;
}