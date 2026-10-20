# DPI: SuperIsland Plugin Interface (Builder Guide)

This guide documents the **currently exposed extension APIs** in SuperIsland so builders can ship working extensions quickly.

Use this as your source of truth for what works in the runtime today.

## 1. Quick Start

1. Create a folder under `Extensions/`, for example `Extensions/my-timer/`.
2. Add a `manifest.json`.
3. Add an `index.js` that calls `SuperIsland.registerModule(...)` once.
4. Optional: add `settings.json` for native settings UI.
5. Launch the app, open **Settings -> Extensions**, then activate your extension.

Minimal example:

```js
SuperIsland.registerModule({
  compact() {
    return View.hstack([
      View.icon("bolt.fill", { color: "yellow" }),
      View.text("Hello", { style: "body" })
    ]);
  },
  expanded() {
    return View.text("Expanded view", { style: "title" });
  },
  onAction(actionID, value) {
    console.log("Action:", actionID, value);
  }
});
```

## 2. Extension Package Layout

```text
my-extension/
  manifest.json
  index.js
  settings.json         (optional)
  assets/               (optional)
```

## 3. `manifest.json` Reference

Required fields:

- `id` (string): globally unique ID (`com.you.extension`).
- `name` (string)
- `version` (string)

Common fields:

- `main` (string, default: `index.js`)
- `minAppVersion` (string, default: `1.0.0`)
- `description` (string, default: `""`)
- `author` (`{ name, url? }`)
- `icon` (string path)
- `license` (string)
- `categories` (string[])
- `permissions` (string[])
- `capabilities`:
  - `compact` (default `true`)
  - `expanded` (default `true`)
  - `fullExpanded` (default `true`)
  - `minimalCompact` (default `false`)
  - `backgroundRefresh` (default `true`)
  - `settings` (default `true`)
  - `notificationFeed` (default `false`) - extension is hidden from module slots; `SuperIsland.island.activate()` opens the shared Notifications module
- `layout` (optional):
  - `expandedHeight`: preferred expanded content height in points (`72...180`)
  - `fullExpandedHeight`: preferred full-expanded content height in points (`96...180`)
- `refreshInterval` (seconds, default `1.0`, minimum `0.1`)
- `activationTriggers` (default `["manual"]`)

Example:

```json
{
  "id": "superisland.pomodoro",
  "name": "Pomodoro Timer",
  "version": "1.0.0",
  "main": "index.js",
  "permissions": ["notifications", "storage"],
  "refreshInterval": 1.0
}
```

## 4. Runtime Lifecycle

Your extension registers exactly one module:

```js
SuperIsland.registerModule({
  compact,                   // required
  expanded,                  // recommended
  fullExpanded,              // optional
  minimalCompact,            // optional
  onActivate,                // optional
  onDeactivate,              // optional
  onAction                   // optional
});
```

### Lifecycle callbacks

- `onActivate()` runs when runtime is activated.
- `onDeactivate()` runs before runtime teardown.
- `onAction(actionID, value?)` runs for UI interactions.

### Render callbacks

- `compact()` -> rendered in compact island.
- `expanded()` -> rendered in expanded island.
- `fullExpanded()` -> rendered in full panel; if missing, expanded is reused.
- `minimalCompact.leading()/trailing()` -> rendered on notched compact variant when available.
- `minimalCompact.precedence` -> optional number or callback. `1` matches media priority, `2` lets music take precedence when media is active.

## 5. `SuperIsland` Global API

### `SuperIsland.registerModule(config)`

Registers your extension module config.

### `SuperIsland.island`

- `activate(autoDismiss = true)`: reveals the island and selects this module
- `select()`: selects this module without expanding, collapsing or changing its dismissal timer
- `dismiss()`
- `setPreferredHeight({ expanded?, fullExpanded? })`: overrides manifest heights for the current runtime; passing a number sets only `fullExpanded`
- `state`: `"compact" | "expanded" | "fullExpanded"`
- `isActive`: boolean

Notes:

- If `manifest.capabilities.notificationFeed` is `true`, `activate()` targets the main Notifications module instead of an extension-specific island slot.

Timer/background-safe pattern:

```js
function revealIsland() {
  SuperIsland.island.activate(false);
  // Optional second activation to survive host/menu transition races.
  setTimeout(() => SuperIsland.island.activate(false), 120);
}
```

### `SuperIsland.store`

Persistent extension-scoped key/value storage.

- `get(key)` -> value or `null`
- `set(key, value)`

Notes:

- `null` clears/removes the key.
- Scalars and JSON-compatible objects/arrays are supported.

### `SuperIsland.settings`

Extension settings key/value store (paired with `settings.json`).

- `get(key)` -> value or `null`
- `set(key, value)`

