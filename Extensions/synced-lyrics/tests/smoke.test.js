"use strict";

var assert = require("node:assert/strict");

var registeredModule = null;
var preferredHeight = null;
global.setInterval = function() { return 1; };
global.clearInterval = function() {};
global.SuperIsland = {
  settings: {
    get: function(key) {
      var values = {
        cleanVideoTitles: true,
        showArtwork: true,
        foregroundWhilePlaying: true,
        simplifiedChinese: true,
        cacheLyrics: false,
        globalOffsetSeconds: 0.4,
        fullViewLineCount: "5"
      };
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    },
    set: function() {}
  },
  store: {
    get: function() { return null; },
    set: function() {}
  },
  system: {
    getNowPlaying: function() { return null; }
  },
  http: {
    fetch: async function() { return { status: 404, data: null, text: "" }; }
  },
  island: {
    activate: function() {},
    setPreferredHeight: function(value) { preferredHeight = value; }
  },
  playFeedback: function() {},
  registerModule: function(moduleConfig) { registeredModule = moduleConfig; }
};

function node(type, args) { return { type: type, args: Array.from(args) }; }
global.View = new Proxy({}, {
  get: function(_target, property) {
    return function() { return node(property, arguments); };
  }
});

var lyrics = require("../index.js");

assert.equal(lyrics.cleanTrackTitle("Coldplay - Yellow (Official Video)"), "Coldplay - Yellow");
assert.equal(lyrics.simplifyChinese("還是會想你，撥開迷霧抓住你的聲音"), "还是会想你，拨开迷雾抓住你的声音");

var parsed = lyrics.parseLrc([
  "[00:01.20]First line",
  "[00:03.500][00:05.00]Second line",
  "[ar:Someone]"
].join("\n"));

assert.deepEqual(parsed, [
  { time: 1.2, text: "First line" },
  { time: 3.5, text: "Second line" },
  { time: 5, text: "Second line" }
]);

var candidates = [
  { id: "1", accesskey: "a", song: "Yellow", singer: "Another Artist", duration: 260000, score: 80 },
  { id: "2", accesskey: "b", song: "Yellow", singer: "Coldplay", duration: 267000, score: 60 }
];
assert.equal(lyrics.rankedKugouCandidates(candidates, {
  title: "Yellow",
  artist: "Coldplay",
  album: "Parachutes",
  duration: 266
})[0], candidates[1]);

assert.equal(
  lyrics.decodeBase64Utf8(Buffer.from("[00:01.00]愿与愁", "utf8").toString("base64")),
  "[00:01.00]愿与愁"
);

assert.equal(lyrics.effectiveElapsedSeconds({
  elapsedSeconds: 10,
  durationSeconds: 100,
  capturedAtEpochMs: 1000,
  playbackState: "playing"
}, 3500), 12.5);

lyrics.resetPlaybackClock();
var frozenSnapshot = {
  bundleIdentifier: "test.player",
  trackIdentifier: "frozen-progress",
  title: "Frozen Progress",
  artist: "Test Artist",
  elapsedSeconds: 49,
  durationSeconds: 100,
  capturedAtEpochMs: 1000,
  playbackState: "playing"
};
var frozenIdentity = lyrics.trackIdentity(frozenSnapshot);
assert.equal(lyrics.updatePlaybackClock(frozenSnapshot, frozenIdentity, 1000), 49);
frozenSnapshot.capturedAtEpochMs = 2000;
assert.equal(lyrics.updatePlaybackClock(frozenSnapshot, frozenIdentity, 2000), 50);
assert.equal(lyrics.effectiveElapsedSeconds(frozenSnapshot, 2500), 50.5);
frozenSnapshot.playbackState = "paused";
frozenSnapshot.capturedAtEpochMs = 3000;
assert.equal(lyrics.updatePlaybackClock(frozenSnapshot, frozenIdentity, 3000), 51);
assert.equal(lyrics.effectiveElapsedSeconds(frozenSnapshot, 9000), 51);
lyrics.resetPlaybackClock();

lyrics.state.snapshot = {
  elapsedSeconds: 3.7,
  durationSeconds: 100,
  capturedAtEpochMs: Date.now(),
  playbackState: "paused",
  title: "Test"
};
lyrics.state.lyricsKey = "test";
lyrics.applyLyricsPayload({
  trackName: "Test",
  artistName: "Artist",
  syncedLyrics: "[00:01.00]One\n[00:03.50]Two\n[00:08.00]Three"
}, "test", "test");
assert.equal(lyrics.currentLyricIndex(Date.now()), 1);

assert.ok(registeredModule);
assert.equal(typeof registeredModule.compact, "function");
assert.equal(typeof registeredModule.expanded, "function");
assert.equal(typeof registeredModule.fullExpanded, "function");
assert.ok(registeredModule.compact());
assert.ok(registeredModule.expanded());
assert.ok(registeredModule.fullExpanded());
assert.deepEqual(preferredHeight, { expanded: 180, fullExpanded: 240 });

var expandedJSON = JSON.stringify(registeredModule.expanded());
assert.ok(expandedJSON.includes("nowPlayingLyrics"));
assert.ok(!expandedJSON.includes("播放控制在主页"));
assert.ok(expandedJSON.includes("offsetSeconds"));
assert.ok(!expandedJSON.includes("同步歌词 · 简体"));

// The host clock is authoritative even when a seek repeats an old value.
lyrics.resetPlaybackClock();
var authoritative = Object.assign({}, frozenSnapshot, {
  playbackState: "playing", elapsedSeconds: 63, playbackRate: 0.5,
  capturedAtEpochMs: 1000, clockAuthoritative: true
});
assert.equal(lyrics.updatePlaybackClock(authoritative, frozenIdentity, 1000), 63);
assert.equal(lyrics.effectiveElapsedSeconds(authoritative, 5000), 65);
authoritative.elapsedSeconds = 0;
authoritative.capturedAtEpochMs = 5000;
assert.equal(lyrics.updatePlaybackClock(authoritative, frozenIdentity, 5000), 0);
authoritative.playbackState = "paused";
authoritative.elapsedSeconds = 12;
assert.equal(lyrics.updatePlaybackClock(authoritative, frozenIdentity, 5000), 12);
assert.equal(lyrics.effectiveElapsedSeconds(authoritative, 65000), 12);
// A long gap between polls must not discard most of the elapsed time.
lyrics.resetPlaybackClock();
frozenSnapshot.playbackState = "playing";
frozenSnapshot.elapsedSeconds = 0;
frozenSnapshot.capturedAtEpochMs = 1000;
lyrics.updatePlaybackClock(frozenSnapshot, frozenIdentity, 1000);
frozenSnapshot.capturedAtEpochMs = 61000;
assert.equal(lyrics.updatePlaybackClock(frozenSnapshot, frozenIdentity, 61000), 60);
console.log("synced-lyrics smoke tests passed");
