#include<stdio.h>
int main()
{
	int n,i,sum=0,num=0;
	float l;
    scanf("%d",&n);
    int a[n];
    for(i=0;i<n;i++)
     {
     	scanf("%d",&a[i]);
     	sum+=a[i];
     }
    l=(float)sum/n;
    for(i=0;i<n;i++)
     {
     	if(a[i]>l)
     	 num+=1;
     }
    printf("%d",num);
	return 0;
} 
