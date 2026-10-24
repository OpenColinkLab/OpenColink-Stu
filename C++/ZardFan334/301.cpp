#include<stdio.h>
#include<math.h>

int main()
{
	int n,m,i=1,c=1,a=0,b=0,sum1=0,sum2=0;
	scanf("%d %d",&n,&m);
	for(i=1;i<n;i++)
	{
		if(	n%i==0)
		{
			a++;
			sum1=sum1+i;
		}
	
	}
	for(c=1;c<m;c++)
	{
		if(	m%c==0)
		{
			b++;
			sum2=sum2+c;
		}
	
	}
	
	if(sum1==m&&sum2==n)
	{
		printf("yes ");
	}
	else
	{
		printf("no ");
	}
	printf("%d %d",a,b);
	return 0;
}
