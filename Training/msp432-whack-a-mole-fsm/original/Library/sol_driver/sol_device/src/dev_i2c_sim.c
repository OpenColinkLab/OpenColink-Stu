/***
 *                                                                                    
 *     @@@@@@@ @@@  @@@  @@@@@@ @@@ @@@@@@@@ @@@@@@@     @@@@@@@@ @@@@@@  @@@@@@@     
 *    !@@      @@!  @@@ !@@     @@! @@!      @@!  @@@    @@!     @@!  @@@ @@!  @@@    
 *    !@!      @!@!@!@!  !@@!!  !!@ @!!!:!   @!@!!@!     @!!!:!  @!@  !@! @!@!!@!     
 *    :!!      !!:  !!!     !:! !!: !!:      !!: :!!     !!:     !!:  !!! !!: :!!     
 *     :: :: :  :   : : ::.: :  :   : :: ::   :   : :     :       : :. :   :   : :    
 *                                                                                    
 *                                                                                    
 *     @@@@@@  @@@@@@  @@@          @@@@@@@  @@@@@@@  @@@ @@@  @@@ @@@@@@@@ @@@@@@@   
 *    !@@     @@!  @@@ @@!          @@!  @@@ @@!  @@@ @@! @@!  @@@ @@!      @@!  @@@  
 *     !@@!!  @!@  !@! @!! @!@!@!@! @!@  !@! @!@!!@!  !!@ @!@  !@! @!!!:!   @!@!!@!   
 *        !:! !!:  !!! !!:          !!:  !!! !!: :!!  !!:  !: .:!  !!:      !!: :!!   
 *    ::.: :   : :. :  : ::.: :     :: :  :   :   : : :      ::    : :: ::   :   : :  
 *
 * @Author: Chsier
 * @Date: 2022-04-23 12:38:08
 * @LastEditTime: 2022-04-24 21:11:58
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_i2c_sim.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */


/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "dev_i2c_sim.h"
#ifdef MSP432_SDK_PLATFORM
	#include "driverlib.h"
#endif
/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/
/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
_DEV(I2C_Sim) i2c_for_at24 = {0};
/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/
/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/
//SCL控制
static void __SCL_Write(_DEV(I2C_Sim) * dev, GPIO_Pin_State op);
//SDA控制
static void __SDA_Write(_DEV(I2C_Sim) * dev, GPIO_Pin_State op);
//SCL读
static GPIO_Pin_State __SCL_Read(_DEV(I2C_Sim) * dev);
//SDA读
static GPIO_Pin_State __SDA_Read(_DEV(I2C_Sim) * dev);

/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/
/*
* 名    称:__SCL_Write
* 功    能:写SCL管脚
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
		   (GPIO_Pin_State op, 管脚状态)
*/
static void __SCL_Write(_DEV(I2C_Sim) * dev, GPIO_Pin_State op){
    dev->I2C_Write_Pin(dev->scl_port,dev->scl_pin,op);
}

/*
* 名    称:__SDA_Write
* 功    能:写SDA管脚
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
		   (GPIO_Pin_State op, 管脚状态)
*/
static void __SDA_Write(_DEV(I2C_Sim) * dev, GPIO_Pin_State op){
	dev->I2C_Write_Pin(dev->sda_port,dev->sda_pin,op);
}

/*
* 名    称:__SCL_Read
* 功    能:读SCL管脚
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
* 出口参数:(GPIO_Pin_State state, 管脚状态)
*/
static GPIO_Pin_State __SCL_Read(_DEV(I2C_Sim) * dev){
	GPIO_Pin_State state;
	
	state = dev->I2C_Read_Pin(dev->scl_port,dev->scl_pin);
	return (state);
}

/*
* 名    称:__SDA_Read
* 功    能:读SDA管脚
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
* 出口参数:(GPIO_Pin_State state, 管脚状态)
*/
static GPIO_Pin_State __SDA_Read(_DEV(I2C_Sim) * dev){
	GPIO_Pin_State state;
	
	state = dev->I2C_Read_Pin(dev->sda_port,dev->sda_pin);
	return (state);
}

