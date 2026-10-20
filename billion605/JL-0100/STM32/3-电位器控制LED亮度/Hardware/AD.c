#include "stm32f10x.h"

void AD_Init(void)
{
	// 1.开启时钟：GPIOA + ADC1，ADC1挂载APB2
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA, ENABLE);
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1, ENABLE);
	
	// ADC预分频：ADC时钟 = 72M /6 =12MHz，不超过14MHz上限
	RCC_ADCCLKConfig(RCC_PCLK2_Div6);
	
	// 2.配置PA1为模拟输入模式
	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AIN;  //AIN：模拟输入，关闭上下拉
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_1;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_Init(GPIOA, &GPIO_InitStructure);
	
	// 3.ADC基础配置
	ADC_InitTypeDef ADC_InitStructure;
	ADC_InitStructure.ADC_Mode = ADC_Mode_Independent; //独立模式，只用ADC1
	ADC_InitStructure.ADC_ScanConvMode = DISABLE;      //单通道，不扫描多通道
	ADC_InitStructure.ADC_ContinuousConvMode = DISABLE;//单次转换模式，读一次采一次
	ADC_InitStructure.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None; //软件触发
	ADC_InitStructure.ADC_DataAlign = ADC_DataAlign_Right; //数据右对齐（常用）
	ADC_InitStructure.ADC_NbrOfChannel = 1;  //通道数量1
	ADC_Init(ADC1, &ADC_InitStructure);
	
	// 4.配置通道1的采样时间
	ADC_RegularChannelConfig(ADC1, ADC_Channel_1, 1, ADC_SampleTime_55Cycles5);
	
	// 5.开启ADC
	ADC_Cmd(ADC1, ENABLE);
	
	// 6.ADC校准（必须！提高采集精度）
	ADC_ResetCalibration(ADC1);
	while(ADC_GetResetCalibrationStatus(ADC1)); //等待复位校准完成
	ADC_StartCalibration(ADC1);
	while(ADC_GetCalibrationStatus(ADC1));      //等待校准完成
}

// 读取ADC通道1的数值，返回0~4095
uint16_t AD_GetValue(void)
{
	ADC_SoftwareStartConvCmd(ADC1, ENABLE);  //软件触发，开始转换
	while(ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC) == RESET); //等待转换结束 EOC
	return ADC_GetConversionValue(ADC1);     //返回采样值
}
