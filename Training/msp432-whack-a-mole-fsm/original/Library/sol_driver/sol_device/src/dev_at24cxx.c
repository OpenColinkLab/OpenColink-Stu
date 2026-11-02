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
 * @LastEditTime: 2022-04-24 21:11:30
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_at24cxx.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */


/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "dev_at24cxx.h"

/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
_DEV(AT24Cxx) at24_used = {0};
/*-------------------------------------------------------*\
			     Extern From Other
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/
//8位页写
static void AT24Cxx_Write_Page_U8(_DEV(AT24Cxx) * dev, 
								    const uint8_t * tx_dat, 
								    uint16_t mem_addr);

//8位连写
static void AT24Cxx_Write_U8(_DEV(AT24Cxx) * dev,
							 const uint8_t * tx_dat, 
							 uint16_t mem_addr, 
							 uint16_t dat_num);
//8位连读
static void AT24Cxx_Read_U8(_DEV(AT24Cxx) * dev, 
							uint8_t * rx_dat, 
							uint16_t mem_addr, 
							uint16_t dat_num);


/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/
/*
* fun_name :AT24Cxx_Write_Page_U8
* describe :8位页写
* input	   :(_DEV(AT24Cxx) * dev,设备)
			(const uint8_t * tx_dat,发送数组)
			(uint16_t mem_addr, (绝对)内存地址)
* other_dis:不带开始停止
*/

static void AT24Cxx_Write_Page_U8(_DEV(AT24Cxx) * dev,
								  const uint8_t * tx_dat,
								  uint16_t mem_addr)
{
	switch(dev->type){
		case AT24C02 : mem_addr /= 8; mem_addr *= 8;break;
		case AT24C04 : mem_addr /= 16; mem_addr *= 16;break;
		case AT24C08 : mem_addr /= 16; mem_addr *= 16;break;
		case AT24C16 : mem_addr /= 16; mem_addr *= 16;break;
		case AT24C32 : mem_addr /= 32; mem_addr *= 32;break;
		case AT24C64 : mem_addr /= 32; mem_addr *= 32;break;
		case AT24C128 : mem_addr /= 64; mem_addr *= 64;break;
		case AT24C256 : mem_addr /= 64; mem_addr *= 64;break;
	}
	__SOL_I2C_Start(dev->i2c_used);
		//写器件地址
		__SOL_I2C_Write_Byte(dev->i2c_used,dev->addr);
		__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		//写内存地址
		if(dev->type > AT24C02){
			__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)((mem_addr & 0xff00) >> 8));
				__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		}
		__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)(mem_addr & 0x00ff));
			__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		
		switch(dev->type){
			case AT24C02 : __SOL_I2C_Write(dev->i2c_used,tx_dat,8);
			case AT24C04 : __SOL_I2C_Write(dev->i2c_used,tx_dat,16);
			case AT24C08 : __SOL_I2C_Write(dev->i2c_used,tx_dat,16);
			case AT24C16 : __SOL_I2C_Write(dev->i2c_used,tx_dat,16);
			case AT24C32 : __SOL_I2C_Write(dev->i2c_used,tx_dat,32);
			case AT24C64 : __SOL_I2C_Write(dev->i2c_used,tx_dat,32);
			case AT24C128 : __SOL_I2C_Write(dev->i2c_used,tx_dat,64);
			case AT24C256 : __SOL_I2C_Write(dev->i2c_used,tx_dat,64);
		}
	__SOL_I2C_Stop(dev->i2c_used);
}

