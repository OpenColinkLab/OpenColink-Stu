#include<stdio.h>

int main()
{
	int num;
	int sum = 0;
	while(scanf("%d",&num)==1)
	{
		if(num==0)
		{
			break;
		}
		if(num%2==1)
		{
			sum=sum+num;
		}
		
	}
	printf("%d",sum);
	return 0;
}