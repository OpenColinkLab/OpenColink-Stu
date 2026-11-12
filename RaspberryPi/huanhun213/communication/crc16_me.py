"""
CRC-16 校验

用途：发送方在帧尾盖一个 2 字节"指纹"，接收方重算一遍比对。
对不上就说明数据在中途被改过（误码、插拔、电气干扰），整帧丢弃。

参数：
    多项值： 0x8005, 反射后 0xA001
    初始值： 0xFFFF
    输入反射: True
    输出异或: 0x0000
"""

Table: list[int] = []
for i in range(256):
    crc = i
    for _ in range(8):
        if crc & 1:
            crc = (crc >> 1) ^ 0xA001
        else:
            crc >>= 1
    Table.append(crc)


def crc16(data: bytes) -> int:
    """查表版：结果与逐位版逐字节等价，工程上用这个。"""
    csc = 0xFFFF
    for byte in data:
        csc = (csc >> 8) ^ Table[(csc ^ byte) & 0xFF]
    return csc


def append_crc(data: bytes) -> bytes:
    """在末尾追加 2 字节大端 CRC, 返回新字节串。"""
    return data + crc16(data).to_bytes(2, "big")


def verify_crc(frame: bytes) -> bool:
    """校验一条带 CRC 尾的帧：前 len-2 字节重算，与最后 2 字节比对。"""
    if len(frame) < 3:
        return False
    expected = int.from_bytes(frame[-2:], "big")
    return crc16(frame[:-2]) == expected

