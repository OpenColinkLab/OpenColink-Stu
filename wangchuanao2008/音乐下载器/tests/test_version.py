import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from musicdown.version import VERSION, read_version


class VersionTests(unittest.TestCase):
    def test_source_version_is_the_shared_file(self):
        self.assertEqual(VERSION, (Path(__file__).resolve().parents[1] / "VERSION").read_text().strip())

    def test_frozen_app_reads_its_bundled_version_and_rejects_invalid_data(self):
        with TemporaryDirectory() as directory:
            version = Path(directory) / "VERSION"
            with patch("musicdown.version.sys._MEIPASS", directory, create=True):
                version.write_text("2.3.4\n")
                self.assertEqual(read_version(), "2.3.4")
                version.write_text("2.3-beta")
                with self.assertRaises(ValueError):
                    read_version()
