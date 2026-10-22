#include "stm32f10x.h"
#include "AD.h"
#include "Serial.h"
#include "Delay.h"


uint16_t Light_ADC;  //存放光敏采样值

int main(void)
{
	AD_Init();    //初始化AD，读取PA2光敏
	Serial_Init();  //初始化串口1，PA9 TX PA10 RX
	
	while(1)
	{
		Light_ADC = AD_GetValue();  //读取光敏ADC数值 0~4095
		printf("ADC = %d \r\n", Light_ADC); //串口打印到电脑
		Delay_ms(500);  //500ms刷新一次，不用刷新太快
	}
}