/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/*
* 名    称:I2C_Init
* 功    能:I2C初始化
* 入口参数:(_DEV(I2C_Sim) * dev,I2C设备)
		   (I2C_Write_Pin_Fun_P i2c_pin_write,管脚写函数指针)
		   (I2C_Read_Pin_Fun_P i2c_pin_read,管脚读函数指针)
		   (I2C_Delay_Fun_P i2c_delay,延时函数指针)
* 额外说明:初始化完毕后默认SDA、SCL拉高(不控制)
*/
void SOL_I2C_Init(_DEV(I2C_Sim) * dev,
			  I2C_Write_Pin_Fun_P i2c_pin_write,
			  I2C_Read_Pin_Fun_P i2c_pin_read,
			  I2C_Delay_Fun_P i2c_delay)
{
	//指针赋值
	dev->I2C_Write_Pin = i2c_pin_write;
	dev->I2C_Read_Pin = i2c_pin_read;
	dev->I2C_Delay = i2c_delay;
	//强制拉高使总线空闲
	__SCL_Write(dev,GPIO_PIN_SET);
	__SDA_Write(dev,GPIO_PIN_SET);
	
}//SDA 1 , SCL 1(默认状态)

/*
* 名    称:__SOL_I2C_Start
* 功    能:I2C开始
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
*/
void __SOL_I2C_Start(_DEV(I2C_Sim) * dev){
//1(SCL) 1(SDA)
	__SCL_Write(dev,GPIO_PIN_SET);
	__SDA_Write(dev,GPIO_PIN_SET);
	dev->I2C_Delay(dev->speed);
	__SDA_Write(dev,GPIO_PIN_RESET);
	dev->I2C_Delay(dev->speed);
	__SCL_Write(dev,GPIO_PIN_RESET);
	dev->I2C_Delay(dev->speed);
}//0 0
/*
* 名    称:__SOL_I2C_Stop
* 功    能:I2C结束
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
*/
void __SOL_I2C_Stop(_DEV(I2C_Sim) * dev){
//0 0
	__SDA_Write(dev,GPIO_PIN_RESET);
	__SCL_Write(dev,GPIO_PIN_SET);
	dev->I2C_Delay(dev->speed);
	__SDA_Write(dev,GPIO_PIN_SET);
	dev->I2C_Delay(dev->speed);
	
}//1 1 

/*
* 名    称:I2C_Ack
* 功    能:发送应答
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
*/
void __SOL_I2C_Ack(_DEV(I2C_Sim) * dev){
//0 x	

	__SDA_Write(dev,GPIO_PIN_RESET);
	dev->I2C_Delay(dev->speed/10);
	__SCL_Write(dev,GPIO_PIN_SET);
	dev->I2C_Delay(dev->speed);
	__SCL_Write(dev,GPIO_PIN_RESET);
	dev->I2C_Delay(dev->speed/10);
	__SDA_Write(dev,GPIO_PIN_SET);
	dev->I2C_Delay(dev->speed);
}//0 1

/*
* 名    称:I2C_NAck
* 功    能:发送不再应答
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
*/
void __SOL_I2C_NAck(_DEV(I2C_Sim) * dev){
//0 x
	
	__SDA_Write(dev,GPIO_PIN_SET);
	dev->I2C_Delay(dev->speed/10);
	__SCL_Write(dev,GPIO_PIN_SET);
	dev->I2C_Delay(dev->speed);
	__SCL_Write(dev,GPIO_PIN_RESET);
	dev->I2C_Delay(dev->speed/10);
	__SDA_Write(dev,GPIO_PIN_RESET);
	dev->I2C_Delay(dev->speed);	
}//0 0

