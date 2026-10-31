from __future__ import annotations

import json
import threading
import unittest
from urllib.request import Request, urlopen

from server.app import make_server


class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = make_server(port=0)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        host, port = cls.server.server_address[:2]
        cls.base = f"http://{host}:{port}"

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def request(self, path: str, payload: dict | None = None) -> dict:
        data = None if payload is None else json.dumps(payload).encode("utf-8")
        request = Request(
            self.base + path,
            data=data,
            headers={"Content-Type": "application/json"} if data else {},
        )
        with urlopen(request, timeout=3) as response:
            return json.loads(response.read().decode("utf-8"))

    def test_health(self) -> None:
        with urlopen(self.base + "/api/health", timeout=3) as response:
            payload = json.loads(response.read().decode("utf-8"))
            self.assertTrue(payload["ok"])
            self.assertEqual(response.headers["Access-Control-Allow-Origin"], "*")

    def test_start_endpoint(self) -> None:
        response = self.request("/api/start", {"seed": 123})
        self.assertEqual(response["source"], "C/WAM")
        self.assertEqual(response["state_name"], "CHECK")

    def test_meta_contains_original_pin_mapping(self) -> None:
        metadata = self.request("/api/meta")
        self.assertEqual(len(metadata["holes"]), 9)
        self.assertEqual(metadata["holes"][0]["pin"], "P7.3")
        self.assertEqual(metadata["constants"]["startKey"], 16)

    def test_source_route_is_whitelisted_text(self) -> None:
        with urlopen(self.base + "/source/sol_fsm.c", timeout=3) as response:
            body = response.read().decode("utf-8")
            self.assertEqual(response.headers.get_content_type(), "text/plain")
            self.assertIn("SOL_FSM_Dispatch", body)


if __name__ == "__main__":
    unittest.main()
