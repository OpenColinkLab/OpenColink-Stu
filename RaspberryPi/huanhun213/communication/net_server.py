"""
网口服务器，收数据，用定帧器切帧
"""

import socket
from binary_framer import LengthPrefixedFramer

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('localhost', 8080))
s.listen(1)
print("等待连接")

conn, addr = s.accept()
print(f"Connected by {addr}")

framer = LengthPrefixedFramer(b"\xAA\x55", 2048, 2)

try:
    while True:
        data = conn.recv(1024)
        if not data:
            break
        frames = framer.feed(data)
        for frame in frames:
            print(f"Received frame: {frame}")

except KeyboardInterrupt:
    pass
finally:
    conn.close()
    s.close()
    print("Connection closed.")
