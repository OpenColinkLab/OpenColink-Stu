#include<stdio.h>
int main()
{
	int a,b,p;
	char op;
	scanf("%d%c%d",&a,&op,&b);
	switch(op)
	{
		case '+':{
			p=a+b;
			printf("%d%c%d=%d",a,op,b,p);
			break;
		}
		case '-':{
			p=a-b;
			printf("%d%c%d=%d",a,op,b,p);
			break;
		}
		case '*':{
			p=a*b;
			printf("%d%c%d=%d",a,op,b,p);
			break;
		}
		case '/':{
			if(b==0)
			{
			}
			else{
				p=a/b;
			printf("%d%c%d=%d",a,op,b,p);	
			}
			
			break;}
		
		case '%':{
			if(b==0)
			{
			}
			else{
					p=a%b;
			printf("%d%c%d=%d",a,op,b,p);
			}
		
			break;
		}
		default:
			break;
	}
	
	return 0;
}