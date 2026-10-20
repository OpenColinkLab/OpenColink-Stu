"""The desktop applications and their packages read the shared VERSION file."""
import re
import sys
from pathlib import Path


def read_version():
    root = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parents[1]))
    value = (root / "VERSION").read_text(encoding="utf-8").strip()
    if not re.fullmatch(r"\d+\.\d+\.\d+", value):
        raise ValueError("VERSION must be major.minor.patch")
    return value


VERSION = read_version()
