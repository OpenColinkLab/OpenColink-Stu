"""
GNSS NMEA 语句解析 + 校验
"""

def verify_checksum(line: bytes) -> bool:
    """
    校验 NMEA 语句的校验和
    :param line: NMEA 语句
    :return: 校验结果
    """
    text = line.decode("ascii", errors="replace")
    if not line.startswith(b"$") or b"*" not in line:
        return False
    body, checksum = text[1:].split("*", 1)
    cal = 0
    for c in body:
        cal ^= ord(c)
    return cal == int(checksum, 16)

    
def dm2deg(value:str, direction:str) -> float:
    """
    将度分格式转换为十进制度
    :param value: 度分格式的字符串
    :param direction: 方向字符 ('N', 'S', 'E', 'W')
    :return: 十进制度的浮点数
    """
    if not value or not direction:
        return 0.0
    if direction in ['N', 'S']:
        degrees = int(value[:2])
        minutes = float(value[2:])
    elif direction in ['E', 'W']:
        degrees = int(value[:3])
        minutes = float(value[3:])
    
    reslut = degrees + minutes / 60.0
    if direction in ['S', 'W']:
        reslut = -reslut
    return reslut


def parse_gga(line: bytes) -> dict:
    """
    解析 GGA 语句
    :param line: GGA 语句
    :return: 解析结果字典
    """
    text = line.decode("ascii", errors="replace")

    body = text[1:].split("*")[0]
    fields = body.split(",")
    
    if fields[0] not in ("GPGGA", "GPGLL", "GNGGA", "GNGLL"):
        return None
    
    lat = dm2deg(fields[2], fields[3])
    lon = dm2deg(fields[4], fields[5])

    return {
        "type": fields[0],
        "time": fields[1],
        "lat": lat,
        "lon": lon,
        "fix": fields[6],
        "sats": fields[7],
        "alt": fields[9],
    }
    