#!/usr/bin/env python3
"""Render the real SwiftUI views with offline fixtures, without running the app.

Only temporary copies of manager initializers are replaced. Production sources
and the user's running application, settings, accounts and permissions are untouched.
Requires macOS 14+, Swift 5.9+, Node.js 18+ and Python 3; no Python packages.
"""
from pathlib import Path
import shutil
import subprocess
import tempfile
import sys

WEBSITE_ONLY = "--website-only" in sys.argv

ROOT = Path(__file__).resolve().parents[2]


def replace_body(source, signature, body):
    start = source.index(signature) + len(signature)
    depth, end = 1, start
    while depth:
        if source[end] == "{":
            depth += 1
        elif source[end] == "}":
            depth -= 1
        end += 1
    return source[:start] + "\n" + body + "\n    " + source[end - 1:]


with tempfile.TemporaryDirectory(prefix="superisland-gallery-") as temporary:
    temporary = Path(temporary)
    sources = []
    # Constructors below otherwise inspect the live machine or start services.
    offline_managers = {
        "BatteryManager.swift", "WiFiManager.swift", "BluetoothManager.swift",
        "CalendarManager.swift", "NotificationManager.swift", "VolumeManager.swift",
        "FocusManager.swift", "KeyboardBacklightManager.swift", "MascotManager.swift",
    }
    for folder in ["SuperIsland", "ExtensionHost"]:
        for path in sorted((ROOT / folder).rglob("*.swift")):
            if path.name in {"SuperIslandApp.swift", "Analytics.swift"}:
                continue
            source = path.read_text()
            if path.name in offline_managers:
                source = replace_body(source, "private init() {", "")
            elif path.name == "WeatherManager.swift":
                source = replace_body(source, "override private init() {", "        super.init()")
            elif path.name == "NowPlayingManager.swift":
                source = source.replace("static let shared = NowPlayingManager()",
                                        "static let shared = NowPlayingManager(observesSystemMedia: false)")
            elif path.name == "AppState.swift":
                source = replace_body(source, "func refreshEnergyState() {", "")
                source = source.replace("@Published private(set) var presentationHasNotch", "@Published var presentationHasNotch")
                source = source.replace("@Published private(set) var presentationNotchRect", "@Published var presentationNotchRect")
            elif path.name == "ShelfStore.swift":
                source = source.replace("@Published private(set) var items:", "@Published var items:")
            destination = temporary / folder / path.relative_to(ROOT / folder)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(source)
            sources.append(str(destination))
    app = temporary / "Gallery.app"
    executable = app / "Contents/MacOS/Gallery"
    resources = app / "Contents/Resources"
    executable.parent.mkdir(parents=True)
    resources.mkdir(parents=True)
    import plistlib
    (app / "Contents/Info.plist").write_bytes(plistlib.dumps({
        "CFBundleIdentifier": "org.superisland.offline-gallery",
        "CFBundleExecutable": "Gallery", "CFBundlePackageType": "APPL",
    }))
    for language in (ROOT / "SuperIsland").glob("*.lproj"):
        shutil.copytree(language, resources / language.name)
    subprocess.run(["node", str(ROOT / "scripts/screenshots/extensions.js"),
                    str(resources / "extension-previews.json")], check=True, cwd=ROOT)
    print("Compiling production SwiftUI views with offline fixture managers...", flush=True)
    subprocess.run(["swiftc", "-parse-as-library", "-D", "DEBUG", "-D",
                    "SUPERISLAND_CUSTOM_HEIGHT", "-module-name", "SuperIslandGallery",
                    *sources, str(ROOT / "scripts/screenshots/Main.swift"),
                    "-o", str(executable)], check=True, cwd=ROOT)
    subprocess.run([str(executable), str(ROOT / "docs/screenshots"), *(["--website-only"] if WEBSITE_ONLY else [])], check=True,
                   cwd=temporary)
    # lockFocus uses Retina pixels; the contact sheet does not need a 2880px export.
    if not WEBSITE_ONLY:
        subprocess.run(["sips", "--resampleWidth", "1440",
                    str(ROOT / "docs/screenshots/player-styles.png")], check=True,
                   stdout=subprocess.DEVNULL)
