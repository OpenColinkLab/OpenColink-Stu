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
 * @LastEditTime: 2022-04-24 21:12:30
 * @LastEditors: Chsier
 * @Description: 
 * @Version: v_
 * @E-mail: Chsier225@gmail.com
 * @FilePath: \Comp_Application\Library\sol_driver\sol_device\src\dev_w25qxx.c
 * @版权声明:如果您继续浏览、使用本代码，将默认您遵守以下声明：
 *         1.不会将此代码以及此代码的衍生代码用作商业用途 
 *         2.在转载和发布此代码和此代码的衍生代码时会注明原出处
 */

/*-------------------------------------------------------*\
						 Include
\*-------------------------------------------------------*/
#include "dev_w25qxx.h"

/*-------------------------------------------------------*\
						 Define
\*-------------------------------------------------------*/

/*-------------------------------------------------------*\
					  Global Ver
\*-------------------------------------------------------*/
_DEV(W25Qxx) w25q_table = {0};
/*-------------------------------------------------------*\
					  Static PV
\*-------------------------------------------------------*/
	//检查缓冲区定义
	static uint8_t check_buf[4096];

/*-------------------------------------------------------*\
				Static fun declaration
\*-------------------------------------------------------*/
//写保护管脚控制
static void __W25Qxx_WP(_DEV(W25Qxx) *dev, _ENUM(W25Qxx_WP) op);
//保持管脚控制
static void __W25Qxx_HD(_DEV(W25Qxx) *dev, _ENUM(W25Qxx_HD) op);
//写字节
static void __W25Qxx_Write_Byte(_DEV(W25Qxx) *dev, uint8_t dat);
//读字节
static uint8_t __W25Qxx_Read_Byte(_DEV(W25Qxx) *dev);


//写使能
static void W25Qxx_Write_Enable(_DEV(W25Qxx) *dev);
//写失能
static void W25Qxx_Write_Disable(_DEV(W25Qxx) *dev);
//忙等待
static void W25Qxx_Wait_Busy(_DEV(W25Qxx) *dev);
//页检查
static W25Qxx_Check_Typedef W25Qxx_Page_Check(_DEV(W25Qxx) *dev, uint32_t check_addr, uint16_t byte_need);
//扇区检查
static W25Qxx_Check_Typedef W25Qxx_Sector_Check(_DEV(W25Qxx) *dev, uint32_t check_addr, uint16_t byte_need);
//任意地址检查
static W25Qxx_Check_Typedef W25Qxx_Addr_Check(_DEV(W25Qxx) *dev, uint32_t check_addr, uint16_t byte_need);
//8位无检验写SPI FLASH
static void W25Qxx_Write_Only_U8(_DEV(W25Qxx) * dev, const uint8_t *p_buffer, uint32_t write_addr, uint16_t dat_num);
//8位页写
static void W25Qxx_Write_Page(_DEV(W25Qxx) * dev, const uint8_t *p_buffer, uint32_t write_addr, uint16_t dat_num);
//字节读
static void W25Qxx_Read_U8(_DEV(W25Qxx) *dev, uint8_t *p_buffer, uint32_t read_addr, uint16_t dat_num);
//字节写
static void W25Qxx_Write_U8(_DEV(W25Qxx) *dev, const uint8_t * p_buffer, uint32_t write_addr, uint16_t dat_num);

#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
				Static function body
\*-------------------------------------------------------*/
/*
* 名    称:W25QXX_WP
* 功    能:W25Q写保护管脚操作函数
*/
static void __W25Qxx_WP(_DEV(W25Qxx) *dev, _ENUM(W25Qxx_WP) op)
{
	dev->W25Qxx_Write_Pin(dev->wp_port,dev->wp_pin,(GPIO_Pin_State)!op);
}

/*
* 名    称:W25QXX_HD
* 功    能:W25Q保持管脚操作函数
*/
static void __W25Qxx_HD(_DEV(W25Qxx) *dev, _ENUM(W25Qxx_HD) op)
{
	dev->W25Qxx_Write_Pin(dev->hold_port,dev->hold_pin,(GPIO_Pin_State)!op);
}

