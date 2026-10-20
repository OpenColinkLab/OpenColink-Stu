from pathlib import Path
import zipfile
root = Path('test-artifacts/windows-transfer/stage')
out = root.parent / 'windows-test.zip'
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=5, allowZip64=True) as z:
    for p in root.rglob('*'):
        if p.is_file():
            z.write(p, p.relative_to(root))
print('Windows test archive:', out.stat().st_size)
