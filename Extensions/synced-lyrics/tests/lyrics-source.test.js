"use strict";
const assert = require("node:assert/strict");
const settings = { globalOffsetSeconds: 0.4, cacheLyrics: true };
const store = { cacheSchemaVersion: 4, lyricsCache: { old: { syncedLyrics: "wrong" } },
  trackOffsets: { "彩虹||周杰伦||我很忙||263": 1 }, interfaceMigrationVersion: 3 };
let config, handler;
global.setInterval = () => 1;
global.clearInterval = () => {};
global.SuperIsland = {
  settings: { get: key => settings[key], set: (key, value) => { settings[key] = value; } },
  store: { get: key => store[key], set: (key, value) => { store[key] = value; } },
  http: { fetch: (...args) => handler(...args) },
  system: { getNowPlaying: () => null },
  registerModule: value => { config = value; },
  island: { setPreferredHeight() {}, activate() {} }, playFeedback() {}
};
const lyrics = require("../index.js");
const snapshot = { title: "彩虹", artist: "周杰伦", album: "我很忙", durationSeconds: 263,
  bundleIdentifier: "com.tencent.QQMusicMac" };
const metadata = { title: "彩虹", artist: "周杰伦", album: "我很忙", duration: 263 };
const qq = (mid, album, interval = 263) => ({ mid, name: "彩虹", singer: [{ name: "周杰伦" }], album: { name: album }, interval });
const encoded = text => Buffer.from(text).toString("base64");
const response = data => ({ status: 200, data });

async function main() {
  assert.equal(settings.globalOffsetSeconds, 0, "retire the old forced lead");
  assert.deepEqual(lyrics.state.cache, {}, "invalidate incorrect old documents");
  assert.equal(store.trackOffsets["彩虹||周杰伦||我很忙||263"], 1, "keep manual calibration");
  assert.equal(store.cacheSchemaVersion, 6);
  assert.equal(lyrics.parseLrc("[offset:500]\n[00:10.00]test")[0].time, 9.5);
  assert.equal(lyrics.parseLrc("[offset:-500]\n[00:10.00]test")[0].time, 10.5);
  assert.notEqual(lyrics.lyricsCacheKey(snapshot), lyrics.lyricsCacheKey({ ...snapshot, bundleIdentifier: "other.player" }));
  assert.notEqual(lyrics.trackIdentity(snapshot), lyrics.trackIdentity({ ...snapshot, album: "另一个录音版本" }));
  const songs = [qq("compilation", "精选"), { ...qq("wrong", "我很忙"), singer: [{ name: "其他人" }] },
    { ...qq("live", "我很忙", 290) }, { ...qq("medley", "我很忙"), name: "彩虹 + 轨迹" }];
  songs[0].grp = [qq("album", "我很忙")];
  assert.deepEqual(lyrics.rankedQQCandidates(songs, metadata).map(song => song.mid), ["album", "compilation"]);

  const requests = [];
  handler = async (url, options) => {
    requests.push(url);
    assert.equal(options.headers.Referer, "https://y.qq.com/");
    if (url.includes("musicu.fcg")) {
      assert.equal(options.method, "POST");
      return response({ req_1: { code: 0, data: { body: { song: { list: songs } } } } });
    }
    assert.ok(url.includes("songmid=album"), "choose the matching album recording");
    return response("MusicJsonCallback_lrc(" + JSON.stringify({ code: 0, lyric: encoded("[03:52.73]correct timeline") }) + ");");
  };
  const result = await lyrics.lookupLyricsPayload(snapshot);
  assert.equal(result.source, "qqmusic");
  assert.equal(lyrics.parseLrc(result.payload.syncedLyrics)[0].time, 232.73);
  assert.equal(requests.length, 2, "do not mix in another platform's lyric when QQ succeeds");

  const timeline = offset => Array.from({ length: 10 }, (_, i) => ({ time: 20 + i * 10 + offset, text: "测试歌曲句子" + i }));
  const docs = [{ lines: timeline(8), result: "outlier" }, { lines: timeline(0), result: "correct" },
    { lines: timeline(0.1), result: "agrees" }, { lines: timeline(0), result: "agrees again" }];
  assert.equal(lyrics.selectKugouDocument(docs).result, "correct", "reject an 8s outlier despite its highest metadata rank");
  assert.equal(lyrics.selectKugouDocument(docs.slice(0, 2)).result, "outlier", "insufficient agreement must not invent a correction");

  handler = async url => {
    if (url.includes("musicu.fcg")) return { status: 503, data: null };
    if (url.includes("/search?")) return response({ candidates: docs.map((_, i) => ({
      id: String(i), accesskey: "key", song: "彩虹", singer: "周杰伦", duration: 263000, score: 60 - i
    })) });
    const index = Number(new URL(url).searchParams.get("id"));
    return response({ content: encoded(docs[index].lines.map(line => "[" + Math.floor(line.time / 60)
      + ":" + (line.time % 60).toFixed(2).padStart(5, "0") + "]" + line.text).join("\n")) });
  };
  const fallback = await lyrics.lookupLyricsPayload(snapshot);
  assert.equal(fallback.source, "kugou");
  assert.equal(lyrics.parseLrc(fallback.payload.syncedLyrics)[0].time, 20);

  lyrics.state.snapshot = snapshot;
  lyrics.state.lyricsKey = lyrics.lyricsCacheKey(snapshot);
  config.onAction("offset-earlier");
  assert.equal(store.trackOffsets["彩虹||周杰伦||我很忙||263"], 1.5);
  config.onAction("offset-later");
  assert.equal(store.trackOffsets["彩虹||周杰伦||我很忙||263"], 1);
  config.onAction("offset-reset");
  assert.equal(store.trackOffsets["彩虹||周杰伦||我很忙||263"], undefined);
  console.log("Lyric provider, album/version, fallback consensus, cache migration and calibration tests passed");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
