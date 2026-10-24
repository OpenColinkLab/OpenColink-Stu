#include <stdio.h>
int main()
{
	int a,b,c;
	scanf("%d %d",&a,&b);
	if(b==1||b==3||b==5||b==7||b==8||b==10||b==12){
		c=31;
		printf("%d",c);
	}
	
	if(b==4||b==6||b==9||b==11){
		c=30;
		printf("%d",c);
	}
	if(b==2){
		if((a%4==0&&a%100!=0)||(a%400==0)){
			c=29;
			printf("%d",c);
		}else {
			
			c=28;
			printf("%d",c);
		}
	}
	
	return 0;
	
}
