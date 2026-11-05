#include<stdio.h>
int main()
{
	int n,num,i=1,s=0;
	scanf("%d",&n);
	num=n*n*n;
	while(1)
	 {
	 s=4*i+12;
	 if(s==num)
	  break;
	 i+=2;
     }
    printf("%d %d %d %d",i,i+2,i+4,i+6);
	return 0;
}
