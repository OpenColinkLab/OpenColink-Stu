import os
import sys

# Qt WebEngine's default Metal compositor can crash in an ad-hoc signed macOS
# bundle while compiling a shader. Select Qt's supported OpenGL backend before
# importing any Qt modules; Chromium is left to choose its own rendering path.
if sys.platform == "darwin":
    os.environ.setdefault("QSG_RHI_BACKEND", "opengl")

from musicdown.gui import main


if __name__ == "__main__":
    main()
