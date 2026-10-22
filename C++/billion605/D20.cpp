#include <stdio.h>
int main()
{
	int a,b,c;
	int x,y,z;
	
	scanf("%d %d %d",&a,&b,&c);
	if(a>=b&&b>=c){
		x=a;
		y=b;
		z=c;
	}
	if(a>=c&&c>=b){
		x=a;
		y=c;
		z=b;
	}
	if(b>=a&&a>=c){
		x=b;
		y=a;
		z=c;
		
	}
	if(b>=c&&c>=a){
		x=b;
		y=c;
		z=a;
	}
	if(c>=a&&a>=b){
		x=c;
		y=a;
		z=b;
	}
	if(c>=b&&b>=a){
		x=c;
		y=b;
		z=a;
	}
	if(y+z>x){
		if(x*x==y*y+z*z){
			printf("%d",(y*z)/2);
			
		}else  {
			printf("其他三角形");
		}
	}else  {
		printf("不是三角形");
	}
	return 0;
	
	
	
}
