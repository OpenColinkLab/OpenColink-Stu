#include <stdio.h>
int max(int e,int f);

int main()
{
	int a,b,c,d;
	
	scanf("%d %d %d",&a,&b,&c);
	
	d=max(max(a,b),c);
	
	printf("%d",d);
	
	return 0;
}

int max(int e,int f)
{
	int q;
	
	if (e>f){
		q=e;
	}
	else {
		q=f;
	}
	return q;
}
