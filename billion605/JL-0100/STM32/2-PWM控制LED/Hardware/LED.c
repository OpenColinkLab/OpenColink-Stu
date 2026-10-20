#include "stm32f10x.h"                  // Device header
int LED_Init(void)
{
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
	
	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_1;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_Init(GPIOA, &GPIO_InitStructure);
	
	GPIO_SetBits(GPIOA, GPIO_Pin_1);
}
void LED_ON(void)
{
	GPIO_ResetBits(GPIOA, GPIO_Pin_1);
}
void LED_OFF(void)
{
	GPIO_SetBits(GPIOA, GPIO_Pin_1);
}
void LED_Turn(void)
{
	if (GPIO_ReadOutputDataBit(GPIOA ,GPIO_Pin_1)==0)
	{
		GPIO_SetBits(GPIOA, GPIO_Pin_1);
	}
	else 
	{
		GPIO_ResetBits(GPIOA, GPIO_Pin_1);
	}
}
