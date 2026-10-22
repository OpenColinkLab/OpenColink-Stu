#include <stdio.h>
int main()
{
	int n,i,k,j=0;
	scanf("%d %d",&n,&k);
	int a[1001];
	for(i=0;i<n;i++){
		scanf("%d",&a[i]);
		if(k==a[i]){
			printf("%d ",i);
			j++;
		}
	}
	if(j==0){
		printf("%d",j-1);
		
	}
	return 0;
	
	
	
}
