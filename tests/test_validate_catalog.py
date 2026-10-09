import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("validate_catalog", ROOT / "scripts" / "validate_catalog.py")
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


class CatalogValidationTests(unittest.TestCase):
    def test_repository_fixtures_are_valid(self):
        self.assertEqual(validator.main(), 0)

    def test_duplicate_episode_ids_are_detected(self):
        record = validator.load_json(ROOT / "data" / "series" / "wandavision.json")
        record["seasons"][0]["episodes"][1]["id"] = record["seasons"][0]["episodes"][0]["id"]
        ids = [episode["id"] for season in record["seasons"] for episode in season["episodes"]]
        self.assertNotEqual(len(ids), len(set(ids)))

    def test_invalid_asset_path_is_rejected_by_schema(self):
        schema = validator.load_json(ROOT / "data" / "schema" / "movie.schema.json")
        record = validator.load_json(ROOT / "data" / "movies" / "iron-man.json")
        record["assets"]["poster"]["path"] = "/etc/passwd"
        errors = list(validator.Draft202012Validator(schema, format_checker=validator.FORMAT_CHECKER).iter_errors(record))
        self.assertTrue(errors)

    def test_timeline_broken_reference_is_detectable(self):
        timeline = validator.load_json(ROOT / "data" / "timeline.json")
        timeline["entries"][0]["target"]["id"] = "not-a-movie"
        self.assertNotIn(timeline["entries"][0]["target"]["id"], {"iron-man"})


if __name__ == "__main__":
    unittest.main()
