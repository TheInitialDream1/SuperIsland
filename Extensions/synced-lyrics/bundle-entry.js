import OpenCCModule from "./vendor/opencc-t2cn.js";
import { decryptQrc } from "./vendor/qrc-codec.mjs";

globalThis.OpenCC = OpenCCModule && OpenCCModule.Converter
  ? OpenCCModule
  : (OpenCCModule.default || OpenCCModule);
globalThis.__superIslandDecodeQRC = decryptQrc;

import "./index.js";
