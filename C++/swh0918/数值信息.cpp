#include<stdio.h>
int main()
{
	int n,i,k,m=0;
	scanf("%d %d",&n,&k);
	int a[n];
	for(i=0;i<n;i++)
	 {
	 	scanf("%d",&a[i]);
	 	if(a[i]==k)
	 	 printf("%d ",i);
	 	 m+=1;
	 }
	if(m==0)
	 printf("-1");
	return 0;
} 