### `SuperIsland.notifications`

- `send(options)`
  - `title` (string)
  - `body` (string)
  - `sound?` (boolean)
  - `id?` (string): stable ID for de-dup/update in notification feed
  - `appName?` (string): app label shown in notification bar
  - `bundleIdentifier?` (string): app bundle ID used for app icon fallback
  - `senderName?` (string): sender/contact name shown as headline
  - `previewText?` (string): message/content preview
  - `avatarURL?` (string): sender avatar (`file://`, absolute file path, `http(s)://`)
  - `appIconURL?` (string): extension/app icon (`file://`, absolute file path, `http(s)://`)
  - `systemNotification?` (boolean, default `true`): when `false`, only Super Island feed is updated

Notes:

- For extensions with `capabilities.notificationFeed: true`, sent notifications are mirrored into the shared Super Island Notifications feed.

### `SuperIsland.http`

- `fetch(url, options?) -> Promise<{ status, data, text, error? }>`

`options`:

- `method` (default GET)
- `headers` (`Record<string, string>`)
- `body` (string)

Notes:

- Requires `"network"` permission.
- Without permission, `fetch` throws.
- Network errors return a resolved object with `error`.

### `SuperIsland.system`

- `getAIUsage()` -> usage object or `null`
- `getNowPlaying()` -> normalized now playing snapshot or `null`
- `getLatestNotification()` -> latest mirrored notification object or `null`
- `getRecentNotifications(limit?)` -> mirrored notifications array (newest first)
- `getWhatsAppWeb(limit?)` -> WhatsApp Web bridge state + recent parsed messages (requires `"network"`)
- `startWhatsAppWeb()` -> starts the WhatsApp Web bridge (requires `"network"`)
- `refreshWhatsAppWebQR()` -> reloads WhatsApp Web and refreshes QR code (requires `"network"`)
- `sendWhatsAppWebMessage(recipient, message)` -> queues message send via the logged-in WhatsApp Web session (requires `"network"`)
- `getLiveOrders(limit?)` -> normalized read-only JD, Meituan, and Cainiao bridge snapshot, including per-platform states (requires `"network"`)
- `startLiveOrders()` -> starts all background order bridges without presenting login windows (requires `"network"`)
- `startLiveOrderPlatform(platform)` -> starts one bridge; platform is `"jd"`, `"meituan"`, or `"cainiao"` (requires `"network"`)
- `openLiveOrdersLogin()` -> backward-compatible shortcut that opens the isolated JD window (requires `"network"`)
- `openLiveOrderPlatform(platform)` -> opens one platform's isolated login/order window (requires `"network"`)
- `refreshLiveOrders()` -> refreshes all order pages (requires `"network"`)
- `refreshLiveOrderPlatform(platform)` -> refreshes one connected order page (requires `"network"`)
- `openLiveOrder(orderID)` -> opens a cached order's trusted detail page in its isolated platform window (requires `"network"`)

Notes:

- Requires `"usage"` for `getAIUsage`.
- Requires `"media"` for `getNowPlaying`.
- Requires `"notifications"` for mirrored notification APIs.
- Requires `"network"` for WhatsApp Web bridge APIs.
- Requires `"network"` for live-order bridge APIs. Each platform has a separate host-owned WebKit data store; credentials and cookies are never exposed to extensions, which only receive normalized order fields.
- `getNowPlaying()` returns:
  - `{ sourceApp, bundleIdentifier, title, artist, album, albumArtist, durationSeconds, elapsedSeconds, playbackRate, clockAuthoritative, artworkURL, artworkColor, playbackState, trackIdentifier, isLocalFile, capturedAtEpochMs }`
  - `artworkURL`, `album`, `albumArtist`, `trackIdentifier`, and `artworkColor` are optional and may be `null`
  - `artworkColor` is `{ r, g, b, a }` with components from `0...1`, derived from the current album cover.

- Data source precedence (aligned with CodexBar-style sources):
  - Codex: local summary files, then ChatGPT OAuth usage API (`/backend-api/wham/usage`) via `~/.codex/auth.json` token.
  - Claude: local summary files, then Claude OAuth usage API (`/api/oauth/usage`), then local stats cache fallback.
- `codex.source` and `claude.source` indicate where each payload came from (`local-summary`, `oauth-api`, `auth-token`, `stats-cache`, `unavailable`).
- Mirrored notification APIs require `"notifications"` permission and return entries shaped like:
  - `{ id, localID, appName, bundleIdentifier, appIcon, appIconURL, title, body, senderName, previewText, avatarURL, timestamp }`
  - `previewText`/`avatarURL` are best-effort and depend on what macOS exposes for that notification (privacy settings can hide previews).

### Native now-playing player

