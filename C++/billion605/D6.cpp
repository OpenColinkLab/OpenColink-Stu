#include <stdio.h>
#include <math.h>
int main()
{
	double a,b,c,x,y,e;
	
	scanf("%lf %lf %lf",&a,&b,&c);
	
	e=b*b-4*a*c;
	
	if (e<0){
		
		printf("no");
		
	}else  if (e==0){
		
		double r=sqrt(e);
		
		x=(-b+r)/(2*a);
		
		printf("%.1f",x);
		
		
	}else  if (e>0){
		
			double r=sqrt(e);
			
			x=(-b+r)/(2*a);
			
			y=(-b-r)/(2*a);
			
			printf("%.1f %.1f",x,y);
			
			
	}
	return 0;
	
	
	
}
