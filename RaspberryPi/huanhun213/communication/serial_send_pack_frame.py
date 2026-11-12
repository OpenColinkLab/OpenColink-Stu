"""
串口发送，等待响应
"""

import serial
from protocol import pack_frame

PORT = '/dev/ttyUSB0'
ser = serial.Serial(port=PORT, baudrate=9600, timeout=1)


payload = b'Hello, UART!'
frame = pack_frame(msg_type=1, seq=1, payload=payload)

ser.write(frame)
print(f"已发送帧: {frame}")

resp = ser.read(1024)
if resp:
    print(f"接收到响应: {resp}")

ser.close()
