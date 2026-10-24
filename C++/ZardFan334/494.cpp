#include<stdio.h>
#include<math.h>
int main()
{
	int M,num=0,i=10000,a=0;
	scanf("%d",&M);
	for(i=10000;i<99999;i++)
	{
		if(i%M==0&&i%10==((i/1000)/10)&&((i%100)/10)==((i/1000)%10))
		{
			a++;
		}
		
	}
	printf("%d %d",M,a);
	return 0;
}