/*
* fun_name :AT24Cxx_Write_U8
* describe :8位连写
* input	   :(_DEV(AT24Cxx) * dev, AT24设备)
			(uint8_t * tx_dat, 发送数组)
			(uint16_t mem_addr, 内存地址)
			(uint16_t dat_num, 数据数量)
*/
static void AT24Cxx_Write_U8(_DEV(AT24Cxx) * dev,
							 const uint8_t * tx_dat, 
							 uint16_t mem_addr, 
							 uint16_t dat_num)
{
	uint16_t index = 0;
	uint16_t page_remain;
	
	switch(dev->type){
		case AT24C02 :page_remain = 8 - (mem_addr % 8);break;
		case AT24C04 :page_remain = 16 - (mem_addr % 16);break;
		case AT24C08 :page_remain = 16 - (mem_addr % 16);break;
		case AT24C16 :page_remain = 16 - (mem_addr % 16);break;
		case AT24C32 :page_remain = 32 - (mem_addr % 32);break;
		case AT24C64 :page_remain = 32 - (mem_addr % 32);break;
		case AT24C128 :page_remain = 64 - (mem_addr % 64);break;
		case AT24C256 :page_remain = 64 - (mem_addr % 64);break;
	}
	while(dat_num){
		if(page_remain >= dat_num)
			page_remain = dat_num;
		
		__SOL_I2C_Start(dev->i2c_used);					
			//写器件地址
			__SOL_I2C_Write_Byte(dev->i2c_used,dev->addr);
				__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
			//写内存地址
			if(dev->type > AT24C02){
				__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)((mem_addr & 0xff00) >> 8));	//注意符号优先级的问题!
					__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
			}
			__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)(mem_addr & 0x00ff));
				__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
			//写本页剩余
			__SOL_I2C_Write(dev->i2c_used,tx_dat,page_remain);
		__SOL_I2C_Stop(dev->i2c_used);
			
		dat_num -= page_remain;
		tx_dat += page_remain;
		switch(dev->type){
			case AT24C02 : mem_addr += page_remain; page_remain = 8; break;
			case AT24C04 : mem_addr += page_remain; page_remain = 16; break;
			case AT24C08 : mem_addr += page_remain; page_remain = 16; break;
			case AT24C16 : mem_addr += page_remain; page_remain = 16; break;
			case AT24C32 : mem_addr += page_remain; page_remain = 32; break;
			case AT24C64 : mem_addr += page_remain; page_remain = 32; break;
			case AT24C128 : mem_addr += page_remain; page_remain = 64; break;
			case AT24C256 : mem_addr += page_remain; page_remain = 64; break;
		}
	dev->AT24Cxx_Delay(12000 * 10);//10000us(IN 168MHz)
	#ifdef DEBUG_MOD
		USER_DBG("mem_addr[%x]",mem_addr);
		USER_DBG("注意此处延时要足够长!");
	#endif
	}

}

/*
* fun_name :AT24Cxx_Read_U8
* describe :8位连读
* input	   :(_DEV(AT24Cxx) * dev, AT24设备)
			(uint16_t mem_addr, 起始地址)
			(uint16_t dat_num, 数据数量)
* change   :(uint8_t * rx_dat, 接收数组)
*/
static void AT24Cxx_Read_U8(_DEV(AT24Cxx) * dev, 
							uint8_t * rx_dat, 
							uint16_t mem_addr, 
							uint16_t dat_num)
{
	uint16_t index = 0;
	
	__SOL_I2C_Start(dev->i2c_used);
		//写器件地址
		__SOL_I2C_Write_Byte(dev->i2c_used,dev->addr);
		__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		//写内存地址
		if(dev->type > AT24C02){
			__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)((mem_addr & 0xff00) >> 8));
				__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		}
		__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)(mem_addr & 0x00ff));
			__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		
		__SOL_I2C_Start(dev->i2c_used);
		__SOL_I2C_Write_Byte(dev->i2c_used,(dev->addr)+1);
			__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		
		__SOL_I2C_Read(dev->i2c_used,rx_dat,dat_num);
	
	__SOL_I2C_Stop(dev->i2c_used);
}



/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/*
* fun_name :AT24Cxx_Init
* describe :初始化
*/
void SOL_AT24Cxx_Init(_DEV(AT24Cxx) * dev,
			AT24Cxx_Write_Pin_Fun_P write_pin,
			AT24Cxx_Read_Pin_Fun_P read_pin,
			AT24Cxx_Delay_Fun_P delay)
{
	dev -> AT24Cxx_Write_Pin = write_pin;
	dev -> AT24Cxx_Read_Pin = read_pin;
	dev -> AT24Cxx_Delay = delay;
}

