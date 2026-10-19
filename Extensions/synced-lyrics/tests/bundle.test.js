"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var vm = require("node:vm");

var registeredModule = null;
var context = {
  console: console,
  Date: Date,
  Map: Map,
  Proxy: Proxy,
  Promise: Promise,
  URL: URL,
  encodeURIComponent: encodeURIComponent,
  setInterval: function() { return 1; },
  clearInterval: function() {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};

context.globalThis = context;
context.SuperIsland = {
  settings: { get: function() { return null; }, set: function() {} },
  store: { get: function() { return null; }, set: function() {} },
  system: { getNowPlaying: function() { return null; } },
  http: { fetch: async function() { return { status: 404, data: null, text: "" }; } },
  island: { activate: function() {}, setPreferredHeight: function() {} },
  playFeedback: function() {},
  registerModule: function(moduleConfig) { registeredModule = moduleConfig; }
};
context.View = new Proxy({}, {
  get: function(_target, property) {
    return function() { return { type: property, args: Array.from(arguments) }; };
  }
});

var bundle = fs.readFileSync(require.resolve("../bundle.js"), "utf8");
vm.runInNewContext(bundle, context, { filename: "bundle.js" });

assert.ok(context.OpenCC);
var converter = context.OpenCC.Converter({ from: "t", to: "cn" });
assert.equal(converter("還是會想你，撥開迷霧抓住你的聲音"), "还是会想你，拨开迷雾抓住你的声音");
assert.ok(registeredModule);
assert.equal(typeof registeredModule.expanded, "function");
assert.equal(typeof registeredModule.fullExpanded, "function");
assert.ok(registeredModule.expanded());
assert.ok(registeredModule.fullExpanded());

console.log("synced-lyrics bundle tests passed");
