#include<stdio.h>
int main()
{
	int G;
	scanf("%d",&G);
	if(G>=90)
	{
		printf("A");
	}
	else if(80<=G&&G<=89)
	{
		printf("B");
	}
	else if(70<=G&&G<=79)
	{
		printf("C");
	}
	else if(60<=G&&G<=69)
	{
		printf("D");
	}
	else if(G<60)
	{
		printf("E");
	}
	return 0;
}