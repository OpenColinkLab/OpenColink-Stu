"""遥测帧打包/拆包。

帧格式：
    MAGIC(2B) + LEN(2B 大端) + TYPE(1B) + SEQ(2B) + PAYLOAD + CRC16(2B 大端)

LEN = 1 + 2 + len(payload)，不含 MAGIC 和 CRC。
CRC 覆盖从 MAGIC 到 PAYLOAD,不含 CRC 自身。
所有多字节字段都是大端。
"""

from csc16 import append_crc, verify_crc

MAGIC = b"\x55\xAA"
HEADER_SIZE = 2 + 2
TYPE_SIZE = 1
SEQ_SIZE = 2
CRC_SIZE = 2

def pack_frame(msg_type: int, seq: int, payload: bytes) -> bytes:
    """打包一条遥测帧，返回字节串。"""
    body = bytes([msg_type]) + seq.to_bytes(SEQ_SIZE, "big") + payload
    frame = MAGIC + len(body).to_bytes(2, "big") + body
    return append_crc(frame)


def unpack_frame(frame: bytes) -> tuple[int, int, bytes]:
    """拆包一条遥测帧，返回 (msg_type, seq, payload)。"""
    if not verify_crc(frame):
        raise ValueError("CRC 校验失败")
    body = frame[HEADER_SIZE:-CRC_SIZE]
    msg_type = body[0]
    seq = int.from_bytes(body[1:1 + SEQ_SIZE], "big")
    payload = body[1 + SEQ_SIZE:]
    return msg_type, seq, payload

