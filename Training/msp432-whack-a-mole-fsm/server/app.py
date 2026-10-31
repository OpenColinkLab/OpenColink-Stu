from __future__ import annotations

import argparse
import json
import random
import time
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from .bridge import CGame, ROOT


WEB_ROOT = ROOT / "web"

SOURCE_FILES = {
    "/source/sol_fsm.h": ROOT / "c" / "include" / "sol_fsm.h",
    "/source/whack_a_mole.h": ROOT / "c" / "include" / "whack_a_mole.h",
    "/source/sol_fsm.c": ROOT / "c" / "src" / "sol_fsm.c",
    "/source/whack_a_mole.c": ROOT / "c" / "src" / "whack_a_mole.c",
    "/source/original-project-main.c": (
        ROOT
        / "original"
        / "Library"
        / "sol_driver"
        / "project"
        / "src"
        / "project_main.c"
    ),
    "/source/original-hamster_plate.h": (
        ROOT
        / "original"
        / "Library"
        / "sol_driver"
        / "project"
        / "inc"
        / "hamster_plate.h"
    ),
    "/source/original-bsp_interrupt.c": (
        ROOT
        / "original"
        / "Library"
        / "sol_driver"
        / "bsp"
        / "src"
        / "bsp_interrupt.c"
    ),
}

HOLES = [
    {"hole": 0, "keypad": 1, "pin": "P7.3", "label": "1"},
    {"hole": 1, "keypad": 2, "pin": "P7.1", "label": "2"},
    {"hole": 2, "keypad": 3, "pin": "P9.4", "label": "3"},
    {"hole": 3, "keypad": 5, "pin": "P9.6", "label": "4"},
    {"hole": 4, "keypad": 6, "pin": "P8.0", "label": "5"},
    {"hole": 5, "keypad": 7, "pin": "P7.4", "label": "6"},
    {"hole": 6, "keypad": 9, "pin": "P7.6", "label": "7"},
    {"hole": 7, "keypad": 10, "pin": "P10.3", "label": "8"},
    {"hole": 8, "keypad": 11, "pin": "P7.7", "label": "9"},
]

KEYPAD = [
    {"keypad": 1, "label": "1"},
    {"keypad": 2, "label": "2"},
    {"keypad": 3, "label": "3"},
    {"keypad": 4, "label": "4", "navigation": True},
    {"keypad": 5, "label": "5"},
    {"keypad": 6, "label": "6"},
    {"keypad": 7, "label": "7"},
    {"keypad": 8, "label": "8", "navigation": True},
    {"keypad": 9, "label": "9"},
    {"keypad": 10, "label": "10"},
    {"keypad": 11, "label": "11"},
    {"keypad": 16, "label": "16", "start": True},
]

GAME = CGame(seed=int(time.time()) & 0xFFFFFFFF)


def _new_seed() -> int:
    return random.SystemRandom().randrange(1, 2**32)


class TutorialHandler(SimpleHTTPRequestHandler):
    server_version = "WAMTutorial/0.1"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB_ROOT), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"{self.address_string()} - {format % args}")

    def _json(self, payload: dict[str, Any], status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length > 4096:
            raise ValueError("Request body is too large")
        if not length:
            return {}
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("JSON object required")
        return payload

    def _text_file(self, path: Path) -> None:
        body = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        try:
            if path in SOURCE_FILES:
                self._text_file(SOURCE_FILES[path])
                return
            if path == "/api/health":
                self._json({"ok": True, "source": "C/WAM"})
                return
            if path == "/api/state":
                self._json(GAME.response())
                return
            if path == "/api/meta":
                self._json(
                    {
                        "holes": HOLES,
                        "keypad": KEYPAD,
                        "constants": {
                            "startKey": 16,
                            "reactionWindowMs": 500,
                            "spawnDelayMinMs": 500,
                            "spawnDelayMaxMs": 1900,
                            "timerTickMs": 1,
                            "navigationKeys": [4, 8],
                        },
                        "source": {
                            "original": "/source/original-project-main.c",
                            "fsm": "/source/sol_fsm.c",
                            "game": "/source/whack_a_mole.c",
                            "lesson": "/lesson.html",
                        },
                    }
                )
                return
            super().do_GET()
        except Exception as error:
            self._json({"ok": False, "error": str(error)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        try:
            payload = self._read_json()
            if path == "/api/start":
                GAME.reset(int(payload.get("seed") or _new_seed()))
                self._json(GAME.press(16))
                return
            if path == "/api/reset":
                self._json(GAME.reset(int(payload.get("seed") or _new_seed())))
                return
            if path == "/api/press":
                code = int(payload.get("code", -1))
                if code < 0 or code > 16:
                    raise ValueError("Key code must be between 0 and 16")
                self._json(GAME.press(code))
                return
            if path == "/api/tick":
                elapsed = int(payload.get("elapsedMs", 0))
                if elapsed < 0 or elapsed > 2000:
                    raise ValueError("elapsedMs must be between 0 and 2000")
                self._json(GAME.advance(elapsed))
                return
            self._json({"ok": False, "error": "Unknown API endpoint"}, HTTPStatus.NOT_FOUND)
        except (TypeError, ValueError, json.JSONDecodeError) as error:
            self._json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
        except Exception as error:
            self._json({"ok": False, "error": str(error)}, HTTPStatus.INTERNAL_SERVER_ERROR)


def make_server(host: str = "127.0.0.1", port: int = 8765) -> ThreadingHTTPServer:
    return ThreadingHTTPServer((host, port), TutorialHandler)


def main() -> None:
    parser = argparse.ArgumentParser(description="MSP432 whack-a-mole tutorial server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server = make_server(args.host, args.port)
    host, port = server.server_address[:2]
    print(f"MSP432 tutorial running at http://{host}:{port}/")
    print(f"Lesson: http://{host}:{port}/lesson.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
