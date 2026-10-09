#!/usr/bin/env python3
"""Smoke-test the generated static bundle without requiring a browser."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


def main() -> int:
    html_path = DIST / "index.html"
    if not html_path.is_file() or html_path.stat().st_size == 0:
        raise SystemExit("Build smoke test failed: dist/index.html is missing or empty")

    html = html_path.read_text(encoding="utf-8")
    if re.search(r"""(?:src|href)=["']/src/main\.(?:tsx|ts)["']""", html):
        raise SystemExit("Build smoke test failed: HTML references the TypeScript source entrypoint")

    js_files = sorted((DIST / "assets").glob("*.js"))
    css_files = sorted((DIST / "assets").glob("*.css"))
    if not js_files or not css_files:
        raise SystemExit("Build smoke test failed: expected generated JavaScript and CSS assets")

    for asset in [*js_files, *css_files]:
        if asset.stat().st_size == 0:
            raise SystemExit(f"Build smoke test failed: generated asset is empty: {asset.name}")

    movie = json.loads((ROOT / "data/movies/iron-man.json").read_text(encoding="utf-8"))
    series = json.loads((ROOT / "data/series/wandavision.json").read_text(encoding="utf-8"))
    timeline = json.loads((ROOT / "data/timeline.json").read_text(encoding="utf-8"))
    if movie.get("id") != "iron-man" or series.get("id") != "wandavision":
        raise SystemExit("Build smoke test failed: expected sample movie/series catalog entries are missing")

    targets = {
        (entry.get("target") or {}).get("id")
        for entry in timeline.get("entries", [])
    }
    if not {"iron-man", "wandavision-s01e01"}.issubset(targets):
        raise SystemExit("Build smoke test failed: expected Iron Man and WandaVision timeline entries are missing")

    for asset in js_files:
        source = asset.read_text(encoding="utf-8")
        if "Iron Man" not in source or "WandaVision" not in source:
            raise SystemExit(f"Build smoke test failed: expected catalog labels absent from {asset.name}")

    print(
        "Build smoke test passed: generated HTML, JS/CSS assets and expected "
        "Iron Man/WandaVision catalog entries are present."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
