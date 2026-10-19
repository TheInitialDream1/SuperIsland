"use strict";
const assert = require("node:assert/strict");
const fixture = require("./fixtures/word-lyrics.json");
global.setInterval = () => 1;
global.clearInterval = () => {};
let request;
global.SuperIsland = {
  settings: { get() {}, set() {} }, store: { get() {}, set() {} },
  registerModule() {}, island: { setPreferredHeight() {} },
  http: { fetch: (...args) => request(...args) }, system: { getNowPlaying: () => null }
};
const api = require("../index.js");
const snapshot = { title: "测试歌曲", artist: "测试歌手", album: "测试专辑", durationSeconds: 180,
  bundleIdentifier: "com.tencent.QQMusicMac" };
const song = { id: 100, mid: "test", title: snapshot.title, singer: [{ name: snapshot.artist }],
  album: { name: snapshot.album }, interval: 180 };
const response = data => ({ status: 200, data });

async function main() {
  const { decryptQrc } = await import("../vendor/qrc-codec.mjs");
  global.__superIslandDecodeQRC = decryptQrc;
  assert.equal(decryptQrc(fixture.encrypted), fixture.text);
  assert.throws(() => decryptQrc("not-a-hex-payload"));
  assert.throws(() => decryptQrc("aa"));
  const lines = api.parseQrc(fixture.text);
  assert.equal(lines.length, 2);
  assert.deepEqual(lines[0], { time: 10, text: "你好呀", words: [
    { text: "你", time: 10, endTime: 10.3 },
    { text: "好", time: 10.5, endTime: 11 },
    { text: "呀", time: 12, endTime: 13 }
  ] });
  assert.equal(lines[1].text, "A&B", "decode XML once");
  assert.equal(api.parseQrc("[offset:500]\n[10000,1000]字(10000,1000)")[0].words[0].time, 9.5);
  assert.deepEqual(api.parseQrc("[10000,1000]字(10000,1000)untimed")[0].words, [], "do not invent trailing timings");
  assert.deepEqual(api.parseQrc("[00:10]plain LRC"), []);

  const calls = [];
  request = async (url, options) => {
    calls.push(url);
    const body = JSON.parse(options.body);
    if (body.req_1.method.startsWith("DoSearch")) {
      assert.equal(body.req_1.param.search_type, 7);
      return response({ req_1: { code: 0, data: { body: { item_song: [song] } } } });
    }
    assert.equal(body.req_1.method, "GetPlayLyricInfo");
    assert.equal(body.req_1.param.songID, 100);
    assert.equal(body.req_1.param.qrc, 1);
    return response({ req_1: { code: 0, data: { lyric: fixture.encrypted } } });
  };
  const result = await api.lookupLyricsPayload(snapshot);
  assert.equal(result.source, "qqmusic");
  assert.equal(result.payload.wordSyncedLyrics, fixture.text);
  assert.equal(calls.length, 2, "do not download redundant LRC when QRC succeeds");
  api.applyLyricsPayload(result.payload, "word-test", "qqmusic");
  assert.deepEqual(api.state.syncedLines[0].words, lines[0].words);

  request = async (url, options) => {
    if (!options.body) return response({ code: 0, lyric: Buffer.from("[00:10.00]fallback line").toString("base64") });
    const method = JSON.parse(options.body).req_1.method;
    return method.startsWith("DoSearch")
      ? response({ req_1: { code: 0, data: { body: { item_song: [song] } } } })
      : response({ req_1: { code: 403, data: {} } });
  };
  const fallback = await api.lookupLyricsPayload(snapshot);
  assert.equal(fallback.source, "qqmusic", "unavailable QRC must not switch recordings or platforms");
  assert.equal(fallback.payload.wordSyncedLyrics, "");
  api.applyLyricsPayload(fallback.payload, "line-test", "qqmusic");
  assert.equal(api.state.syncedLines[0].text, "fallback line");
  assert.equal(api.state.syncedLines[0].words, undefined);
  console.log("Real QRC decoding, word gaps, entity handling, provider request, cache and LRC fallback passed");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
