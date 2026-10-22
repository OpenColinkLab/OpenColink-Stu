#include <stdio.h>
int main()
{
	int n,m=2,i,j,k=1;
	scanf("%d",&n);
	for(i=1;i<n;i++){
		m*=2;	
	}
	m=m-1;
	for(j=2;j<=m-1;j++){
		if(m%j==0){
			k=0;
		}
	}
	
	
	
	
	
	
	
	printf("%d %d",m,k);
	return 0;
	
	
}
