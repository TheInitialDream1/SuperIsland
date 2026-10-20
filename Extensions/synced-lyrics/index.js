"use strict";

var EXTENSION_VERSION = "0.10.0";
var KUGOU_LYRICS_ROOT = "https://lyrics.kugou.com";
var POLL_INTERVAL_MS = 1000;
var MAX_CACHE_ENTRIES = 16;
var MAX_PLAIN_LINES = 80;
var CACHE_SCHEMA_VERSION = 6;
var DEFAULT_FULL_HEIGHT = 240;
var DEFAULT_SYNC_LEAD_SECONDS = 0;

var state = {
  snapshot: null,
  trackIdentity: "",
  lyricsKey: "",
  lookupStatus: "idle",
  syncedLines: [],
  plainLines: [],
  instrumental: false,
  errorMessage: "",
  match: null,
  requestSerial: 0,
  cache: {},
  cacheOrder: [],
  trackOffsets: {},
  playbackClock: {
    initialized: false,
    identity: "",
    positionSeconds: 0,
    updatedAtEpochMs: 0,
    observedElapsedSeconds: 0,
    observedCapturedAtEpochMs: 0,
    playing: false,
    rate: 1
  }
};

var pollTimer = null;
var tickInFlight = false;
var traditionalToSimplifiedConverter = null;
var didInitializeChineseConverter = false;

