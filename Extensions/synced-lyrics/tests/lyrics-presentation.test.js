"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function harness(file, settings, options = {}) {
  let config, snapshot;
  const events = [];
  const context = {
    console, Date, Map, Proxy, Promise, URL, encodeURIComponent,
    setInterval: () => 1, clearInterval() {}, setTimeout, clearTimeout
  };
  context.globalThis = context;
  context.module = { exports: {} };
  context.View = new Proxy({}, { get: (_, type) => (...args) => ({ type, args }) });
  const island = { activate: autoDismiss => events.push(["reveal", autoDismiss]), setPreferredHeight() {} };
  if (!options.legacy) island.select = () => events.push(["select"]);
  context.SuperIsland = {
    settings: { get: key => settings[key], set() {} },
    store: { get: () => null, set() {} },
    system: { getNowPlaying: () => snapshot },
    http: { fetch: async () => ({ status: 404, data: null }) },
    island, registerModule: value => { config = value; }, playFeedback() {}
  };
  let source = fs.readFileSync(file, "utf8");
  if (file.endsWith("bundle.js")) {
    // Expose the existing packaged CommonJS export for this test only.
    const entry = "var import_index = __toESM(require_index());";
    assert.ok(source.includes(entry));
    source = source.replace(entry, "globalThis.__lyricsTestAPI = require_index();\n" + entry);
  }
  vm.runInNewContext(source, context, { filename: file });
  const api = context.__lyricsTestAPI || context.module.exports;
  return {
    api, config, events,
    async match(title, playing = true) {
      snapshot = { title, artist: "任贤齐", album: "test", durationSeconds: 266,
        elapsedSeconds: 47, playbackState: playing ? "playing" : "paused",
        capturedAtEpochMs: Date.now(), bundleIdentifier: "test.player", clockAuthoritative: true };
      const key = api.lyricsCacheKey(snapshot);
      api.state.cache[key] = { trackName: title, artistName: snapshot.artist, duration: 266,
        syncedLyrics: "[00:01.00]当前歌词", lyricSource: "test" };
      await api.tick();
      assert.equal(api.state.lookupStatus, "synced");
    }
  };
}

async function run(file) {
  for (const foreground of [false, true]) {
    for (const reveal of [false, true]) {
      const settings = { foregroundWhilePlaying: foreground, autoRevealOnTrackChange: reveal, cacheLyrics: true };
      const h = harness(file, settings);
      await h.match("心太软");
      await h.match("伤心太平洋");
      const expected = reveal ? [["reveal", true], ["reveal", true]] : foreground ? [["select"], ["select"]] : [];
      assert.deepEqual(h.events, expected, `foreground=${foreground}, reveal=${reveal}`);
      await h.api.tick();
      h.config.compact();
      h.config.minimalCompact.leading();
      assert.deepEqual(h.events, expected, "polls and rendering cannot reveal again");
      const leading = h.config.minimalCompact.leading();
      assert.equal(leading.type, "frame");
      assert.equal(leading.args[0].type, "nowPlayingArtwork");
      assert.equal(leading.args[0].args[0].size, 18);
      assert.equal(h.config.compact().args[0][0].type, "nowPlayingArtwork");
      await h.match("天涯", false);
      assert.deepEqual(h.events, expected, "paused track changes never reveal or steal foreground");
    }
  }
  const defaults = harness(file, { cacheLyrics: true });
  await defaults.match("天涯");
  assert.deepEqual(defaults.events, [["select"]], "default foreground never expands");
  const legacy = harness(file, { foregroundWhilePlaying: true, autoRevealOnTrackChange: false, cacheLyrics: true }, { legacy: true });
  await legacy.match("天涯");
  assert.deepEqual(legacy.events, [], "old hosts must not fall back to an expanding activation");
}
(async () => {
  await run(require.resolve("../index.js"));
  await run(require.resolve("../bundle.js"));
  console.log("Lyrics source and bundle: foreground/reveal combinations, repeated polling, paused changes, legacy host and compact artwork passed");
})().catch(error => { console.error(error); process.exitCode = 1; });