/*
* 名    称:W25QXX_Write_Byte
* 功    能:模拟SPI写W25Qx一个字节
* 入口参数:(W25QXX_Dev_Typedef * dev,使用的W25QXX设备)
*		  (uint8_t dat,数据)
* 额外说明:CLK 引脚的上升沿捕获
*/
static void __W25Qxx_Write_Byte(_DEV(W25Qxx) *dev, uint8_t dat)
{
	uint8_t dat_[1];
	
		dat_[0] = dat;
	__SOL_SPI_Write(dev->spi_used,dat_,1);
#ifdef DBG_MOD
    //USER_DBG("__W25Qxx_Write_Byte %06x CMP!",dat);
#endif
}

/*
* 名    称:W25QXX_Read_Byte
* 功    能:模拟SPI读W25Qx一个字节
* 入口参数:(_DEV(W25Qxx) * dev,使用的W25QXX设备)
* 出口参数:(uint8_t receive, 接收到字节)
* 额外说明:SCLK下降沿输出
*/
static uint8_t __W25Qxx_Read_Byte(_DEV(W25Qxx) *dev)
{
	uint8_t receive[1];
	
	__SOL_SPI_Read(dev->spi_used,receive,1);
	
#ifdef DBG_MOD
//   USER_DBG("__W25Qxx_Read_Byte CMP!");
#endif	
	return receive[0]; //返回收到的数据
}

/*
* 名    称:W25QXX_Write_Enable
* 功    能:写使能
* 入口参数:(_DEV(W25Qxx) dev,使用的W25QXX设备)
*/
static void W25Qxx_Write_Enable(_DEV(W25Qxx) *dev)
{
		__SOL_SPI_CS(dev->spi_used,CS_EN);
			__W25Qxx_Write_Byte(dev, W25Qxx_WRITE_EN); //发送写使能
		__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	
#ifdef DBG_MOD
//    USER_DBG("W25Qxx_Write_Enable CMP!");
#endif
}

/*
* 名    称:W25Qxx_Write_Disable
* 功    能:写失能
* 入口参数:(_DEV(W25Qxx) dev,使用的W25QXX设备)
*/
static void W25Qxx_Write_Disable(_DEV(W25Qxx) *dev)
{
		__SOL_SPI_CS(dev->spi_used,CS_EN);
			__W25Qxx_Write_Byte(dev, W25Qxx_WRITE_DISEN); //发送写失能
		__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	
#ifdef DBG_MOD
//    USER_DBG("W25Qxx_Write_Disable CMP!");
#endif
}

/*
* 名    称:W25Qxx_Wait_Busy
* 功    能:等待空闲
* 入口参数:(_DEV(W25Qxx) w25qxx_dev,使用的W25Qxx设备)
*/
static void W25Qxx_Wait_Busy(_DEV(W25Qxx) *dev)
{
	while ((SOL_W25Qxx_Read_SR(dev, 1) & 0x01));
	
#ifdef DBG_MOD
//    printf("Wait Busy...\n");// 等待BUSY位清空
//	printf("Wait CMP!...\n");
#endif
}

/*
* 名    称:W25Qxx_Page_Check
* 功    能:页写入前检测
* 入口参数: (_DEV(W25Qxx) * dev,使用的W25Qxx设备)
			(uint32_t check_addr,24位检查地址)
			(uint16_t byte_need, 需要检查的连续字节数,最大256)
* 出口参数:	(W25Qxx_Check_Typedef, 检查结果)
* 额外说明：此函数使用到了page_check_buff[256]缓冲区
*/
static W25Qxx_Check_Typedef W25Qxx_Page_Check(_DEV(W25Qxx) *dev, uint32_t check_addr, uint16_t byte_need)
{
	uint32_t page_addr = check_addr / 256;
	uint16_t index = 0;
	
	W25Qxx_Read_U8(dev, check_buf, page_addr * 256, byte_need);
	for (index = 0; index < byte_need; index++)
	{
		if (check_buf[index] != 0xFF){
			#ifdef DBG_MOD
//				USER_DBG("W25Qxx_Page_Check FAL!\n");
			#endif			
			return (CHECK_WARNING);
		}	
	}

#ifdef DBG_MOD
//    USER_DBG("W25Qxx_Page_Check CMP!\n");
#endif
	return (CHECK_OK);
}

