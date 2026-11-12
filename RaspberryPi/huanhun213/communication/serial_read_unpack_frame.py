"""
串口读取，读字节，解包
"""
import serial
from protocol import unpack_frame

PORT = '/dev/ttyUSB0'
ser = serial.Serial(port=PORT, baudrate=9600, timeout=1)

print(f"串口 {PORT} 已打开，波特率 {ser.baudrate}")

try:
    while True:
        data = ser.read(1024)
        if data:
            frame = unpack_frame(data)
            if frame:
                print(f"接收到帧: {frame}")

except KeyboardInterrupt:
    print("程序已停止")
finally:
    ser.close()
