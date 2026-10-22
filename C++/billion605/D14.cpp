#include <stdio.h>
int main()
{
	int n,m,x;
	scanf("%d",&n);
	m=n%2;
	if(m==0){
		x=n;
	}else {
		x=3*n+1;
	}
	printf("%d",x);
	return 0;
}
