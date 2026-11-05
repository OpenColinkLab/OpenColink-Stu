#include<stdio.h>
int main()
{
	int n,num,i=1,l,s=0;
	scanf("%d",&n);
	num=n*n*n;
	while(1)
	 {
	 s=(i+i+2*(n-1))*n/2;
	 if(s==num)
	  break;
	 i+=2;
     }
    for(l=0;l<n;l++)
     {
     	printf("%d ",i+l*2);
     }
	return 0;
}
