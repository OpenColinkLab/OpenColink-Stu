#include <stdio.h>
int main()
{
	int n,m;
	scanf("%d %d\n",&n,&m);
	
	int x,y=1;
	scanf("%d",&x);
	while(x>=0&&x!=n){
	
		
		if(x>n){
			printf("Too big\n");
			y++;
			int a;
			scanf("%d",&a);
			x=a;
			
			
		}else {
			printf("Too small\n");
			y++;
			int a;
			scanf("%d",&a);
			x=a;
		}
		if(y>m){
			break;
		}					
	}
	if(x<0){
		printf("Game Over!");
	}else  if(y==1){
		
		printf("Bingo!");
	}else  if(y<=3){
		printf("Lucky You!");
	}else  if(y>=3&&y<=m){
		printf("Good Guess!");
	}else  if(y>m){
		printf("Game Over!");
		
	}
	return 0;
	
	
}
