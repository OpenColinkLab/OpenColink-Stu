#include <stdio.h>

int main() {
    int a, b, result;
    char fuhao;
    scanf ("%d%c%d", &a, &fuhao, &b);
    switch (fuhao) {
        case '+':
            result = a + b;
            break;
        case '-':
            result = a - b;
            break;
        case '*':
            result = a * b;
            break;
        case '/':
            result = a / b;
            break;
        case '%':
            result = a % b;
            break;
    }
    printf("%d%c%d=%d", a, fuhao, b, result);
    return 0;
}