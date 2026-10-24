#include <stdio.h>
int main()
{
	int m,i,j;
	char c;
	scanf("%d %c",&m,&c);
	for(i=1;i<=m;i++){
		for(j=0;j<=m-i;j++){
			printf(" ");
		}
		for(j=1;j<=i;j++){
			printf("%c",c);
			if(j<i){
				printf(" ");
			}
		}
		printf("\n");
	}
	return 0;
	
	
	
	
}
