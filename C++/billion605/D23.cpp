#include <stdio.h>
#include <stdlib.h>

int main()
{
	int n,i,j,a[101];
	scanf("%d\n",&n);
	
	for(i=0;i<n-1;i++){
		
		scanf("%d",&a[i]);	
	}

	for (int i = 0; i < n - 1; i++)
	    for (j = 0; j < n - 1 - i; j++)
	        if (a[j] < a[j + 1]) {       
	            int t = a[j];
	            a[j] = a[j + 1];
	            a[j + 1] = t;
	        }
	
	
	
	int b[101],x=0;
	for(i=0;i<n;i++){
		if(a[i]%2==0){
			b[x]=a[i];
			x++;
		}
	}
	
	for(i=0;i<n;i++){
		if(a[i]%2!=0){
			b[x]=a[i];
			x++;
		}
	}
	for(i=0;i<n;i++){
		printf("%d ",b[i]);
	}
	return 0;
	
	
	
}
