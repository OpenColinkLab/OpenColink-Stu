#include<stdio.h>
#include<math.h>
int main()
{
	int n,m,i=2,flag=1;
	scanf("%d",&n);
	
	m=(1 << n) - 1;
		for(i=2;i<m;i++)
		{
			if(m%i==0)
			{
				flag=0;
				break;
			}
		}
	printf("%d %d",m,flag);
	return 0;
}