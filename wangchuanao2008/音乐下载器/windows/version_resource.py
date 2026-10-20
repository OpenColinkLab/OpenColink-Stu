"""Generate the Windows EXE resource from the shared VERSION."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from musicdown.version import VERSION

parts = tuple(map(int, VERSION.split("."))) + (0,)
resource = f"""VSVersionInfo(
 ffi=FixedFileInfo(filevers={parts!r}, prodvers={parts!r}, mask=0x3f,
 flags=0x0, OS=0x40004, fileType=0x1, subtype=0x0, date=(0, 0)),
 kids=[StringFileInfo([StringTable('040904b0', [
 StringStruct('FileDescription', 'NetEase Music Downloader'),
 StringStruct('FileVersion', '{VERSION}'),
 StringStruct('ProductName', 'NetEase Music Downloader'),
 StringStruct('ProductVersion', '{VERSION}')])]),
 VarFileInfo([VarStruct('Translation', [1033, 1200])])])
"""
out = Path(__file__).resolve().parent / "build/version.txt"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(resource, encoding="utf-8")
