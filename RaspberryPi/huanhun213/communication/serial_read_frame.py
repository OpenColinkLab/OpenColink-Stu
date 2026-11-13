"""
串口读取，读字节，用定帧器切割
"""
import serial
from framer import DelimiterFramer

PORT = '/dev/ttyUSB0'
ser = serial.Serial(port=PORT, baudrate=9600, timeout=1)
framer = DelimiterFramer(delimiter=b'\r\n')

print(f"串口 {PORT} 已打开，波特率 {ser.baudrate}")

try:
    while True:
        data = ser.read(1024)
        if data:
            frames = framer.feed(data)
            for frame in frames:
                print(f"接收到帧: {frame}")
except KeyboardInterrupt:
    print("程序已停止")
finally:
    ser.close()

