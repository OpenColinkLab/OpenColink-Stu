#include <stdio.h>
int main()
{
	int n,i,x=1;
	scanf("%d",&n);
	int a[1001];
	for(i=0;i<n;i++){
		scanf("%d",&a[i]);
		
	}
	for(i=1;i<n;i++){
		if(a[i]!=a[i-1]){
			x++;
		}
	}
	printf("%d",x);
	return 0;
	
}
