"""Read and summarize NMEA data from a USB GNSS receiver."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, Iterator


@dataclass(frozen=True)
class GpsReading:
    fix_valid: bool = False
    latitude: float | None = None
    longitude: float | None = None
    utc_time: datetime | None = None
    altitude_m: float | None = None
    satellites: int | None = None
    fix_quality: int | None = None
    speed_kmh: float | None = None
    course_deg: float | None = None


def _checksum_ok(line: str) -> bool:
    if not line.startswith("$") or "*" not in line:
        return False
    body, checksum = line[1:].rsplit("*", 1)
    if len(checksum) < 2:
        return False
    try:
        expected = int(checksum[:2], 16)
    except ValueError:
        return False
    actual = 0
    for char in body.encode("ascii", errors="ignore"):
        actual ^= char
    return actual == expected


def _coordinate(value: str, hemisphere: str, degree_digits: int) -> float | None:
    if not value or not hemisphere:
        return None
    raw = float(value)
    degrees = raw // 100
    minutes = raw - degrees * 100
    result = degrees + minutes / 60
    if hemisphere.upper() in {"S", "W"}:
        result = -result
    return result


class NmeaDecoder:
    def __init__(self) -> None:
        self._reading = GpsReading()

    def feed(self, line: str) -> GpsReading | None:
        line = line.strip()
        if not _checksum_ok(line):
            return None

        body = line[1:].rsplit("*", 1)[0]
        fields = body.split(",")
        sentence = fields[0][2:] if len(fields[0]) >= 5 else fields[0]

        if sentence == "RMC":
            self._update_rmc(fields)
        elif sentence == "GGA":
            self._update_gga(fields)
        else:
            return None

        return self._reading

    def _update_rmc(self, fields: list[str]) -> None:
        if len(fields) < 10:
            return
        status = fields[2]
        valid = status == "A"
        latitude = _coordinate(fields[3], fields[4], 2) if valid else None
        longitude = _coordinate(fields[5], fields[6], 3) if valid else None
        speed_kmh = (
            float(fields[7]) * 1.852
            if valid and fields[7]
            else None
        )
        course_deg = float(fields[8]) if valid and fields[8] else None
        utc_time = self._parse_rmc_time(fields[1], fields[9]) if valid else None
        self._reading = GpsReading(
            fix_valid=valid,
            latitude=latitude,
            longitude=longitude,
            utc_time=utc_time,
            altitude_m=self._reading.altitude_m,
            satellites=self._reading.satellites,
            fix_quality=self._reading.fix_quality,
            speed_kmh=speed_kmh,
            course_deg=course_deg,
        )

    def _update_gga(self, fields: list[str]) -> None:
        if len(fields) < 10:
            return
        try:
            quality = int(fields[6]) if fields[6] else 0
            satellites = int(fields[7]) if fields[7] else None
        except ValueError:
            return
        valid = quality > 0
        latitude = _coordinate(fields[2], fields[3], 2) if valid else None
        longitude = _coordinate(fields[4], fields[5], 3) if valid else None
        altitude = float(fields[9]) if valid and fields[9] else None
        self._reading = GpsReading(
            fix_valid=valid,
            latitude=latitude,
            longitude=longitude,
            utc_time=self._reading.utc_time,
            altitude_m=altitude,
            satellites=satellites,
            fix_quality=quality,
            speed_kmh=self._reading.speed_kmh,
            course_deg=self._reading.course_deg,
        )

    @staticmethod
    def _parse_rmc_time(time_value: str, date_value: str) -> datetime | None:
        if not time_value or not date_value:
            return None
        try:
            time_part = datetime.strptime(time_value.split(".")[0], "%H%M%S")
            date_part = datetime.strptime(date_value, "%d%m%y")
            return datetime.combine(date_part.date(), time_part.time())
        except ValueError:
            return None


def iter_readings(lines: Iterable[str | bytes]) -> Iterator[GpsReading]:
    decoder = NmeaDecoder()
    for raw_line in lines:
        if isinstance(raw_line, bytes):
            line = raw_line.decode("ascii", errors="ignore")
        else:
            line = raw_line
        reading = decoder.feed(line)
        if reading is not None:
            yield reading


def format_reading(reading: GpsReading) -> str:
    def value(item, unit: str = "") -> str:
        return "无" if item is None else f"{item}{unit}"

    return "\n".join(
        [
            f"定位状态: {'有效' if reading.fix_valid else '无定位'}",
            f"纬度: {value(reading.latitude if reading.latitude is None else f'{reading.latitude:.6f}')}",
            f"经度: {value(reading.longitude if reading.longitude is None else f'{reading.longitude:.6f}')}",
            f"UTC 时间: {value(reading.utc_time.isoformat() if reading.utc_time else None)}",
            f"海拔: {value(reading.altitude_m, ' m')}",
            f"卫星数: {value(reading.satellites)}",
            f"定位质量: {value(reading.fix_quality)}",
            f"速度: {value(reading.speed_kmh, ' km/h')}",
            f"航向: {value(reading.course_deg, '°')}",
        ]
    )


def reading_as_dict(reading: GpsReading) -> dict[str, str]:
    return {
        "fix_valid": str(reading.fix_valid),
        "latitude": (
            f"{reading.latitude:.6f}" if reading.latitude is not None else ""
        ),
        "longitude": (
            f"{reading.longitude:.6f}" if reading.longitude is not None else ""
        ),
        "utc_time": reading.utc_time.isoformat() if reading.utc_time else "",
        "altitude_m": (
            f"{reading.altitude_m:g}" if reading.altitude_m is not None else ""
        ),
        "satellites": (
            str(reading.satellites) if reading.satellites is not None else ""
        ),
        "fix_quality": (
            str(reading.fix_quality) if reading.fix_quality is not None else ""
        ),
        "speed_kmh": (
            f"{reading.speed_kmh:g}" if reading.speed_kmh is not None else ""
        ),
        "course_deg": (
            f"{reading.course_deg:g}" if reading.course_deg is not None else ""
        ),
    }


CSV_FIELDS = [
    "fix_valid",
    "latitude",
    "longitude",
    "utc_time",
    "altitude_m",
    "satellites",
    "fix_quality",
    "speed_kmh",
    "course_deg",
]


def run_reader(
    stream,
    *,
    once: bool = False,
    show_raw: bool = False,
    csv_path: str | Path | None = None,
    output=print,
) -> GpsReading | None:
    decoder = NmeaDecoder()
    csv_file = None
    writer = None
    last_reading: GpsReading | None = None

    try:
        if csv_path is not None:
            path = Path(csv_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            needs_header = not path.exists() or path.stat().st_size == 0
            csv_file = path.open("a", encoding="utf-8", newline="")
            writer = csv.DictWriter(csv_file, fieldnames=CSV_FIELDS)
            if needs_header:
                writer.writeheader()

        while True:
            raw_line = stream.readline()
            if not raw_line:
                continue
            if isinstance(raw_line, bytes):
                line = raw_line.decode("ascii", errors="ignore").strip()
            else:
                line = str(raw_line).strip()
            if not line:
                continue

            if show_raw:
                output(f"RAW: {line}")

            reading = decoder.feed(line)
            if reading is None:
                continue

            last_reading = reading
            output(format_reading(reading))
            if writer is not None:
                writer.writerow(reading_as_dict(reading))
                if csv_file is not None:
                    csv_file.flush()

            if once and reading.fix_valid and reading.satellites is not None:
                return reading
    finally:
        if csv_file is not None:
            csv_file.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="读取并解析 USB GNSS 模块的 NMEA 数据"
    )
    parser.add_argument(
        "--port",
        default="/dev/ttyUSB0",
        help="USB GNSS 设备节点",
    )
    parser.add_argument(
        "--baud",
        type=int,
        default=9600,
        help="串口波特率，ATGM336H 常用 9600",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=2.0,
        help="每次读取串口的超时时间，单位秒",
    )
    parser.add_argument(
        "--csv",
        type=str,
        default=None,
        help="把解析结果持续追加到 CSV 文件",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="获得第一次有效定位后退出",
    )
    parser.add_argument(
        "--show-raw",
        action="store_true",
        help="同时打印原始 NMEA 语句",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        import serial
    except ImportError:
        print("缺少 pyserial。请先运行：uv add pyserial")
        return 1

    try:
        with serial.Serial(
            args.port,
            args.baud,
            timeout=args.timeout,
        ) as serial_port:
            print(f"正在读取 {args.port}，波特率 {args.baud}")
            print("按 Ctrl+C 停止。")
            run_reader(
                serial_port,
                once=args.once,
                show_raw=args.show_raw,
                csv_path=args.csv,
            )
    except KeyboardInterrupt:
        print("\n已停止读取。")
        return 0
    except serial.SerialException as exc:
        print(f"无法打开串口：{exc}")
        print("请检查 /dev/ttyUSB0、dialout 权限，以及模块是否已通过 USB 连接。")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
