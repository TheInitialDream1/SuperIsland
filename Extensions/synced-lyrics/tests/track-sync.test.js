"use strict";
const assert = require("node:assert/strict");
let moduleConfig, snapshot = null;
const pending = [];
global.setInterval = () => 1;
global.clearInterval = () => {};
global.SuperIsland = {
  settings: { get: key => key === "cacheLyrics" ? false : null, set() {} },
  store: { get: () => null, set() {} },
  system: { getNowPlaying: () => snapshot },
  http: { fetch: url => new Promise(resolve => pending.push({ url, resolve })) },
  island: { activate() {}, setPreferredHeight() {} },
  registerModule: config => { moduleConfig = config; }, playFeedback() {}
};
const fs = require("node:fs");
const vm = require("node:vm");
const hostSource = fs.readFileSync(require.resolve("../../../ExtensionHost/ExtensionJSRuntime.swift"), "utf8");
const hostLyricsAPI = vm.runInNewContext("(" + hostSource.match(/nowPlayingLyrics: (function\(opts\).*),/)[1] + ")");
global.View = new Proxy({}, { get: (_, type) => type === "nowPlayingLyrics"
  ? hostLyricsAPI : (...args) => ({ type, args }) });
const lyrics = require("../index.js");
const flush = () => new Promise(resolve => setImmediate(resolve));
const song = title => ({ title, artist: "任贤齐", bundleIdentifier: "test.player",
  durationSeconds: 266, elapsedSeconds: 47, playbackState: "playing",
  capturedAtEpochMs: Date.now(), clockAuthoritative: true });
const candidate = (title, id) => ({ id, accesskey: "key", song: title, singer: "任贤齐", duration: 266000 });
const respond = (request, data) => request.resolve({ status: 200, data });

async function main() {
  // Switch tracks during a pending HTTP request. The polling lock must be free.
  snapshot = song("伤心太平洋");
  await lyrics.tick();
  const firstSearch = pending.shift();
  snapshot = song("心太软");
  moduleConfig.fullExpanded(); // Host render must refresh even without JS timers.
  assert.equal(lyrics.state.snapshot.title, "心太软");
  assert.equal(lyrics.state.lookupStatus, "loading");
  const secondSearch = pending.shift();
  respond(firstSearch, { candidates: [candidate("伤心太平洋", "first")] });
  await flush();
  const firstDownload = pending.shift();
  respond(firstDownload, { content: Buffer.from("[00:01.00]旧歌歌词").toString("base64") });
  await flush();
  assert.deepEqual(lyrics.state.syncedLines, []);
  respond(secondSearch, { candidates: [candidate("心太软", "second")] });
  await flush();
  respond(pending.shift(), { content: Buffer.from("[00:10.00]当前歌歌词").toString("base64") });
  await flush();
  assert.equal(lyrics.state.syncedLines[0].text, "当前歌歌词");
  const node = moduleConfig.fullExpanded();
  assert.equal(node.trackTitle, "心太软");
  assert.equal(node.trackArtist, "任贤齐");

  // The actual player changes before the suspended timer has observed it.
  snapshot = song("伤心太平洋");
  await lyrics.tick();
  const lateSearch = pending.shift();
  respond(lateSearch, { candidates: [candidate("伤心太平洋", "late")] });
  await flush();
  const lateDownload = pending.shift();
  snapshot = song("天涯");
  respond(lateDownload, { content: Buffer.from("[00:01.00]不应显示").toString("base64") });
  await flush();
  assert.equal(lyrics.state.snapshot.title, "天涯");
  assert.deepEqual(lyrics.state.syncedLines, []);

  assert.equal(lyrics.payloadMatchesSnapshot({ trackName: "启程", artistName: "水木年华", duration: 292 }, snapshot), false);
  assert.equal(lyrics.rankedKugouCandidates([candidate("天涯", "valid"),
    { ...candidate("天涯", "wrong"), singer: "其他歌手" },
    { ...candidate("天涯", "live"), duration: 360000 }],
    { title: "天涯", artist: "任贤齐", duration: 266 }).length, 1);
  const shifted = lyrics.parseLrc("[offset:500]\n[00:10.00]歌词");
  assert.equal(shifted[0].time, 9.5);
  console.log("Track switch, suspended timer, late response, match validation and LRC offset tests passed");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