- `View.nowPlayingLyrics(options?)` renders the native album-themed lyric player. Pass `lines: [{ time, text }]`, `status` (`idle`, `loading`, `synced`, `plain`, `missing`, `instrumental`), optional `message`, `offsetSeconds` (defaults to 0) and `showArtwork`. Bind the document to `trackTitle`, `trackArtist` and `sourceBundleIdentifier` from the snapshot; the view hides lyrics that do not match the live player. Set `canCalibrate: true` to expose `offset-earlier`, `offset-later`, `offset-reset` and `retry` actions. `lyricSource` labels the provider (`qqmusic` or `kugou`).
- The lyric view follows the host playback clock, fades neighboring lines, sweeps the active line over its LRC interval, and supports click-to-seek. Missing-lyrics retry sends the extension action `retry`.
- Media snapshots return `clockAuthoritative: true`: `elapsedSeconds` is already projected to `capturedAtEpochMs`. `playbackRate` is the current speed, so extensions should not maintain a separate drift correction for these snapshots.
- `View.nowPlayingPlayer(options?)` renders the host's native now-playing player inside an extension.
- The player observes `NowPlayingManager` directly and includes previous, play/pause, next, and draggable seek controls.
- `options.artworkSize` accepts `36...78` points and defaults to `54`.
- `options.showArtwork` controls album artwork visibility and defaults to `true`.
- `View.nowPlayingArtwork(options?)` renders only the current album artwork. `size` accepts `16...180` and `cornerRadius` accepts `0...32`.
- `View.nowPlayingTransport(options?)` renders time, draggable progress, previous, play/pause, and next controls. Set `showProgress: false` to hide the progress line.
- `View.nowPlayingBackdrop(child)` renders `child` over a full-size gradient and soft album-art color wash derived from the current cover.
- Requires the extension to declare the `"media"` permission.

### `SuperIsland.playFeedback(type)`

`type` supported:

- `"success"`
- `"warning"`
- `"error"`
- `"selection"`

### `SuperIsland.openURL(url)`

Opens URL in default browser.

### `SuperIsland.mascot`

Control the shared mascot companion that users can configure in Settings.

- `setExpression(expression)` — Set the mascot's current expression. Supported expressions:
  - `"idle"` — default neutral state
  - `"working"` — active/focused (animated pulse)
  - `"alert"` — attention needed (animated blink)
  - `"happy"` — positive/celebration (animated bounce)
  - `"tired"` — low energy/paused
  - `"clicked"` — user interaction feedback (animated spin, auto-resets to idle)
- `getExpression()` — Returns the current expression string.
- `getSelected()` — Returns `{ id, name, previewIcon }` of the user's selected mascot character.
- `list()` — Returns an array of all available mascot characters: `[{ id, name, previewIcon }]`.
- `setInput(name, value)` — Set a state machine input (forward-compatible with masko-code style inputs).

Notes:

- The mascot is a shared resource — all extensions write to the same expression state.
- Users select their mascot character in **Settings -> General -> Mascot**.
- Use `View.mascot()` to render the mascot in your extension UI.

## 6. Global Timer and Console APIs

Available in extension JS context:

- `setInterval(callback, ms)`
- `setTimeout(callback, ms)`
- `clearInterval(id)`
- `clearTimeout(id)`
- `console.log(...args)`
- `console.warn(...args)`
- `console.error(...args)`

Notes:

- Minimum timer interval is ~10ms.
- Console output appears in extension logs in the app settings UI.

## 7. `View` Global (Declarative UI DSL)

Use `View.*` helpers to build UI nodes (no HTML/DOM).

### Layout

- `View.hstack(children, { spacing?, align?, distribution? })`
- `View.vstack(children, { spacing?, align?, distribution? })`
- `View.zstack(children)`
- `View.spacer(minLength?)`
- `View.scroll(child, { axes?, showsIndicators? })`

Alignment values:

- `hstack.align`: `top | center | bottom`
- `vstack.align`: `leading | center | trailing`
- `distribution`: `natural | fillEqually` (`fillEqually` makes each direct child consume equal space along the stack axis)
- `scroll.axes`: `vertical | horizontal | both`

### Content

- `View.text(value, { style?, color?, lineLimit? })`
- `View.icon(name, { size?, color? })`
- `View.image(url, { width, height, cornerRadius? })`
- `View.progress(value, { total?, color? })`
- `View.circularProgress(value, { total?, lineWidth?, color? })`
- `View.gauge(value, { min?, max?, label? })`
- `View.divider()`

Text styles:

- `largeTitle`, `title`, `body`, `caption`, `footnote`, `monospaced`, `monospacedSmall`

Color values:

- Named: `white`, `gray`, `red`, `green`, `blue`, `yellow`, `orange`, `purple`, `pink`, `teal`, `cyan`
- RGBA object: `{ r, g, b, a? }` (0..1)

