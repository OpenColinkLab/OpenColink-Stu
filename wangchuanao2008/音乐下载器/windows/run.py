"""Windows uses the same desktop implementation as macOS."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from musicdown.gui import main

if __name__ == "__main__":
    main()
