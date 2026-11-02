from __future__ import annotations

import ctypes
import subprocess
import threading
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DLL_PATH = ROOT / "build" / "wam.dll"
BUILD_SCRIPT = ROOT / "scripts" / "build.ps1"
C_SOURCES = (
    ROOT / "c" / "include" / "sol_fsm.h",
    ROOT / "c" / "include" / "whack_a_mole.h",
    ROOT / "c" / "src" / "sol_fsm.c",
    ROOT / "c" / "src" / "whack_a_mole.c",
)


class WAMSnapshot(ctypes.Structure):
    _fields_ = [
        ("state", ctypes.c_uint32),
        ("score", ctypes.c_uint32),
        ("lost", ctypes.c_uint32),
        ("mole_hole", ctypes.c_int32),
        ("mole_code", ctypes.c_uint32),
        ("keypad", ctypes.c_uint32),
        ("reaction_window_ms", ctypes.c_uint32),
        ("wait_token", ctypes.c_uint32),
        ("remaining_ms", ctypes.c_uint32),
        ("spawn_delay_ms", ctypes.c_uint32),
        ("next_turn", ctypes.c_uint32),
        ("timed_out", ctypes.c_uint32),
        ("tick_count", ctypes.c_uint32),
        ("round", ctypes.c_uint32),
    ]


class WAMEvent(ctypes.Structure):
    _fields_ = [
        ("seq", ctypes.c_uint32),
        ("kind", ctypes.c_uint32),
        ("from_state", ctypes.c_uint32),
        ("to_state", ctypes.c_uint32),
        ("signal", ctypes.c_uint32),
        ("keypad", ctypes.c_uint32),
        ("score_delta", ctypes.c_int32),
        ("lost_delta", ctypes.c_int32),
        ("mole_hole", ctypes.c_int32),
        ("value", ctypes.c_uint32),
    ]


def ensure_dll() -> None:
    stale = not DLL_PATH.exists()
    if DLL_PATH.exists():
        dll_mtime = DLL_PATH.stat().st_mtime
        stale = any(path.stat().st_mtime > dll_mtime for path in C_SOURCES)
    if not stale:
        return

    result = subprocess.run(
        [
            "powershell.exe",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(BUILD_SCRIPT),
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        details = result.stdout + result.stderr
        raise RuntimeError(f"C bridge build failed:\n{details}")


def load_library() -> ctypes.WinDLL:
    ensure_dll()
    library = ctypes.WinDLL(str(DLL_PATH))
    library.WAM_ApiVersion.argtypes = []
    library.WAM_ApiVersion.restype = ctypes.c_uint32
    library.WAM_Create.argtypes = [ctypes.c_uint32]
    library.WAM_Create.restype = ctypes.c_void_p
    library.WAM_Destroy.argtypes = [ctypes.c_void_p]
    library.WAM_Destroy.restype = None
    library.WAM_Reset.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
    library.WAM_Reset.restype = None
    library.WAM_PressKey.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
    library.WAM_PressKey.restype = None
    library.WAM_AdvanceTime.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
    library.WAM_AdvanceTime.restype = None
    library.WAM_GetSnapshot.argtypes = [
        ctypes.c_void_p,
        ctypes.POINTER(WAMSnapshot),
    ]
    library.WAM_GetSnapshot.restype = None
    library.WAM_GetEventCount.argtypes = [ctypes.c_void_p]
    library.WAM_GetEventCount.restype = ctypes.c_uint32
    library.WAM_CopyEvents.argtypes = [
        ctypes.c_void_p,
        ctypes.c_uint32,
        ctypes.POINTER(WAMEvent),
        ctypes.c_uint32,
    ]
    library.WAM_CopyEvents.restype = ctypes.c_uint32
    library.WAM_ClearEvents.argtypes = [ctypes.c_void_p]
    library.WAM_ClearEvents.restype = None
    library.WAM_StateName.argtypes = [ctypes.c_uint32]
    library.WAM_StateName.restype = ctypes.c_char_p
    library.WAM_EventKindName.argtypes = [ctypes.c_uint32]
    library.WAM_EventKindName.restype = ctypes.c_char_p
    return library


LIBRARY = load_library()
if LIBRARY.WAM_ApiVersion() != 1:
    raise RuntimeError("Unsupported C bridge API version")


class CGame:
    """Thread-safe ctypes wrapper around one extracted C game instance."""

    def __init__(self, seed: int) -> None:
        self._lock = threading.RLock()
        self._handle = LIBRARY.WAM_Create(seed)
        if not self._handle:
            raise MemoryError("WAM_Create returned a null handle")

    def __del__(self) -> None:
        handle = getattr(self, "_handle", None)
        if handle:
            LIBRARY.WAM_Destroy(handle)
            self._handle = None

    @staticmethod
    def _name(function: Any, value: int) -> str:
        raw = function(value)
        return raw.decode("ascii") if raw else "UNKNOWN"

    def _snapshot(self) -> dict[str, int]:
        snapshot = WAMSnapshot()
        LIBRARY.WAM_GetSnapshot(self._handle, ctypes.byref(snapshot))
        return {field: int(getattr(snapshot, field)) for field, _ in snapshot._fields_}

    def _events(self) -> list[dict[str, Any]]:
        count = int(LIBRARY.WAM_GetEventCount(self._handle))
        if count == 0:
            return []
        buffer = (WAMEvent * count)()
        copied = int(
            LIBRARY.WAM_CopyEvents(self._handle, 0, buffer, count)
        )
        events: list[dict[str, Any]] = []
        for index in range(copied):
            event = buffer[index]
            events.append(
                {
                    "seq": int(event.seq),
                    "kind": int(event.kind),
                    "kind_name": self._name(LIBRARY.WAM_EventKindName, event.kind),
                    "from_state": int(event.from_state),
                    "from_state_name": self._name(
                        LIBRARY.WAM_StateName, event.from_state
                    ),
                    "to_state": int(event.to_state),
                    "to_state_name": self._name(
                        LIBRARY.WAM_StateName, event.to_state
                    ),
                    "signal": int(event.signal),
                    "keypad": int(event.keypad),
                    "score_delta": int(event.score_delta),
                    "lost_delta": int(event.lost_delta),
                    "mole_hole": int(event.mole_hole),
                    "value": int(event.value),
                }
            )
        return events

    def response(self) -> dict[str, Any]:
        with self._lock:
            snapshot = self._snapshot()
            return {
                "source": "C/WAM",
                "state_name": self._name(LIBRARY.WAM_StateName, snapshot["state"]),
                "snapshot": snapshot,
                "events": self._events(),
            }

    def reset(self, seed: int) -> dict[str, Any]:
        with self._lock:
            LIBRARY.WAM_Reset(self._handle, seed & 0xFFFFFFFF)
            return self.response()

    def press(self, keypad: int) -> dict[str, Any]:
        with self._lock:
            LIBRARY.WAM_PressKey(self._handle, keypad & 0xFFFFFFFF)
            return self.response()

    def advance(self, elapsed_ms: int) -> dict[str, Any]:
        with self._lock:
            LIBRARY.WAM_AdvanceTime(self._handle, elapsed_ms & 0xFFFFFFFF)
            return self.response()
