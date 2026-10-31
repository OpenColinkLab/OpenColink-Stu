#include "stm32f10x.h"

//延时函数
void delay(unsigned int ms)
{
    while (ms--)
    {
        SysTick->LOAD = SystemCoreClock / 1000U - 1U;
        SysTick->VAL = 0;
        SysTick->CTRL = SysTick_CTRL_CLKSOURCE_Msk |
                        SysTick_CTRL_ENABLE_Msk;

        while ((SysTick->CTRL & SysTick_CTRL_COUNTFLAG_Msk) == 0U)
        {
        }

        SysTick->CTRL = 0;	
    }
}

int main(void){
	//初始化
				RCC -> APB2ENR |= RCC_APB2ENR_IOPCEN;
	
				GPIOC -> CRH &= ~(0xFU << 20);
				GPIOC -> CRH |= (0x2U << 20);
	//点灯
				while(1){
					    GPIOC -> BSRR = (1U << 29);
					    delay(500);
					
					    GPIOC -> BSRR = (1U << 13);
					    delay(500);
				}

}