/*
* 名    称:W25Qxx_Sector_Check
* 功    能:扇区写入前检测
* 入口参数: (_DEV(W25Qxx) * dev,使用的W25Qxx设备)
			(uint32_t check_addr,24位某扇区中的某地址)
			(uint16_t byte_need, 需要检查的连续字节数,最大4096)
* 出口参数:	(W25Qxx_Check_Typedef, 检查结果)
* 额外说明:此函数使用到了sec_check_buff[4096]缓冲区
*/
static W25Qxx_Check_Typedef W25Qxx_Sector_Check(_DEV(W25Qxx) *dev, uint32_t check_addr, uint16_t byte_need)
{
	uint32_t sec_addr = check_addr / 4096;
	uint16_t index = 0;

	W25Qxx_Read_U8(dev, check_buf, sec_addr * 4096, byte_need);
	for (index = 0; index < byte_need; index++)
	{
		if (check_buf[index] != 0xFF){
			#ifdef DBG_MOD
//				USER_DBG("W25Qxx_Sector_Check FAL!\n");
			#endif
			return (CHECK_WARNING);
		}	
	}

#ifdef DBG_MOD
//    USER_DBG("W25Qxx_Sector_Check CMP!\n");
#endif
	return (CHECK_OK);
}

/*
* 名    称:W25Qxx_Addr_Check
* 功    能:地址写入前检测
* 入口参数: (_DEV(W25Qxx) * dev,使用的W25Qxx设备)
			(uint32_t write_addr,某扇区中的某地址)
			(uint16_t byte_need, 需要检查的连续字节数,最大4096)
* 出口参数:	(W25Qxx_Check_Typedef, 检查结果)
* 额外说明:此函数使用到了check_buff[4096]缓冲区
*/
static W25Qxx_Check_Typedef W25Qxx_Addr_Check(_DEV(W25Qxx) *dev, uint32_t check_addr, uint16_t byte_need)
{
	uint16_t index = 0;

	W25Qxx_Read_U8(dev, check_buf, check_addr, byte_need);
	for (index = 0; index < byte_need; index++)
	{
		if (check_buf[index] != 0xFF){
			#ifdef DBG_MOD
//				USER_DBG("W25Qxx_Addr_Check FAL!\n");
			#endif
			return (CHECK_WARNING);
		}	
	}

#ifdef DBG_MOD
//   USER_DBG("W25Qxx_Addr_Check CMP!\n");
#endif
	return (CHECK_OK);
}

/*
* 名    称:W25Qxx_Write_Only_U8
* 功    能:无检验写SPI FLASH
* 入口参数:(_DEV(W25Qxx) * dev,使用的W25Qxx设备)
		  (uint8_t* p_buffer,数据存储区)
		  (uint32_t write_addr,开始写入的地址(24bit))
		  (uint16_t dat_num,要写入的字节数(最大65535))
* 额外说明:无检验写SPI FLASH,在指定地址开始写入指定长度的数据,
		  但是要确保地址不越界.必须确保所写的地址范围内的数据
		  全部为0XFF,否则在非0XFF处写入的数据将失效!
*/
static void W25Qxx_Write_Only_U8(_DEV(W25Qxx) *dev, const uint8_t *p_buffer, uint32_t write_addr, uint16_t dat_num)
{
	uint16_t index;

	W25Qxx_Write_Enable(dev);
	W25Qxx_Wait_Busy(dev); //等待写入结束
	__SOL_SPI_CS(dev->spi_used,CS_EN);	
		__W25Qxx_Write_Byte(dev, W25Qxx_PROGRAM_PAGE); //发送写页命令
		if (dev->w25qxx_type == W25Q256)				   //如果是W25Q256的发送32bit地址
		{
			__W25Qxx_Write_Byte(dev, (uint8_t)((write_addr) >> 24));
		}
		__W25Qxx_Write_Byte(dev, (uint8_t)((write_addr) >> 16)); //发送24bit地址
		__W25Qxx_Write_Byte(dev, (uint8_t)((write_addr) >> 8));
		__W25Qxx_Write_Byte(dev, (uint8_t)write_addr);
		for (index = 0; index < dat_num; index++)
			__W25Qxx_Write_Byte(dev, p_buffer[index]); //循环写数
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	W25Qxx_Wait_Busy(dev); //等待写入结束
#ifdef DBG_MOD
//    USER_DBG("W25Qxx_Write_Only_U8 CMP!\n");
#endif
}

