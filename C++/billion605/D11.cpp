#include <stdio.h>
int main()
{
	int n,i;
	double x=0,pi=0;
	double y=1.0;
	scanf("%d",&n);
	for(i=1;i<=n;i++){
		x+=y/(2*i-1);
		y=-y;
	
	}
	pi=4*x;
			
	printf("%.6f",pi);
	return 0;
	
	
}
