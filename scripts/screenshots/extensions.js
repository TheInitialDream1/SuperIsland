"use strict";
// Execute the real extension view functions inside an offline VM. No accounts,
// subprocesses, credentials, filesystem access or network are exposed to them.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
const runtime = fs.readFileSync(path.join(root, "ExtensionHost/ExtensionJSRuntime.swift"), "utf8");
function injectedScript(name) {
  const section = runtime.split(`private func ${name}() {`)[1];
  if (!section) throw new Error(`Missing production helper ${name}`);
  return section.split('"""')[1];
}
const results = [];
for (const entry of fs.readdirSync(path.join(root, "Extensions"), { withFileTypes: true })) {
  const folder = path.join(root, "Extensions", entry.name);
  if (!entry.isDirectory() || entry.name === "synced-lyrics" || !fs.existsSync(path.join(folder, "manifest.json"))) continue;
  const manifest = JSON.parse(fs.readFileSync(path.join(folder, "manifest.json"), "utf8"));
  let config;
  const defaults = {};
  const settings = path.join(folder, "settings.json");
  if (fs.existsSync(settings)) {
    for (const section of JSON.parse(fs.readFileSync(settings, "utf8")).sections || []) {
      for (const field of section.fields || []) defaults[field.key] = field.default;
    }
  }
  const noop = () => null;
  const namespace = new Proxy({}, { get: () => noop });
  const api = {
    settings: { get: key => defaults[key] ?? null, set: noop },
    store: { get: noop, set: noop },
    system: namespace,
    island: { state: "fullExpanded", activate: noop, dismiss: noop },
    http: { fetch: () => Promise.resolve({ status: 503, data: null, text: "", error: "Offline gallery" }) },
    notifications: namespace, mascot: namespace, clipboard: namespace,
    playFeedback: noop, registerModule: value => { config = value; },
  };
  const context = vm.createContext({ SuperIsland: api, console: { log: noop, warn: noop, error: noop },
    setInterval: noop, clearInterval: noop, setTimeout: noop, clearTimeout: noop,
    URL, URLSearchParams, TextEncoder, TextDecoder, module: { exports: {} } });
  vm.runInContext(injectedScript("injectViewHelpers"), context);
  vm.runInContext(injectedScript("injectComponents"), context);
  vm.runInContext(fs.readFileSync(path.join(folder, manifest.main), "utf8"), context, { timeout: 3000 });
  if (!config) throw new Error(`${entry.name} did not register a module`);
  // Only the offline timer initializes its saved/default duration. All APIs are mocked.
  if (entry.name === "pomodoro") config.onActivate();
  // Other integrations intentionally show their initial / disconnected screen.
  const node = (config.fullExpanded || config.expanded).call(config);
  results.push({ name: entry.name, id: manifest.id, node });
  console.log(`Prepared offline ${entry.name}`);
}
fs.writeFileSync(process.argv[2], JSON.stringify(results));
