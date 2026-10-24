#include<stdio.h>
#include<math.h>

int main()
{
	int n,num,i=0;
	scanf("%d",&n);
	for(i=1;i>=1;i++)
	{
		if(n%2==0)
		{
			n=n/2;
		}
		else
		{
			n=(3*n)+1;
		}
		if(n==1)
		{
			break;
		}
	}
	printf("%d",i);
	return 0;
}