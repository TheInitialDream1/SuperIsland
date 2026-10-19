#!/usr/bin/env python3
"""Optimize the repository's own screenshots for the static product website.

Requires Pillow: python3 -m pip install Pillow
The generated WebP assets are committed so Pages needs no build dependencies.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs/site-assets"
OUTPUT.mkdir(exist_ok=True)
STYLES = ["standard", "luminous", "mindscape", "staircase", "floating", "chorus",
          "tilt", "orbit", "diorama", "clockwork", "sonnet", "tempera", "lumiere",
          "monet", "still"]
MODULES = ["home", "now-playing", "calendar", "weather", "shelf", "teleprompter",
           "battery", "connectivity", "notifications", "volume"]
sources = [ROOT / "assets/logo.png", ROOT / "assets/player-styles-overview.png"]
sources += [ROOT / f"docs/screenshots/player-{name}.png" for name in STYLES]
sources += [ROOT / f"docs/screenshots/{name}.png" for name in MODULES]
for source in sources:
    image = Image.open(source).convert("RGBA")
    image.thumbnail((1800, 1350))
    image.save(OUTPUT / f"{source.stem}.webp", "WEBP", quality=88, method=6)
print(f"Prepared {len(sources)} website assets.")
