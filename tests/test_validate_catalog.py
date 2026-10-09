import json
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
import importlib.util

SPEC = importlib.util.spec_from_file_location("validate_catalog", ROOT / "scripts" / "validate_catalog.py")
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


class CatalogValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        shutil.copytree(ROOT / "data", self.root / "data")

    def tearDown(self):
        self.temp_dir.cleanup()

    def read_json(self, relative_path):
        path = self.root / relative_path
        return json.loads(path.read_text(encoding="utf-8"))

    def write_json(self, relative_path, payload):
        path = self.root / relative_path
        path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    def validate(self):
        return validator.validate_catalog(self.root)[0]

    def test_repository_fixtures_are_valid(self):
        errors, counts = validator.validate_catalog(ROOT)
        self.assertEqual(errors, [])
        self.assertEqual(counts["movies"], 1)
        self.assertEqual(counts["series"], 1)
        self.assertEqual(counts["episodes"], 2)

    def test_duplicate_episode_ids_fail_actual_validation(self):
        path = "data/series/wandavision.json"
        record = self.read_json(path)
        record["seasons"][0]["episodes"][1]["id"] = record["seasons"][0]["episodes"][0]["id"]
        self.write_json(path, record)

        errors = self.validate()
        self.assertTrue(any("duplicate episode ID 'wandavision-s01e01'" in error for error in errors), errors)

    def test_broken_timeline_reference_fails_actual_validation(self):
        path = "data/timeline.json"
        timeline = self.read_json(path)
        timeline["entries"][0]["target"]["id"] = "not-a-movie"
        self.write_json(path, timeline)

        errors = self.validate()
        self.assertTrue(any("unknown movie ID 'not-a-movie'" in error for error in errors), errors)

    def test_duplicate_ids_across_record_types_fail(self):
        path = "data/series/wandavision.json"
        record = self.read_json(path)
        record["seasons"][0]["episodes"][0]["id"] = "iron-man"
        self.write_json(path, record)

        errors = self.validate()
        self.assertTrue(any("duplicate ID 'iron-man'" in error and "movie" in error and "episode" in error for error in errors), errors)

    def test_invalid_asset_path_fails_actual_validation(self):
        path = "data/movies/iron-man.json"
        record = self.read_json(path)
        record["assets"]["poster"] = {
            "path": "/etc/passwd",
            "status": "available",
            "source": None,
        }
        self.write_json(path, record)

        errors = self.validate()
        self.assertTrue(any("asset path must stay under public/assets" in error for error in errors), errors)

    def test_missing_local_asset_fails_actual_validation(self):
        path = "data/movies/iron-man.json"
        record = self.read_json(path)
        record["assets"]["poster"] = {
            "path": "public/assets/movies/iron-man/poster.webp",
            "status": "available",
            "source": None,
        }
        self.write_json(path, record)

        errors = self.validate()
        self.assertTrue(any("asset file does not exist" in error for error in errors), errors)

    def test_episode_assets_are_validated_independently(self):
        path = "data/series/wandavision.json"
        record = self.read_json(path)
        record["seasons"][0]["episodes"][0]["assets"] = {
            "still": {
                "path": "public/assets/series/wandavision/episode-still.webp",
                "status": "available",
                "source": None,
            }
        }
        self.write_json(path, record)

        errors = self.validate()
        self.assertTrue(
            any("wandavision-s01e01.still: asset file does not exist" in error for error in errors),
            errors,
        )
        self.assertFalse(
            any("wandavision.still" in error for error in errors),
            errors,
        )


if __name__ == "__main__":
    unittest.main()
