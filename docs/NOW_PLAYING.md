# Now Playing

The Now Playing module combines the system media feed with app-specific fallbacks for Apple Music and Spotify.

## Browser media detection

Browser media detection is off by default. When enabled in Settings -> Modules -> Now Playing, SuperIsland can use macOS Automation to inspect allowed browser tabs for active `video` and `audio` elements.

Supported browser targets:

- Google Chrome
- Google Chrome Canary

Browser detection requires:

- Automation permission for SuperIsland
- The browser running with media in an open tab
- JavaScript from Apple Events enabled in the browser

If detection is unavailable, the app keeps browser support explicit instead of showing a misleading playing state.

## Provider states

Now Playing distinguishes active playback, paused playback, stale last-known playback, missing permissions, and no detected media. A paused or recently known track can remain visible briefly so the home panel does not immediately collapse to an empty state.

## Controls

System media controls continue to use the existing system path. Apple Music and Spotify controls use their app automation support. Browser controls are only attempted for browser media that was detected through the opt-in browser path.

## Playback position and lyrics

Position is calculated from an elapsed-time anchor, its capture timestamp,
playback rate and playing state. The progress timer publishes the projected
position once per second and remains active when the built-in player is hidden.
It does not add a fixed number of seconds or discard time after a delayed tick.
MediaRemote adapter anchors are projected before publishing; metadata-only diffs
preserve the clock, and opening an already-playing track never resets it to zero.
Adapter streams and snapshots use microsecond timestamps so ISO date formatting
does not round the anchor by a second. While a progress view is visible, a
separate three-second verification checks the actual source even when local
state says paused. Control commands use the same working adapter as metadata
(direct private-framework symbols can exist while macOS rejects their calls).
Every control is followed by a real snapshot, and newer notifications/controls
invalidate older in-flight reads. An unchanged positive-rate anchor is frozen
while the source is paused (QQ Music can leave the rate at 1); a changed anchor
still applies paused seeks. Unchanged artwork is not decoded repeatedly.
Playback uses explicit play/pause commands. QQ Music can update the system's
playing flag in response to the generic toggle without pausing its own audio;
explicit commands have been checked against the actual QQ Music controls.

Media extension snapshots include `playbackRate` and `clockAuthoritative: true`.
Their `elapsedSeconds` is projected to `capturedAtEpochMs`, rather than copying
the last value delivered by the source app. Native synced lyrics use the same
clock for scrolling, controls, seeking and the time label.

Synced lyric documents carry `trackTitle`, `trackArtist` and `sourceBundleIdentifier`.
The native view refuses a document for another track immediately, and the extension
refreshes its snapshot on host render even when its JS polling timer was suspended.
Async HTTP responses re-check the live track; cache entries and candidates are
validated against title, artist and duration. LRC `[offset:]` tags are honored.

QQ Music playback first searches QQ's own lyric service, matching the exact
title/artist and duration, and preferring the current album (including grouped
album editions). Other sources, or an unavailable QQ service, use Kugou.
The fallback compares up to four valid timelines: a metadata-leading outlier
is rejected only when at least three documents agree. Source-specific cache
keys and schema 6 invalidate old incorrectly chosen documents. No fixed lead
is applied by default; a positive LRC file offset advances timestamps.
The transport-row calibration popover exposes earlier/later/reset/retry actions;
per-song adjustments persist separately from the provider cache.

The lyric surface is 240 points by default with a cover capped at 140 points.
The full layout gives roughly 42% to the cover/spectrum/progress column and the
rest to lyrics and transport. Title and artist share one row; four fixed lyric
rows remain readable without a fading mask (three in the compact layout).
Album colors are lifted in saturation and brightness while monochrome covers stay
neutral.
The island passes its outward side-wall insets to the lyric view, which leaves
32 points inside each visible wall (22 in compact mode). Non-notched layouts
subtract the inset already supplied by their wider surface. Progress and transport
therefore retain clear space at the lower corners without changing panel height.
The entire island, including its shoulders, uses the cover palette while lyrics
are visible. After the user enables it, the spectrum captures the source app's
audio with a private, unmuted Core Audio process tap on macOS 14.2+ (including
helper processes with the same bundle prefix). macOS 14.0–14.1 uses an audio-only
ScreenCaptureKit stream. Permission is checked by the audio capture backend,
rather than blocking system-audio access with a screen-recording preflight.
Interleaved/planar Float32, Float64, Int16 and Int32 PCM are decoded and analyzed
with a Hann-windowed FFT and
24 logarithmic bands. The display interpolates these measurements into 56
bottom-aligned mirrored columns; it never generates animation from elapsed time.
It has no microphone/video output and no file/network sink.
Paused, hidden, stale and silent streams display zero energy.
The monitor marks capture as running only after receiving samples. A three-second
sample timeout retries the connection, with at most three attempts per presentation
or resume. Missing/silent input has an explicit retry control and diagnostic help.

