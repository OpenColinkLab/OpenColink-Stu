#include <stdio.h>
#include <math.h>

int main()
{
	double n,m,y;
	int x;
	scanf ("%lf %d",&n,&x);
	
	if (n<=3)
	{
		m=10;
	}
	else if (n>3 && n<=10)
	{
		m=10+(n-3)*2;
		
	}
	else if (n>10)
	{
		m=10+7*2+(n-10)*3;
	}
	y=(x/5)*2+m;
	
	y=(int)(y+0.5);
	
	
	printf("%d",(int)y);
	
	
	return 0;
	
}