/*
* 名    称:W25Qxx_Write_Page
* 功    能:在指定地址开始写入最大256字节的数据
* 入口参数:(_DEV(W25Qxx) * dev,使用的W25Qxx设备)
			(uint8_t* p_buffer,数据存储区)
			(uint32_t write_addr,开始写入的地址(24bit))
			(uint16_t dat_num,要写入的字节数(最大256))
* 额外说明:dat_num不应该超过该页的剩余字节数
*/
static void W25Qxx_Write_Page(_DEV(W25Qxx) *dev, const uint8_t *p_buffer, uint32_t write_addr, uint16_t dat_num)
{
	uint16_t page_remain;

	page_remain = 256 - (write_addr % 256); //单页剩余的字节数
	if (dat_num <= page_remain)
		page_remain = dat_num; //不大于256个字节
	while (dat_num)
	{
		W25Qxx_Write_Only_U8(dev, p_buffer, write_addr, page_remain);
		if (dat_num == page_remain)
			break;
		else
		{
			p_buffer += page_remain;   //待写数据指针后移
			write_addr += page_remain; //写地址指针后移
			dat_num -= page_remain;   //减去已经写入了的字节数

			if (dat_num > 256)
				page_remain = 256; //一次可以写入256个字节
			else
				page_remain = dat_num; //不够256个字节
		}
	}
#ifdef DBG_MOD
//    USER_DBG("W25Qxx_Write_Page CMP!\n");
#endif
}

/*
* 名    称:W25Qxx_Read_U8
* 功    能:读取SPI FLASH,在指定地址开始读取指定长度的数据
* 入口参数: (_DEV(W25Qxx) dev,使用的W25Qxx设备)
			(uint8_t* p_buffer,数据存储区)
			(uint32_t read_addr,开始读取的地址(24bit))
			(uint16_t dat_num,要读取的字节数(最大65535))
*/
static void W25Qxx_Read_U8(_DEV(W25Qxx) *dev, uint8_t *p_buffer, uint32_t read_addr, uint16_t dat_num)
{
	uint16_t index;

	__SOL_SPI_CS(dev->spi_used,CS_EN);
		__W25Qxx_Write_Byte(dev, W25Qxx_READ_DATA); //发送读取命令
		if (dev->w25qxx_type == W25Q256)				//如果是W25Q256,发送32bit地址
		{
			__W25Qxx_Write_Byte(dev, (uint8_t)((read_addr) >> 24));
		}
		__W25Qxx_Write_Byte(dev, (uint8_t)((read_addr) >> 16)); //发送24bit地址
		__W25Qxx_Write_Byte(dev, (uint8_t)((read_addr) >> 8));
		__W25Qxx_Write_Byte(dev, (uint8_t)read_addr);
		for (index = 0; index < dat_num; index++)
		{
			p_buffer[index] = __W25Qxx_Read_Byte(dev); //循环读数
			#ifdef DBG_MOD
				//USER_DBG("Read_U8: (addr:%04x)p_buffer[%d] = %d\n",(read_addr + index),index,p_buffer[index]);
			#endif		
		}
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
		
#ifdef DBG_MOD
//    USER_DBG("W25Qxx_Read_U8 CMP!\n");
#endif
}

