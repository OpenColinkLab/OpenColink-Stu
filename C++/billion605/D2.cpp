#include <stdio.h>

int main()
{
	int h,m;
	
	double t=0,T=0;
	
	scanf("%d%d", &h,&m);
	
	t=h+m/60.0;
	
	T=(4*t*t)/(t+2)-20;
	
	printf("%.2f",T);
	
	return 0;
	
	
	
}
