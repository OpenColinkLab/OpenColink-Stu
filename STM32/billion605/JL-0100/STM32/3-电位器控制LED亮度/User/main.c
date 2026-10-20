#include "stm32f10x.h"
#include "AD.h"
#include "PWM.h"

uint16_t adc_val, ccr;
int main(void)
{
	AD_Init();
	PWM_Init();
	while(1)
	{
		adc_val = AD_GetValue(); //读取电位器0~4095
		ccr = adc_val * 100 / 4095; //把0~4095映射成0~100（PWM的CCR范围）
		PWM_SetCompare1(ccr);
	}
}