Visible synced lyrics bypass the general low-power 60-second UI refresh interval.
They refresh every second and completed HTTP lyric requests schedule an immediate
render. Hidden lyrics retain the normal suspension behavior.

The full-expanded toolbar uses a native tracking rectangle over the entire bar.
Its view rejects hit testing and observes local window events without consuming
them. Entering a child button does not end toolbar hover. The padded 32-point control labels and module tabs are rectangular click
targets, so their blank edges respond just like the icon.

The native panel settles to its actual content size after every expand/collapse
animation. Cycler gutters are reserved only when the arrows are enabled. Mouse
routing uses the same pill path as rendering: viewport padding, outward-corner
cutouts and shadows pass clicks through to other applications. Entering the
visible surface restores interaction; a drag begun inside keeps its mouse-up
even when released outside. Hover validation uses this geometry on every display.

## Fixed display

General and Advanced settings share a display picker. A selected display UUID
persists across reconnects and relaunches; older numeric IDs remain readable.
Cursor movement and application focus never select a target screen. An empty
selection uses the menu-bar display (`NSScreen.screens.first`, not the focused
window's `NSScreen.main`). If a selected monitor is unavailable, the island
temporarily uses the menu-bar display without overwriting the saved choice.


## Native player scenes (build 29)

The source analysis used Folia commit `08eda1fe057793463e7fd5b43781081cdcd8b800`:
https://github.com/chthollyphile/folia-major/blob/08eda1fe057793463e7fd5b43781081cdcd8b800/src/types/visualizerModes.ts
The reference has 14 built-in lyric modes, six background modes and an extensible
React renderer using Motion, Three.js and Pixi. Its source is AGPL-3.0. No Folia
code, assets, renderer or models are included in SuperIsland. The user chose
independent lightweight native adaptations inside the existing island; these
retain the style ideas, rather than reproducing the full-screen GPU scenes.
The original two-column player is a separate “原版” option.
All other options compose the entire content area: compact cover and album
metadata, a full-width lyric stage, a centered bottom player capsule and a
mode-aware backdrop that fills the outer island, including its shoulders.
The reference's full-screen composition is scaled for the existing window;
its JavaScript/GPU runtime and assets are not embedded.

The “歌词样式与校准” button opens a persistent native style picker. Folia's
floating-player capsule informed the new chrome: round play/pause at the left,
song/time/progress in the middle, previous/next and settings at the right.
During playback, leaving the scene fades the capsule to a thin progress track.
Hover, keyboard navigation, pause, scrubbing and an open calibration popover
reveal the full controls. Track coordinates never change during this transition;
revealing the controls cannot move the first click or cancel a drag. A native
whole-rectangle tracking view ignores hit tests and handles child view rebuilds.
Style names appear in the picker only, never as a top-right scene label.

| Reference | Native scene composition |
| --- | --- |
| 流光 / classic | Centered large timed-word line, context, fluid cover-color backdrop |
| 心象 / cadenza | Full-width scattered glyphs and focus circles, contextual word cloud |
| 云阶 / partita | Vertical glyph columns, staircase offsets and guide lines |
| 浮名 / fume | Full-width oversized foreground typography and layered context |
| 群唱 / cappella | Full-width alternating chat bubbles, avatars, tinted chat backdrop |
| 倾诉 / tilt | Large horizontal active phrase with tilted context lines |
| 回环 / claddagh | Elliptical lyric arrangement and native-clock orbit point |
| 镜台 / diorama | Scrolling perspective lyric corridor, subtle depth frames and bright album colors |
| 时计 / pendolo | Left mechanical gears and clock, right lyrics, dark themed backdrop |
| 商籁 / sonnet | Entire-window poster borders, corner marks, serif typography and indices |
| 凝彩 / tempera | Entire-window split color fields, large index and dividing rules |
| 绘光 / lumiere | Dark stage with full-window moving beams and measured audio response |
| 莫奈 / monet | Fully opaque album-color background, metadata/lyrics at left and tilted cover at right |
| 静止 / still | Original album-color gradient, three centered static lines, no decorative motion |

True word intervals also drive native word lift, scale and glow. Full-stage
line transitions, scrolling rows, perspective transforms, continuously turning
mechanical gears and measured-audio light beams supply the scene motion.
Lyric rows retain their source-index identity while moving through the viewport.
Fixed-slot compositions transition only their lyric labels. Borders, guides,
cloud decorations and gears stay outside that transition; no whole-scene ID
changes on a new line. Decorative motion uses a separate pauseable clock, so
lyric changes and seeking cannot restart or jump it. No beat signal or word
timing is invented. The top-right audio meter has been removed. The Still scene throttles its timeline to two updates per
second. System Reduce Motion disables decorative movement. Decorative layers reject
input. Tapping a line always seeks through the same native manager. Only true
QRC intervals animate word progress, including in glyph-based modes. The 3D,
volumetric and GPU effects remain lightweight native visual adaptations.

### Toolbar scope

Only the synced-lyrics page overlays and auto-hides its top toolbar. Home,
built-in modules and other extensions retain the original visible toolbar in
a vertical stack, including its layout space. Notched displays retain their
separate shoulder area. Switching out of lyrics restores fixed chrome, so it
cannot overlap the extension's first-row actions.

### True word timings

QQ lookup uses anonymous `DoSearchForQQMusicLite` with search type 7 (the older
desktop search can return no candidates). Exact title, artist, album preference
and recording duration checks remain. For a matched song ID, `GetPlayLyricInfo`
with `qrc: 1` supplies QRC. A vendored MIT-licensed qrc-decoder 1.0.2 and
pako 2.1.0 decode it locally, without Node/browser globals or an extra server.
Their notices ship with the extension. Input and decompressed output are bounded.

Each lyric row optionally carries `words: [{time, endTime, text}]`, in absolute
seconds. File offsets apply to both lines and words; the native calibration
applies once at presentation. Native Text preserves shaping and spaces while
coloring each word over its actual interval. No character-count timing is
invented. The bridge rejects malformed, reordered or text-mismatched words and
keeps their plain line. If QRC is absent/refused/invalid, the exact same QQ
recording's LRC remains the fallback. Other providers retain the existing LRC
fallback. Schema 6 fetches new documents without discarding per-track offsets.
The UI identifies whether the current song has word or line timing.

### Seeking

All built-in and extension progress bars use the same native 28-point control.
The visible track stays thin and has a persistent thumb. First clicks work in
the nonactivating island; the whole control accepts pointer input. A drag owns
its entire mouse sequence and can release beyond the track with clamped values.
It previews time and lyrics without issuing player commands. Mouse-up commits
once; Escape, teardown and track changes cancel the preview. Arrow keys and
VoiceOver adjust five seconds; Home/End jump to the ends.

The player clock remains separate from the preview. On commit, a bounded
five-second confirmation window ignores old source positions until the new
position is acknowledged, and recovers to the actual player if it is rejected.
The bundled MediaRemote Adapter and Perl script are pinned together to v0.7.5
(revision cc5d90aa0b633acc34a8c44197b5fcb309958935, BSD-3-Clause).
Upstream PR #34 corrects the elapsed-time command's return type and waits for
the asynchronous command; the old framework could exit before a seek executed.
A nonzero adapter exit now immediately releases optimistic seek confirmation,
restores the previous clock and fetches the player's actual position. A success
exit still waits for a player snapshot to acknowledge the requested position.
Rapid seeks cancel commands that have not started, and changing tracks cancels
queued seeks. Island swipe/tap/long-press actions are suppressed during the
progress gesture and its mouse-up, preventing accidental module switches.

Mouse scrubbing keeps first-responder ownership for Escape and arrow keys but
suppresses the blue keyboard-navigation ring. Keyboard navigation still shows
its focus indication. The native slider exposes its accessibility role/value.

The lyrics calibration/style popover acquires a UUID-owned, module-scoped
presentation hold before opening. It releases the hold on closing, anchor
teardown or page disappearance, then resumes the normal dismissal policy.
Multiple presenters cannot release each other's tokens, persistent module holds
remain intact, and the user's full-expanded lock preference is never changed.
