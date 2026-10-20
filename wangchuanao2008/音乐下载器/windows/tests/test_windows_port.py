import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from musicdown.audio import find_ffmpeg


class WindowsPortTests(unittest.TestCase):
    def test_ffmpeg_next_to_packaged_executable(self):
        with tempfile.TemporaryDirectory() as directory:
            executable = Path(directory) / "网易云音乐下载器.exe"
            ffmpeg = Path(directory) / "ffmpeg.exe"
            ffmpeg.touch()
            with patch("musicdown.audio.shutil.which", return_value=None), \
                 patch("musicdown.audio.sys.executable", str(executable)), \
                 patch("musicdown.audio.sys.platform", "win32"):
                self.assertEqual(find_ffmpeg(), str(ffmpeg.resolve()))


if __name__ == "__main__":
    unittest.main()