/*
* 名    称:W25Qxx_Write_U8
* 功    能:在指定地址开始写入指定长度的数据
* 入口参数: (_DEV(W25Qxx) * dev,使用的W25Qxx设备)
			(uint8_t* p_buffer,数据存储区)
			(uint32_t write_addr,开始写入的地址(24bit))
			(uint16_t dat_num,要读取的字节数(最大65535))
* 额外说明:该函数带擦除操作!!
*/
static void W25Qxx_Write_U8(_DEV(W25Qxx) *dev, const uint8_t * p_buffer, uint32_t write_addr, uint16_t dat_num)
{
	uint16_t sec_off;	 //地址偏移
	uint16_t sec_remain; //扇区空间剩余
	uint16_t index = 0;

	sec_off = write_addr % 4096;  //在扇区内的偏移
	sec_remain = 4096 - sec_off;  //扇区剩余空间大小
	#ifdef DBG_MOD
//		USER_DBG("扇区剩余空间大小 %d !\n",sec_remain);
	#endif
	
	while(dat_num)
	{
			
		if(sec_remain > dat_num)
		   sec_remain = dat_num;

		if(W25Qxx_Addr_Check(dev, write_addr, sec_remain) == CHECK_WARNING){
			SOL_W25Qxx_Erase_Sector(dev,write_addr);  	//擦除所在扇区
			#ifdef DBG_MOD
				//USER_DBG("W25Qxx_Write_U8函数擦除了扇区 %d !\n",(write_addr / 4096));
			#endif			
		}
		W25Qxx_Write_Page(dev, p_buffer, write_addr, sec_remain);
		p_buffer += sec_remain;		//数组指针后移
		dat_num -= sec_remain;		//减去已写数据个数
		write_addr += sec_remain;	//写地址后移
		sec_remain = 4096;			//下扇区默认最大字节容量
	}

#ifdef DBG_MOD
//	USER_DBG("W25Qxx_Write_U8 CMP!\n");
#endif
}


#ifdef USER_FUN
#endif
/*-------------------------------------------------------*\
			Related referential function body
\*-------------------------------------------------------*/
/*
* 名    称:W25Qxx_Init
* 功    能:初始化W25Q的SPI设备
* 入口参数:(_DEV(W25Qxx) dev, W25Q设备)
* 额外说明:写保护(WP)和稳定(HD)只有在有管脚定义时才取
		   消注释,否则会引发硬件错误;
		   这里的函数指针赋值已经由SPI驱动完成,除非想
		   要更换SPI驱动,否则不要更改;
*/
void SOL_W25Qxx_Init(_DEV(W25Qxx) *dev/*,
				W25Qxx_Delay_Fun_P delay, 
				W25Qxx_Write_Pin_Fun_P write_pin, 
				W25Qxx_Pin_Read_Fun_P read_pin*/)
{
	/*函数指针赋值*/
//	dev->W25Qxx_Delay = delay;
//	dev->W25Qxx_Write_Pin = write_pin;
//	dev->W25Qxx_Pin_Read = read_pin;
	/* 取消写保护 */
//	__W25Qxx_WP(dev, W25Qxx_WP_DISEN);
	/* 取消稳定 */
//	__W25Qxx_HD(dev, W25Qxx_NHOLD);	//已由硬件完成
	/* 取消片选 */
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	//默认电平,SPI模式等工作已由SPI_Init完成
	
	
#ifdef DBG_MOD
//    USER_DBG("W25Qxx_Init CMP!");
#endif
}

/*
* 名    称:SOL_W25Qxx_Read_ID
* 功    能:读取芯片ID,返回值为芯片ID
* 入口参数:(_DEV(W25Qxx) * dev,使用的W25Qxx设备)
* 出口参数:(uint16_t id, 状态寄存器内容和芯片ID)
* 逻辑说明:发送命令完成后状态寄存器内容和设备ID将不断重复直到片选结束
* 额外说明:  0XEF13,表示芯片型号为W25Q80  
			0XEF14,表示芯片型号为W25Q16    
			0XEF15,表示芯片型号为W25Q32  
			0XEF16,表示芯片型号为W25Q64 
			0XEF17,表示芯片型号为W25Q128 	  
			0XEF18,表示芯片型号为W25Q256
*/
uint16_t SOL_W25Qxx_Read_ID(_DEV(W25Qxx) *dev)
{
	uint16_t id = 0;

	__SOL_SPI_CS(dev->spi_used,CS_EN);
		__W25Qxx_Write_Byte(dev, W25Qxx_MFTR_OR_DEV_ID); //发送读取ID命令
		__W25Qxx_Write_Byte(dev, W25Qxx_DUMMY);			 //伪字
		__W25Qxx_Write_Byte(dev, W25Qxx_DUMMY);			 //伪字
		__W25Qxx_Write_Byte(dev, 0x00);				 //规定发送0x00
		id |= __W25Qxx_Read_Byte(dev) << 8;
		id |= __W25Qxx_Read_Byte(dev);
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	
#ifdef DBG_MOD
//    USER_DBG("SOL_W25Qxx_Read_ID CMP!");
#endif
	return id;
}

