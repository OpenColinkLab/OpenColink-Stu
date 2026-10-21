#include<stdio.h>
int main()
{
	int a,b,c,m,s;
	printf("输入一个三位数："); 
	scanf("%d",&m);
	if(100<=m && m<=999)
	{a=m/100;
	b=m%100/10;
	c=m%10;
	s=a+b+c;
	printf("三位数的各位和为%d",s);
	} 
	else
	printf("输入的不为三位数");
	return 0; 
}