function asString(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function trimString(value) {
  return asString(value).trim();
}

function toNumber(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  var parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function fallbackSimplifyChinese(value) {
  var replacements = {
    "還": "还", "會": "会", "開": "开", "聲": "声", "給": "给", "單": "单",
    "撥": "拨", "霧": "雾", "過": "过", "裡": "里", "這": "这", "個": "个",
    "們": "们", "來": "来", "時": "时", "說": "说", "聽": "听", "愛": "爱",
    "夢": "梦", "風": "风", "離": "离", "讓": "让", "後": "后", "從": "从",
    "對": "对", "為": "为", "與": "与", "無": "无", "點": "点", "總": "总",
    "當": "当", "見": "见", "長": "长", "間": "间", "難": "难", "樣": "样",
    "發": "发", "現": "现", "萬": "万", "歲": "岁", "國": "国", "畫": "画",
    "詞": "词", "樂": "乐", "頭": "头", "進": "进", "遠": "远", "終": "终",
    "記": "记", "錯": "错", "願": "愿", "淚": "泪", "舊": "旧",
    "體": "体", "門": "门", "問": "问", "處": "处", "別": "别", "寫": "写",
    "隻": "只", "雙": "双", "親": "亲", "雲": "云", "轉": "转", "動": "动"
  };
  return asString(value).replace(/[\u3400-\u9fff]/g, function(character) {
    return replacements[character] || character;
  });
}

function simplifyChinese(value) {
  var text = asString(value);
  if (!text || !settingBool("simplifiedChinese", true)) return text;

  if (!didInitializeChineseConverter) {
    didInitializeChineseConverter = true;
    try {
      if (typeof OpenCC !== "undefined" && OpenCC && typeof OpenCC.Converter === "function") {
        traditionalToSimplifiedConverter = OpenCC.Converter({ from: "t", to: "cn" });
      }
    } catch (error) {
      traditionalToSimplifiedConverter = null;
      logWarning("简体转换器初始化失败，使用轻量转换");
    }
  }

  if (traditionalToSimplifiedConverter) {
    try { return traditionalToSimplifiedConverter(text); } catch (error) {}
  }
  return fallbackSimplifyChinese(text);
}

function settingBool(key, fallback) {
  var value = SuperIsland.settings.get(key);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

function settingNumber(key, fallback) {
  return toNumber(SuperIsland.settings.get(key), fallback);
}

function applyWindowHeightPreference() {
  if (!SuperIsland.island || typeof SuperIsland.island.setPreferredHeight !== "function") return;
  var fullExpandedHeight = clamp(settingNumber("windowHeight", DEFAULT_FULL_HEIGHT), 200, 300);
  SuperIsland.island.setPreferredHeight({
    expanded: 180,
    fullExpanded: fullExpandedHeight
  });
}

function storeGet(key, fallback) {
  var value = SuperIsland.store.get(key);
  return value === null || value === undefined ? fallback : value;
}

function storeSet(key, value) {
  SuperIsland.store.set(key, value);
}

function logInfo(message) {
  if (typeof console !== "undefined" && console && typeof console.log === "function") {
    console.log("[synced-lyrics] " + trimString(message));
  }
}

function logWarning(message) {
  if (typeof console !== "undefined" && console && typeof console.warn === "function") {
    console.warn("[synced-lyrics] " + trimString(message));
  } else {
    logInfo("warning: " + trimString(message));
  }
}

function normalizedText(value) {
  return trimString(value)
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTrackTitle(value) {
  var title = trimString(value);
  if (!settingBool("cleanVideoTitles", true)) return title;

  title = title
    .replace(/\s*[\[(]\s*(official\s*)?(music\s*)?(video|audio|mv|visuali[sz]er|lyrics?|lyric\s*video|hd|4k)\s*[\])]\s*/gi, " ")
    .replace(/\s*[-|]\s*(official\s*)?(music\s*)?(video|audio|mv|visuali[sz]er|lyrics?|lyric\s*video)\s*$/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return title;
}

function lookupMetadata(snapshot) {
  var title = cleanTrackTitle(snapshot && snapshot.title);
  var artist = trimString(snapshot && snapshot.artist);
  var album = trimString(snapshot && snapshot.album);

  if (!artist && title.indexOf(" - ") > 0) {
    var parts = title.split(" - ");
    if (parts.length === 2) {
      artist = trimString(parts[0]);
      title = trimString(parts[1]);
    }
  }

  return {
    title: title,
    artist: artist,
    album: album,
    duration: Math.max(0, Math.round(toNumber(snapshot && snapshot.durationSeconds, 0)))
  };
}

function trackIdentity(snapshot) {
  if (!snapshot) return "";
  var identifier = trimString(snapshot.trackIdentifier);
  var base = [
    trimString(snapshot.bundleIdentifier),
    identifier,
    normalizedText(snapshot.title),
    normalizedText(snapshot.artist),
    normalizedText(snapshot.album),
    Math.round(toNumber(snapshot.durationSeconds, 0))
  ];
  return base.join("||");
}

function trackOffsetKey(snapshot) {
  var metadata = lookupMetadata(snapshot || {});
  return [
    normalizedText(metadata.title),
    normalizedText(metadata.artist),
    normalizedText(metadata.album),
    metadata.duration
  ].join("||");
}

function lyricsCacheKey(snapshot) {
  // A document from another provider may have different recording/timestamps.
  return trimString(snapshot && snapshot.bundleIdentifier) + "||" + trackOffsetKey(snapshot);
}

function isPlaying(snapshot) {
  var playbackState = trimString(snapshot && snapshot.playbackState).toLowerCase();
  return playbackState === "playing" || playbackState === "play" || playbackState === "1";
}

function resetPlaybackClock() {
  state.playbackClock.initialized = false;
  state.playbackClock.identity = "";
  state.playbackClock.positionSeconds = 0;
  state.playbackClock.updatedAtEpochMs = 0;
  state.playbackClock.observedElapsedSeconds = 0;
  state.playbackClock.observedCapturedAtEpochMs = 0;
  state.playbackClock.playing = false;
  state.playbackClock.rate = 1;
}

function updatePlaybackClock(snapshot, identity, atEpochMs) {
  var nextIdentity = trimString(identity || trackIdentity(snapshot));
  if (!snapshot || !nextIdentity) {
    resetPlaybackClock();
    return 0;
  }

  var clock = state.playbackClock;
  var now = Math.max(0, toNumber(atEpochMs, Date.now()));
  var observed = Math.max(0, toNumber(snapshot.elapsedSeconds, 0));
  var capturedAt = Math.max(0, toNumber(snapshot.capturedAtEpochMs, now));
  var playing = isPlaying(snapshot);
  var duration = Math.max(0, toNumber(snapshot.durationSeconds, 0));
  var rate = Math.max(0.01, toNumber(snapshot.playbackRate, 1));

  // The custom host projects its media clock before returning this snapshot.
  // Accept every position, including a seek back to the same previous value.
  if (snapshot.clockAuthoritative === true) {
    clock.initialized = true;
    clock.identity = nextIdentity;
    clock.positionSeconds = observed + (playing ? Math.max(0, now - capturedAt) / 1000 * rate : 0);
    clock.updatedAtEpochMs = now;
    clock.observedElapsedSeconds = observed;
    clock.observedCapturedAtEpochMs = capturedAt;
    clock.playing = playing;
    clock.rate = rate;
    return duration > 0 ? clamp(clock.positionSeconds, 0, duration) : clock.positionSeconds;
  }

  if (!clock.initialized || clock.identity !== nextIdentity) {
    clock.initialized = true;
    clock.identity = nextIdentity;
    clock.positionSeconds = observed;
    clock.updatedAtEpochMs = now;
    clock.observedElapsedSeconds = observed;
    clock.observedCapturedAtEpochMs = capturedAt;
    clock.playing = playing;
    clock.rate = rate;
    return duration > 0 ? clamp(observed, 0, duration) : observed;
  }

  var wallDelta = Math.max(0, (now - clock.updatedAtEpochMs) / 1000);
  var captureDelta = Math.max(0, (capturedAt - clock.observedCapturedAtEpochMs) / 1000);
  var observedDelta = observed - clock.observedElapsedSeconds;
  var observationChanged = Math.abs(observedDelta) >= 0.02;
  var observationJumped = observedDelta < -0.2 || observedDelta > 5;

  if (playing) {
    if (observationChanged) {
      // The media source advanced or the user sought. Treat it as authoritative.
      clock.positionSeconds = observed;
    } else {
      // Some players keep returning the same elapsedSeconds value. In that case,
      // advance from the snapshot/wall clock so the lyric line still moves.
      clock.positionSeconds += (captureDelta > 0 ? captureDelta : wallDelta) * clock.rate;
    }
  } else if (observationChanged || observationJumped) {
    clock.positionSeconds = observed;
  } else if (clock.playing && wallDelta > 0) {
    // Preserve the final fraction of playback before a pause was observed.
    clock.positionSeconds += wallDelta * clock.rate;
  }

  if (duration > 0) clock.positionSeconds = clamp(clock.positionSeconds, 0, duration);
  else clock.positionSeconds = Math.max(0, clock.positionSeconds);
  clock.updatedAtEpochMs = now;
  clock.observedElapsedSeconds = observed;
  clock.observedCapturedAtEpochMs = capturedAt;
  clock.playing = playing;
  clock.rate = rate;
  return clock.positionSeconds;
}

function effectiveElapsedSeconds(snapshot, atEpochMs) {
  if (!snapshot) return 0;
  var now = toNumber(atEpochMs, Date.now());
  var identity = trackIdentity(snapshot);
  var clock = state.playbackClock;

  if (clock.initialized && identity && clock.identity === identity) {
    var clockElapsed = clock.positionSeconds;
    if (clock.playing && now > clock.updatedAtEpochMs) {
      clockElapsed += (now - clock.updatedAtEpochMs) / 1000 * clock.rate;
    }
    var clockDuration = toNumber(snapshot.durationSeconds, 0);
    return clockDuration > 0 ? clamp(clockElapsed, 0, clockDuration) : Math.max(0, clockElapsed);
  }

  var elapsed = Math.max(0, toNumber(snapshot.elapsedSeconds, 0));
  var capturedAt = toNumber(snapshot.capturedAtEpochMs, atEpochMs || Date.now());

  if (isPlaying(snapshot) && capturedAt > 0 && now > capturedAt) {
    elapsed += (now - capturedAt) / 1000 * Math.max(0.01, toNumber(snapshot.playbackRate, 1));
  }

  var duration = toNumber(snapshot.durationSeconds, 0);
  return duration > 0 ? clamp(elapsed, 0, duration) : elapsed;
}

function formatClock(seconds) {
  var safe = Math.max(0, Math.floor(toNumber(seconds, 0)));
  var minutes = Math.floor(safe / 60);
  var rest = safe % 60;
  return minutes + ":" + String(rest).padStart(2, "0");
}

function parseLrc(value) {
  var rows = asString(value).split(/\r?\n/);
  var offsetTag = asString(value).match(/\[offset:\s*([+-]?\d+)\s*\]/i);
  var fileOffset = offsetTag ? toNumber(offsetTag[1], 0) / 1000 : 0;
  var parsed = [];
  var i;

  for (i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    var timestampPattern = /\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]/g;
    var timestamps = [];
    var match;

    while ((match = timestampPattern.exec(row)) !== null) {
      // Positive LRC offset advances the lyric; negative offset delays it.
      timestamps.push(Math.max(0, (Number(match[1]) * 60) + Number(match[2]) - fileOffset));
    }

    if (!timestamps.length) continue;

    var text = row.replace(/\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]/g, "").trim();
    if (!text) text = "♪";

    var j;
    for (j = 0; j < timestamps.length; j += 1) {
      parsed.push({ time: timestamps[j], text: text });
    }
  }

  parsed.sort(function(a, b) { return a.time - b.time; });

  var deduped = [];
  for (i = 0; i < parsed.length; i += 1) {
    var previous = deduped.length ? deduped[deduped.length - 1] : null;
    if (previous && Math.abs(previous.time - parsed[i].time) < 0.001 && previous.text === parsed[i].text) continue;
    deduped.push(parsed[i]);
  }
  return deduped;
}

function parseQrc(value) {
  var text = asString(value);
  var xml = text.match(/<Lyric_1\b[^>]*\bLyricContent=(["'])([\s\S]*?)\1/i);
  if (xml) {
    text = xml[2].replace(/&(#x[\da-f]+|#\d+|quot|apos|lt|gt|amp);/gi, function(entity, code) {
      if (code[0] === "#") {
        var number = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return number >= 0 && number <= 1114111 ? String.fromCodePoint(number) : entity;
      }
      return { quot: '"', apos: "'", lt: "<", gt: ">", amp: "&" }[code.toLowerCase()] || entity;
    });
  }
  var offset = text.match(/\[offset:\s*([+-]?\d+)\s*\]/i);
  var shift = offset ? Number(offset[1]) / 1000 : 0;
  var lines = [];
  text.split(/\r?\n/).slice(0, 2000).forEach(function(row) {
    if (row.length > 8192) return;
    var match = row.match(/^\s*\[(\d+),(\d+)\](.*)$/);
    if (!match) return;
    var words = [], word, pattern = /([\s\S]*?)\((\d+),(\d+)\)/g;
    while ((word = pattern.exec(match[3])) !== null) {
      words.push({ text: word[1], time: Math.max(0, Number(word[2]) / 1000 - shift),
        endTime: Math.max(0, (Number(word[2]) + Number(word[3])) / 1000 - shift) });
    }
    var lineText = match[3].replace(/\(\d+,\d+\)/g, "");
    if (words.map(function(item) { return item.text; }).join("") !== lineText) words = [];
    if (!lineText.trim()) return;
    lines.push({ time: Math.max(0, Number(match[1]) / 1000 - shift), text: lineText, words: words });
  });
  return lines.sort(function(a, b) { return a.time - b.time; });
}

function qrcAsLrc(lines) {
  return lines.map(function(line) {
    var minute = Math.floor(line.time / 60), second = (line.time - minute * 60).toFixed(3);
    return "[" + minute + ":" + (Number(second) < 10 ? "0" : "") + second + "]" + line.text;
  }).join("\n");
}

function parsePlainLyrics(value) {
  return asString(value)
    .split(/\r?\n/)
    .map(function(line) { return trimString(line); })
    .filter(function(line) { return !!line; })
    .slice(0, MAX_PLAIN_LINES);
}

function kugouDurationSeconds(candidate) {
  var value = Math.max(0, toNumber(candidate && candidate.duration, 0));
  return value > 10000 ? value / 1000 : value;
}

function scoreKugouCandidate(candidate, metadata) {
  if (!candidate || !trimString(candidate.id) || !trimString(candidate.accesskey)) return -Infinity;
  var wantedTitle = normalizedText(metadata.title);
  var candidateTitle = normalizedText(candidate.song || candidate.songname);
  if (!wantedTitle || !candidateTitle) return -Infinity;

  var score = 0;
  if (wantedTitle === candidateTitle) score += 60;
  else if (wantedTitle.indexOf(candidateTitle) >= 0 || candidateTitle.indexOf(wantedTitle) >= 0) score += 28;
  else return -Infinity;

  var wantedArtist = normalizedText(metadata.artist);
  var candidateArtist = normalizedText(candidate.singer || candidate.singername);
  if (wantedArtist && candidateArtist) {
    if (wantedArtist === candidateArtist) score += 30;
    else if (wantedArtist.indexOf(candidateArtist) >= 0 || candidateArtist.indexOf(wantedArtist) >= 0) score += 15;
    else return -Infinity;
  }

  var wantedDuration = toNumber(metadata.duration, 0);
  var candidateDuration = kugouDurationSeconds(candidate);
  if (wantedDuration > 0 && candidateDuration > 0) {
    var difference = Math.abs(wantedDuration - candidateDuration);
    if (difference <= 2) score += 30;
    else if (difference <= 6) score += 20;
    else if (difference <= 15) score += 8;
    else return -Infinity;
  }

  score += clamp(toNumber(candidate.score, 0), 0, 100) * 0.05;
  return score;
}

function rankedKugouCandidates(candidates, metadata) {
  if (!Array.isArray(candidates)) return [];
  return candidates.map(function(candidate) {
    return { candidate: candidate, score: scoreKugouCandidate(candidate, metadata) };
  }).filter(function(item) {
    return item.score >= 28;
  }).sort(function(left, right) {
    return right.score - left.score;
  }).map(function(item) {
    return item.candidate;
  });
}

function parseJSONOrJSONP(text) {
  try { return JSON.parse(text); } catch (error) {}
  // Decode a JSONP response as data only. Never evaluate the callback wrapper.
  var wrapper = trimString(text).match(/^[\w.]+\s*\(\s*([\s\S]*)\s*\)\s*;?$/);
  if (wrapper) { try { return JSON.parse(wrapper[1]); } catch (error) {} }
  return null;
}

function parseHttpData(response) {
  if (!response) return null;
  if (response.data !== null && response.data !== undefined) {
    if (typeof response.data === "string") {
      return parseJSONOrJSONP(response.data);
    }
    return response.data;
  }
  if (response.text) {
    return parseJSONOrJSONP(response.text);
  }
  return null;
}

async function requestJSON(url, options) {
  options = options || {};
  try {
    var response = await SuperIsland.http.fetch(url, {
      method: options.method || "GET",
      headers: Object.assign({ "Accept": "application/json" }, options.headers || {}),
      body: options.body || ""
    });
    return {
      status: toNumber(response && response.status, 0),
      data: parseHttpData(response),
      error: trimString(response && response.error)
    };
  } catch (error) {
    return {
      status: 0,
      data: null,
      error: trimString(error && error.message ? error.message : error) || "网络请求失败"
    };
  }
}

function encodedPair(key, value) {
  return encodeURIComponent(key) + "=" + encodeURIComponent(asString(value));
}

function decodeBase64Utf8(value) {
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var input = asString(value).replace(/[^A-Za-z0-9+/=]/g, "");
  var bytes = [];
  var index;

  for (index = 0; index < input.length; index += 4) {
    var first = alphabet.indexOf(input.charAt(index));
    var second = alphabet.indexOf(input.charAt(index + 1));
    var thirdCharacter = input.charAt(index + 2);
    var fourthCharacter = input.charAt(index + 3);
    var third = thirdCharacter === "=" ? 0 : alphabet.indexOf(thirdCharacter);
    var fourth = fourthCharacter === "=" ? 0 : alphabet.indexOf(fourthCharacter);
    if (first < 0 || second < 0 || third < 0 || fourth < 0) continue;
    bytes.push((first << 2) | (second >> 4));
    if (thirdCharacter !== "=") bytes.push(((second & 15) << 4) | (third >> 2));
    if (fourthCharacter !== "=") bytes.push(((third & 3) << 6) | fourth);
  }

  var output = "";
  for (index = 0; index < bytes.length;) {
    var byte = bytes[index++];
    if (byte < 128) {
      output += String.fromCharCode(byte);
    } else if (byte < 224 && index < bytes.length) {
      output += String.fromCharCode(((byte & 31) << 6) | (bytes[index++] & 63));
    } else if (byte < 240 && index + 1 < bytes.length) {
      output += String.fromCharCode(((byte & 15) << 12) | ((bytes[index++] & 63) << 6) | (bytes[index++] & 63));
    } else if (index + 2 < bytes.length) {
      var codePoint = ((byte & 7) << 18) | ((bytes[index++] & 63) << 12) | ((bytes[index++] & 63) << 6) | (bytes[index++] & 63);
      codePoint -= 65536;
      output += String.fromCharCode(55296 + (codePoint >> 10), 56320 + (codePoint & 1023));
    }
  }
  return output;
}

function scoreQQCandidate(song, metadata) {
  if (!song || !trimString(song.mid) || normalizedText(song.name || song.title) !== normalizedText(metadata.title)) return -Infinity;
  var artists = (Array.isArray(song.singer) ? song.singer : []).map(function(item) { return trimString(item.name); });
  var artist = normalizedText(artists.join(" "));
  var wantedArtist = normalizedText(metadata.artist);
  if (wantedArtist && (!artist || (artist !== wantedArtist && artist.indexOf(wantedArtist) < 0))) return -Infinity;
  var duration = toNumber(song.interval, 0);
  var difference = Math.abs(duration - metadata.duration);
  if (metadata.duration > 0 && (duration <= 0 || difference > 6)) return -Infinity;
  var album = trimString(song.album && (song.album.name || song.album.title));
  var albumMatches = normalizedText(album) === normalizedText(metadata.album);
  return 100 + (metadata.album && albumMatches ? 80 : 0) - difference;
}

function rankedQQCandidates(songs, metadata) {
  var flattened = [], seen = {};
  (Array.isArray(songs) ? songs : []).forEach(function(song) {
    [song].concat(Array.isArray(song.grp) ? song.grp : []).forEach(function(item) {
      var score = scoreQQCandidate(item, metadata);
      if (!Number.isFinite(score) || seen[item.mid]) return;
      seen[item.mid] = true;
      flattened.push({ song: item, score: score });
    });
  });
  return flattened.sort(function(a, b) { return b.score - a.score; }).map(function(item) { return item.song; });
}

async function lookupQQLyrics(metadata) {
  var headers = { "Referer": "https://y.qq.com/", "Content-Type": "application/json" };
  var search = await requestJSON("https://u.y.qq.com/cgi-bin/musicu.fcg", {
    method: "POST", headers: headers,
    body: JSON.stringify({ comm: { ct: 11, cv: "1003006" },
      req_1: { module: "music.search.SearchCgiService", method: "DoSearchForQQMusicLite",
      param: { num_per_page: 20, page_num: 1, query: [metadata.artist, metadata.title].filter(Boolean).join(" "),
        search_type: 7, remoteplace: "search.android.keyboard", grp: 1 } } })
  });
  var section = search.data && search.data.req_1;
  var body = section && section.data && section.data.body;
  if (!section || section.code !== 0 || !body) return null;
  var songs = rankedQQCandidates(body.item_song || (body.song && body.song.list), metadata).slice(0, 3);
  for (var i = 0; i < songs.length; i += 1) {
    var song = songs[i];
    var qrc = "", lrc = "";
    if (toNumber(song.id, 0) > 0 && typeof globalThis.__superIslandDecodeQRC === "function") {
      try {
        var wordResult = await requestJSON("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          method: "POST", headers: headers,
          body: JSON.stringify({ comm: { ct: 11, cv: "1003006" }, req_1: {
            module: "music.musichallSong.PlayLyricInfo", method: "GetPlayLyricInfo",
            param: { songID: Number(song.id), qrc: 1, crypt: 1, ct: 19, cv: 2111,
              lrc_t: 0, qrc_t: 0, trans: 0, roma: 0, type: 0 }
          } })
        });
        var wordSection = wordResult.data && wordResult.data.req_1;
        if (wordSection && wordSection.code === 0 && wordSection.data && wordSection.data.lyric) {
          var decoded = globalThis.__superIslandDecodeQRC(wordSection.data.lyric);
          var wordLines = parseQrc(decoded);
          if (wordLines.some(function(line) { return line.words.length > 1; })) {
            qrc = decoded;
            lrc = qrcAsLrc(wordLines);
          }
        }
      } catch (error) { logWarning("逐字歌词暂不可用，继续读取逐行歌词"); }
    }
    if (!lrc) {
    var download = await requestJSON("https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?" + [
      encodedPair("songmid", song.mid), encodedPair("format", "jsonp"),
      encodedPair("callback", "MusicJsonCallback_lrc"), encodedPair("platform", "yqq"), encodedPair("needNewCode", 0)
    ].join("&"), { headers: headers });
    var data = asObject(download.data) || {};
    if (data.code !== 0) continue;
    lrc = decodeBase64Utf8(data.lyric);
    }
    if (!parseLrc(lrc).length) continue;
    return { payload: {
      trackName: trimString(song.name || song.title),
      artistName: song.singer.map(function(item) { return trimString(item.name); }).join(" / "),
      albumName: trimString(song.album && (song.album.name || song.album.title)),
      duration: toNumber(song.interval, 0), instrumental: false, plainLyrics: "", syncedLyrics: lrc,
      lyricSource: "qqmusic", wordSyncedLyrics: qrc
    }, metadata: metadata, source: "qqmusic" };
  }
  return null;
}

function timelinesAgree(left, right) {
  // Match repeated phrases by occurrence, ignoring punctuation/space/credits.
  var byText = {};
  right.forEach(function(line) {
    var key = normalizedText(line.text).replace(/\s/g, "");
    if (key.length < 4 || line.time < 5) return;
    (byText[key] || (byText[key] = [])).push(line.time);
  });
  var counts = {}, compared = 0, aligned = 0;
  left.forEach(function(line) {
    var key = normalizedText(line.text).replace(/\s/g, "");
    if (key.length < 4 || line.time < 5 || !byText[key]) return;
    var occurrence = counts[key] || 0;
    counts[key] = occurrence + 1;
    if (occurrence >= byText[key].length) return;
    compared += 1;
    if (Math.abs(line.time - byText[key][occurrence]) <= 0.75) aligned += 1;
  });
  return compared >= 6 && compared >= Math.min(left.length, right.length) * 0.3 && aligned / compared >= 0.7;
}

function selectKugouDocument(documents) {
  if (!documents.length) return null;
  var best = 0, support = 0;
  documents.forEach(function(document, index) {
    var votes = documents.filter(function(other, otherIndex) {
      return index !== otherIndex && timelinesAgree(document.lines, other.lines);
    }).length;
    if (votes > support) { best = index; support = votes; }
  });
  // Two other candidates must agree before overriding the metadata ranking.
  return documents[support >= 2 ? best : 0];
}

async function lookupLyricsPayload(snapshot) {
  var metadata = lookupMetadata(snapshot);
  if (!metadata.title) {
    return { error: "当前媒体没有歌曲标题" };
  }

  if (trimString(snapshot.bundleIdentifier).indexOf("com.tencent.QQMusic") === 0) {
    var qq = await lookupQQLyrics(metadata);
    if (qq) return qq;
    logWarning("QQ 音乐歌词不可用，尝试备用歌词源");
  }

  var keyword = [metadata.artist, metadata.title].filter(Boolean).join(" - ");
  var searchPairs = [
    encodedPair("ver", 1),
    encodedPair("man", "yes"),
    encodedPair("client", "pc"),
    encodedPair("keyword", keyword || metadata.title)
  ];
  if (metadata.duration > 0) searchPairs.push(encodedPair("duration", metadata.duration * 1000));

  var search = await requestJSON(KUGOU_LYRICS_ROOT + "/search?" + searchPairs.join("&"));
  if (search.status === 429) return { error: "酷狗歌词请求过于频繁，请稍后重试" };
  if (search.status === 0 && search.error) return { error: search.error };

  var searchData = asObject(search.data) || {};
  var candidates = rankedKugouCandidates(searchData.candidates, metadata).slice(0, 4);
  if (!candidates.length) return { error: "酷狗没有找到匹配的歌词" };

  var documents = [];
  var candidateIndex;
  for (candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
    var candidate = candidates[candidateIndex];
    var downloadURL = KUGOU_LYRICS_ROOT + "/download?" + [
      encodedPair("ver", 1),
      encodedPair("client", "pc"),
      encodedPair("id", candidate.id),
      encodedPair("accesskey", candidate.accesskey),
      encodedPair("fmt", "lrc"),
      encodedPair("charset", "utf8")
    ].join("&");
    var download = await requestJSON(downloadURL);
    var downloadData = asObject(download.data) || {};
    var syncedLyrics = decodeBase64Utf8(downloadData.content);
    if (!syncedLyrics || !parseLrc(syncedLyrics).length) continue;

    documents.push({ lines: parseLrc(syncedLyrics), result: {
      payload: {
        trackName: trimString(candidate.song || candidate.songname) || metadata.title,
        artistName: trimString(candidate.singer || candidate.singername) || metadata.artist,
        albumName: metadata.album,
        duration: kugouDurationSeconds(candidate) || metadata.duration,
        instrumental: false,
        plainLyrics: "",
        syncedLyrics: syncedLyrics,
        lyricSource: "kugou"
      },
      metadata: metadata,
      source: "kugou"
    } });
  }

  var selected = selectKugouDocument(documents);
  if (selected) return selected.result;

  return { error: "酷狗歌词下载失败，请稍后重试" };
}

function cachePayload(key, payload) {
  if (!settingBool("cacheLyrics", true) || !key || !payload) return;
  state.cache[key] = {
    trackName: trimString(payload.trackName),
    artistName: trimString(payload.artistName),
    albumName: trimString(payload.albumName),
    duration: toNumber(payload.duration, 0),
    instrumental: !!payload.instrumental,
    plainLyrics: asString(payload.plainLyrics),
    syncedLyrics: asString(payload.syncedLyrics),
    lyricSource: trimString(payload.lyricSource),
    cachedAtEpochMs: Date.now()
  };

  state.cacheOrder = state.cacheOrder.filter(function(existingKey) { return existingKey !== key; });
  state.cacheOrder.push(key);
  while (state.cacheOrder.length > MAX_CACHE_ENTRIES) {
    var removedKey = state.cacheOrder.shift();
    delete state.cache[removedKey];
  }

  storeSet("lyricsCache", state.cache);
  storeSet("lyricsCacheOrder", state.cacheOrder);
  storeSet("cacheSchemaVersion", CACHE_SCHEMA_VERSION);
}

function applyLyricsPayload(payload, key, source) {
  var synced = parseLrc(payload && payload.syncedLyrics);
  var wordSynced = parseQrc(payload && payload.wordSyncedLyrics);
  if (wordSynced.some(function(line) { return line.words.length > 1; })) synced = wordSynced;
  var plain = parsePlainLyrics(payload && payload.plainLyrics);
  state.syncedLines = synced;
  state.plainLines = plain;
  state.instrumental = !!(payload && payload.instrumental);
  state.errorMessage = "";
  state.match = {
    trackName: trimString(payload && payload.trackName),
    artistName: trimString(payload && payload.artistName),
    albumName: trimString(payload && payload.albumName),
    source: trimString(payload && payload.lyricSource) || source || "network"
  };

  if (state.instrumental) state.lookupStatus = "instrumental";
  else if (synced.length) state.lookupStatus = "synced";
  else if (plain.length) state.lookupStatus = "plain";
  else state.lookupStatus = "missing";

  if (source !== "cache") cachePayload(key, payload);
}

function clearLyrics(status) {
  state.lookupStatus = status || "idle";
  state.syncedLines = [];
  state.plainLines = [];
  state.instrumental = false;
  state.errorMessage = "";
  state.match = null;
}

function maybeRevealForNewTrack() {
  if (!state.snapshot || !isPlaying(state.snapshot)) return;
  var keepForeground = settingBool("foregroundWhilePlaying", true);
  var revealBriefly = settingBool("autoRevealOnTrackChange", false);
  try {
    if (revealBriefly) {
      SuperIsland.island.activate(true);
    } else if (keepForeground && typeof SuperIsland.island.select === "function") {
      // Selecting compact content must never change the island's open state.
      SuperIsland.island.select();
    }
  } catch (error) {
    logWarning("无法更新歌词岛显示状态");
  }
}

async function loadLyricsForSnapshot(snapshot, force) {
  var key = lyricsCacheKey(snapshot);
  if (!key) return;
  if (!force && key === state.lyricsKey && state.lookupStatus !== "idle") return;

  state.lyricsKey = key;
  state.requestSerial += 1;
  var serial = state.requestSerial;
  clearLyrics("loading");

  if (!force && settingBool("cacheLyrics", true) && asObject(state.cache[key]) &&
      payloadMatchesSnapshot(state.cache[key], snapshot)) {
    applyLyricsPayload(state.cache[key], key, "cache");
    maybeRevealForNewTrack();
    return;
  }

  var result = await lookupLyricsPayload(snapshot);
  if (serial !== state.requestSerial || key !== state.lyricsKey) return;

  // The player can change tracks while the network request is in flight or
  // while host energy policy suspends JS timers. Check the source again.
  var live = asObject(SuperIsland.system.getNowPlaying());
  if (!live || lyricsCacheKey(live) !== key) {
    void tick();
    return;
  }

  if (result && result.payload && payloadMatchesSnapshot(result.payload, snapshot)) {
    applyLyricsPayload(result.payload, key, result.source);
    logInfo("已匹配歌词：" + trimString(result.payload.trackName));
    maybeRevealForNewTrack();
    return;
  }

  clearLyrics("missing");
  state.errorMessage = trimString(result && result.error) || "没有找到匹配的歌词";
  logWarning(state.errorMessage);
}

function payloadMatchesSnapshot(payload, snapshot) {
  var metadata = lookupMetadata(snapshot);
  return scoreKugouCandidate({ id: "validation", accesskey: "validation",
    song: payload.trackName, singer: payload.artistName,
    duration: payload.duration }, metadata) >= 28;
}

function currentTrackOffset() {
  return toNumber(state.trackOffsets[trackOffsetKey(state.snapshot)], 0);
}

function totalOffsetSeconds() {
  return settingNumber("globalOffsetSeconds", DEFAULT_SYNC_LEAD_SECONDS) + currentTrackOffset();
}

function currentLyricIndex(atEpochMs) {
  if (!state.syncedLines.length || !state.snapshot) return -1;
  var target = effectiveElapsedSeconds(state.snapshot, atEpochMs || Date.now()) + totalOffsetSeconds();
  var low = 0;
  var high = state.syncedLines.length - 1;
  var answer = -1;

  while (low <= high) {
    var middle = Math.floor((low + high) / 2);
    if (state.syncedLines[middle].time <= target) {
      answer = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return answer;
}

function currentLyricText() {
  var index = currentLyricIndex(Date.now());
  if (index >= 0 && state.syncedLines[index]) return simplifyChinese(state.syncedLines[index].text);
  if (state.syncedLines.length) return "♪ " + simplifyChinese(trimString(state.snapshot && state.snapshot.title));
  return "";
}

function truncateText(value, maximumLength) {
  var text = trimString(value);
  var limit = Math.max(1, Math.floor(toNumber(maximumLength, 18)));
  if (text.length <= limit) return text;
  return text.slice(0, Math.max(1, limit - 1)) + "…";
}

function adjustTrackOffset(delta) {
  if (!state.lyricsKey) return;
  var next = clamp(currentTrackOffset() + delta, -10, 10);
  next = Math.round(next * 10) / 10;
  state.trackOffsets[trackOffsetKey(state.snapshot)] = next;
  storeSet("trackOffsets", state.trackOffsets);
  try { SuperIsland.playFeedback("selection"); } catch (error) {}
}

function resetTrackOffset() {
  if (!state.lyricsKey) return;
  delete state.trackOffsets[trackOffsetKey(state.snapshot)];
  storeSet("trackOffsets", state.trackOffsets);
  try { SuperIsland.playFeedback("selection"); } catch (error) {}
}

function loadPersistedState() {
  var persistedVersion = toNumber(storeGet("cacheSchemaVersion", 0), 0);
  state.cache = persistedVersion === CACHE_SCHEMA_VERSION
    ? (asObject(storeGet("lyricsCache", {})) || {})
    : {};
  state.cacheOrder = persistedVersion === CACHE_SCHEMA_VERSION
    ? storeGet("lyricsCacheOrder", [])
    : [];
  if (!Array.isArray(state.cacheOrder)) state.cacheOrder = [];
  state.trackOffsets = asObject(storeGet("trackOffsets", {})) || {};

  var interfaceMigrationVersion = toNumber(storeGet("interfaceMigrationVersion", 0), 0);
  if (interfaceMigrationVersion < 4 && typeof SuperIsland.settings.set === "function") {
    // Retire the old automatic lead; preserve other explicitly chosen offsets.
    if (Math.abs(settingNumber("globalOffsetSeconds", 0) - 0.4) < 0.001) {
      SuperIsland.settings.set("globalOffsetSeconds", 0);
    }
  }

  if (interfaceMigrationVersion < 2) {
    if (settingNumber("windowHeight", 132) <= 180 && typeof SuperIsland.settings.set === "function") {
      SuperIsland.settings.set("windowHeight", DEFAULT_FULL_HEIGHT);
    }
    storeSet("interfaceMigrationVersion", 2);
  }

  if (interfaceMigrationVersion < 3) {
    if (settingNumber("windowHeight", 300) >= 300 && typeof SuperIsland.settings.set === "function") {
      SuperIsland.settings.set("windowHeight", DEFAULT_FULL_HEIGHT);
    }
    storeSet("interfaceMigrationVersion", 3);
  }
  storeSet("interfaceMigrationVersion", 4);

  if (persistedVersion !== CACHE_SCHEMA_VERSION) {
    storeSet("lyricsCache", {});
    storeSet("lyricsCacheOrder", []);
    storeSet("cacheSchemaVersion", CACHE_SCHEMA_VERSION);
  }
}

async function tick() {
  if (tickInFlight) return;
  tickInFlight = true;
  try {
    var snapshot = null;
    try {
      snapshot = asObject(
        SuperIsland.system && typeof SuperIsland.system.getNowPlaying === "function"
          ? SuperIsland.system.getNowPlaying()
          : null
      );
    } catch (error) {
      snapshot = null;
      logWarning("无法读取当前播放信息，请检查 media 权限");
    }

    state.snapshot = snapshot;
    var nextIdentity = trackIdentity(snapshot);

    if (!snapshot || !trimString(snapshot.title)) {
      resetPlaybackClock();
      if (state.trackIdentity) state.requestSerial += 1;
      state.trackIdentity = "";
      state.lyricsKey = "";
      clearLyrics("idle");
      return;
    }

    updatePlaybackClock(snapshot, nextIdentity, Date.now());

    if (nextIdentity !== state.trackIdentity) {
      state.trackIdentity = nextIdentity;
      // Network lookup must not hold the snapshot polling lock.
      void loadLyricsForSnapshot(snapshot, false);
    }
  } finally {
    tickInFlight = false;
  }
}

function startPolling() {
  if (pollTimer !== null) return;
  void tick();
  pollTimer = setInterval(function() { void tick(); }, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (pollTimer === null) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

function white(alpha) {
  return { r: 1, g: 1, b: 1, a: alpha };
}

function accentColor() {
  return { r: 1, g: 0.66, b: 0.22, a: 1 };
}

function compactArtwork(size) {
  if (typeof View.nowPlayingArtwork === "function") {
    return View.nowPlayingArtwork({ size: size, cornerRadius: 4 });
  }
  return View.icon("music.note", { size: 13, color: accentColor() });
}

function compactView() {
  void tick();
  if (!state.snapshot || !trimString(state.snapshot.title)) {
    return View.hstack([
      View.icon("music.note", { size: 13, color: white(0.55) }),
      View.text("歌词待机", { style: "footnote", color: white(0.6), lineLimit: 1 })
    ], { spacing: 6, align: "center" });
  }

  if (state.lookupStatus === "loading") {
    return View.hstack([
      compactArtwork(18),
      View.text("正在匹配歌词", { style: "footnote", color: white(0.72), lineLimit: 1 })
    ], { spacing: 6, align: "center" });
  }

  var lyric = currentLyricText();
  var label = lyric || simplifyChinese(trimString(state.snapshot.title));
  return View.hstack([
    compactArtwork(18),
    View.frame(View.text(label, {
      style: "footnote",
      color: lyric ? "white" : white(0.68),
      lineLimit: 1
    }), { maxWidth: 280, alignment: "leading" })
  ], { spacing: 7, align: "center" });
}

function minimalLeadingView() {
  void tick();
  return View.frame(compactArtwork(18), {
    width: 18,
    height: 18,
    alignment: "leading"
  });
}

function minimalTrailingView() {
  if (state.lookupStatus === "loading") {
    return View.frame(View.animate(View.icon("waveform", { size: 13, color: accentColor() }), "pulse"), {
      width: 20,
      height: 18,
      alignment: "trailing"
    });
  }
  var lyric = currentLyricText();
  if (lyric) {
    return View.frame(View.text(truncateText(lyric, 20), {
      style: "footnote",
      color: white(0.9),
      lineLimit: 1
    }), {
      maxWidth: 220,
      height: 18,
      alignment: "trailing"
    });
  }
  var duration = toNumber(state.snapshot && state.snapshot.durationSeconds, 0);
  var elapsed = effectiveElapsedSeconds(state.snapshot, Date.now());
  return View.frame(View.circularProgress(duration > 0 ? elapsed / duration : 0, {
    total: 1,
    lineWidth: 2,
    color: accentColor()
  }), { width: 18, height: 18, alignment: "trailing" });
}

function lyricStatusMessage() {
  if (state.lookupStatus === "plain" && state.plainLines.length) {
    return simplifyChinese(state.plainLines.slice(0, 4).join("\n"));
  }
  return state.errorMessage || "";
}

function playerLyricsView() {
  // Rendering must refresh the track even if the JS polling timer was suspended.
  void tick();
  var lines = state.syncedLines.map(function(line) {
    var converted = simplifyChinese(line.text);
    var offset = 0;
    var words = converted.length === line.text.length && Array.isArray(line.words)
      ? line.words.map(function(word) {
          var text = converted.slice(offset, offset + word.text.length);
          offset += word.text.length;
          return { time: word.time, endTime: word.endTime, text: text };
        }) : [];
    return { time: line.time, text: converted, words: words };
  });
  return View.nowPlayingLyrics({
    lines: lines,
    status: state.lookupStatus,
    message: lyricStatusMessage(),
    offsetSeconds: totalOffsetSeconds(),
    lyricSource: trimString(state.match && state.match.source),
    canCalibrate: state.lookupStatus === "synced",
    showArtwork: settingBool("showArtwork", true),
    trackTitle: trimString(state.snapshot && state.snapshot.title),
    trackArtist: trimString(state.snapshot && state.snapshot.artist),
    sourceBundleIdentifier: trimString(state.snapshot && state.snapshot.bundleIdentifier)
  });
}

function expandedView() { return playerLyricsView(); }
function fullExpandedView() { return playerLyricsView(); }

loadPersistedState();

SuperIsland.registerModule({
  onActivate: function() {
    applyWindowHeightPreference();
    startPolling();
  },

  onDeactivate: function() {
    stopPolling();
  },

  onSettingsChanged: function() {
    applyWindowHeightPreference();
    void tick();
  },

  onAction: function(actionID) {
    if (actionID === "retry" && state.snapshot) {
      void loadLyricsForSnapshot(state.snapshot, true);
      return;
    }
    if (actionID === "offset-earlier") {
      adjustTrackOffset(0.5);
      return;
    }
    if (actionID === "offset-later") {
      adjustTrackOffset(-0.5);
      return;
    }
    if (actionID === "offset-reset") {
      resetTrackOffset();
    }
  },

  compact: function() {
    return compactView();
  },

  minimalCompact: {
    leading: function() { return minimalLeadingView(); },
    trailing: function() { return minimalTrailingView(); },
    precedence: function() { return 1; }
  },

  expanded: function() {
    return expandedView();
  },

  fullExpanded: function() {
    return fullExpandedView();
  }
});

applyWindowHeightPreference();
startPolling();

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    cleanTrackTitle: cleanTrackTitle,
    parseLrc: parseLrc,
    parseQrc: parseQrc,
    parsePlainLyrics: parsePlainLyrics,
    scoreKugouCandidate: scoreKugouCandidate,
    rankedKugouCandidates: rankedKugouCandidates,
    decodeBase64Utf8: decodeBase64Utf8,
    simplifyChinese: simplifyChinese,
    resetPlaybackClock: resetPlaybackClock,
    updatePlaybackClock: updatePlaybackClock,
    effectiveElapsedSeconds: effectiveElapsedSeconds,
    applyLyricsPayload: applyLyricsPayload,
    currentLyricIndex: currentLyricIndex,
    tick: tick,
    loadLyricsForSnapshot: loadLyricsForSnapshot,
    lyricsCacheKey: lyricsCacheKey,
    trackIdentity: trackIdentity,
    payloadMatchesSnapshot: payloadMatchesSnapshot,
    lookupLyricsPayload: lookupLyricsPayload,
    rankedQQCandidates: rankedQQCandidates,
    selectKugouDocument: selectKugouDocument,
    state: state
  };
}
