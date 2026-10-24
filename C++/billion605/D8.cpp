#include <stdio.h>

int max(int e,int f);
int min(int i,int o);

int main()
{
	int a,b,j,k;
	
	int x,y,z,w;
	
	scanf("%d %d",&a,&b);
	if (a>=4&&b<1000){
		
		x=(a+b)*(a+b);
		y=(a-b)*(a-b);
		z=a*a+b*b;
		w=a*a-b*b;
		j=max(max(x,y),max(z,w));
		k=min(min(x,y),min(z,w));
		
		printf("%d %d",j,k);
		
		
	}
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
int min(int i,int o)
{
	int p;
	if (i>o){
		p=o;
	}
	else {
		p=i;
	}
	return p;
}



