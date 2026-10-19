# SuperIsland custom-height build

This local build adds extension-controlled window heights without changing the
default dimensions of Home or built-in modules.

## Extension manifest

An extension may provide static defaults:

```json
{
  "layout": {
    "expandedHeight": 180,
    "fullExpandedHeight": 240
  }
}
```

The host clamps extension heights to safe ranges. Existing manifests without a
`layout` object keep the upstream dimensions.

## Runtime API

An extension may update its height while running:

```js
SuperIsland.island.setPreferredHeight({
  expanded: 180,
  fullExpanded: 240
});
```

Passing a number sets only the full-expanded height. Runtime values override
the manifest until the extension reloads.

## Local build behavior

The official auto-updater is disabled under the `SUPERISLAND_CUSTOM_HEIGHT`
compilation condition so an upstream update cannot silently replace this
custom host. Pull upstream changes and rebuild manually when updating.

This build also exposes `View.nowPlayingPlayer(...)` to media extensions. The
view uses the same native `NowPlayingManager` control path as the Home player,
including previous, play/pause, next, and seeking.


The synced-lyrics surface uses `View.nowPlayingLyrics({ lines, status, message,
offsetSeconds, showArtwork, trackTitle, trackArtist, sourceBundleIdentifier })`. Each line has a `time` in seconds and `text`.
The native view reads the same media position as the built-in controls, scrolls
to the active line, and seeks through the native manager when a line is clicked.
Full-expanded extension height is capped at 360 points. Hosting views reserve
this space even when an extension is activated after the window was created;
the actual panel continues to clip to its current content dimensions.
