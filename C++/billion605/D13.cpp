#include <stdio.h>
int main()
{
	int a,b,c;
	char x;
	scanf("%d %c %d",&a,&x,&b);
	switch(x){
		
		
	case '+':
		c=a+b;
		break;
	case '-':
		c=a-b;
		break;
	case '*':
		c=a*b;
		break;
	case '%':
		c=a%b;
			break;
	case '/':
		c=a/b;
		break;
		
	}
	
	
	
	
	
	printf("%d%c%d=%d",a,x,b,c);
	return 0;
	
}
