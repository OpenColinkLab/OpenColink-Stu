#include "stm32f10x.h"                  // Device header
#include "LED.h"
#include "Delay.h"
#include "Key.h"

uint8_t state = 0;
uint8_t KeyNum;


int main(void)
{
	
	LED_Init();
	Key_Init();
	
	while (1)
	{
		KeyNum = Key_GetNum();
		if (KeyNum==1)
		{
			state++;
			if (state>2)
			{
				state = 0;
			}
		}
		
		switch(state)
		{
			case 0:
				LED_OFF();
				break;
			
			case 1:
				LED_ON();
				break;
			
			case 2:
				LED_Turn();
				Delay_ms(100);
				break;
		}
			
	}
}