/*
* fun_name :AT24Cxx_Write_Byte
* describe :特定地址单写
* input	   :(_DEV(AT24Cxx) * dev, 设备)
			( uint16_t mem_add, 写入数据地址)
			(uint8_t dat, 待写数据)
*/
void SOL_AT24Cxx_Write_Byte(_DEV(AT24Cxx) * dev , uint16_t mem_addr , uint8_t dat){
    __SOL_I2C_Start(dev->i2c_used);
		__SOL_I2C_Write_Byte(dev->i2c_used,dev->addr);
			__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		if(dev->type > AT24C02){
			__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)((mem_addr & 0xff00) >> 8));
				__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		}
		__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)(mem_addr & 0x00ff));
			__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		__SOL_I2C_Write_Byte(dev->i2c_used,dat);
			__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
    __SOL_I2C_Stop(dev->i2c_used);
}

/*
* fun_name :AT24Cxx_Read_Byte
* describe :指定字节读
* input	   :(_DEV(AT24Cxx) * dev ,设备)
			(uint16_t mem_add, 字节地址)
* output   :(uint8_t receive,数据)
*/
uint8_t SOL_AT24Cxx_Read_Byte(_DEV(AT24Cxx) * dev , uint16_t mem_addr){
    uint8_t receive;
	
    __SOL_I2C_Start(dev->i2c_used);
		__SOL_I2C_Write_Byte(dev->i2c_used,dev->addr);
			__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		if(dev->type > AT24C02){
			__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)((mem_addr & 0xff00) >> 8));
				__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
		}
		__SOL_I2C_Write_Byte(dev->i2c_used,(uint8_t)(mem_addr & 0x00ff));
			__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
	
		__SOL_I2C_Start(dev->i2c_used);
			__SOL_I2C_Write_Byte(dev->i2c_used,(dev->addr)+1);
				__SOL_I2C_Wait_Ack(dev->i2c_used,ACK_WAIT_TIME);
			receive = __SOL_I2C_Read_Byte(dev->i2c_used);
				__SOL_I2C_NAck(dev->i2c_used);
    __SOL_I2C_Stop(dev->i2c_used);
#ifdef DEBUG_MOD
    USER_DBG("%d",mem_addr);
#endif	
    return (receive);
}

/*
* fun_name :AT24Cxx_Write
* describe :连写
* input	   :(_DEV(AT24Cxx) * dev, 设备)
			(const uint8_t * tx_dat, 发送数据)
			(uint16_t mem_addr, 内存地址)
			(uint8_t byte_num, 数据字节数(宽度))
			(uint16_t dat_num, 数据个数)
*/
void SOL_AT24Cxx_Write(_DEV(AT24Cxx) * dev, 
				   const uint8_t * tx_dat, 
				   uint16_t mem_addr,
				   uint8_t byte_num, 
				   uint16_t dat_num)
{
	dat_num *= byte_num;
	AT24Cxx_Write_U8(dev,tx_dat,mem_addr,dat_num);
}
/*
* fun_name :AT24Cxx_Read
* describe :连读
* input	   :(_DEV(AT24Cxx) * dev, 设备)
			(uint16_t mem_addr, 开始地址)
			(uint8_t byte_num, 数据字节数)
			(uint16_t dat_num, 数据数)
* change   :(uint8_t * rx_dat, 传出数组)
*/

void SOL_AT24Cxx_Read(_DEV(AT24Cxx) * dev, 
				  uint8_t * rx_dat, 
				  uint16_t mem_addr, 
				  uint8_t byte_num, 
				  uint16_t dat_num)
{
	dat_num *= byte_num;
	AT24Cxx_Read_U8(dev,rx_dat,mem_addr,dat_num);
}

/*-------------------------------------------------------*\
						If DBG Mod
\*-------------------------------------------------------*/
/*The DBG code maybe used*/

#ifdef DBG_MOD
	
#endif
