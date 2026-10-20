import time
from smbus2 import SMBus,i2c_msg

bus = SMBus(1)  #打开I2C

#定义地址

AHT20_ADD = 0x38
CMD_STATUS = 0x71
CMD_MEASURE = 0xAC
CMD_INIT = 0xBE

#读状态
def read_status():
    read_data = bus.read_byte_data(AHT20_ADD,CMD_STATUS)
    return read_data

#判断是否在测量
def is_measuring():
    status = read_status()
    jud_me = status & 0x80
    return jud_me

#判断是否校准
def is_corrected():
    status = read_status()
    jud_co = status & 0x08
    return jud_co

#初始化传感器
def init_aht20():
    time.sleep(0.04)
    if is_corrected():
        print("corrected!")
        return
    bus.write_i2c_block_data(AHT20_ADD, CMD_INIT, [0x08, 0x00])
    time.sleep(0.1)

    for _ in range(100):
        if not is_measuring():
            break
        time.sleep(0.01)

    if not is_corrected():
        status = read_status()
        raise RuntimeError(f"AHT20 校准失败, status=0x{status:02x}")

#触发测量
def trig_measure():
    bus.write_i2c_block_data(AHT20_ADD, CMD_MEASURE, [0x33, 0x00])

#读数据
def read_raw_data():
    #data = bus.read_i2c_block_data(AHT20_ADD,0x71,6)
    #return data
    # 触发后直接连续读取 6 字节：status + 5 个数据字节
    for _ in range(100):
        if not is_measuring():
            break
        time.sleep(0.01)

    msg = i2c_msg.read(AHT20_ADD, 6)
    bus.i2c_rdwr(msg)
    return list(msg)

#解析数据
def analy_data(data):
    humi_raw = (data[1] << 12 | data[2] <<4 | data[3] >> 4)
    humi = humi_raw / 0x100000 * 100.0

    tempera_raw = ((data[3] & 0x0F) << 16 | data[4] << 8 | data[5])
    tempera = tempera_raw / 0x100000 *200.0 - 50.0
    return humi , tempera

if __name__ == "__main__":
    init_aht20()
    print("init finish!\n")
    try:
        while True:
            trig_measure()
            
            time.sleep(0.1)
            
            data = read_raw_data()

            Humi,Temp = analy_data(data)
            print(f"温度：{Temp:.1f} | 湿度：{Humi:.1f}")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n已退出")
    finally:
        bus.close()