#include <stdio.h>
#include <string.h>

int main(int argc, char const *argv[])
{
    char *s = (char *)malloc(sizeof(char) * 5);
    strcpy(s, "Hello");
    printf("%s/n", s);

    free(s);

    return 0;

}
