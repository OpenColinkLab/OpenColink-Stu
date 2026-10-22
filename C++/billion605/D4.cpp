#include <stdio.h>
int main()
{
	int n;
	int m=0;
	
	scanf("%d",&n);
	if(n==0)
	{
		m=1;
	}
	
	while(n>0)
	{
		n=n/10;
		m++;
	}
	printf("%d",m);
	return 0;
}
