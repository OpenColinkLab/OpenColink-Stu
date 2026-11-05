#include<stdio.h>
int main()
{
	int n,sum=0,max=0,min=0,i;
	scanf("%d",&n);
	int a[n];
	for(i=0;i<n;i++)
	 {
	 	scanf("%d",&a[i]);
	 	sum+=a[i];
	 	if(a[max]<a[i])
	 	 max=i;
	 	if(a[min]>a[i])
	 	 min=i;
	 }
	printf("%d %d %d %d %d",sum,a[max],max+1,a[min],min+1);
	return 0;
} 
