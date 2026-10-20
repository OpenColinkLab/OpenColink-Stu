import unittest

import httpx

from musicdown.quality_catalog import fetch_quality_catalog, parse_quality_catalog


class QualityCatalogTests(unittest.TestCase):
    def test_catalog_maps_song_fields_and_spatial_variants(self):
        payload = {"code": 200, "data": {
            "l": {"br": 128000}, "m": {"br": 192000}, "h": {"br": 320000},
            "sq": {"br": 1000000}, "hr": None, "jm": {"br": 4000000},
            "je": {"br": 2000000}, "sk": None, "sks": [{"type": "c51"}],
            "db": None, "vi": {"br": 500000},
        }}
        expected = {"standard", "higher", "exhigh", "lossless", "jymaster",
                    "jyeffect", "sky", "vivid"}
        self.assertEqual(parse_quality_catalog(payload), expected)

        def handler(request):
            self.assertEqual(request.url.params["songId"], "2041026502")
            return httpx.Response(200, json=payload)

        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            self.assertEqual(fetch_quality_catalog("2041026502", client), expected)

    def test_invalid_response_is_not_misreported_as_unavailable(self):
        for payload in ({"code": 403, "data": {}}, {"code": 200, "data": {}},
                        {"code": 200, "data": None}):
            with self.subTest(payload=payload), self.assertRaises(ValueError):
                parse_quality_catalog(payload)


if __name__ == "__main__":
    unittest.main()
