#include "stm32f10x.h"
#include "LED.h"
#include "Key.h"
#include "Delay.h"
#include "PWM.h"

uint8_t state = 0;
uint8_t keyVal;

int main(void)
{
	PWM_Init();
	Key_Init();
	
	while(1)
	{
		keyVal = Key_GetNum();
		if(keyVal == 1)
		{
			state ++;
			if(state > 2)
				state = 0;
		}
		switch(state)
		{
			case 0:
				PWM_SetCompare1(20);  //20%占空比
				break;
			case 1:
				PWM_SetCompare1(50);  //50%占空比
				break;
			case 2:
				PWM_SetCompare1(80);  //80%占空比
				break;
		}
	}
}
