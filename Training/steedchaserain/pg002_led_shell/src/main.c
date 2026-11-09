#include "cmd.h"
#include "platform.h"
#include "uart.h"
#include "led.h"

int ch;			//收到的字符 
char line[64];	//装字符
int n = 0;		//当前已经装了几个 


int main()
{
	/*初始化*/
	init_platform();
    if (Uart_Init() != 0) {
        while (1) {
        }
    }

    Uart_PutString("\r\nled> ");
    
    
	while (1)
	{
		/*收一行字符*/
		ch=Uart_GetChar();
		if(ch<0)
		{
			continue;
		}
		
		if (ch == '\r') 
		{
   			line[n] = '\0';
   			Uart_PutString("\r\n");
   			Cmd_Execute(line);
   			Uart_PutString("\r\nled> ");
   			n = 0;
   		}
   		
   		else if (ch == '\b' || ch == 127) 
   		{
    		if (n > 0) 
			{
        		n = n - 1;
        		Uart_PutString("\b \b");
    		}
		}	
		
   		else
   		{
		    /*回显*/
		    if(ch>=0)
		    {
				Uart_PutChar((char)ch);
		    }
		    line[n++]=(char)ch;
	    }
	} 
}










	