/*
* 名    称:SOL_W25Qxx_Read_SR
* 功    能:读状态寄存器值
* 入口参数:(_DEV(W25Qxx) dev, W25Q设备)
* 出口参数:(uint8_t status_reg_val, 状态寄存器值)
* 额外说明:具体含义参见Support文件夹内状态寄存器说明.docx
		SR1 默认值为 0x02
		SR2 默认值为 0x02
		SR3 默认值为 0x60
*/
uint8_t SOL_W25Qxx_Read_SR(_DEV(W25Qxx) *dev, uint8_t reg_num)
{
	uint8_t status_reg_val = 0;
	uint8_t cmd = 0;

	switch (reg_num)
	{
	case 1:
		cmd = W25Qxx_READ_SR1; //读状态寄存器1指令
		break;
	case 2:
		cmd = W25Qxx_READ_SR2; //读状态寄存器2指令
		break;
	case 3:
		cmd = W25Qxx_READ_SR3; //读状态寄存器3指令
		break;
	default:
		cmd = W25Qxx_READ_SR1;
		break;
	}

	__SOL_SPI_CS(dev->spi_used,CS_EN);
		__W25Qxx_Write_Byte(dev, cmd);			//发送读取状态寄存器命令
		status_reg_val = __W25Qxx_Read_Byte(dev); //读取一个字节
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	
#ifdef DBG_MOD
//    USER_DBG("REG_%d : status_reg_val = %d\n",(int)reg_num,(int)status_reg_val);
#endif
	return status_reg_val;
}



/*
* 名    称:SOL_W25Qxx_Write_SR
* 功    能:写状态寄存器值
* 入口参数:(_DEV(W25Qxx) dev, W25Q设备)(uint8_t dat,写入数据)
*/
void SOL_W25Qxx_Write_SR(_DEV(W25Qxx) *dev, uint8_t dat, uint8_t reg_num)
{
	uint8_t cmd = 0;
	switch (reg_num)
	{
	case 1:
		cmd = W25Qxx_WRITE_SR1; //写状态寄存器1指令
		break;
	case 2:
		cmd = W25Qxx_WRITE_SR2; //写状态寄存器2指令
		break;
	case 3:
		cmd = W25Qxx_WRITE_SR3; //写状态寄存器3指令
		break;
	default:
		cmd = W25Qxx_WRITE_SR1;
		break;
	}

	W25Qxx_Write_Enable(dev);	 //发送完整的写使能才行
	__SOL_SPI_CS(dev->spi_used,CS_EN);
		__W25Qxx_Write_Byte(dev, cmd); //发送写状态寄存器命令
		__W25Qxx_Write_Byte(dev, dat); //写入寄存器值
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	
#ifdef DBG_MOD
//    USER_DBG("SOL_W25Qxx_Write_SR CMP!\n Wrote %d\n",dat);
#endif
}

/*
* 名    称:SOL_W25Qxx_Read
* 功    能:任意位读位宽度读
* 入口参数: (_DEV(W25Qxx) dev,使用的W25Qxx设备)
			(uint8_t* p_buffer,数据存储区)
			(uint32_t read_addr,开始读取的地址(24bit))
			(uint16_t dat_num,要读取的字节数(最大65535))
* 额外说明：p_buffer传入参数时请使用强制类型转换为uint8_t * !
*/
void SOL_W25Qxx_Read(_DEV(W25Qxx) * dev, 
				uint8_t *p_buffer, 
				uint32_t read_addr, 
				uint8_t byte_num ,
				uint16_t dat_num){

	dat_num *= byte_num;

	W25Qxx_Read_U8(dev,p_buffer,read_addr,dat_num);
	
#ifdef DBG_MOD
//	USER_DBG("SOL_W25Qxx_Read %d byte CMP!\n",byte_num);
#endif
}

