#include<stdio.h>

char *gstWord(char c)
{
    switch (c)
    {
    case 'a':
        return "Apple";
    case 'b':
        return "Banana";
    default:
        return "None";
    }
}

int main(int argc, char *argv[])
{
    char input;
    scanf("%c", &input);

    printf("%s\n", gstWord(input));

    return 0;
}