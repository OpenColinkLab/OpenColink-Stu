"""
GNSS 串口读取:读NMEA + 校验 + 解析
"""

import serial
from nmea import verify_checksum, parse_gga
from communication.framer import DelimiterFramer

PORT = "/dev/ttyUSB0"
BAND = 9600

try:
    ser = serial.Serial(PORT, BAND, timeout=1)
except ser.SerialException as e:
    print(f"串口{PORT}打开失败，{e}")
    return

framer = DelimiterFramer(b"\r\n")

print("监听GNSS")

try:
    while True:
        chunk = ser.read(ser.in_waiting or 1)

        for line in framer.feed(chunk):
            if not verify_checksum(line):
                continue
            info = parse_gga(line)
            if info:
                print(info)
except KeyboardInterupt:
    ser.close()
    print("已退出")