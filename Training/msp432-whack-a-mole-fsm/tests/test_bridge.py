from __future__ import annotations

import unittest

from server.bridge import CGame


class CGameBridgeTest(unittest.TestCase):
    def setUp(self) -> None:
        self.game = CGame(2026)

    def test_start_generates_mole_from_c(self) -> None:
        response = self.game.press(16)
        snapshot = response["snapshot"]
        self.assertEqual(response["source"], "C/WAM")
        self.assertEqual(response["state_name"], "CHECK")
        self.assertGreaterEqual(snapshot["mole_hole"], 0)
        self.assertLess(snapshot["mole_hole"], 9)
        self.assertIn(snapshot["mole_code"], {1, 2, 3, 5, 6, 7, 9, 10, 11})
        self.assertGreaterEqual(snapshot["spawn_delay_ms"], 500)
        self.assertLessEqual(snapshot["spawn_delay_ms"], 1900)

    def test_hit_updates_score_and_round(self) -> None:
        started = self.game.press(16)
        code = started["snapshot"]["mole_code"]
        result = self.game.press(code)
        self.assertEqual(result["snapshot"]["score"], 1)
        self.assertEqual(result["snapshot"]["lost"], 0)
        self.assertGreater(result["snapshot"]["round"], started["snapshot"]["round"])
        self.assertTrue(
            any(event["kind_name"] == "HIT" for event in result["events"])
        )

    def test_timeout_is_processed_by_c_state_machine(self) -> None:
        started = self.game.press(16)
        before = self.game.advance(499)
        self.assertEqual(before["snapshot"]["lost"], 0)
        after = self.game.advance(1)
        self.assertEqual(after["snapshot"]["lost"], 1)
        self.assertGreater(after["snapshot"]["round"], started["snapshot"]["round"])
        self.assertTrue(
            any(event["kind_name"] == "TIMEOUT" for event in after["events"])
        )

    def test_quit_restores_idle(self) -> None:
        self.game.press(16)
        result = self.game.press(16)
        self.assertEqual(result["state_name"], "IDLE")
        self.assertEqual(result["snapshot"]["mole_hole"], -1)


if __name__ == "__main__":
    unittest.main()
