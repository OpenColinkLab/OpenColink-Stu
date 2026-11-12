"""CRC-16/MODBUS 校验。

用途：发送方在帧尾盖一个 2 字节"指纹"，接收方重算一遍比对。
对不上就说明数据在中途被改过（误码、插拔、电气干扰），整帧丢弃。

参数（这四项两边必须完全一致，否则永远对不上）：
    多项式  0x8005，反射后用 0xA001
    初值    0xFFFF
    输入反射 是
    输出异或 0x0000
"""

# 256 项查表：把"每字节 8 次位移"的中间结果预先算好，运行时分 8 次变 1 次
_TABLE: list[int] = []
for _i in range(256):
    _crc = _i
    for _ in range(8):
        _crc = (_crc >> 1) ^ 0xA001 if _crc & 1 else _crc >> 1
    _TABLE.append(_crc)


def crc16_modbus(data: bytes) -> int:
    """逐位版：最直白，适合看懂原理，速度慢约 8 倍。"""
    crc = 0xFFFF
    for byte in data:
        crc ^= byte
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ 0xA001
            else:
                crc >>= 1
    return crc


def crc16_modbus_fast(data: bytes) -> int:
    """查表版：结果与逐位版逐字节等价，工程上用这个。"""
    crc = 0xFFFF
    for byte in data:
        crc = (crc >> 8) ^ _TABLE[(crc ^ byte) & 0xFF]
    return crc


def append_crc(data: bytes) -> bytes:
    """在末尾追加 2 字节大端 CRC，返回新字节串。"""
    return data + crc16_modbus_fast(data).to_bytes(2, "big")


def verify_crc(frame: bytes) -> bool:
    """校验一条带 CRC 尾的帧：前 len-2 字节重算，与最后 2 字节比对。"""
    if len(frame) < 3:
        return False
    expected = int.from_bytes(frame[-2:], "big")
    return crc16_modbus_fast(frame[:-2]) == expected
