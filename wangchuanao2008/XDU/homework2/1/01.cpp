#include <stdio.h>

int main() {
    int xingqi, wumaizhishu, chepaihao;
    scanf ("%d %d %d", &xingqi, &wumaizhishu, &chepaihao);
    int weihao = chepaihao % 10;
    int xianxing = 0;
    if (xingqi == 6 || xingqi == 7) {
        xianxing = 0;
    }
    else {
        if (wumaizhishu < 200) {
            xianxing = 0;
        }
        else if (wumaizhishu < 400) {
            switch (xingqi) {
                case 1:
                    if (weihao == 1 || weihao == 6) {
                        xianxing = 1;
                    }
                    else {
                        xianxing = 0;
                    }
                    break;
                case 2:
                    if (weihao == 2 || weihao == 7) {
                        xianxing = 1;
                    }
                    else {
                        xianxing = 0;
                    }
                    break;
                case 3:
                    if (weihao == 3 || weihao == 8) {
                        xianxing = 1;
                    }
                    else {
                        xianxing = 0;
                    }
                    break;
                case 4:
                    if (weihao == 4 || weihao == 9) {
                        xianxing = 1;
                    }
                    else {
                        xianxing = 0;
                    }
                    break;
                case 5:
                    if (weihao == 5 || weihao == 0) {
                        xianxing = 1;
                    }
                    else {
                        xianxing = 0;
                    }
                    break;
                    
            }
        }
        else {
            switch (xingqi) {
                case 1:
                case 3:
                case 5:
                    if (weihao == 1 || weihao == 3 || weihao == 5 || weihao == 7 || weihao == 9) {
                        xianxing = 1;
                    }
                    else {
                        xianxing = 0;
                    }
                    break;
                case 2:
                case 4:
                    if (weihao == 0 || weihao == 2 || weihao == 4 || weihao == 6 || weihao == 8) {
                        xianxing = 1;
                    }
                    else {
                        xianxing = 0;
                    }
                    break;
                    
            }
        }
    }
    if (xianxing == 1) {
       printf ("%d yes", weihao); 
    }
    else {
        printf ("%d no", weihao);
    }
    return 0;
}