### Interactive

- `View.button(labelNode, actionID)`
- `View.toggle(isOn, label, actionID)`
- `View.slider(value, min, max, actionID)`

Action payloads:

- Button: `onAction(actionID)`
- Toggle: `onAction(actionID, boolean)`
- Slider: `onAction(actionID, number)` (sent when drag ends)

### Decorators

- `View.padding(child, { edges?, amount? })`
- `View.frame(child, { width?, height?, maxWidth?, maxHeight? })`
- `View.opacity(child, value)`
- `View.background(child, color)`
- `View.cornerRadius(child, radius)`
- `View.animate(child, kind)` where kind is commonly `pulse | bounce | spin | blink`

### Mascot

- `View.mascot({ size?, expression? })`
  - `size` (number, default 60): diameter of the mascot orb in points
  - `expression` (string, optional): override expression (`"idle"`, `"working"`, `"alert"`, `"happy"`, `"tired"`, `"clicked"`). If omitted, uses the global expression set via `SuperIsland.mascot.setExpression()`.

The mascot renders as an animated orb with the user's selected character. Each character has unique symbols, colors, and animations per expression.

### Conditional and Utilities

- `View.when(condition, thenNode, elseNode?)`
- `View.timerText(seconds, { style? })`

Returning `null` from child positions is supported (treated as empty).

### Shared Components

- `SuperIsland.components.inputComposer({ placeholder, text?, action, id?, autoFocus?, minHeight?, showsEmojiButton?, error?, spacing?, padding?, cornerRadius?, chrome?, backgroundColor? })`
- Returns a reusable reply/input tray with the shared input box styling, shortcut hint, optional error text, and optional emoji button.

## 8. `settings.json` Schema

Supported field types:

- `toggle`
- `slider`
- `stepper`
- `picker`
- `button`
- `text`
- `color`

Schema shape:

```json
{
  "sections": [
    {
      "title": "General",
      "fields": [
        {
          "type": "toggle",
          "key": "enabled",
          "label": "Enabled",
          "default": true
        }
      ]
    }
  ]
}
```

Field properties (type-dependent):

- `key` (required)
- `label` (required)
- `default`
- `min`, `max`, `step` (slider/stepper)
- `options: [{ value, label }]` (picker)
- `action` (button, optional; defaults to the field `key`)

## 9. Discovery and Activation (Host Behavior)

The host scans extension directories and loads any folder containing `manifest.json` + `main` JS file.

Common scan locations:

- `<repo>/Extensions` (development)
- `<cwd>/Extensions`
- `<cwd>/ExtensionsDev`
- `~/Library/Application Support/SuperIsland/Extensions`

If duplicate IDs are found, first discovered wins and duplicates are logged.

## 10. Permissions and Sandbox Notes

Sandbox behavior in current runtime:

- `eval` and `Function` are removed from global scope.
- JS runs in isolated JavaScriptCore context.
- `network` permission is enforced for `SuperIsland.http.fetch`.
- `media` permission is enforced for `SuperIsland.system.getNowPlaying`.
- `usage` permission is enforced for `SuperIsland.system.getAIUsage`.
- `notifications` permission is enforced for `SuperIsland.system.getLatestNotification` and `SuperIsland.system.getRecentNotifications`.

Other permission names are currently metadata for compatibility/future policy, but should still be declared correctly in `manifest.json`.

## 11. Troubleshooting

### Extension not showing up

Check:

- `manifest.json` exists.
- `main` file exists (for example `index.js`).
- `id` is unique.
- Open Settings -> Extensions and review source paths/logs.

### Only 1-minute timer behavior

If a numeric setting is unset (`null`) and code uses `Number(value)` directly, it may become `0` unexpectedly. Use explicit null/undefined fallback handling.

### `island.activate(false)` seems missed on timer completion

If activation is triggered during transient host/menu transitions, call `activate(false)` and schedule a short retry (`~100-150ms`) for reliability.

### Extension crashes on store/set

Do not pass unsupported complex host objects. Stick to scalars, arrays, and plain objects.

## 12. Recommended Builder Pattern

- Keep module state in plain JS variables.
- Persist checkpoints via `SuperIsland.store`.
- Keep render functions pure and fast.
- Use action IDs as stable command names (`start`, `pause`, `reset`, etc.).
- Declare only required permissions.

---

If you want, a good next step is adding a small extension starter template (`manifest.json + index.js + settings.json`) under `Extensions/template/` for new contributors.

`View.nowPlayingLyrics` rows may optionally include `words: [{ time, endTime, text }]` in absolute seconds. Word text must concatenate to the complete line and have finite, ordered intervals. Invalid words fall back to the line; hosts never estimate word timings from line duration.
