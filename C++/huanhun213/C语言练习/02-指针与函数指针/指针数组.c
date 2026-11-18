#include<stdio.h>
#include<string.h>

int main(int argc, char *argv[])
{
    char *cBooks[] = {
        "123",
        "4560",
        "1234"
    };

    char **by1;
    char **by2[2];

    by1 = &cBooks[1];
    by2[0] = &cBooks[0];
    by2[1] = &cBooks[2];

    printf("%s\n", *by1);
    printf("%s\n", *by2[0]);

    strcpy(cBooks[1], "789");
    printf("%s\n", *by1);

    return 0;
}