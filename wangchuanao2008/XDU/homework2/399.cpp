#include <stdio.h>

int main() {
    int c = getchar();
    if (c == EOF) return 0;

    char s[4];
    int n = 0;
    s[n++] = (char)c;
    if ((unsigned char)c >= 0x81) {
        int c2 = getchar();
        if (c2 != EOF) s[n++] = (char)c2;
    }
    s[n] = '\0';

    if (n == 1 && c >= 'A' && c <= 'Z') {
        putchar(c - 'A' + 'a');
    }
    else if (n == 1 && c >= 'a' && c <= 'z') {
        putchar(c - 'a' + 'A');
    }
    else if (n == 1 && c >= '0' && c <= '9') {
        printf ("%c是数字", c);
    }
    else {
        printf ("%s是其他字符", s);
    }
    return 0;
}
