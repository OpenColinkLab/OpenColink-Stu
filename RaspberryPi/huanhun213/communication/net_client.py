"""
网口客户端：连接接收端，循环发送数据，断线自动重连
"""

import socket
import time
from protocol import pack_frame

HOST = "127.0.0.1"
PORT = 8080

def main():
    seq = 0
    while True:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.connect((HOST, PORT))
                print(f"Connected to {HOST}:{PORT}")
                while True:
                    payload = b"Hello, World!"
                    frame = pack_frame(msg_type=1, seq=seq, payload=payload)
                    s.sendall(frame)
                    print(f"Sent frame with seq={seq}")
                    seq += 1
                    time.sleep(1)
        except Exception as e:
            print(f"Connection error: {e}. Retrying in 3 seconds...")
            time.sleep(3)

if __name__ == "__main__":
    main()
    