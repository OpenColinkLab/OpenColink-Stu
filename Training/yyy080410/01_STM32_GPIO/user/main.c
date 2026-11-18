#include "stm32f10x.h"                  // Device header
void Delay_ms(uint32_t ms)    
{
	uint32_t i;
	while (ms--)                   
	{
		for (i = 0; i < 7200; i++); 
	}
}

int main(void)
{
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC,ENABLE);
	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Mode=GPIO_Mode_Out_PP;
	GPIO_InitStructure.GPIO_Pin=GPIO_Pin_13;
	GPIO_InitStructure.GPIO_Speed=GPIO_Speed_50MHz;
	GPIO_Init(GPIOC,&GPIO_InitStructure);
	GPIO_SetBits(GPIOC,GPIO_Pin_13);
//	GPIO_ResetBits(GPIOC,GPIO_Pin_13);
	while (1)
	{
		GPIO_ResetBits(GPIOC,GPIO_Pin_13);
		Delay_ms(100);
		GPIO_SetBits(GPIOC,GPIO_Pin_13);
		Delay_ms(100);
	}
}