/*
* 名    称:SOL_W25Qxx_Write
* 功    能:在指定地址开始写入指定长度、宽度的数据
* 入口参数: (_DEV(W25Qxx) * dev,使用的W25Qxx设备)
			(uint8_t* p_buffer,数据存储区)
			(uint32_t write_addr,开始写入的地址(24bit))
			(uint8_t byte_num, 数据字节宽度)
			(uint16_t dat_num,要读取的数据个数(最大65535))
* 额外说明:该函数带擦除操作!!
		   p_buffer传入参数时请使用强制类型转换为uint8_t * !
*/
void SOL_W25Qxx_Write(_DEV(W25Qxx) * dev, 
				  const uint8_t *p_buffer, 
				  uint32_t write_addr, 
				  uint8_t byte_num ,
				  uint16_t dat_num)
{
					  
	dat_num *= byte_num;
	
	W25Qxx_Write_U8(dev,p_buffer,write_addr,dat_num);
					  
#ifdef DBG_MOD
//	USER_DBG("SOL_W25Qxx_Write %d byte CMP!\n",byte_num);
#endif	
}

/*
* 名    称:SOL_W25Qxx_Erase_Chip
* 功    能:擦除整个芯片
* 入口参数:(_DEV(W25Qxx) dev,使用的W25Qxx设备)
* 额外说明:等待时间超长,至少3秒
*/
void SOL_W25Qxx_Erase_Chip(_DEV(W25Qxx) *dev)
{
	W25Qxx_Write_Enable(dev); //SET WEL
	W25Qxx_Wait_Busy(dev);
	
	__SOL_SPI_CS(dev->spi_used,CS_EN);
		__W25Qxx_Write_Byte(dev, W25Qxx_ERASE_CHIP); //发送片擦除命令
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	W25Qxx_Wait_Busy(dev); //等待芯片擦除结束
#ifdef DBG_MOD
//    USER_DBG("Chip Erase CMP!\n");
#endif
}

/*
* 名    称:SOL_W25Qxx_Erase_Sector
* 功    能:擦除一个扇区
* 入口参数: (_DEV(W25Qxx) dev,使用的W25Qxx设备)
			(uint32_t addr,24位扇区地址)
* 额外说明:擦除一个扇区的最少时间:150ms
*/
void SOL_W25Qxx_Erase_Sector(_DEV(W25Qxx) * dev, uint32_t addr)
{
	addr /= 4096;	
	addr *= 4096;	//转换为扇区首地址绝对地址
	W25Qxx_Write_Enable(dev);
	W25Qxx_Wait_Busy(dev);
	
	__SOL_SPI_CS(dev->spi_used,CS_EN);
		__W25Qxx_Write_Byte(dev, W25Qxx_ERASE_SECTOR); //发送扇区擦除指令
		if (dev->w25qxx_type == W25Q256)				   //如果是W25Q256的话地址为4字节的，要发送最高8位
		{
			__W25Qxx_Write_Byte(dev, (uint8_t)((addr) >> 24));
		}
		__W25Qxx_Write_Byte(dev, (uint8_t)((addr) >> 16)); //发送24bit地址
		__W25Qxx_Write_Byte(dev, (uint8_t)((addr) >> 8));
		__W25Qxx_Write_Byte(dev, (uint8_t)addr);
	__SOL_SPI_CS(dev->spi_used,CS_DISEN);
	W25Qxx_Wait_Busy(dev); //等待擦除完成
		
#ifdef DBG_MOD
		//USER_DBG("W25Qxx_Erase_Sector函数擦除了扇区 (addr:%04x)%d !\n",addr,(addr / 4096));
#endif
}

/*
* fun_name :SOL_W25Qxx_Write_Only
* describe :无校验连写
* input	   :(_DEV(W25Qxx) * dev, 设备)
			(const uint8_t *p_buffer, 待发送数据)
			(uint32_t write_addr, 写地址)
			(uint8_t byte_num, 数据宽度(单位字节))
			(uint16_t dat_num, 数据个数)
* other_dis:调用页写无校验,使用前先片擦除(耗时5s)
*/
void SOL_W25Qxx_Write_Only(_DEV(W25Qxx) * dev, 
					   const uint8_t *p_buffer, 
					   uint32_t write_addr, 
					   uint8_t byte_num, 
					   uint16_t dat_num)
{
	dat_num *= byte_num;
	W25Qxx_Write_Page(dev, p_buffer, write_addr, dat_num);
}