/*
* 名    称:__SOL_I2C_Wait_Ack
* 功    能:I2C应答等待(就是接收应答)
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
		   (uint32_t timeout,等待延时次数)
* 出口参数:(I2C_ACK_Status_Typedef, 应答结果)
* 额外说明:需要配合应答时钟脉冲
*/
_ENUM(I2C_Ack_Status) __SOL_I2C_Wait_Ack(_DEV(I2C_Sim) * dev, uint32_t timeout){
//0 x
	__SDA_Write(dev,GPIO_PIN_SET);	 //以非应答默认开始
	dev->I2C_Delay(dev->speed);		 //这里延时很重要
	while(__SDA_Read(dev))           //读取数据引脚
	{
		if(!timeout){
			__SOL_I2C_Stop(dev);
		#ifdef INF_MOD
    		USER_INF("I2C_ACK_RECEIVE_FAIL");
		#endif
			return I2C_ACK_RECEIVE_FAIL;
		}
		timeout --;
		dev->I2C_Delay(dev->speed);
	}
	__SCL_Write(dev,GPIO_PIN_SET);
	dev->I2C_Delay(dev->speed);
	__SCL_Write(dev,GPIO_PIN_RESET);

	#ifdef INF_MOD
    	USER_INF("I2C_ACK_RECEIVE_SUCESS");
	#endif

	return I2C_ACK_RECEIVE_SUCESS;
}//0 x

/*
* 名    称:__SOL_I2C_Write_Byte
* 功    能:I2C写一个字节
* 入口参数:(_DEV(I2C_Sim) * dev,I2C设备)
		   (uint8_t dat, 数据)
*/
void __SOL_I2C_Write_Byte(_DEV(I2C_Sim) * dev, uint8_t dat)
{
//0 x
	uint8_t tem = dat;
	uint8_t index = 0;
	
	for(index = 0; index < 8; index ++){
		if(tem & 0x80)
			__SDA_Write(dev,GPIO_PIN_SET);
		else
			__SDA_Write(dev,GPIO_PIN_RESET);
		
		dev->I2C_Delay(dev->speed);
		__SCL_Write(dev,GPIO_PIN_SET);
		dev->I2C_Delay(dev->speed);
		__SCL_Write(dev,GPIO_PIN_RESET);
		tem <<= 1;
	}
	dev->I2C_Delay(dev->speed);
}//SCL 0, SDA x

/*
* 名    称:__SOL_I2C_Read_Byte
* 功    能:I2C读一个字节
* 入口参数:(_DEV(I2C_Sim) * dev,I2C设备)
* 出口参数:(uint8_t receive, 数据)
*/
uint8_t __SOL_I2C_Read_Byte(_DEV(I2C_Sim) * dev)
{
//0 x
	uint8_t receive = 0;
	uint8_t index = 0;	
	__SDA_Write(dev,GPIO_PIN_SET);	//释放数据线
	
	for(index = 0; index < 8; index ++){
		receive <<= 1;	//进行一次无用移位
		dev->I2C_Delay(dev->speed);
		__SCL_Write(dev,GPIO_PIN_SET);
		if(__SDA_Read(dev))
			receive |= 0x01;
		dev->I2C_Delay(dev->speed);
		__SCL_Write(dev,GPIO_PIN_RESET);	
	}

	return (receive);
}//SCL 0, SDA x

/*
* 名    称:__SOL_I2C_Write
* 功    能:连写带应答检测
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
		   (uint8_t * tx_dat, 待写数组)
		   (uint16_t dat_num, 数据长度)
* 额外说明:无起始和终止
*/
void __SOL_I2C_Write(_DEV(I2C_Sim) * dev, 
				 const uint8_t * tx_dat, 
				 uint16_t dat_num)
{
	uint16_t index = 0;
	
	for(index = 0; index < dat_num; index ++){
		__SOL_I2C_Write_Byte(dev,tx_dat[index]);
		__SOL_I2C_Wait_Ack(dev,ACK_WAIT_TIME);
	}
}//SCL 1, SDA x

/*
* 名    称:__SOL_I2C_Read
* 功    能:I2C连读带应答&末位非应答发送
* 入口参数:(_DEV(I2C_Sim) * dev, I2C设备)
		   (uint8_t * rx_dat, 接收数组)
		   (uint16_t dat_num,数据长度)
* 额外说明:无起始和终止
*/
void __SOL_I2C_Read(_DEV(I2C_Sim) * dev, 
				   uint8_t * rx_dat, 
				   uint16_t dat_num)
{
	uint16_t index = 0;
	
	for(index = 0; index < dat_num; index ++){
		rx_dat[index] = __SOL_I2C_Read_Byte(dev);
		if(index < (dat_num - 1))
			__SOL_I2C_Ack(dev);
		else
			__SOL_I2C_NAck(dev);
	}
}//SCL 1,SDA 1(默认状态)
