#include "main.h"      
#include <stdio.h>
#include <string.h>

extern UART_HandleTypeDef huart2;  

uint8_t UART_ReadLine(char *buf, uint8_t size)
{
    static uint8_t idx = 0;    
    uint8_t ch;

 
    if (HAL_UART_Receive(&huart2, &ch, 1, 10) != HAL_OK)
        return 0;             

   
    if (ch == '\r') return 0; 

    if (ch == '\n') {
        buf[idx]='\0';
        idx=0;		
        return 1;	
					
    
    }
    else if (idx < size - 1) {
    	buf[idx]=ch;
    	idx++;
    
    }
    else {
    	idx=0;
    	return 2;
    
     
    }

    return 0;               
}
