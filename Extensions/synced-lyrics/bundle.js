(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // lyrics-island/vendor/opencc-t2cn.js
  var require_opencc_t2cn = __commonJS({
    "lyrics-island/vendor/opencc-t2cn.js"(exports, module) {
      !(function(n, e) {
        "object" == typeof exports && "undefined" != typeof module ? e(exports) : "function" == typeof define && define.amd ? define(["exports"], e) : e((n = "undefined" != typeof globalThis ? globalThis : n || self).OpenCC = {});
      })(exports, function(n) {
        "use strict";
        class e {
          constructor() {
            this.map = /* @__PURE__ */ new Map();
          }
          addWord(n2, e2) {
            let { map: t2 } = this;
            for (const e3 of n2) {
              const n3 = e3.codePointAt(0), r2 = t2.get(n3);
              if (null == r2) {
                const e4 = /* @__PURE__ */ new Map();
                t2.set(n3, e4), t2 = e4;
              } else t2 = r2;
            }
            t2.trie_val = e2;
          }
          loadDict(n2) {
            if ("string" == typeof n2) {
              n2 = n2.split("|");
              for (const e2 of n2) {
                const [n3, t2] = e2.split(" ");
                if ("string" != typeof t2) throw new TypeError('Invalid dictionary entry: expected string entries to use "source replacement" format.');
                this.addWord(n3, t2);
              }
            } else for (const e2 of n2) {
              if (!Array.isArray(e2) || "string" != typeof e2[0] || "string" != typeof e2[1]) throw new TypeError("Invalid dictionary entry: expected [source, replacement] pairs. If you are passing locale dictionaries to ConverterFactory, spread them, for example: ConverterFactory(...Locale.from.cn, ...Locale.to.hk).");
              const [n3, t2] = e2;
              this.addWord(n3, t2);
            }
          }
          loadDictGroup(n2) {
            n2.slice().reverse().forEach((n3) => {
              this.loadDict(n3);
            });
          }
          matchPrefix(n2, e2) {
            const t2 = n2.length;
            let r2, o2 = this.map, i2 = 0;
            for (let a2 = e2; a2 < t2; ) {
              const e3 = n2.codePointAt(a2);
              a2 += e3 > 65535 ? 2 : 1;
              const t3 = o2.get(e3);
              if (void 0 === t3) break;
              o2 = t3;
              const l2 = o2.trie_val;
              void 0 !== l2 && (i2 = a2, r2 = l2);
            }
            return i2 > 0 ? { end: i2, value: r2 } : null;
          }
          segment(n2) {
            const e2 = n2.length, t2 = [];
            let r2 = null;
            for (let i2 = 0; i2 < e2; ) {
              const e3 = this.matchPrefix(n2, i2);
              e3 ? (null !== r2 && (t2.push(n2.slice(r2, i2)), r2 = null), t2.push(n2.slice(i2, e3.end)), i2 = e3.end) : (null === r2 && (r2 = i2), i2 += o(n2, i2));
            }
            return null !== r2 && t2.push(n2.slice(r2, e2)), t2;
          }
          convert(n2) {
            const e2 = n2.length, t2 = [];
            let r2 = null;
            for (let i2 = 0; i2 < e2; ) {
              const e3 = this.matchPrefix(n2, i2);
              e3 ? (null !== r2 && (t2.push(n2.slice(r2, i2)), r2 = null), t2.push(e3.value), i2 = e3.end) : (null === r2 && (r2 = i2), i2 += o(n2, i2));
            }
            return null !== r2 && t2.push(n2.slice(r2, e2)), t2.join("");
          }
        }
        function t(n2, e2) {
          return n2.codePointAt(e2) > 65535 ? 2 : 1;
        }
        function r(n2, e2) {
          const o2 = (function(n3) {
            return n3 >= 12272 && n3 <= 12273 ? 2 : n3 >= 12274 && n3 <= 12275 ? 3 : n3 >= 12276 && n3 <= 12287 ? 2 : 0;
          })(n2.codePointAt(e2));
          if (0 === o2) return 0;
          let i2 = e2 + t(n2, e2);
          for (let e3 = 0; e3 < o2; e3 += 1) {
            if (i2 >= n2.length) return 0;
            i2 = r(n2, i2) || i2 + t(n2, i2);
          }
          return i2;
        }
        function o(n2, e2) {
          const o2 = r(n2, e2);
          return o2 > e2 ? o2 - e2 : t(n2, e2);
        }
        function i(...n2) {
          const t2 = (function(n3) {
            return n3.flatMap((n4) => {
              if ((function(n5) {
                return Array.isArray(n5) && n5.every(c);
              })(n4)) return n4;
              if (c(n4)) return [n4];
              if (!Array.isArray(n4)) throw new TypeError("Invalid ConverterFactory argument: expected a dictionary group or locale dictionary collection.");
              const e2 = [];
              let t3 = 0;
              for (; t3 < n4.length && c(n4[t3]); ) e2.push(n4[t3].slice()), t3 += 1;
              const r2 = n4.slice(t3);
              return e2.length > 0 && r2.length > 0 && r2.every(l) ? (e2[e2.length - 1].push(...r2), e2) : [n4];
            });
          })(n2).map((n3) => {
            const t3 = new e();
            return t3.loadDictGroup(n3), t3;
          });
          return function(n3) {
            return t2.reduce((n4, e2) => e2.convert(n4), n3);
          };
        }
        function a(n2) {
          return Array.isArray(n2) && "string" == typeof n2[0] && "string" == typeof n2[1];
        }
        function l(n2) {
          return "string" == typeof n2 || Array.isArray(n2) && n2.every(a);
        }
        function c(n2) {
          return Array.isArray(n2) && n2.every((n3) => (function(n4) {
            return "string" == typeof n4 && ("" === n4 || n4.includes(" "));
          })(n3) || Array.isArray(n3) && n3.every(a));
        }
        function s(n2) {
          return i([n2]);
        }
        function u(n2, e2, t2, r2) {
          return { convert: function() {
            !(function e3(o2, i2) {
              if (o2.nodeType !== Node.ELEMENT_NODE || !o2.classList.contains("ignore-opencc")) {
                if (o2.lang === t2 ? (i2 = true, o2.shouldChangeLang = true, o2.lang = r2) : o2.lang && o2.lang.length && (i2 = false), i2) {
                  if ("SCRIPT" === o2.tagName) return;
                  if ("STYLE" === o2.tagName) return;
                  "META" === o2.tagName && "description" === o2.name || "META" === o2.tagName && "keywords" === o2.name ? (null == o2.originalContent && (o2.originalContent = o2.content), o2.content = n2(o2.originalContent)) : "IMG" === o2.tagName ? (null == o2.originalAlt && (o2.originalAlt = o2.alt), o2.alt = n2(o2.originalAlt)) : "INPUT" === o2.tagName && "button" === o2.type && (null == o2.originalValue && (o2.originalValue = o2.value), o2.value = n2(o2.originalValue)), o2.nodeType === Node.ELEMENT_NODE && (o2.hasAttribute("placeholder") && (null == o2.originalPlaceholder && (o2.originalPlaceholder = o2.getAttribute("placeholder")), o2.setAttribute("placeholder", n2(o2.originalPlaceholder))), o2.hasAttribute("aria-label") && (null == o2.originalAriaLabel && (o2.originalAriaLabel = o2.getAttribute("aria-label")), o2.setAttribute("aria-label", n2(o2.originalAriaLabel))));
                }
                for (const t3 of o2.childNodes) t3.nodeType === Node.TEXT_NODE && i2 ? (null == t3.originalString && (t3.originalString = t3.nodeValue), t3.nodeValue = n2(t3.originalString)) : e3(t3, i2);
              }
            })(e2, false);
          }, restore: function() {
            !(function n3(e3) {
              if (e3.nodeType !== Node.ELEMENT_NODE || !e3.classList.contains("ignore-opencc")) {
                e3.shouldChangeLang && (e3.lang = t2), void 0 !== e3.originalString && (e3.nodeValue = e3.originalString), "META" === e3.tagName && "description" === e3.name || "META" === e3.tagName && "keywords" === e3.name ? void 0 !== e3.originalContent && (e3.content = e3.originalContent) : "IMG" === e3.tagName ? void 0 !== e3.originalAlt && (e3.alt = e3.originalAlt) : "INPUT" === e3.tagName && "button" === e3.type && void 0 !== e3.originalValue && (e3.value = e3.originalValue), void 0 !== e3.originalPlaceholder && e3.setAttribute("placeholder", e3.originalPlaceholder), void 0 !== e3.originalAriaLabel && e3.setAttribute("aria-label", e3.originalAriaLabel);
                for (const t3 of e3.childNodes) n3(t3);
              }
            })(e2);
          } };
        }
        var f = "\u4E00\u53E3\u5403\u500B \u4E00\u53E3\u55AB\u500B|\u4E00\u53E3\u5403\u6210 \u4E00\u53E3\u55AB\u6210|\u4E00\u5BB6\u4E09\u53E3 \u4E00\u5BB6\u4E09\u53E3|\u4E00\u5BB6\u4E94\u53E3 \u4E00\u5BB6\u4E94\u53E3|\u4E00\u5BB6\u516D\u53E3 \u4E00\u5BB6\u516D\u53E3|\u4E00\u5BB6\u56DB\u53E3 \u4E00\u5BB6\u56DB\u53E3|\u4E00\u91DD \u4E00\u91DD|\u4E00\u91DD\u898B\u8840 \u4E00\u91DD\u898B\u8840|\u4E09\u91DD \u4E09\u91DD|\u4E1F\u5DE7\u91DD \u4E1F\u5DE7\u91DD|\u4E39\u7A1C \u4E39\u7A1C|\u4E5D\u91DD \u4E5D\u91DD|\u4E82\u91DD\u7E61 \u4E82\u91DD\u7E61|\u4ED9\u53F0 \u4ED9\u53F0|\u5012\u6263\u91DD\u5152 \u5012\u6263\u91DD\u5152|\u505A\u91DD\u7DDA \u505A\u91DD\u7DDA|\u516B\u5B57\u65B9\u91DD \u516B\u5B57\u65B9\u91DD|\u5200\u5272\u91DD\u624E \u5200\u5272\u91DD\u624E|\u5206\u91DD \u5206\u91DD|\u5225\u91DD \u5225\u91DD|\u523A\u80F3\u91DD \u523A\u80F3\u91DD|\u523A\u91DD \u523A\u91DD|\u5317\u6E2F\u5CF6\u7DAB \u5317\u6E2F\u5CF6\u7DDA|\u5341\u91DD \u5341\u91DD|\u5357\u6E2F\u5CF6\u7DAB \u5357\u6E2F\u5CF6\u7DDA|\u5357\u91DD \u5357\u91DD|\u53CD\u6642\u91DD \u53CD\u6642\u91DD|\u53E3\u5403 \u53E3\u5403|\u53F0\u5C71 \u53F0\u5C71|\u53F0\u5C71\u5E02 \u53F0\u5C71\u5E02|\u53F0\u5DDE \u53F0\u5DDE|\u53F0\u5DDE\u5730\u5340 \u53F0\u5DDE\u5730\u5340|\u53F0\u5DDE\u5E02 \u53F0\u5DDE\u5E02|\u5403\u53E3 \u55AB\u53E3|\u5403\u53E3\u4EE4 \u5403\u53E3\u4EE4|\u5403\u53E3\u98EF \u55AB\u53E3\u98EF|\u5403\u5403 \u55AB\u55AB|\u5403\u5B50 \u55AB\u5B50|\u5411\u98A8\u91DD \u5411\u98A8\u91DD|\u5531\u91DD \u5531\u91DD|\u5544\u91DD\u5152 \u5544\u91DD\u5152|\u55CE\u5561\u91DD \u55CE\u5561\u91DD|\u5927\u653F\u65B9\u91DD \u5927\u653F\u65B9\u91DD|\u5927\u6D77\u6488\u91DD \u5927\u6D77\u6488\u91DD|\u5927\u982D\u91DD \u5927\u982D\u91DD|\u5929\u53F0 \u5929\u53F0|\u5929\u53F0\u5973 \u5929\u53F0\u5973|\u5929\u53F0\u5B97 \u5929\u53F0\u5B97|\u5929\u53F0\u5C71 \u5929\u53F0\u5C71|\u5929\u53F0\u7E23 \u5929\u53F0\u7E23|\u592A\u4E59\u795E\u91DD \u592A\u4E59\u795E\u91DD|\u5947\u53F0 \u5947\u53F0|\u5973\u4EBA\u5FC3\u6D77\u5E95\u91DD \u5973\u4EBA\u5FC3\u6D77\u5E95\u91DD|\u5B9A\u5357\u91DD \u5B9A\u5357\u91DD|\u5B9A\u98A8\u91DD \u5B9A\u98A8\u91DD|\u5C07\u8ECD\u6FB3\u7DAB \u5C07\u8ECD\u6FB3\u7DDA|\u5C0D\u91DD \u5C0D\u91DD|\u5C0F\u91DD \u5C0F\u91DD|\u5C0F\u91DD\u7F8E\u5BB9 \u5C0F\u91DD\u7F8E\u5BB9|\u5C6F\u99AC\u7DAB \u5C6F\u99AC\u7DDA|\u5E73\u91DD\u7E2B \u5E73\u91DD\u7E2B|\u5E7E\u91DD \u5E7E\u91DD|\u5F15\u7DDA\u7A7F\u91DD \u5F15\u7DDA\u7A7F\u91DD|\u5F35\u53E3 \u5F35\u53E3|\u5F35\u67CF\u829D \u5F35\u67CF\u829D|\u5F35\u6822\u829D \u5F35\u6822\u829D|\u5F35\u98DB\u7A7F\u91DD \u5F35\u98DB\u7A7F\u91DD|\u5F37\u5FC3\u91DD \u5F37\u5FC3\u91DD|\u5F3C\u91DD \u5F3C\u91DD|\u5F48\u91DD \u5F48\u91DD|\u61F8\u91DD \u61F8\u91DD|\u61F8\u91DD\u5782\u9732 \u61F8\u91DD\u5782\u9732|\u624B\u8155\u5F0F\u6307\u5317\u91DD \u624B\u8155\u5F0F\u6307\u5317\u91DD|\u624E\u91DD \u624E\u91DD|\u6253\u5B8C\u91DD \u6253\u5B8C\u91DD|\u6253\u91DD \u6253\u91DD|\u62AB\u91DD\u5F62\u8449 \u62AB\u91DD\u5F62\u8449|\u62B5\u91DD \u62B5\u91DD|\u62C8\u91DD\u6307 \u62C8\u91DD\u6307|\u6307\u5317\u91DD \u6307\u5317\u91DD|\u6307\u5357\u91DD \u6307\u5357\u91DD|\u6307\u63EE\u53F0 \u6307\u63EE\u53F0|\u6307\u91DD \u6307\u91DD|\u6307\u91DD\u5F0F \u6307\u91DD\u5F0F|\u63A2\u91DD \u63A2\u91DD|\u63A7\u5236\u53F0 \u63A7\u5236\u53F0|\u63D2\u91DD \u63D2\u91DD|\u6416\u91DD \u6416\u91DD|\u6417\u91DD \u6417\u91DD|\u649E\u91DD \u649E\u91DD|\u64FA\u91DD \u64FA\u91DD|\u6536\u91DD \u6536\u91DD|\u6559\u80B2\u65B9\u91DD \u6559\u80B2\u65B9\u91DD|\u6579\u4E00\u91DD \u6579\u4E00\u91DD|\u65B9\u91DD \u65B9\u91DD|\u6642\u91DD \u6642\u91DD|\u6688\u91DD \u6688\u91DD|\u66F2\u5225\u91DD \u66F2\u5225\u91DD|\u6771\u4E5D\u9F8D\u7DAB \u6771\u4E5D\u9F8D\u7DDA|\u6771\u6D77\u6488\u91DD \u6771\u6D77\u6488\u91DD|\u6771\u6D8C\u7DAB \u6771\u6D8C\u7DDA|\u6771\u9435\u7DAB \u6771\u9435\u7DDA|\u677E\u91DD \u677E\u91DD|\u679D\u91DD \u679D\u91DD|\u6851\u91DD \u6851\u91DD|\u68D2\u91DD \u68D2\u91DD|\u68D2\u91DD\u886B \u68D2\u91DD\u886B|\u68D8\u91DD \u68D8\u91DD|\u68D8\u91DD\u79D1 \u68D8\u91DD\u79D1|\u68D8\u91DD\u9580 \u68D8\u91DD\u9580|\u6A5F\u5834\u5FEB\u7DAB \u6A5F\u5834\u5FEB\u7DDA|\u6B65\u7DDA\u884C\u91DD \u6B65\u7DDA\u884C\u91DD|\u6BD2\u91DD \u6BD2\u91DD|\u6BDB\u7DDA\u91DD \u6BDB\u7DDA\u91DD|\u6BEB\u91DD \u6BEB\u91DD|\u6C34\u5E95\u6488\u91DD \u6C34\u5E95\u6488\u91DD|\u6C99\u4E2D\u7DAB \u6C99\u4E2D\u7DDA|\u6CE8\u5C04\u91DD \u6CE8\u5C04\u91DD|\u6CE8\u5C04\u91DD\u982D \u6CE8\u5C04\u91DD\u982D|\u6D17\u9762\u7682 \u6D17\u9762\u7682|\u6D17\u9AEE\u7682 \u6D17\u9AEE\u7682|\u6D59\u6C5F\u5929\u53F0\u7E23 \u6D59\u6C5F\u5929\u53F0\u7E23|\u6D77\u5E95\u6488\u91DD \u6D77\u5E95\u6488\u91DD|\u6E2F\u5CF6\u7DAB \u6E2F\u5CF6\u7DDA|\u6F0F\u91DD \u6F0F\u91DD|\u70AE\u53F0\u5C71\u5FAA\u9053\u885B\u7406\u4E2D\u5B78 \u70AE\u53F0\u5C71\u5FAA\u9053\u885B\u7406\u4E2D\u5B78|\u7121\u7DDA\u65B0\u805E\u53F0 \u7121\u7DDA\u65B0\u805E\u53F0|\u7121\u91DD\u4E0D\u5F15\u7DDA \u7121\u91DD\u4E0D\u5F15\u7DDA|\u7121\u91DD\u6CE8\u5C04\u5668 \u7121\u91DD\u6CE8\u5C04\u5668|\u71D4\u91DD \u71D4\u91DD|\u7559\u91DD \u7559\u91DD|\u7682\u5316 \u7682\u5316|\u7682\u83A2 \u7682\u83A2|\u7682\u83A2\u6A39 \u7682\u83A2\u6A39|\u7682\u89D2 \u7682\u89D2|\u77ED\u91DD \u77ED\u91DD|\u77F3\u91DD \u77F3\u91DD|\u786C\u80A5\u7682 \u786C\u80A5\u7682|\u78C1\u91DD \u78C1\u91DD|\u78E8\u6775\u6210\u91DD \u78E8\u6775\u6210\u91DD|\u78E8\u91DD\u6EAA \u78E8\u91DD\u6EAA|\u78E8\u9435\u6210\u91DD \u78E8\u9435\u6210\u91DD|\u79D2\u91DD \u79D2\u91DD|\u79E7\u91DD \u79E7\u91DD|\u7A46\u7A1C \u7A46\u7A1C|\u7A7F\u91DD \u7A7F\u91DD|\u7A7F\u91DD\u5F15\u7DDA \u7A7F\u91DD\u5F15\u7DDA|\u7A7F\u91DD\u8D70\u7DDA \u7A7F\u91DD\u8D70\u7DDA|\u7D0B\u5149\u91DD \u7D0B\u5149\u91DD|\u7D30\u91DD\u5BC6\u7E37 \u7D30\u91DD\u5BC6\u7E37|\u7D5E\u5305\u91DD \u7D5E\u5305\u91DD|\u7D66\u500B\u68D2\u9318\u7576\u91DD\u8A8D \u7D66\u500B\u68D2\u9318\u7576\u91DD\u8A8D|\u7D8F\u7A1C \u7D8F\u7A1C|\u7DBF\u88CF\u85CF\u91DD \u7DBF\u88CF\u85CF\u91DD|\u7DBF\u88CF\u91DD \u7DBF\u88CF\u91DD|\u7E2B\u8863\u91DD \u7E2B\u8863\u91DD|\u7E2B\u91DD \u7E2B\u91DD|\u7E2B\u91DD\u88DC\u7DDA \u7E2B\u91DD\u88DC\u7DDA|\u7E2B\u91DD\u8DE1 \u7E2B\u91DD\u8DE1|\u7E3D\u65B9\u91DD \u7E3D\u65B9\u91DD|\u7E43\u91DD \u7E43\u91DD|\u7E61\u82B1\u91DD \u7E61\u82B1\u91DD|\u7E61\u82B1\u91DD\u5152 \u7E61\u82B1\u91DD\u5152|\u7E61\u91DD \u7E61\u91DD|\u7F85\u76E4\u91DD \u7F85\u76E4\u91DD|\u7F8E\u767D\u91DD \u7F8E\u767D\u91DD|\u8033\u91DD \u8033\u91DD|\u80A5\u7682 \u80A5\u7682|\u80A5\u7682\u5287 \u80A5\u7682\u5287|\u80A5\u7682\u6CE1 \u80A5\u7682\u6CE1|\u80A5\u7682\u7C89 \u80A5\u7682\u7C89|\u80A5\u7682\u7D72 \u80A5\u7682\u7D72|\u80A5\u7682\u83A2 \u80A5\u7682\u83A2|\u80C3\u53E3 \u80C3\u53E3|\u80F8\u91DD \u80F8\u91DD|\u81FA\u7063\u53F0 \u81FA\u7063\u53F0|\u8239\u4E0D\u6F0F\u91DD\u6F0F\u91DD\u6C92\u5916\u4EBA \u8239\u4E0D\u6F0F\u91DD\u6F0F\u91DD\u6C92\u5916\u4EBA|\u82B1\u5152\u91DD \u82B1\u5152\u91DD|\u8305\u91DD \u8305\u91DD|\u8343\u7063\u7DAB \u8343\u7063\u7DDA|\u8449\u91DD \u8449\u91DD|\u85CF\u91DD\u7E2B \u85CF\u91DD\u7E2B|\u85E5\u7682 \u85E5\u7682|\u85E5\u91DD \u85E5\u91DD|\u86C7\u53E3\u8702\u91DD \u86C7\u53E3\u8702\u91DD|\u87AB\u91DD \u87AB\u91DD|\u883B\u91DD\u778E\u7078 \u883B\u91DD\u778E\u7078|\u88DC\u8840\u91DD \u88DC\u8840\u91DD|\u88DC\u91DD \u88DC\u91DD|\u898B\u7E2B\u63D2\u91DD \u898B\u7E2B\u63D2\u91DD|\u89C0\u5858\u7DAB \u89C0\u5858\u7DDA|\u8A0E\u91DD\u7DDA \u8A0E\u91DD\u7DDA|\u8C61\u7259\u91DD\u5C16 \u8C61\u7259\u91DD\u5C16|\u8CC0\u723E\u8499\u91DD \u8CC0\u723E\u8499\u91DD|\u8DF3\u91DD \u8DF3\u91DD|\u8E47\u5403 \u8E47\u5403|\u8EDF\u80A5\u7682 \u8EDF\u80A5\u7682|\u8FEA\u58EB\u5C3C\u7DAB \u8FEA\u58EB\u5C3C\u7DDA|\u8FF4\u7D0B\u91DD \u8FF4\u7D0B\u91DD|\u9000\u91DD \u9000\u91DD|\u9006\u6642\u91DD \u9006\u6642\u91DD|\u907F\u96F7\u91DD \u907F\u96F7\u91DD|\u90ED\u53F0\u6210 \u90ED\u53F0\u6210|\u90ED\u53F0\u9298 \u90ED\u53F0\u9298|\u9127\u827E\u5403 \u9127\u827E\u5403|\u91D1\u91DD \u91D1\u91DD|\u91D1\u91DD\u5C71 \u91D1\u91DD\u5C71|\u91D1\u91DD\u5EA6\u4EBA \u91D1\u91DD\u5EA6\u4EBA|\u91D1\u91DD\u82B1 \u91D1\u91DD\u82B1|\u91D1\u91DD\u83C7 \u91D1\u91DD\u83C7|\u91D1\u91DD\u83DC \u91D1\u91DD\u83DC|\u91D8\u66F8\u91DD \u91D8\u66F8\u91DD|\u91DD\u5177 \u91DD\u5177|\u91DD\u523A \u91DD\u523A|\u91DD\u523A\u9EBB\u9189 \u91DD\u523A\u9EBB\u9189|\u91DD\u5291 \u91DD\u5291|\u91DD\u5B54 \u91DD\u5B54|\u91DD\u5B54\u651D\u5F71\u6A5F \u91DD\u5B54\u651D\u5F71\u6A5F|\u91DD\u5B54\u7167\u50CF \u91DD\u5B54\u7167\u50CF|\u91DD\u5B54\u7167\u50CF\u6A5F \u91DD\u5B54\u7167\u50CF\u6A5F|\u91DD\u5B54\u73FE\u8C61 \u91DD\u5B54\u73FE\u8C61|\u91DD\u5C0D \u91DD\u5C0D|\u91DD\u5C0D\u6027 \u91DD\u5C0D\u6027|\u91DD\u5C0D\u65BC \u91DD\u5C0D\u65BC|\u91DD\u5C16 \u91DD\u5C16|\u91DD\u5C16\u5152 \u91DD\u5C16\u5152|\u91DD\u5DE5 \u91DD\u5DE5|\u91DD\u5E03 \u91DD\u5E03|\u91DD\u5F62\u8449 \u91DD\u5F62\u8449|\u91DD\u6307 \u91DD\u6307|\u91DD\u6311\u5200\u6316 \u91DD\u6311\u5200\u6316|\u91DD\u68B3\u6A5F \u91DD\u68B3\u6A5F|\u91DD\u6C08 \u91DD\u6C08|\u91DD\u6CD5 \u91DD\u6CD5|\u91DD\u7099 \u91DD\u7099|\u91DD\u72C0 \u91DD\u72C0|\u91DD\u72C0\u7269 \u91DD\u72C0\u7269|\u91DD\u76E4 \u91DD\u76E4|\u91DD\u773C \u91DD\u773C|\u91DD\u773C\u5B50 \u91DD\u773C\u5B50|\u91DD\u795E \u91DD\u795E|\u91DD\u7B46 \u91DD\u7B46|\u91DD\u7B46\u5320 \u91DD\u7B46\u5320|\u91DD\u7B52 \u91DD\u7B52|\u91DD\u7B8D \u91DD\u7B8D|\u91DD\u7B8D\u5152 \u91DD\u7B8D\u5152|\u91DD\u7DDA \u91DD\u7DDA|\u91DD\u7DDA\u5305 \u91DD\u7DDA\u5305|\u91DD\u7DDA\u5A18 \u91DD\u7DDA\u5A18|\u91DD\u7DDA\u6D3B \u91DD\u7DDA\u6D3B|\u91DD\u7DDA\u6D3B\u8A08 \u91DD\u7DDA\u6D3B\u8A08|\u91DD\u7DDA\u76D2 \u91DD\u7DDA\u76D2|\u91DD\u7DDA\u7B94\u7C6C \u91DD\u7DDA\u7B94\u7C6C|\u91DD\u7E54 \u91DD\u7E54|\u91DD\u7E54\u54C1 \u91DD\u7E54\u54C1|\u91DD\u7E54\u5EE0 \u91DD\u7E54\u5EE0|\u91DD\u7E54\u6599 \u91DD\u7E54\u6599|\u91DD\u8173 \u91DD\u8173|\u91DD\u8449 \u91DD\u8449|\u91DD\u8449\u6797 \u91DD\u8449\u6797|\u91DD\u8449\u690D\u7269 \u91DD\u8449\u690D\u7269|\u91DD\u8449\u6A39 \u91DD\u8449\u6A39|\u91DD\u91DD\u898B\u8840 \u91DD\u91DD\u898B\u8840|\u91DD\u91E6 \u91DD\u91E6|\u91DD\u92D2 \u91DD\u92D2|\u91DD\u92D2\u76F8\u5C0D \u91DD\u92D2\u76F8\u5C0D|\u91DD\u92D2\u76F8\u6295 \u91DD\u92D2\u76F8\u6295|\u91DD\u92E9 \u91DD\u92E9|\u91DD\u982D \u91DD\u982D|\u91DD\u990C\u83AB\u6E1B \u91DD\u990C\u83AB\u6E1B|\u91DD\u9AA8 \u91DD\u9AA8|\u91DD\u9B5A \u91DD\u9B5A|\u91DD\u9EF9 \u91DD\u9EF9|\u91DD\u9EF9\u7D21\u7E3E \u91DD\u9EF9\u7D21\u7E3E|\u91DD\u9F34 \u91DD\u9F34|\u91DD\u9F3B \u91DD\u9F3B|\u91DD\u9F3B\u5152 \u91DD\u9F3B\u5152|\u91E6\u91DD \u91E6\u91DD|\u9264\u91DD \u9264\u91DD|\u9280\u91DD \u9280\u91DD|\u92FC\u91DD \u92FC\u91DD|\u9336\u91DD \u9336\u91DD|\u9435\u91DD \u9435\u91DD|\u9577\u91DD \u9577\u91DD|\u958B\u53E3 \u958B\u53E3|\u9632\u75AB\u91DD \u9632\u75AB\u91DD|\u96FB\u5531\u91DD \u96FB\u5531\u91DD|\u96FB\u91DD \u96FB\u91DD|\u96FB\u91DD\u9EBB\u9189 \u96FB\u91DD\u9EBB\u9189|\u9762\u7682 \u9762\u7682|\u9802\u91DD \u9802\u91DD|\u9802\u91DD\u5152 \u9802\u91DD\u5152|\u9802\u91DD\u6371\u4F4F \u9802\u91DD\u6371\u4F4F|\u9802\u9580\u91DD \u9802\u9580\u91DD|\u9806\u6642\u91DD \u9806\u6642\u91DD|\u9810\u9632\u91DD \u9810\u9632\u91DD|\u9818\u5E36\u91DD \u9818\u5E36\u91DD|\u98A8\u5411\u91DD \u98A8\u5411\u91DD|\u98DB\u91DD\u8D70\u7DDA \u98DB\u91DD\u8D70\u7DDA|\u9999\u7682 \u9999\u7682|\u9AA8\u91DD \u9AA8\u91DD|\u9AEE\u91DD \u9AEE\u91DD|\u9B3C\u91DD\u8349 \u9B3C\u91DD\u8349|\u9CF3\u53F0 \u9CF3\u53F0|\u9E7D\u6C34\u91DD \u9E7D\u6C34\u91DD|\u9EBB\u9189\u91DD \u9EBB\u9189\u91DD|\u9EC3\u6210 \u9EC3\u6210|\u9F3B\u91DD\u7642\u6CD5 \u9F3B\u91DD\u7642\u6CD5|\u9F67\u8617\u541E\u91DD \u9F67\u8617\u541E\u91DD|\u9F8D\u61C9\u53F0 \u9F8D\u61C9\u53F0", g = "\u507D \u50DE|\u5151 \u514C|\u5367 \u81E5|\u53C1 \u53C4|\u53F0 \u81FA|\u5403 \u55AB|\u5507 \u8123|\u555F \u5553|\u56F1 \u56EA|\u5AAA \u5ABC|\u5AAF \u5B00|\u60A6 \u6085|\u6120 \u614D|\u6237 \u6236|\u635D \u6329|\u63FE \u6435|\u654D \u6558|\u655A \u6553|\u67B1 \u6AAF|\u67B4 \u67FA|\u68C1 \u68B2|\u6985 \u69B2|\u6C32 \u6C33|\u6D9A \u6D97|\u6E29 \u6EAB|\u6E88 \u6F59|\u6F40 \u6F68|\u6FD5 \u6EBC|\u7076 \u7AC8|\u70BA \u7232|\u7174 \u7185|\u75F4 \u7661|\u7682 \u7681|\u773E \u8846|\u79D8 \u7955|\u7A0E \u7A05|\u7A1C \u68F1|\u7CA7 \u599D|\u7CBD \u7CC9|\u7CED \u7CC9|\u7DAB \u7DDA|\u7DFC \u7E15|\u7F3D \u9262|\u8131 \u812B|\u817D \u8183|\u8471 \u8525|\u8480 \u8495|\u848D \u853F|\u85F4 \u860A|\u8715 \u86FB|\u885E \u885B|\u8879 \u53EA|\u8AAC \u8AAA|\u8E34 \u8E0A|\u8F3C \u8F40|\u9196 \u919E|\u91DD \u937C|\u920E \u9264|\u92ED \u92B3|\u95B2 \u95B1|\u9C1B \u9C2E", d = "\u4F0A\u5229\u8AFE \u4F0A\u5229\u8AFE\u4F0A|\u4F0A\u5229\u8AFE\u5DDE \u4F0A\u5229\u8AFE\u4F0A\u5DDE|\u4F3A\u670D\u5668 \u670D\u52D9\u5668|\u4F5C\u696D\u7CFB\u7D71 \u64CD\u4F5C\u7CFB\u7D71|\u5317\u5361\u7F85\u840A\u7D0D \u5317\u5361\u7F85\u4F86\u7D0D|\u5317\u5361\u7F85\u840A\u7D0D\u5DDE \u5317\u5361\u7F85\u4F86\u7D0D\u5DDE|\u5357\u5361\u7F85\u840A\u7D0D \u5357\u5361\u7F85\u4F86\u7D0D|\u5357\u5361\u7F85\u840A\u7D0D\u5DDE \u5357\u5361\u7F85\u4F86\u7D0D\u5DDE|\u5967\u514B\u62C9\u8377\u99AC \u4FC4\u514B\u62C9\u4F55\u99AC|\u5967\u514B\u62C9\u8377\u99AC\u5DDE \u4FC4\u514B\u62C9\u4F55\u99AC\u5DDE|\u5BC6\u829D\u6839 \u5BC6\u6B47\u6839|\u5BC6\u829D\u6839\u5DDE \u5BC6\u6B47\u6839\u5DDE|\u5BEC\u983B \u5BEC\u5E36|\u5FB7\u85A9\u65AF \u5F97\u514B\u85A9\u65AF|\u5FB7\u85A9\u65AF\u5DDE \u5F97\u514B\u85A9\u65AF\u5DDE|\u641C\u5C0B \u641C\u7D22|\u68B3\u8299\u5398 \u8212\u8299\u857E|\u6982\u7387 \u6982\u7387|\u6A5F\u6703\u7387 \u6982\u7387|\u6A5F\u7387 \u5E7E\u7387|\u6E38\u6A19 \u5149\u6A19|\u6ED1\u9F20 \u9F20\u6A19|\u786C\u789F \u786C\u76E4|\u79C1\u96B1\u6B0A \u96B1\u79C1\u6B0A|\u7A0B\u5F0F\u8A9E\u8A00 \u7DE8\u7A0B\u8A9E\u8A00|\u7DAD\u73CD\u5C3C\u4E9E \u5F17\u5409\u5C3C\u4E9E|\u7DAD\u73CD\u5C3C\u4E9E\u5DDE \u5F17\u5409\u5C3C\u4E9E\u5DDE|\u7F85\u5FB7\u5CF6 \u7F85\u5F97\u5CF6|\u7F85\u5FB7\u5CF6\u5DDE \u7F85\u5F97\u5CF6\u5DDE|\u897F\u7DAD\u73CD\u5C3C\u4E9E \u897F\u5F17\u5409\u5C3C\u4E9E|\u897F\u7DAD\u73CD\u5C3C\u4E9E\u5DDE \u897F\u5F17\u5409\u5C3C\u4E9E\u5DDE|\u8CC7\u6599\u593E \u6587\u4EF6\u593E|\u8CD3\u5915\u51E1\u5C3C\u4E9E \u8CD3\u5915\u6CD5\u5C3C\u4E9E|\u8CD3\u5915\u51E1\u5C3C\u4E9E\u5DDE \u8CD3\u5915\u6CD5\u5C3C\u4E9E\u5DDE|\u99AC\u5229\u862D \u99AC\u91CC\u862D|\u99AC\u5229\u862D\u5DDE \u99AC\u91CC\u862D\u5DDE", p = "\u4E00\u53E3\u5403\u500B \u4E00\u53E3\u55AB\u500B|\u4E00\u53E3\u5403\u6210 \u4E00\u53E3\u55AB\u6210|\u4E00\u5BB6\u4E09\u53E3 \u4E00\u5BB6\u4E09\u53E3|\u4E00\u5BB6\u4E94\u53E3 \u4E00\u5BB6\u4E94\u53E3|\u4E00\u5BB6\u516D\u53E3 \u4E00\u5BB6\u516D\u53E3|\u4E00\u5BB6\u56DB\u53E3 \u4E00\u5BB6\u56DB\u53E3|\u4E00\u5C55\u9577\u624D \u4E00\u5C55\u9577\u624D|\u4E00\u6D41\u4EBA\u624D \u4E00\u6D41\u4EBA\u624D|\u4E00\u8868\u4EBA\u624D \u4E00\u8868\u4EBA\u624D|\u4E00\u91DD \u4E00\u91DD|\u4E00\u91DD\u898B\u8840 \u4E00\u91DD\u898B\u8840|\u4E03\u6B65\u4E4B\u624D \u4E03\u6B65\u4E4B\u624D|\u4E03\u6B65\u5947\u624D \u4E03\u6B65\u5947\u624D|\u4E09\u624D \u4E09\u624D|\u4E09\u624D\u5716\u6703 \u4E09\u624D\u5716\u6703|\u4E09\u91DD \u4E09\u91DD|\u4E0B\u624D \u4E0B\u624D|\u4E0D\u6210\u624D \u4E0D\u6210\u624D|\u4E0D\u624D \u4E0D\u624D|\u4E0D\u6253\u4E0D\u6210\u624D \u4E0D\u6253\u4E0D\u6210\u624D|\u4E0D\u826F\u624D \u4E0D\u826F\u624D|\u4E1F\u5DE7\u91DD \u4E1F\u5DE7\u91DD|\u4E2D\u624D \u4E2D\u624D|\u4E2D\u6838 \u4E2D\u6838|\u4E39\u7A1C \u4E39\u7A1C|\u4E4B\u6838 \u4E4B\u6838|\u4E5D\u91DD \u4E5D\u91DD|\u4E7E\u5974\u624D \u4E7E\u5974\u624D|\u4E82\u91DD\u7E61 \u4E82\u91DD\u7E61|\u4E8C\u6D41\u4EBA\u624D \u4E8C\u6D41\u4EBA\u624D|\u4E9E\u6838 \u4E9E\u6838|\u4EBA\u624D \u4EBA\u624D|\u4EBA\u624D\u51FA\u8846 \u4EBA\u624D\u51FA\u8846|\u4EBA\u624D\u5916\u6D41 \u4EBA\u624D\u5916\u6D41|\u4EBA\u624D\u5EAB \u4EBA\u624D\u5EAB|\u4EBA\u624D\u6D41\u5931 \u4EBA\u624D\u6D41\u5931|\u4EBA\u624D\u6FDF\u6FDF \u4EBA\u624D\u6FDF\u6FDF|\u4EBA\u624D\u8F29\u51FA \u4EBA\u624D\u8F29\u51FA|\u4EBA\u624D\u96E3\u5F97 \u4EBA\u624D\u96E3\u5F97|\u4EBA\u76E1\u5176\u624D \u4EBA\u76E1\u5176\u624D|\u4ED9\u624D \u4ED9\u624D|\u4F0A\u6838 \u4F0A\u6838|\u4F5C\u80B2\u82F1\u624D \u4F5C\u80B2\u82F1\u624D|\u4F73\u4EBA\u624D\u5B50 \u4F73\u4EBA\u624D\u5B50|\u500B\u6838 \u500B\u6838|\u5012\u4E86\u6838\u6843\u8ECA\u5B50 \u5012\u4E86\u6838\u6843\u8ECA\u5B50|\u5012\u6263\u91DD\u5152 \u5012\u6263\u91DD\u5152|\u504F\u624D \u504F\u624D|\u505A\u91DD\u7DDA \u505A\u91DD\u7DDA|\u50B2\u4E16\u8F15\u624D \u50B2\u4E16\u8F15\u624D|\u50C5\u4F5C\u53C3\u8003 \u50C5\u4F5C\u53C3\u8003|\u50C5\u4F9B\u53C3\u8003 \u50C5\u4F9B\u53C3\u8003|\u5132\u8A13\u4EBA\u624D \u5132\u8A13\u4EBA\u624D|\u514D\u53C3 \u514D\u53C3|\u5167\u53C3 \u5167\u53C3|\u5167\u6838 \u5167\u6838|\u5168\u624D \u5168\u624D|\u5168\u7A0B\u53C3\u52A0 \u5168\u7A0B\u53C3\u52A0|\u5168\u9762\u7981\u6B62\u6838\u8A66\u9A57\u689D\u7D04 \u5168\u9762\u7981\u6B62\u6838\u8A66\u9A57\u689D\u7D04|\u516B\u5B57\u65B9\u91DD \u516B\u5B57\u65B9\u91DD|\u516B\u6597\u4E4B\u624D \u516B\u6597\u4E4B\u624D|\u516B\u6597\u624D \u516B\u6597\u624D|\u516C\u624D\u516C\u671B \u516C\u624D\u516C\u671B|\u516C\u8846\u53C3\u8207 \u516C\u8846\u53C3\u8207|\u516D\u624D\u5B50\u66F8 \u516D\u624D\u5B50\u66F8|\u5176\u6838 \u5176\u6838|\u51A0\u4E16\u4E4B\u624D \u51A0\u4E16\u4E4B\u624D|\u51B0\u6838 \u51B0\u6838|\u51E0\u6848\u4E4B\u624D \u51E0\u6848\u4E4B\u624D|\u51E1\u624D \u51E1\u624D|\u51FA\u502B\u4E4B\u624D \u51FA\u502B\u4E4B\u624D|\u5200\u5272\u91DD\u624E \u5200\u5272\u91DD\u624E|\u5206\u91DD \u5206\u91DD|\u521D\u9732\u624D\u83EF \u521D\u9732\u624D\u83EF|\u5225\u91DD \u5225\u91DD|\u5229\u5F0A\u53C3\u534A \u5229\u5F0A\u53C3\u534A|\u523A\u80F3\u91DD \u523A\u80F3\u91DD|\u523A\u91DD \u523A\u91DD|\u524B\u6838 \u524B\u6838|\u524D\u6838 \u524D\u6838|\u529B\u8584\u624D\u758F \u529B\u8584\u624D\u758F|\u529F\u904E\u53C3\u534A \u529F\u904E\u53C3\u534A|\u52D5\u5982\u53C3\u5546 \u52D5\u5982\u53C3\u5546|\u5321\u6FDF\u4E4B\u624D \u5321\u6FDF\u4E4B\u624D|\u5341\u91DD \u5341\u91DD|\u5343\u5678\u7D1A\u6838\u6B66\u5668 \u5343\u5678\u7D1A\u6838\u6B66\u5668|\u5357\u91DD \u5357\u91DD|\u535A\u5B78\u591A\u624D \u535A\u5B78\u591A\u624D|\u536F\u9149\u53C3\u8FB0 \u536F\u9149\u53C3\u8FB0|\u5370\u6838 \u5370\u6838|\u5375\u6838 \u5375\u6838|\u539F\u5B50\u6838 \u539F\u5B50\u6838|\u539F\u6838 \u539F\u6838|\u53BB\u6838 \u53BB\u6838|\u53C3\u4E88 \u53C3\u4E88|\u53C3\u4E8B \u53C3\u4E8B|\u53C3\u4F0D \u53C3\u4F0D|\u53C3\u4F50 \u53C3\u4F50|\u53C3\u5047 \u53C3\u5047|\u53C3\u5169\u9662 \u53C3\u5169\u9662|\u53C3\u524D\u843D\u5F8C \u53C3\u524D\u843D\u5F8C|\u53C3\u52A0 \u53C3\u52A0|\u53C3\u52A0\u4EBA \u53C3\u52A0\u4EBA|\u53C3\u52A0\u570B \u53C3\u52A0\u570B|\u53C3\u52A0\u5B8C \u53C3\u52A0\u5B8C|\u53C3\u52A0\u7232 \u53C3\u52A0\u7232|\u53C3\u52A0\u734E \u53C3\u52A0\u734E|\u53C3\u52A0\u8005 \u53C3\u52A0\u8005|\u53C3\u52BE \u53C3\u52BE|\u53C3\u534A \u53C3\u534A|\u53C3\u5408 \u53C3\u5408|\u53C3\u540C\u5951 \u53C3\u540C\u5951|\u53C3\u5546 \u53C3\u5546|\u53C3\u5718 \u53C3\u5718|\u53C3\u5802 \u53C3\u5802|\u53C3\u5834 \u53C3\u5834|\u53C3\u5929 \u53C3\u5929|\u53C3\u594F \u53C3\u594F|\u53C3\u5B6B \u53C3\u5B6B|\u53C3\u5BBF \u53C3\u5BBF|\u53C3\u5BBF\u4E03 \u53C3\u5BBF\u4E03|\u53C3\u5C07 \u53C3\u5C07|\u53C3\u5C55 \u53C3\u5C55|\u53C3\u5C55\u5546 \u53C3\u5C55\u5546|\u53C3\u5C55\u5718 \u53C3\u5C55\u5718|\u53C3\u5DEE \u53C3\u5DEE|\u53C3\u5DEE\u4E0D\u9F4A \u53C3\u5DEE\u4E0D\u9F4A|\u53C3\u5DEE\u932F\u843D \u53C3\u5DEE\u932F\u843D|\u53C3\u5EA6 \u53C3\u5EA6|\u53C3\u609F \u53C3\u609F|\u53C3\u6230 \u53C3\u6230|\u53C3\u6230\u570B \u53C3\u6230\u570B|\u53C3\u62DC \u53C3\u62DC|\u53C3\u62FE\u58F9 \u53C3\u62FE\u58F9|\u53C3\u62FE\u9678 \u53C3\u62FE\u9678|\u53C3\u653F \u53C3\u653F|\u53C3\u653F\u6B0A \u53C3\u653F\u6B0A|\u53C3\u6578 \u53C3\u6578|\u53C3\u6578\u8868 \u53C3\u6578\u8868|\u53C3\u6703 \u53C3\u6703|\u53C3\u671D \u53C3\u671D|\u53C3\u672C \u53C3\u672C|\u53C3\u6821 \u53C3\u6821|\u53C3\u6F14 \u53C3\u6F14|\u53C3\u7167 \u53C3\u7167|\u53C3\u7167\u5361 \u53C3\u7167\u5361|\u53C3\u7167\u7269 \u53C3\u7167\u7269|\u53C3\u7167\u7CFB \u53C3\u7167\u7CFB|\u53C3\u770B \u53C3\u770B|\u53C3\u77E5\u653F\u4E8B \u53C3\u77E5\u653F\u4E8B|\u53C3\u7834 \u53C3\u7834|\u53C3\u79AA \u53C3\u79AA|\u53C3\u7D9C \u53C3\u7D9C|\u53C3\u8003 \u53C3\u8003|\u53C3\u8003\u503C \u53C3\u8003\u503C|\u53C3\u8003\u50F9 \u53C3\u8003\u50F9|\u53C3\u8003\u50F9\u503C \u53C3\u8003\u50F9\u503C|\u53C3\u8003\u53C3\u8003 \u53C3\u8003\u53C3\u8003|\u53C3\u8003\u5EA7\u6A19 \u53C3\u8003\u5EA7\u6A19|\u53C3\u8003\u6027 \u53C3\u8003\u6027|\u53C3\u8003\u624B\u518A \u53C3\u8003\u624B\u518A|\u53C3\u8003\u6587\u737B \u53C3\u8003\u6587\u737B|\u53C3\u8003\u66F8 \u53C3\u8003\u66F8|\u53C3\u8003\u66F8\u76EE \u53C3\u8003\u66F8\u76EE|\u53C3\u8003\u6750\u6599 \u53C3\u8003\u6750\u6599|\u53C3\u8003\u6CD5 \u53C3\u8003\u6CD5|\u53C3\u8003\u6D88\u606F \u53C3\u8003\u6D88\u606F|\u53C3\u8003\u7279\u85CF \u53C3\u8003\u7279\u85CF|\u53C3\u8003\u7CFB \u53C3\u8003\u7CFB|\u53C3\u8003\u8CC7\u6599 \u53C3\u8003\u8CC7\u6599|\u53C3\u80A1 \u53C3\u80A1|\u53C3\u8207 \u53C3\u8207|\u53C3\u8207\u4EBA\u54E1 \u53C3\u8207\u4EBA\u54E1|\u53C3\u8207\u5236 \u53C3\u8207\u5236|\u53C3\u8207\u5EA6 \u53C3\u8207\u5EA6|\u53C3\u8207\u611F \u53C3\u8207\u611F|\u53C3\u8207\u6B0A \u53C3\u8207\u6B0A|\u53C3\u8207\u7387 \u53C3\u8207\u7387|\u53C3\u8207\u8005 \u53C3\u8207\u8005|\u53C3\u8846\u5169\u9662 \u53C3\u8846\u5169\u9662|\u53C3\u898B \u53C3\u898B|\u53C3\u898B\u4E92\u7167 \u53C3\u898B\u4E92\u7167|\u53C3\u898B\u6CE8 \u53C3\u898B\u6CE8|\u53C3\u89C0 \u53C3\u89C0|\u53C3\u89C0\u5238 \u53C3\u89C0\u5238|\u53C3\u89C0\u53C3\u89C0 \u53C3\u89C0\u53C3\u89C0|\u53C3\u89C0\u5718 \u53C3\u89C0\u5718|\u53C3\u89C0\u5718\u9AD4 \u53C3\u89C0\u5718\u9AD4|\u53C3\u89C0\u5B8C \u53C3\u89C0\u5B8C|\u53C3\u89C0\u8005 \u53C3\u89C0\u8005|\u53C3\u8A02 \u53C3\u8A02|\u53C3\u8A13 \u53C3\u8A13|\u53C3\u8A2A \u53C3\u8A2A|\u53C3\u8A2A\u5718 \u53C3\u8A2A\u5718|\u53C3\u8A55 \u53C3\u8A55|\u53C3\u8A71\u982D \u53C3\u8A71\u982D|\u53C3\u8ACB \u53C3\u8ACB|\u53C3\u8B00 \u53C3\u8B00|\u53C3\u8B00\u7E3D\u90E8 \u53C3\u8B00\u7E3D\u90E8|\u53C3\u8B00\u7E3D\u9577 \u53C3\u8B00\u7E3D\u9577|\u53C3\u8B00\u9577 \u53C3\u8B00\u9577|\u53C3\u8B01 \u53C3\u8B01|\u53C3\u8B5A \u53C3\u8B5A|\u53C3\u8B70 \u53C3\u8B70|\u53C3\u8B70\u54E1 \u53C3\u8B70\u54E1|\u53C3\u8B70\u6703 \u53C3\u8B70\u6703|\u53C3\u8B70\u9662 \u53C3\u8B70\u9662|\u53C3\u8CFD \u53C3\u8CFD|\u53C3\u8CFD\u570B \u53C3\u8CFD\u570B|\u53C3\u8CFD\u6B0A \u53C3\u8CFD\u6B0A|\u53C3\u8CFD\u7247 \u53C3\u8CFD\u7247|\u53C3\u8CFD\u8005 \u53C3\u8CFD\u8005|\u53C3\u8D0A \u53C3\u8D0A|\u53C3\u8ECD \u53C3\u8ECD|\u53C3\u8FB0 \u53C3\u8FB0|\u53C3\u8FB0\u536F\u9149 \u53C3\u8FB0\u536F\u9149|\u53C3\u8FB0\u65E5\u6708 \u53C3\u8FB0\u65E5\u6708|\u53C3\u900F \u53C3\u900F|\u53C3\u9053 \u53C3\u9053|\u53C3\u9078 \u53C3\u9078|\u53C3\u9078\u4EBA \u53C3\u9078\u4EBA|\u53C3\u914C \u53C3\u914C|\u53C3\u91CF \u53C3\u91CF|\u53C3\u91CF\u7A7A\u9593 \u53C3\u91CF\u7A7A\u9593|\u53C3\u932F \u53C3\u932F|\u53C3\u95B1 \u53C3\u95B1|\u53C3\u9662 \u53C3\u9662|\u53C3\u96DC \u53C3\u96DC|\u53C3\u9748 \u53C3\u9748|\u53C3\u9769 \u53C3\u9769|\u53C3\u9810 \u53C3\u9810|\u53C3\u982D \u53C3\u982D|\u53C3\u9A57 \u53C3\u9A57|\u53CD\u6642\u91DD \u53CD\u6642\u91DD|\u53CD\u6838 \u53CD\u6838|\u53D6\u624D \u53D6\u624D|\u53E3\u5403 \u53E3\u5403|\u53E3\u624D \u53E3\u624D|\u53E3\u624D\u597D \u53E3\u624D\u597D|\u53E3\u624D\u8FA8\u7D66 \u53E3\u624D\u8FA8\u7D66|\u53EF\u4F9B\u53C3\u8003 \u53EF\u4F9B\u53C3\u8003|\u53EF\u618E\u624D \u53EF\u618E\u624D|\u5403\u53E3 \u55AB\u53E3|\u5403\u53E3\u4EE4 \u5403\u53E3\u4EE4|\u5403\u53E3\u98EF \u55AB\u53E3\u98EF|\u5403\u5403 \u55AB\u55AB|\u5403\u5B50 \u55AB\u5B50|\u5408\u8457 \u5408\u8457|\u5408\u8457\u8005 \u5408\u8457\u8005|\u540C\u53C3 \u540C\u53C3|\u540D\u8457 \u540D\u8457|\u5411\u98A8\u91DD \u5411\u98A8\u91DD|\u547D\u4E16\u4E4B\u624D \u547D\u4E16\u4E4B\u624D|\u547D\u4E16\u624D \u547D\u4E16\u624D|\u548C\u6838 \u548C\u6838|\u5510\u624D\u5E38 \u5510\u624D\u5E38|\u5531\u91DD \u5531\u91DD|\u5544\u91DD\u5152 \u5544\u91DD\u5152|\u5584\u624D \u5584\u624D|\u5584\u624D\u7AE5\u5B50 \u5584\u624D\u7AE5\u5B50|\u559C\u6182\u53C3\u534A \u559C\u6182\u53C3\u534A|\u559D\u53C3 \u559D\u53C3|\u55AB\u6572\u624D \u55AB\u6572\u624D|\u55AC\u624D \u55AC\u624D|\u55AE\u6838 \u55AE\u6838|\u55AE\u6838\u7D30\u80DE\u589E\u591A\u75C7 \u55AE\u6838\u7D30\u80DE\u589E\u591A\u75C7|\u55CE\u5561\u91DD \u55CE\u5561\u91DD|\u56DB\u624D\u5B50 \u56DB\u624D\u5B50|\u56DB\u6838 \u56DB\u6838|\u571F\u53C3 \u571F\u53C3|\u5730\u6838 \u5730\u6838|\u5730\u9762\u6838\u7206\u70B8 \u5730\u9762\u6838\u7206\u70B8|\u57CB\u6C92\u4EBA\u624D \u57CB\u6C92\u4EBA\u624D|\u589E\u91CF\u53C3\u6578 \u589E\u91CF\u53C3\u6578|\u5916\u624D \u5916\u624D|\u5916\u6838 \u5916\u6838|\u591A\u4E8B\u901E\u624D \u591A\u4E8B\u901E\u624D|\u591A\u624D \u591A\u624D|\u591A\u624D\u591A\u85DD \u591A\u624D\u591A\u85DD|\u591A\u6838 \u591A\u6838|\u5927\u624D \u5927\u624D|\u5927\u624D\u5C0F\u7528 \u5927\u624D\u5C0F\u7528|\u5927\u624D\u69C3\u69C3 \u5927\u624D\u69C3\u69C3|\u5927\u653F\u65B9\u91DD \u5927\u653F\u65B9\u91DD|\u5927\u66C6\u5341\u624D\u5B50 \u5927\u66C6\u5341\u624D\u5B50|\u5927\u6838 \u5927\u6838|\u5927\u6D77\u6488\u91DD \u5927\u6D77\u6488\u91DD|\u5927\u982D\u91DD \u5927\u982D\u91DD|\u5929\u5992\u82F1\u624D \u5929\u5992\u82F1\u624D|\u5929\u624D \u5929\u624D|\u5929\u624D\u5152\u7AE5 \u5929\u624D\u5152\u7AE5|\u5929\u624D\u51FA\u81EA\u52E4\u596E \u5929\u624D\u51FA\u81EA\u52E4\u596E|\u5929\u624D\u578B \u5929\u624D\u578B|\u5929\u624D\u6559\u80B2 \u5929\u624D\u6559\u80B2|\u5929\u624D\u6A6B\u6EA2 \u5929\u624D\u6A6B\u6EA2|\u5929\u624D\u8AD6 \u5929\u624D\u8AD6|\u5929\u7E31\u4E4B\u624D \u5929\u7E31\u4E4B\u624D|\u592A\u4E59\u795E\u91DD \u592A\u4E59\u795E\u91DD|\u5947\u624D \u5947\u624D|\u5947\u624D\u7570\u80FD \u5947\u624D\u7570\u80FD|\u5973\u4EBA\u5FC3\u6D77\u5E95\u91DD \u5973\u4EBA\u5FC3\u6D77\u5E95\u91DD|\u5973\u5B50\u53C3\u653F\u4E3B\u7FA9 \u5973\u5B50\u53C3\u653F\u4E3B\u7FA9|\u5973\u5B50\u53C3\u653F\u6B0A \u5973\u5B50\u53C3\u653F\u6B0A|\u5973\u79C0\u624D \u5973\u79C0\u624D|\u5973\u8C8C\u90CE\u624D \u5973\u8C8C\u90CE\u624D|\u5974\u624D \u5974\u624D|\u5999\u624D \u5999\u624D|\u5B78\u512A\u624D\u8D0D \u5B78\u512A\u624D\u8D0D|\u5B78\u6DFA\u624D\u758F \u5B78\u6DFA\u624D\u758F|\u5B78\u758F\u624D\u6DFA \u5B78\u758F\u624D\u6DFA|\u5B8F\u5167\u6838 \u5B8F\u5167\u6838|\u5B9A\u5357\u91DD \u5B9A\u5357\u91DD|\u5B9A\u98A8\u91DD \u5B9A\u98A8\u91DD|\u5BE6\u624D \u5BE6\u624D|\u5C07\u624D \u5C07\u624D|\u5C07\u9047\u826F\u624D \u5C07\u9047\u826F\u624D|\u5C08\u624D \u5C08\u624D|\u5C08\u696D\u4EBA\u624D \u5C08\u696D\u4EBA\u624D|\u5C08\u9580\u4EBA\u624D \u5C08\u9580\u4EBA\u624D|\u5C0D\u91DD \u5C0D\u91DD|\u5C0F\u624D\u5927\u7528 \u5C0F\u624D\u5927\u7528|\u5C0F\u624D\u5B50 \u5C0F\u624D\u5B50|\u5C0F\u79C0\u624D \u5C0F\u79C0\u624D|\u5C0F\u79C0\u624D\u5B78\u5802 \u5C0F\u79C0\u624D\u5B78\u5802|\u5C0F\u91DD \u5C0F\u91DD|\u5C0F\u91DD\u7F8E\u5BB9 \u5C0F\u91DD\u7F8E\u5BB9|\u5C11\u5E74\u624D\u4FCA \u5C11\u5E74\u624D\u4FCA|\u5C3A\u4E8C\u79C0\u624D \u5C3A\u4E8C\u79C0\u624D|\u5C48\u624D \u5C48\u624D|\u5C55\u624D \u5C55\u624D|\u5C91\u53C3 \u5C91\u53C3|\u5DE8\u8457 \u5DE8\u8457|\u5E36\u5718\u53C3\u52A0 \u5E36\u5718\u53C3\u52A0|\u5E38\u7528\u53C3\u8003\u66F8 \u5E38\u7528\u53C3\u8003\u66F8|\u5E73\u91DD\u7E2B \u5E73\u91DD\u7E2B|\u5E79\u624D \u5E79\u624D|\u5E7E\u91DD \u5E7E\u91DD|\u5EB8\u624D \u5EB8\u624D|\u5EE9\u81B3\u79C0\u624D \u5EE9\u81B3\u79C0\u624D|\u5F15\u7DDA\u7A7F\u91DD \u5F15\u7DDA\u7A7F\u91DD|\u5F35\u53E3 \u5F35\u53E3|\u5F35\u98DB\u7A7F\u91DD \u5F35\u98DB\u7A7F\u91DD|\u5F37\u5FC3\u91DD \u5F37\u5FC3\u91DD|\u5F3C\u91DD \u5F3C\u91DD|\u5F48\u91DD \u5F48\u91DD|\u5F57\u6838 \u5F57\u6838|\u5F62\u540D\u53C3\u540C \u5F62\u540D\u53C3\u540C|\u5F85\u8457 \u5F85\u7740|\u5F97\u5931\u53C3\u534A \u5F97\u5931\u53C3\u534A|\u5FAE\u6838 \u5FAE\u6838|\u5FB5\u624D \u5FB5\u624D|\u5FB7\u624D \u5FB7\u624D|\u5FB7\u624D\u517C\u5099 \u5FB7\u624D\u517C\u5099|\u5FB7\u8584\u624D\u758F \u5FB7\u8584\u624D\u758F|\u5FD7\u5927\u624D\u758F \u5FD7\u5927\u624D\u758F|\u5FD7\u5927\u624D\u77ED \u5FD7\u5927\u624D\u77ED|\u5FD7\u5EE3\u624D\u758F \u5FD7\u5EE3\u624D\u758F|\u6043\u624D\u50B2\u7269 \u6043\u624D\u50B2\u7269|\u6043\u624D\u77DC\u5DF1 \u6043\u624D\u77DC\u5DF1|\u6043\u624D\u81EA\u5C08 \u6043\u624D\u81EA\u5C08|\u60E1\u540D\u662D\u8457 \u60E1\u540D\u662D\u8457|\u610F\u5EE3\u624D\u758F \u610F\u5EE3\u624D\u758F|\u611B\u624D \u611B\u624D|\u611B\u624D\u597D\u58EB \u611B\u624D\u597D\u58EB|\u611B\u624D\u5982\u547D \u611B\u624D\u5982\u547D|\u611B\u624D\u82E5\u6E34 \u611B\u624D\u82E5\u6E34|\u6182\u559C\u53C3\u534A \u6182\u559C\u53C3\u534A|\u6190\u624D \u6190\u624D|\u61F7\u624D\u4E0D\u9047 \u61F7\u624D\u4E0D\u9047|\u61F7\u624D\u62B1\u5FB7 \u61F7\u624D\u62B1\u5FB7|\u61F8\u91DD \u61F8\u91DD|\u61F8\u91DD\u5782\u9732 \u61F8\u91DD\u5782\u9732|\u6210\u5146\u624D \u6210\u5146\u624D|\u6210\u6838 \u6210\u6838|\u6230\u8853\u6838\u6B66\u5668 \u6230\u8853\u6838\u6B66\u5668|\u624B\u8155\u5F0F\u6307\u5317\u91DD \u624B\u8155\u5F0F\u6307\u5317\u91DD|\u624D\u4EBA \u624D\u4EBA|\u624D\u4FCA \u624D\u4FCA|\u624D\u5132\u516B\u6597 \u624D\u5132\u516B\u6597|\u624D\u5177 \u624D\u5177|\u624D\u517C\u6587\u6B66 \u624D\u517C\u6587\u6B66|\u624D\u5206 \u624D\u5206|\u624D\u529B \u624D\u529B|\u624D\u52C7\u517C\u512A \u624D\u52C7\u517C\u512A|\u624D\u540D \u624D\u540D|\u624D\u5668 \u624D\u5668|\u624D\u58EB \u624D\u58EB|\u624D\u5927\u96E3\u7528 \u624D\u5927\u96E3\u7528|\u624D\u5973 \u624D\u5973|\u624D\u5982\u53F2\u9077 \u624D\u5982\u53F2\u9077|\u624D\u5A9B \u624D\u5A9B|\u624D\u5B50 \u624D\u5B50|\u624D\u5B50\u4F73\u4EBA \u624D\u5B50\u4F73\u4EBA|\u624D\u5B50\u66F8 \u624D\u5B50\u66F8|\u624D\u5B78 \u624D\u5B78|\u624D\u5B78\u517C\u512A \u624D\u5B78\u517C\u512A|\u624D\u5B88 \u624D\u5B88|\u624D\u5B9A \u624D\u5B9A|\u624D\u5E79 \u624D\u5E79|\u624D\u5EE3\u59A8\u8EAB \u624D\u5EE3\u59A8\u8EAB|\u624D\u5FAE\u667A\u6DFA \u624D\u5FAE\u667A\u6DFA|\u624D\u5FB7 \u624D\u5FB7|\u624D\u5FB7\u517C\u5099 \u624D\u5FB7\u517C\u5099|\u624D\u601D \u624D\u601D|\u624D\u601D\u654F\u6377 \u624D\u601D\u654F\u6377|\u624D\u609F \u624D\u609F|\u624D\u60C5 \u624D\u60C5|\u624D\u667A \u624D\u667A|\u624D\u671B \u624D\u671B|\u624D\u6C23 \u624D\u6C23|\u624D\u6C23\u7121\u96D9 \u624D\u6C23\u7121\u96D9|\u624D\u6C23\u7E31\u6A6B \u624D\u6C23\u7E31\u6A6B|\u624D\u6C23\u904E\u4EBA \u624D\u6C23\u904E\u4EBA|\u624D\u7232\u4E16\u51FA \u624D\u7232\u4E16\u51FA|\u624D\u7528 \u624D\u7528|\u624D\u7565 \u624D\u7565|\u624D\u7565\u904E\u4EBA \u624D\u7565\u904E\u4EBA|\u624D\u7576\u66F9\u6597 \u624D\u7576\u66F9\u6597|\u624D\u758F\u5B78\u6DFA \u624D\u758F\u5B78\u6DFA|\u624D\u758F\u5FB7\u8584 \u624D\u758F\u5FB7\u8584|\u624D\u758F\u5FD7\u5927 \u624D\u758F\u5FD7\u5927|\u624D\u758F\u610F\u5EE3 \u624D\u758F\u610F\u5EE3|\u624D\u758F\u8A08\u62D9 \u624D\u758F\u8A08\u62D9|\u624D\u77ED\u6C23\u7C97 \u624D\u77ED\u6C23\u7C97|\u624D\u79C0\u4EBA\u5FAE \u624D\u79C0\u4EBA\u5FAE|\u624D\u80FD \u624D\u80FD|\u624D\u80FD\u5E79\u6FDF \u624D\u80FD\u5E79\u6FDF|\u624D\u8272 \u624D\u8272|\u624D\u83EF \u624D\u83EF|\u624D\u83EF\u51FA\u8846 \u624D\u83EF\u51FA\u8846|\u624D\u83EF\u6A6B\u6EA2 \u624D\u83EF\u6A6B\u6EA2|\u624D\u83EF\u6D0B\u6EA2 \u624D\u83EF\u6D0B\u6EA2|\u624D\u83EF\u84CB\u4E16 \u624D\u83EF\u84CB\u4E16|\u624D\u853D\u8B58\u6DFA \u624D\u853D\u8B58\u6DFA|\u624D\u85DD \u624D\u85DD|\u624D\u85DD\u5353\u7D55 \u624D\u85DD\u5353\u7D55|\u624D\u85DD\u6280\u80FD \u624D\u85DD\u6280\u80FD|\u624D\u85DD\u73ED \u624D\u85DD\u73ED|\u624D\u85DD\u79C0 \u624D\u85DD\u79C0|\u624D\u85FB \u624D\u85FB|\u624D\u8A9E \u624D\u8A9E|\u624D\u8B58 \u624D\u8B58|\u624D\u8B58\u904E\u4EBA \u624D\u8B58\u904E\u4EBA|\u624D\u8C8C \u624D\u8C8C|\u624D\u8C8C\u51FA\u8846 \u624D\u8C8C\u51FA\u8846|\u624D\u8C8C\u96D9\u5168 \u624D\u8C8C\u96D9\u5168|\u624D\u8CAB\u4E8C\u9149 \u624D\u8CAB\u4E8C\u9149|\u624D\u8CC7 \u624D\u8CC7|\u624D\u8F15\u5FB7\u8584 \u624D\u8F15\u5FB7\u8584|\u624D\u904E\u5B50\u5EFA \u624D\u904E\u5B50\u5EFA|\u624D\u904E\u5C48\u5B8B \u624D\u904E\u5C48\u5B8B|\u624D\u975E\u7389\u6F64 \u624D\u975E\u7389\u6F64|\u624D\u9AD8\u516B\u6597 \u624D\u9AD8\u516B\u6597|\u624D\u9AD8\u610F\u5EE3 \u624D\u9AD8\u610F\u5EE3|\u624D\u9AD8\u6C23\u50B2 \u624D\u9AD8\u6C23\u50B2|\u624D\u9AD8\u884C\u539A \u624D\u9AD8\u884C\u539A|\u624D\u9AD8\u884C\u6F54 \u624D\u9AD8\u884C\u6F54|\u624E\u91DD \u624E\u91DD|\u6253\u53C3 \u6253\u53C3|\u6253\u5B8C\u91DD \u6253\u5B8C\u91DD|\u6253\u91DD \u6253\u91DD|\u62AB\u91DD\u5F62\u8449 \u62AB\u91DD\u5F62\u8449|\u62B5\u91DD \u62B5\u91DD|\u62C8\u91DD\u6307 \u62C8\u91DD\u6307|\u62D4\u5730\u53C3\u5929 \u62D4\u5730\u53C3\u5929|\u6307\u5317\u91DD \u6307\u5317\u91DD|\u6307\u5357\u91DD \u6307\u5357\u91DD|\u6307\u91DD \u6307\u91DD|\u6307\u91DD\u5F0F \u6307\u91DD\u5F0F|\u636B\u53C3\u6B77\u4E95 \u636B\u53C3\u6B77\u4E95|\u6377\u624D \u6377\u624D|\u6383\u7709\u624D\u5B50 \u6383\u7709\u624D\u5B50|\u63A2\u91DD \u63A2\u91DD|\u63D2\u91DD \u63D2\u91DD|\u63DA\u5DF1\u9732\u624D \u63DA\u5DF1\u9732\u624D|\u6416\u91DD \u6416\u91DD|\u6417\u91DD \u6417\u91DD|\u649E\u91DD \u649E\u91DD|\u64A5\u4E82\u4E4B\u624D \u64A5\u4E82\u4E4B\u624D|\u64EC\u6838 \u64EC\u6838|\u64FA\u91DD \u64FA\u91DD|\u6536\u91DD \u6536\u91DD|\u653E\u53C3 \u653E\u53C3|\u6559\u80B2\u65B9\u91DD \u6559\u80B2\u65B9\u91DD|\u6579\u4E00\u91DD \u6579\u4E00\u91DD|\u6587\u624D \u6587\u624D|\u6587\u6B66\u5168\u624D \u6587\u6B66\u5168\u624D|\u6587\u9078\u721B\u79C0\u624D\u534A \u6587\u9078\u721B\u79C0\u624D\u534A|\u6597\u7B72\u4E4B\u624D \u6597\u7B72\u4E4B\u624D|\u6597\u8F49\u53C3\u6A6B \u6597\u8F49\u53C3\u6A6B|\u65B9\u91DD \u65B9\u91DD|\u65E5\u6708\u53C3\u8FB0 \u65E5\u6708\u53C3\u8FB0|\u65E9\u53C3 \u65E9\u53C3|\u662D\u8457 \u662D\u8457|\u6642\u91DD \u6642\u91DD|\u665A\u53C3 \u665A\u53C3|\u6668\u53C3\u66AE\u7701 \u6668\u53C3\u66AE\u7701|\u6668\u53C3\u66AE\u79AE \u6668\u53C3\u66AE\u79AE|\u6676\u6838 \u6676\u6838|\u6688\u91DD \u6688\u91DD|\u66AE\u79AE\u6668\u53C3 \u66AE\u79AE\u6668\u53C3|\u66E0\u4E16\u4E4B\u624D \u66E0\u4E16\u4E4B\u624D|\u66E0\u4E16\u5947\u624D \u66E0\u4E16\u5947\u624D|\u66E0\u4E16\u9038\u624D \u66E0\u4E16\u9038\u624D|\u66F2\u5225\u91DD \u66F2\u5225\u91DD|\u66F9\u53C3 \u66F9\u53C3|\u66FE\u53C3 \u66FE\u53C3|\u66FE\u53C3\u6BBA\u4EBA \u66FE\u53C3\u6BBA\u4EBA|\u6708\u6838 \u6708\u6838|\u6708\u843D\u53C3\u6A6B \u6708\u843D\u53C3\u6A6B|\u6709\u624D \u6709\u624D|\u6709\u624D\u5E79 \u6709\u624D\u5E79|\u6709\u624D\u7121\u547D \u6709\u624D\u7121\u547D|\u6709\u6838 \u6709\u6838|\u671D\u53C3\u66AE\u79AE \u671D\u53C3\u66AE\u79AE|\u671D\u6838 \u671D\u6838|\u672A\u6613\u624D \u672A\u6613\u624D|\u673D\u6728\u4E4B\u624D \u673D\u6728\u4E4B\u624D|\u674F\u6838 \u674F\u6838|\u6771\u6D77\u6488\u91DD \u6771\u6D77\u6488\u91DD|\u677E\u91DD \u677E\u91DD|\u6797\u6728\u53C3\u5929 \u6797\u6728\u53C3\u5929|\u679C\u6838 \u679C\u6838|\u679D\u91DD \u679D\u91DD|\u6838\u4E0B \u6838\u4E0B|\u6838\u4E8C\u5EE0 \u6838\u4E8C\u5EE0|\u6838\u4EBA \u6838\u4EBA|\u6838\u4EC1 \u6838\u4EC1|\u6838\u4EE5 \u6838\u4EE5|\u6838\u50F5\u6301 \u6838\u50F5\u6301|\u6838\u5152 \u6838\u5152|\u6838\u51AC\u5929 \u6838\u51AC\u5929|\u6838\u51FA\u53E3\u63A7\u5236 \u6838\u51FA\u53E3\u63A7\u5236|\u6838\u529B \u6838\u529B|\u6838\u5316 \u6838\u5316|\u6838\u5340 \u6838\u5340|\u6838\u53EF \u6838\u53EF|\u6838\u5408\u6210 \u6838\u5408\u6210|\u6838\u548C \u6838\u548C|\u6838\u56DB \u6838\u56DB|\u6838\u578B \u6838\u578B|\u6838\u5B50 \u6838\u5B50|\u6838\u5B50\u5EE0 \u6838\u5B50\u5EE0|\u6838\u5B54 \u6838\u5B54|\u6838\u5CF6 \u6838\u5CF6|\u6838\u5DE5 \u6838\u5DE5|\u6838\u5F48 \u6838\u5F48|\u6838\u5FC3 \u6838\u5FC3|\u6838\u6230 \u6838\u6230|\u6838\u6230\u9B25\u90E8 \u6838\u6230\u9B25\u90E8|\u6838\u6280\u8853 \u6838\u6280\u8853|\u6838\u6578 \u6838\u6578|\u6838\u662F \u6838\u662F|\u6838\u6709 \u6838\u6709|\u6838\u679C \u6838\u679C|\u6838\u6843 \u6838\u6843|\u6838\u6B66 \u6838\u6B66|\u6838\u706B\u7BAD\u767C\u52D5\u6A5F \u6838\u706B\u7BAD\u767C\u52D5\u6A5F|\u6838\u70AB \u6838\u70AB|\u6838\u71C3\u6599\u5F8C\u8655\u7406 \u6838\u71C3\u6599\u5F8C\u8655\u7406|\u6838\u7206 \u6838\u7206|\u6838\u7206\u70B8\u7159\u96F2 \u6838\u7206\u70B8\u7159\u96F2|\u6838\u72C0 \u6838\u72C0|\u6838\u7403 \u6838\u7403|\u6838\u7518 \u6838\u7518|\u6838\u7576\u91CF \u6838\u7576\u91CF|\u6838\u767C \u6838\u767C|\u6838\u767C\u96FB \u6838\u767C\u96FB|\u6838\u767C\u96FB\u5EE0 \u6838\u767C\u96FB\u5EE0|\u6838\u7684 \u6838\u7684|\u6838\u78C1 \u6838\u78C1|\u6838\u7A2E \u6838\u7A2E|\u6838\u7A81 \u6838\u7A81|\u6838\u7C92 \u6838\u7C92|\u6838\u7CD6 \u6838\u7CD6|\u6838\u7CD6\u6838\u9178 \u6838\u7CD6\u6838\u9178|\u6838\u7D20 \u6838\u7D20|\u6838\u7DDA \u6838\u7DDA|\u6838\u80FD \u6838\u80FD|\u6838\u80FD\u6280\u8853 \u6838\u80FD\u6280\u8853|\u6838\u80FD\u767C\u96FB \u6838\u80FD\u767C\u96FB|\u6838\u80FD\u767C\u96FB\u5EE0 \u6838\u80FD\u767C\u96FB\u5EE0|\u6838\u80FD\u96FB\u5EE0 \u6838\u80FD\u96FB\u5EE0|\u6838\u819C \u6838\u819C|\u6838\u82F7 \u6838\u82F7|\u6838\u83CC \u6838\u83CC|\u6838\u878D\u5408 \u6838\u878D\u5408|\u6838\u878D\u5408\u767C\u96FB \u6838\u878D\u5408\u767C\u96FB|\u6838\u89E3 \u6838\u89E3|\u6838\u8A08\u5283 \u6838\u8A08\u5283|\u6838\u8A66 \u6838\u8A66|\u6838\u8AC7 \u6838\u8AC7|\u6838\u8CEA \u6838\u8CEA|\u6838\u8F09 \u6838\u8F09|\u6838\u8FA6 \u6838\u8FA6|\u6838\u914D \u6838\u914D|\u6838\u916A \u6838\u916A|\u6838\u9176 \u6838\u9176|\u6838\u9178 \u6838\u9178|\u6838\u9632\u79A6 \u6838\u9632\u79A6|\u6838\u96FB \u6838\u96FB|\u6838\u96FB\u5EE0 \u6838\u96FB\u5EE0|\u6838\u96FB\u78C1\u8108\u885D \u6838\u96FB\u78C1\u8108\u885D|\u6838\u9AD4 \u6838\u9AD4|\u6838\u9EDE \u6838\u9EDE|\u6843\u6838 \u6843\u6838|\u6843\u6838\u96D5 \u6843\u6838\u96D5|\u6851\u91DD \u6851\u91DD|\u6885\u6838 \u6885\u6838|\u68C4\u6838 \u68C4\u6838|\u68CB\u9022\u5C0D\u624B\u5C07\u9047\u826F\u624D \u68CB\u9022\u5C0D\u624B\u5C07\u9047\u826F\u624D|\u68D2\u91DD \u68D2\u91DD|\u68D2\u91DD\u886B \u68D2\u91DD\u886B|\u68D7\u6838 \u68D7\u6838|\u68D8\u91DD \u68D8\u91DD|\u68D8\u91DD\u79D1 \u68D8\u91DD\u79D1|\u68D8\u91DD\u9580 \u68D8\u91DD\u9580|\u6975\u6838 \u6975\u6838|\u69C3\u624D \u69C3\u624D|\u69C3\u69C3\u5927\u624D \u69C3\u69C3\u5927\u624D|\u6A58\u6838 \u6A58\u6838|\u6AA2\u6838 \u6AA2\u6838|\u6AA2\u6838\u8868 \u6AA2\u6838\u8868|\u6B63\u5247\u53C3\u6578 \u6B63\u5247\u53C3\u6578|\u6B65\u7DDA\u884C\u91DD \u6B65\u7DDA\u884C\u91DD|\u6B6A\u624D \u6B6A\u624D|\u6B77\u7DF4\u4E4B\u624D \u6B77\u7DF4\u4E4B\u624D|\u6BBA\u624D \u6BBA\u624D|\u6BD2\u91DD \u6BD2\u91DD|\u6BD4\u624D \u6BD4\u624D|\u6BDB\u7DDA\u91DD \u6BDB\u7DDA\u91DD|\u6BEB\u91DD \u6BEB\u91DD|\u6C18\u6838 \u6C18\u6838|\u6C34\u5E95\u6488\u91DD \u6C34\u5E95\u6488\u91DD|\u6C42\u624D \u6C42\u624D|\u6C42\u624D\u82E5\u6E34 \u6C42\u624D\u82E5\u6E34|\u6C5F\u5357\u56DB\u5927\u624D\u5B50 \u6C5F\u5357\u56DB\u5927\u624D\u5B50|\u6C5F\u53C3 \u6C5F\u53C3|\u6C5F\u6DF9\u624D\u76E1 \u6C5F\u6DF9\u624D\u76E1|\u6C5F\u90CE\u624D\u76E1 \u6C5F\u90CE\u624D\u76E1|\u6CBF\u624D\u6388\u8077 \u6CBF\u624D\u6388\u8077|\u6CE8\u5C04\u91DD \u6CE8\u5C04\u91DD|\u6CE8\u5C04\u91DD\u982D \u6CE8\u5C04\u91DD\u982D|\u6D17\u9762\u7682 \u6D17\u9762\u7682|\u6D17\u9AEE\u7682 \u6D17\u9AEE\u7682|\u6D1B\u967D\u624D\u5B50 \u6D1B\u967D\u624D\u5B50|\u6D3E\u5718\u53C3\u52A0 \u6D3E\u5718\u53C3\u52A0|\u6D77\u53C3\u5A01 \u6D77\u53C3\u5A01|\u6D77\u53C3\u5D34 \u6D77\u53C3\u5D34|\u6D77\u5E95\u6488\u91DD \u6D77\u5E95\u6488\u91DD|\u6EFF\u8179\u624D\u5B78 \u6EFF\u8179\u624D\u5B78|\u6F0F\u91DD \u6F0F\u91DD|\u6F51\u624D \u6F51\u624D|\u6FDF\u4E16\u4E4B\u624D \u6FDF\u4E16\u4E4B\u624D|\u7121\u6838 \u7121\u6838|\u7121\u91DD\u4E0D\u5F15\u7DDA \u7121\u91DD\u4E0D\u5F15\u7DDA|\u7121\u91DD\u6CE8\u5C04\u5668 \u7121\u91DD\u6CE8\u5C04\u5668|\u7164\u6838 \u7164\u6838|\u7194\u6838 \u7194\u6838|\u71B1\u6838 \u71B1\u6838|\u71D4\u91DD \u71D4\u91DD|\u7247\u5584\u5C0F\u624D \u7247\u5584\u5C0F\u624D|\u7269\u8272\u4EBA\u624D \u7269\u8272\u4EBA\u624D|\u7279\u6B8A\u624D\u80FD \u7279\u6B8A\u624D\u80FD|\u72C0\u614B\u53C3\u6578 \u72C0\u614B\u53C3\u6578|\u72D7\u624D \u72D7\u624D|\u7387\u5718\u53C3\u52A0 \u7387\u5718\u53C3\u52A0|\u7389\u53C3\u5DEE \u7389\u53C3\u5DEE|\u7389\u5C3A\u91CF\u624D \u7389\u5C3A\u91CF\u624D|\u738B\u4F50\u4E4B\u624D \u738B\u4F50\u4E4B\u624D|\u7463\u624D \u7463\u624D|\u7504\u624D\u54C1\u80FD \u7504\u624D\u54C1\u80FD|\u7504\u9078\u4EBA\u624D \u7504\u9078\u4EBA\u624D|\u7537\u624D\u5973\u8C8C \u7537\u624D\u5973\u8C8C|\u754E\u755D\u4E0B\u624D \u754E\u755D\u4E0B\u624D|\u7559\u91DD \u7559\u91DD|\u7565\u7121\u53C3\u5546 \u7565\u7121\u53C3\u5546|\u7570\u624D \u7570\u624D|\u7576\u4E16\u624D\u5EA6 \u7576\u4E16\u624D\u5EA6|\u7591\u4FE1\u53C3\u534A \u7591\u4FE1\u53C3\u534A|\u7591\u6838 \u7591\u6838|\u75D4\u6838 \u75D4\u6838|\u75DB\u5931\u82F1\u624D \u75DB\u5931\u82F1\u624D|\u767B\u5EB8\u4EBA\u624D \u767B\u5EB8\u4EBA\u624D|\u767C\u5C55\u6838\u6B66\u5668 \u767C\u5C55\u6838\u6B66\u5668|\u767D\u9DB4\u79C0\u624D \u767D\u9DB4\u79C0\u624D|\u767E\u842C\u5678\u7D1A\u6838\u6B66\u5668 \u767E\u842C\u5678\u7D1A\u6838\u6B66\u5668|\u767E\u91CC\u4E4B\u624D \u767E\u91CC\u4E4B\u624D|\u7682\u5316 \u7682\u5316|\u7682\u83A2 \u7682\u83A2|\u7682\u83A2\u6A39 \u7682\u83A2\u6A39|\u7682\u89D2 \u7682\u89D2|\u7684\u6838 \u7684\u6838|\u76F4\u63A5\u53C3\u8207 \u76F4\u63A5\u53C3\u8207|\u771F\u624D\u5BE6\u5B78 \u771F\u624D\u5BE6\u5B78|\u771F\u6838 \u771F\u6838|\u77DC\u624D\u4F7F\u6C23 \u77DC\u624D\u4F7F\u6C23|\u77DC\u80FD\u8CA0\u624D \u77DC\u80FD\u8CA0\u624D|\u77ED\u91DD \u77ED\u91DD|\u77F3\u91DD \u77F3\u91DD|\u786C\u6838 \u786C\u6838|\u786C\u80A5\u7682 \u786C\u80A5\u7682|\u788C\u788C\u5EB8\u624D \u788C\u788C\u5EB8\u624D|\u78C1\u6838 \u78C1\u6838|\u78C1\u91DD \u78C1\u91DD|\u78E8\u6775\u6210\u91DD \u78E8\u6775\u6210\u91DD|\u78E8\u91DD\u6EAA \u78E8\u91DD\u6EAA|\u78E8\u9435\u6210\u91DD \u78E8\u9435\u6210\u91DD|\u793E\u4EA4\u624D\u80FD \u793E\u4EA4\u624D\u80FD|\u7981\u6838 \u7981\u6838|\u79C0\u624D \u79C0\u624D|\u79C0\u624D\u4E0D\u51FA\u9580\u80FD\u77E5\u5929\u4E0B\u4E8B \u79C0\u624D\u4E0D\u51FA\u9580\u80FD\u77E5\u5929\u4E0B\u4E8B|\u79C0\u624D\u4EBA\u60C5 \u79C0\u624D\u4EBA\u60C5|\u79C0\u624D\u4F5C\u91AB\u5982\u83DC\u4F5C\u8640 \u79C0\u624D\u4F5C\u91AB\u5982\u83DC\u4F5C\u8640|\u79C0\u624D\u9020\u53CD \u79C0\u624D\u9020\u53CD|\u79D2\u91DD \u79D2\u91DD|\u79E7\u91DD \u79E7\u91DD|\u7A46\u7A1C \u7A46\u7A1C|\u7A4D\u6975\u53C3\u52A0 \u7A4D\u6975\u53C3\u52A0|\u7A4D\u6975\u53C3\u8207 \u7A4D\u6975\u53C3\u8207|\u7A7F\u91DD \u7A7F\u91DD|\u7A7F\u91DD\u5F15\u7DDA \u7A7F\u91DD\u5F15\u7DDA|\u7A7F\u91DD\u8D70\u7DDA \u7A7F\u91DD\u8D70\u7DDA|\u7B46\u53C3\u9020\u5316 \u7B46\u53C3\u9020\u5316|\u7BA1\u7406\u4EBA\u624D \u7BA1\u7406\u4EBA\u624D|\u7CBE\u6838 \u7CBE\u6838|\u7D04\u6838 \u7D04\u6838|\u7D04\u7FF0\u53C3\u66F8 \u7D04\u7FF0\u53C3\u66F8|\u7D0B\u5149\u91DD \u7D0B\u5149\u91DD|\u7D30\u91DD\u5BC6\u7E37 \u7D30\u91DD\u5BC6\u7E37|\u7D50\u6838 \u7D50\u6838|\u7D50\u6838\u687F\u83CC \u7D50\u6838\u687F\u83CC|\u7D55\u5C0D\u53C3\u7167 \u7D55\u5C0D\u53C3\u7167|\u7D55\u624D \u7D55\u624D|\u7D5E\u5305\u91DD \u7D5E\u5305\u91DD|\u7D66\u500B\u68D2\u9318\u7576\u91DD\u8A8D \u7D66\u500B\u68D2\u9318\u7576\u91DD\u8A8D|\u7D8F\u7A1C \u7D8F\u7A1C|\u7D93\u4E16\u4E4B\u624D \u7D93\u4E16\u4E4B\u624D|\u7D93\u570B\u4E4B\u624D \u7D93\u570B\u4E4B\u624D|\u7D93\u6FDF\u4E4B\u624D \u7D93\u6FDF\u4E4B\u624D|\u7DB2\u7F85\u4EBA\u624D \u7DB2\u7F85\u4EBA\u624D|\u7DBF\u88CF\u85CF\u91DD \u7DBF\u88CF\u85CF\u91DD|\u7DBF\u88CF\u91DD \u7DBF\u88CF\u91DD|\u7E2B\u8863\u91DD \u7E2B\u8863\u91DD|\u7E2B\u91DD \u7E2B\u91DD|\u7E2B\u91DD\u88DC\u7DDA \u7E2B\u91DD\u88DC\u7DDA|\u7E2B\u91DD\u8DE1 \u7E2B\u91DD\u8DE1|\u7E3D\u53C3\u8B00\u90E8 \u7E3D\u53C3\u8B00\u90E8|\u7E3D\u53C3\u8B00\u9577 \u7E3D\u53C3\u8B00\u9577|\u7E3D\u65B9\u91DD \u7E3D\u65B9\u91DD|\u7E43\u91DD \u7E43\u91DD|\u7E61\u82B1\u91DD \u7E61\u82B1\u91DD|\u7E61\u82B1\u91DD\u5152 \u7E61\u82B1\u91DD\u5152|\u7E61\u91DD \u7E61\u91DD|\u7F85\u76E4\u91DD \u7F85\u76E4\u91DD|\u7F8E\u570B\u53C3\u8B70\u9662 \u7F8E\u570B\u53C3\u8B70\u9662|\u7F8E\u624D \u7F8E\u624D|\u7F8E\u767D\u91DD \u7F8E\u767D\u91DD|\u8001\u5974\u624D \u8001\u5974\u624D|\u8010\u591A\u85E5\u7D50\u6838\u75C5 \u8010\u591A\u85E5\u7D50\u6838\u75C5|\u8033\u91DD \u8033\u91DD|\u806F\u5408\u53C3\u8B00 \u806F\u5408\u53C3\u8B00|\u8070\u660E\u624D\u667A \u8070\u660E\u624D\u667A|\u80A5\u7682 \u80A5\u7682|\u80A5\u7682\u5287 \u80A5\u7682\u5287|\u80A5\u7682\u6CE1 \u80A5\u7682\u6CE1|\u80A5\u7682\u7C89 \u80A5\u7682\u7C89|\u80A5\u7682\u7D72 \u80A5\u7682\u7D72|\u80A5\u7682\u83A2 \u80A5\u7682\u83A2|\u80B2\u624D \u80B2\u624D|\u80C3\u53E3 \u80C3\u53E3|\u80E1\u624D\u52C7 \u80E1\u624D\u52C7|\u80F8\u91DD \u80F8\u91DD|\u81EA\u5B78\u6210\u624D \u81EA\u5B78\u6210\u624D|\u81EA\u6838 \u81EA\u6838|\u8239\u4E0D\u6F0F\u91DD\u6F0F\u91DD\u6C92\u5916\u4EBA \u8239\u4E0D\u6F0F\u91DD\u6F0F\u91DD\u6C92\u5916\u4EBA|\u82B1\u5152\u91DD \u82B1\u5152\u91DD|\u82B1\u65D7\u53C3 \u82B1\u65D7\u53C3|\u82F1\u624D \u82F1\u624D|\u82F1\u624D\u4FCA\u5049 \u82F1\u624D\u4FCA\u5049|\u8302\u624D \u8302\u624D|\u8302\u624D\u7570\u7B49 \u8302\u624D\u7570\u7B49|\u8305\u91DD \u8305\u91DD|\u8332\u6838 \u8332\u6838|\u83CC\u6838 \u83CC\u6838|\u83F2\u624D\u5BE1\u5B78 \u83F2\u624D\u5BE1\u5B78|\u8449\u91DD \u8449\u91DD|\u8457\u4F5C \u8457\u4F5C|\u8457\u540D \u8457\u540D|\u8457\u5F0F \u8457\u5F0F|\u8457\u5FD7 \u8457\u5FD7|\u8457\u65BC \u8457\u65BC|\u8457\u66F8 \u8457\u66F8|\u8457\u767D \u8457\u767D|\u8457\u7A31 \u8457\u7A31|\u8457\u7A31\u65BC\u4E16 \u8457\u7A31\u65BC\u4E16|\u8457\u8005 \u8457\u8005|\u8457\u8FF0 \u8457\u8FF0|\u8457\u9304 \u8457\u9304|\u84CB\u4E16\u4E4B\u624D \u84CB\u4E16\u4E4B\u624D|\u85CF\u91DD\u7E2B \u85CF\u91DD\u7E2B|\u85E5\u7682 \u85E5\u7682|\u85E5\u91DD \u85E5\u91DD|\u860B\u679C\u6838 \u860B\u679C\u6838|\u86C7\u53E3\u8702\u91DD \u86C7\u53E3\u8702\u91DD|\u87AB\u91DD \u87AB\u91DD|\u883B\u91DD\u778E\u7078 \u883B\u91DD\u778E\u7078|\u884C\u77ED\u624D\u55AC \u884C\u77ED\u624D\u55AC|\u884C\u77ED\u624D\u9AD8 \u884C\u77ED\u624D\u9AD8|\u88DC\u8840\u91DD \u88DC\u8840\u91DD|\u88DC\u91DD \u88DC\u91DD|\u88FD\u9EB5 \u88FD\u9EAA|\u897F\u6D0B\u53C3 \u897F\u6D0B\u53C3|\u898B\u7E2B\u63D2\u91DD \u898B\u7E2B\u63D2\u91DD|\u8A0E\u91DD\u7DDA \u8A0E\u91DD\u7DDA|\u8A60\u96EA\u4E4B\u624D \u8A60\u96EA\u4E4B\u624D|\u8A69\u624D \u8A69\u624D|\u8A87\u624D\u8CE3\u667A \u8A87\u624D\u8CE3\u667A|\u8AAA\u53C3\u8ACB \u8AAA\u53C3\u8ACB|\u8ACB\u53C3\u95B1 \u8ACB\u53C3\u95B1|\u8B0A\u6572\u624D \u8B0A\u6572\u624D|\u8B1D\u7D55\u53C3\u89C0 \u8B1D\u7D55\u53C3\u89C0|\u8B58\u591A\u624D\u5EE3 \u8B58\u591A\u624D\u5EE3|\u8B58\u624D \u8B58\u624D|\u8B58\u624D\u5C0A\u8CE2 \u8B58\u624D\u5C0A\u8CE2|\u8B6D\u8B7D\u53C3\u534A \u8B6D\u8B7D\u53C3\u534A|\u8C61\u7259\u91DD\u5C16 \u8C61\u7259\u91DD\u5C16|\u8C6C\u516B\u6212\u55AB\u4EBA\u53C3\u679C \u8C6C\u516B\u6212\u55AB\u4EBA\u53C3\u679C|\u8CA0\u624D \u8CA0\u624D|\u8CA0\u624D\u4EFB\u6C23 \u8CA0\u624D\u4EFB\u6C23|\u8CA0\u624D\u4F7F\u6C23 \u8CA0\u624D\u4F7F\u6C23|\u8CC0\u723E\u8499\u91DD \u8CC0\u723E\u8499\u91DD|\u8CE2\u624D \u8CE2\u624D|\u8CE4\u624D \u8CE4\u624D|\u8D85\u4E16\u4E4B\u624D \u8D85\u4E16\u4E4B\u624D|\u8DAB\u624D \u8DAB\u624D|\u8DF3\u91DD \u8DF3\u91DD|\u8E47\u5403 \u8E47\u5403|\u8EAB\u624D \u8EAB\u624D|\u8EDF\u80A5\u7682 \u8EDF\u80A5\u7682|\u8F07\u624D \u8F07\u624D|\u8F15\u6838 \u8F15\u6838|\u8FAF\u624D \u8FAF\u624D|\u8FAF\u624D\u5929 \u8FAF\u624D\u5929|\u8FAF\u624D\u7121\u7919 \u8FAF\u624D\u7121\u7919|\u8FF4\u7D0B\u91DD \u8FF4\u7D0B\u91DD|\u9000\u91DD \u9000\u91DD|\u9006\u6642\u91DD \u9006\u6642\u91DD|\u901A\u4EBA\u9054\u624D \u901A\u4EBA\u9054\u624D|\u901A\u624D \u901A\u624D|\u901A\u624D\u6559\u80B2 \u901A\u624D\u6559\u80B2|\u901A\u624D\u7DF4\u8B58 \u901A\u624D\u7DF4\u8B58|\u9020\u5C31\u4EBA\u624D \u9020\u5C31\u4EBA\u624D|\u9038\u624D \u9038\u624D|\u9038\u7FA3\u4E4B\u624D \u9038\u7FA3\u4E4B\u624D|\u904E\u4EBA\u624D\u7565 \u904E\u4EBA\u624D\u7565|\u9055\u7D00\u53C3\u9078 \u9055\u7D00\u53C3\u9078|\u9069\u624D \u9069\u624D|\u9078\u624D \u9078\u624D|\u9078\u6C11\u53C3\u52A0\u7387 \u9078\u6C11\u53C3\u52A0\u7387|\u907A\u624D \u907A\u624D|\u907F\u96F7\u91DD \u907F\u96F7\u91DD|\u908A\u6838 \u908A\u6838|\u90CE\u624D\u5973\u59FF \u90CE\u624D\u5973\u59FF|\u90CE\u624D\u5973\u8C8C \u90CE\u624D\u5973\u8C8C|\u9127\u827E\u5403 \u9127\u827E\u5403|\u91CE\u7121\u907A\u624D \u91CE\u7121\u907A\u624D|\u91CF\u624D\u9304\u7528 \u91CF\u624D\u9304\u7528|\u91D1\u91DD \u91D1\u91DD|\u91D1\u91DD\u5C71 \u91D1\u91DD\u5C71|\u91D1\u91DD\u5EA6\u4EBA \u91D1\u91DD\u5EA6\u4EBA|\u91D1\u91DD\u82B1 \u91D1\u91DD\u82B1|\u91D1\u91DD\u83C7 \u91D1\u91DD\u83C7|\u91D1\u91DD\u83DC \u91D1\u91DD\u83DC|\u91D8\u66F8\u91DD \u91D8\u66F8\u91DD|\u91DD\u5177 \u91DD\u5177|\u91DD\u523A \u91DD\u523A|\u91DD\u523A\u9EBB\u9189 \u91DD\u523A\u9EBB\u9189|\u91DD\u5291 \u91DD\u5291|\u91DD\u5B54 \u91DD\u5B54|\u91DD\u5B54\u651D\u5F71\u6A5F \u91DD\u5B54\u651D\u5F71\u6A5F|\u91DD\u5B54\u7167\u50CF \u91DD\u5B54\u7167\u50CF|\u91DD\u5B54\u7167\u50CF\u6A5F \u91DD\u5B54\u7167\u50CF\u6A5F|\u91DD\u5B54\u73FE\u8C61 \u91DD\u5B54\u73FE\u8C61|\u91DD\u5C0D \u91DD\u5C0D|\u91DD\u5C0D\u6027 \u91DD\u5C0D\u6027|\u91DD\u5C0D\u65BC \u91DD\u5C0D\u65BC|\u91DD\u5C16 \u91DD\u5C16|\u91DD\u5C16\u5152 \u91DD\u5C16\u5152|\u91DD\u5DE5 \u91DD\u5DE5|\u91DD\u5E03 \u91DD\u5E03|\u91DD\u5F62\u8449 \u91DD\u5F62\u8449|\u91DD\u6307 \u91DD\u6307|\u91DD\u6311\u5200\u6316 \u91DD\u6311\u5200\u6316|\u91DD\u68B3\u6A5F \u91DD\u68B3\u6A5F|\u91DD\u6C08 \u91DD\u6C08|\u91DD\u6CD5 \u91DD\u6CD5|\u91DD\u7099 \u91DD\u7099|\u91DD\u72C0 \u91DD\u72C0|\u91DD\u72C0\u7269 \u91DD\u72C0\u7269|\u91DD\u76E4 \u91DD\u76E4|\u91DD\u773C \u91DD\u773C|\u91DD\u773C\u5B50 \u91DD\u773C\u5B50|\u91DD\u795E \u91DD\u795E|\u91DD\u7B46 \u91DD\u7B46|\u91DD\u7B46\u5320 \u91DD\u7B46\u5320|\u91DD\u7B52 \u91DD\u7B52|\u91DD\u7B8D \u91DD\u7B8D|\u91DD\u7B8D\u5152 \u91DD\u7B8D\u5152|\u91DD\u7DDA \u91DD\u7DDA|\u91DD\u7DDA\u5305 \u91DD\u7DDA\u5305|\u91DD\u7DDA\u5A18 \u91DD\u7DDA\u5A18|\u91DD\u7DDA\u6D3B \u91DD\u7DDA\u6D3B|\u91DD\u7DDA\u6D3B\u8A08 \u91DD\u7DDA\u6D3B\u8A08|\u91DD\u7DDA\u76D2 \u91DD\u7DDA\u76D2|\u91DD\u7DDA\u7B94\u7C6C \u91DD\u7DDA\u7B94\u7C6C|\u91DD\u7E54 \u91DD\u7E54|\u91DD\u7E54\u54C1 \u91DD\u7E54\u54C1|\u91DD\u7E54\u5EE0 \u91DD\u7E54\u5EE0|\u91DD\u7E54\u6599 \u91DD\u7E54\u6599|\u91DD\u8173 \u91DD\u8173|\u91DD\u8449 \u91DD\u8449|\u91DD\u8449\u6797 \u91DD\u8449\u6797|\u91DD\u8449\u690D\u7269 \u91DD\u8449\u690D\u7269|\u91DD\u8449\u6A39 \u91DD\u8449\u6A39|\u91DD\u91DD\u898B\u8840 \u91DD\u91DD\u898B\u8840|\u91DD\u91E6 \u91DD\u91E6|\u91DD\u92D2 \u91DD\u92D2|\u91DD\u92D2\u76F8\u5C0D \u91DD\u92D2\u76F8\u5C0D|\u91DD\u92D2\u76F8\u6295 \u91DD\u92D2\u76F8\u6295|\u91DD\u92E9 \u91DD\u92E9|\u91DD\u982D \u91DD\u982D|\u91DD\u990C\u83AB\u6E1B \u91DD\u990C\u83AB\u6E1B|\u91DD\u9AA8 \u91DD\u9AA8|\u91DD\u9B5A \u91DD\u9B5A|\u91DD\u9EF9 \u91DD\u9EF9|\u91DD\u9EF9\u7D21\u7E3E \u91DD\u9EF9\u7D21\u7E3E|\u91DD\u9F34 \u91DD\u9F34|\u91DD\u9F3B \u91DD\u9F3B|\u91DD\u9F3B\u5152 \u91DD\u9F3B\u5152|\u91E6\u91DD \u91E6\u91DD|\u9245\u8457 \u9245\u8457|\u9264\u91DD \u9264\u91DD|\u9280\u6838 \u9280\u6838|\u9280\u91DD \u9280\u91DD|\u92FC\u91DD \u92FC\u91DD|\u9336\u91DD \u9336\u91DD|\u9435\u91DD \u9435\u91DD|\u9451\u6838\u5099\u67E5 \u9451\u6838\u5099\u67E5|\u9577\u624D \u9577\u624D|\u9577\u91DD \u9577\u91DD|\u958B\u53E3 \u958B\u53E3|\u9632\u75AB\u91DD \u9632\u75AB\u91DD|\u9670\u6838 \u9670\u6838|\u96A8\u624D\u5668\u4F7F \u96A8\u624D\u5668\u4F7F|\u96C4\u624D \u96C4\u624D|\u96C4\u624D\u5927\u7565 \u96C4\u624D\u5927\u7565|\u96CC\u6838 \u96CC\u6838|\u96D9\u6838 \u96D9\u6838|\u96D9\u93C8\u6838\u9178 \u96D9\u93C8\u6838\u9178|\u96FB\u5531\u91DD \u96FB\u5531\u91DD|\u96FB\u91DD \u96FB\u91DD|\u96FB\u91DD\u9EBB\u9189 \u96FB\u91DD\u9EBB\u9189|\u9700\u624D\u5B54\u4E9F \u9700\u624D\u5B54\u4E9F|\u9732\u624D \u9732\u624D|\u9732\u624D\u63DA\u5DF1 \u9732\u624D\u63DA\u5DF1|\u9738\u624D \u9738\u624D|\u975E\u624D \u975E\u624D|\u975E\u6838 \u975E\u6838|\u9762\u7682 \u9762\u7682|\u9802\u6838 \u9802\u6838|\u9802\u91DD \u9802\u91DD|\u9802\u91DD\u5152 \u9802\u91DD\u5152|\u9802\u91DD\u6371\u4F4F \u9802\u91DD\u6371\u4F4F|\u9802\u9580\u91DD \u9802\u9580\u91DD|\u9806\u6642\u91DD \u9806\u6642\u91DD|\u9810\u9632\u91DD \u9810\u9632\u91DD|\u9818\u5E36\u91DD \u9818\u5E36\u91DD|\u986F\u8457 \u986F\u8457|\u986F\u8457\u6A19\u5FD7 \u986F\u8457\u6A19\u5FD7|\u98A8\u5411\u91DD \u98A8\u5411\u91DD|\u98A8\u6D41\u624D\u5B50 \u98A8\u6D41\u624D\u5B50|\u98DB\u91DD\u8D70\u7DDA \u98DB\u91DD\u8D70\u7DDA|\u98FD\u5B78\u79C0\u624D \u98FD\u5B78\u79C0\u624D|\u9999\u7682 \u9999\u7682|\u99AE\u9A65\u624D \u99AE\u9A65\u624D|\u9A5A\u624D\u7D55\u8C54 \u9A5A\u624D\u7D55\u8C54|\u9AA8\u91DD \u9AA8\u91DD|\u9AD8\u53C3 \u9AD8\u53C3|\u9AD8\u624D \u9AD8\u624D|\u9AD8\u624D\u751F \u9AD8\u624D\u751F|\u9AD8\u7D1A\u7BA1\u7406\u4EBA\u624D \u9AD8\u7D1A\u7BA1\u7406\u4EBA\u624D|\u9AEE\u91DD \u9AEE\u91DD|\u9B3C\u624D \u9B3C\u624D|\u9B3C\u91DD\u8349 \u9B3C\u91DD\u8349|\u9B5A\u982D\u53C3\u653F \u9B5A\u982D\u53C3\u653F|\u9D3B\u7BC7\u9245\u8457 \u9D3B\u7BC7\u9245\u8457|\u9E7D\u6C34\u91DD \u9E7D\u6C34\u91DD|\u9EB4\u79C0\u624D \u9EB4\u79C0\u624D|\u9EBB\u9189\u91DD \u9EBB\u9189\u91DD|\u9EC3\u6709\u624D \u9EC3\u6709\u624D|\u9EDE\u6838 \u9EDE\u6838|\u9F3B\u91DD\u7642\u6CD5 \u9F3B\u91DD\u7642\u6CD5|\u9F67\u8617\u541E\u91DD \u9F67\u8617\u541E\u91DD", h = "\u4E48 \u5E7A|\u507D \u50DE|\u53C3 \u8518|\u5403 \u55AB|\u5507 \u8123|\u555F \u5553|\u5AAF \u5B00|\u5AFB \u5AFA|\u5CF0 \u5CEF|\u5E8A \u7240|\u624D \u7E94|\u6838 \u8988|\u6C59 \u6C61|\u6D29 \u6CC4|\u6E88 \u6F59|\u6F40 \u6F68|\u7076 \u7AC8|\u70BA \u7232|\u75F4 \u7661|\u75FA \u75F9|\u7682 \u7681|\u773E \u8846|\u776A \u777E|\u79D8 \u7955|\u7A1C \u68F1|\u7C37 \u6A90|\u7CBD \u7CC9|\u7F3D \u9262|\u7FA4 \u7FA3|\u8457 \u7740|\u848D \u853F|\u88E1 \u88CF|\u8E34 \u8E0A|\u91DD \u937C|\u97C1 \u7E6E|\u984E \u9F76|\u9BF0 \u9B8E|\u9EB5 \u9EAA", y = "A\u578B\u809D\u708E \u7532\u578B\u809D\u708E|A\u809D \u7532\u809D|BMW\u96C6\u5718 \u5BF6\u99AC\u96C6\u5718|B\u578B\u809D\u708E \u4E59\u578B\u809D\u708E|B\u809D \u4E59\u809D|C\u578B\u809D\u708E \u4E19\u578B\u809D\u708E|C\u809D \u4E19\u809D|D\u578B\u809D\u708E \u4E01\u578B\u809D\u708E|D\u809D \u4E01\u809D|E\u578B\u809D\u708E \u620A\u578B\u809D\u708E|E\u809D \u620A\u809D|PN\u63A5\u9762 PN\u7D50|SQL\u96B1\u78BC\u653B\u64CA SQL\u6CE8\u5165|\u4E09\u6975\u9AD4 \u4E09\u6975\u7BA1|\u4E0B\u62C9\u5F0F\u6E05\u55AE \u4E0B\u62C9\u5217\u8868|\u4E19\u80FA\u9178 \u4E19\u6C28\u9178|\u4E1F\u64F2 \u62CB\u51FA|\u4E2D\u4ECB\u8EDF\u9AD4 \u4E2D\u9593\u4EF6|\u4E3B\u6A5F\u677F \u4E3B\u677F|\u4E3B\u958B\u6A5F\u8A18\u9304 \u4E3B\u5F15\u5C0E\u8A18\u9304|\u4E59\u592A\u7DB2 \u4EE5\u592A\u7DB2|\u4E59\u592A\u7DB2\u8DEF \u4EE5\u592A\u7DB2|\u4E59\u592A\u7DB2\u8DEF\u7531\u5668 \u4EE5\u592A\u7DB2\u8DEF\u7531\u5668|\u4E59\u592A\u7DB2\u8DEF\u8DEF\u7531\u5668 \u4EE5\u592A\u7DB2\u8DEF\u7531\u5668|\u4E59\u91AF\u80FA\u915A \u5C0D\u4E59\u9170\u6C28\u57FA\u915A|\u4E73\u916A \u5976\u916A|\u4E8C\u6975\u9AD4 \u4E8C\u6975\u7BA1|\u4E92\u52D5 \u4EA4\u4E92|\u4E92\u52D5\u5F0F \u4EA4\u4E92\u5F0F|\u4E9E\u585E\u62DC\u7136 \u963F\u585E\u62DC\u7586|\u4EAE\u80FA\u9178 \u4EAE\u6C28\u9178|\u4EBA\u5DE5\u667A\u6167 \u4EBA\u5DE5\u667A\u80FD|\u4ECB\u9762 \u754C\u9762|\u4ECB\u9762\u5361 \u9069\u914D\u5668|\u4EE3\u78BC \u4EE3\u78BC|\u4EE3\u8B1D\u75C7\u5019\u7FA4 \u4EE3\u8B1D\u7D9C\u5408\u5FB5|\u4F0A\u5229\u8AFE \u4F0A\u5229\u8AFE\u4F0A|\u4F0A\u5229\u8AFE\u5DDE \u4F0A\u5229\u8AFE\u4F0A\u5DDE|\u4F3A\u670D\u5668 \u670D\u52D9\u5668|\u4F47\u5217 \u968A\u5217|\u4F4D\u5143 \u6BD4\u7279|\u4F4D\u5143\u7387 \u6BD4\u7279\u7387|\u4F4D\u5143\u7D44 \u5B57\u7BC0|\u4F4D\u5143\u901F\u7387 \u78BC\u7387|\u4F4D\u5740 \u5730\u5740|\u4F4D\u5740\u5217 \u5730\u5740\u6B04|\u4F4E\u7D1A \u4F4E\u7D1A|\u4F4E\u968E \u4F4E\u7D1A|\u4F5B\u6F22\xB7\u5A01\u5EC9\u65AF \u6C83\u6069\xB7\u5A01\u5EC9\u65AF|\u4F5B\u745E \u798F\u96F7|\u4F5C\u696D\u7CFB\u7D71 \u64CD\u4F5C\u7CFB\u7D71|\u4F7F\u7528\u8005 \u7528\u6236|\u4F7F\u7528\u8005\u540D\u7A31 \u7528\u6236\u540D|\u4F86\u96FB\u8F49\u63A5 \u547C\u53EB\u8F49\u79FB|\u4F8B\u9805 \u5BE6\u4F8B|\u4FE1\u865F \u4FE1\u865F|\u505C\u7528 \u7981\u7528|\u5075\u932F \u8ABF\u8A66|\u5075\u932F\u7A0B\u5F0F \u8ABF\u8A66\u5668|\u5085\u7ACB\u8449 \u5085\u91CC\u8449|\u50B3\u9001 \u767C\u9001|\u50B7\u5FC3\u5C0F\u68E7 \u7D05\u5FC3\u5927\u6230|\u50F9\u6548\u6BD4 \u6027\u50F9\u6BD4|\u512A\u5148\u9806\u5E8F \u512A\u5148\u7D1A|\u5132\u5B58 \u4FDD\u5B58|\u5143\u4EF6 \u7D44\u4EF6|\u5149\u789F \u5149\u76E4|\u5149\u789F\u6A5F \u5149\u9A45|\u514B\u7F85\u57C3\u897F\u4E9E \u514B\u7F85\u5730\u4E9E|\u514B\u840A\u9580\u7B2C \u514B\u840A\u9580\u8482|\u5165\u53E3\u7DB2\u7AD9 \u9580\u6236\u7DB2\u7AD9|\u5167\u5EFA \u5167\u7F6E|\u5167\u78BC\u8868 \u4EE3\u78BC\u9801|\u5168\u57DF\u6027 \u5168\u5C40|\u5168\u5F62 \u5168\u89D2|\u5168\u7403\u8CC7\u8A0A\u7DB2 \u842C\u7DAD\u7DB2|\u516C\u5143\u7D00\u5E74 \u516C\u5143\u7D00\u5E74|\u51B0\u68D2 \u51B0\u68CD|\u51B7\u76E4 \u6DBC\u83DC|\u51F1\u5409 \u51F1\u5947|\u51FD\u5F0F \u51FD\u6578|\u51FD\u6578\u8A9E\u8A00\u7A0B\u5F0F\u8A2D\u8A08 \u51FD\u6578\u5F0F\u7DE8\u7A0B|\u5200\u92D2\u4F3A\u670D\u5668 \u5200\u7247\u670D\u52D9\u5668|\u5206\u5272\u69FD \u5206\u5340|\u5206\u6563\u5F0F \u5206\u4F48\u5F0F|\u5206\u6642\u591A\u5DE5 \u6642\u5206\u8907\u7528|\u5206\u6642\u591A\u91CD\u9032\u63A5 \u6642\u5206\u591A\u5740|\u5206\u78BC\u591A\u91CD\u9032\u63A5 \u78BC\u5206\u591A\u5740|\u5206\u7A7A\u9593\u591A\u91CD\u9032\u63A5 \u7A7A\u5206\u591A\u5740|\u5206\u983B\u591A\u5DE5 \u983B\u5206\u8907\u7528|\u5206\u983B\u591A\u91CD\u9032\u63A5 \u983B\u5206\u591A\u5740|\u5217\u5370 \u6253\u5370|\u5217\u652F\u6566\u65AF\u767B \u5217\u652F\u6566\u58EB\u767B|\u5217\u8209 \u679A\u8209|\u5229\u84CB\u608C \u5229\u84CB\u8482|\u524D\u8655\u7406\u5668 \u9810\u8655\u7406\u5668|\u526A\u4E0B \u526A\u5207|\u526A\u8CBC\u7C3F \u526A\u8CBC\u677F|\u526F\u6A94\u540D \u64F4\u5C55\u540D|\u52A0\u5F6D \u52A0\u84EC|\u5305\u7F85\u5B9A \u9B91\u7F85\u4E01|\u5317\u5361\u7F85\u840A\u7D0D \u5317\u5361\u7F85\u4F86\u7D0D|\u5317\u5361\u7F85\u840A\u7D0D\u5DDE \u5317\u5361\u7F85\u4F86\u7D0D\u5DDE|\u5317\u99AC\u5229\u5B89\u7D0D \u5317\u99AC\u91CC\u4E9E\u7D0D|\u5317\u99AC\u5229\u5B89\u7D0D\u7FA4\u5CF6 \u5317\u99AC\u91CC\u4E9E\u7D0D\u7FA3\u5CF6|\u532F\u5165 \u5C0E\u5165|\u532F\u51FA \u5C0E\u51FA|\u532F\u6D41\u6392 \u7E3D\u7DDA|\u5340\u57DF\u6027 \u5C40\u90E8|\u5340\u57DF\u7DB2 \u5C40\u57DF\u7DB2|\u5343\u91CC\u9054\u53CA\u6258\u5DF4\u54E5 \u7279\u7ACB\u5C3C\u9054\u548C\u591A\u5DF4\u54E5|\u534A\u5F62 \u534A\u89D2|\u5357\u5361\u7F85\u840A\u7D0D \u5357\u5361\u7F85\u4F86\u7D0D|\u5357\u5361\u7F85\u840A\u7D0D\u5DDE \u5357\u5361\u7F85\u4F86\u7D0D\u5DDE|\u5361\u9054 \u5361\u5854\u723E|\u5370\u8868\u6A5F \u6253\u5370\u6A5F|\u5373\u6642 \u5BE6\u6642|\u5384\u5229\u5782\u4E9E \u5384\u7ACB\u7279\u91CC\u4E9E|\u5384\u74DC\u591A \u5384\u74DC\u591A\u723E|\u539F\u59CB\u6A94 \u6E90\u6587\u4EF6|\u539F\u59CB\u78BC \u6E90\u4EE3\u78BC|\u539F\u751F\u4EE3\u78BC \u672C\u5730\u4EE3\u78BC|\u53C3\u6578\u5217 \u53C3\u6578\u8868|\u53D6\u6A23 \u63A1\u6A23|\u53D6\u6A23\u7387 \u63A1\u6A23\u7387|\u53E2\u96C6 \u96C6\u7FA3|\u53EE\u53EE\u5679 \u4E01\u4E01\u7576|\u53EE\u53EE\u5679\u5679 \u4E01\u4E01\u7576\u7576|\u53EE\u5679 \u4E01\u7576|\u53F0\u7A4D\u516C\u53F8 \u81FA\u7A4D\u516C\u53F8|\u53F0\u7A4D\u96FB \u81FA\u7A4D\u96FB|\u53F2\u4ED6\u6C40\u985E \u4ED6\u6C40\u985E|\u53F2\u514B\u91CC\u4E9E\u8CD3 \u65AF\u514B\u91CC\u4E9E\u8CD3|\u53F2\u5361\u62C9\u7B2C \u65AF\u5361\u62C9\u8482|\u53F2\u6258\u514B\u8C6A\u68EE \u65BD\u6258\u514B\u8C6A\u68EE|\u53F2\u7279\u52DE\u65AF \u65BD\u7279\u52DE\u65AF|\u53F2\u7279\u62C9\u6C76\u65AF\u57FA \u65AF\u7279\u62C9\u6587\u65AF\u57FA|\u53F2\u74E6\u6FDF\u862D \u65AF\u5A01\u58EB\u862D|\u53F2\u9EA5\u5854\u7D0D \u65AF\u7F8E\u5854\u90A3|\u53F8\u6CD5\u7A0B\u5E8F \u53F8\u6CD5\u7A0B\u5E8F|\u5409\u5E03\u5730 \u5409\u5E03\u5824|\u5409\u91CC\u5DF4\u65AF \u57FA\u91CC\u5DF4\u65AF|\u540D\u5B57\u7A7A\u9593 \u547D\u540D\u7A7A\u9593|\u540D\u7A31\u7A7A\u9593 \u547D\u540D\u7A7A\u9593|\u5410\u74E6\u9B6F \u5716\u74E6\u76E7|\u5411\u91CF \u77E2\u91CF|\u547C\u53EB \u8ABF\u7528|\u547D\u4EE4\u5217 \u547D\u4EE4\u884C|\u5496\u54E9 \u5496\u55B1|\u54C8\u85A9\u514B \u54C8\u85A9\u514B\u65AF\u5766|\u54E5\u65AF\u5927\u9ECE\u52A0 \u54E5\u65AF\u9054\u9ECE\u52A0|\u5510\u6C0F\u75C7 \u5510\u6C0F\u7D9C\u5408\u5FB5|\u555F\u7528 \u6FC0\u6D3B|\u55AC\u6CBB\u4E9E \u55AC\u6CBB\u4E9E|\u55AC\u6CBB\u4E9E\u5171\u548C\u570B \u683C\u9B6F\u5409\u4E9E\u5171\u548C\u570B|\u55AC\u6CBB\u4E9E\u5DDE \u4F50\u6CBB\u4E9E\u5DDE|\u55AE\u6838\u5FC3 \u5B8F\u5167\u6838|\u56DE\u64A5 \u56DE\u8ABF|\u5716\u793A \u5716\u6A19|\u571F\u5EAB\u66FC \u571F\u5EAB\u66FC\u65AF\u5766|\u5730\u5740 \u5730\u5740|\u5766\u5C1A\u5C3C\u4E9E \u5766\u6851\u5C3C\u4E9E|\u578B\u5225 \u985E\u578B|\u57E0 \u7AEF\u53E3|\u57F7\u884C \u904B\u884C|\u57F7\u884C\u6A94 \u53EF\u57F7\u884C\u6587\u4EF6|\u57F7\u884C\u7DD2 \u7DDA\u7A0B|\u57F7\u884C\u9577 \u9996\u5E2D\u57F7\u884C\u5B98|\u5806\u758A \u5806\u68E7|\u5834\u6548\u96FB\u6676\u9AD4 \u5834\u6548\u61C9\u7BA1|\u5851\u81A0 \u5851\u6599|\u5854\u5409\u514B \u5854\u5409\u514B\u65AF\u5766|\u585E\u5E2D\u723E \u585E\u820C\u723E|\u585E\u666E\u52D2\u65AF \u585E\u6D66\u8DEF\u65AF|\u58C1\u7D19 \u58C1\u7D19|\u590F\u8FB2 \u9999\u8FB2|\u5916\u639B \u63D2\u4EF6|\u5916\u63A5 \u5916\u7F6E|\u5916\u90E8\u7D22\u5F15\u9375 \u5916\u9375|\u591A\u56CA\u6027\u5375\u5DE2\u75C7\u5019\u7FA4 \u591A\u56CA\u5375\u5DE2\u7D9C\u5408\u5FB5|\u591A\u578B \u591A\u614B|\u591A\u57F7\u884C\u7DD2 \u591A\u7DDA\u7A0B|\u591A\u5C3C\u91C7\u7B2C \u591A\u5C3C\u91C7\u8482|\u591A\u5DE5 \u591A\u4EFB\u52D9|\u591A\u660E\u5C3C\u52A0 \u591A\u7C73\u5C3C\u52A0|\u5927\u6578\u64DA \u5927\u6578\u64DA|\u5927\u8178\u6FC0\u8E81\u75C7 \u8178\u6613\u6FC0\u7D9C\u5408\u5FB5|\u5929\u51AC\u80FA\u9178 \u5929\u51AC\u6C28\u9178|\u5929\u51AC\u91AF\u80FA \u5929\u51AC\u9170\u80FA|\u5929\u9580\u51AC\u80FA\u9178 \u5929\u9580\u51AC\u6C28\u9178|\u5929\u9580\u51AC\u91AF\u80FA \u5929\u9580\u51AC\u9170\u80FA|\u592A\u7A7A\u68AD \u822A\u5929\u98DB\u6A5F|\u5931\u667A\u75C7 \u7661\u5446\u75C7|\u5948\u53CA\u5229\u4E9E \u5C3C\u65E5\u5229\u4E9E|\u5948\u7C73 \u7D0D\u7C73|\u5967\u514B\u62C9\u8377\u99AC \u4FC4\u514B\u62C9\u4F55\u99AC|\u5967\u514B\u62C9\u8377\u99AC\u57CE \u4FC4\u514B\u62C9\u4F55\u99AC\u57CE|\u5967\u514B\u62C9\u8377\u99AC\u5DDE \u4FC4\u514B\u62C9\u4F55\u99AC\u5DDE|\u5967\u514B\u62C9\u8377\u99AC\u5E02 \u4FC4\u514B\u62C9\u4F55\u99AC\u5E02|\u5967\u52D2\u5CA1 \u4FC4\u52D2\u5CA1|\u5967\u52D2\u5CA1\u5DDE \u4FC4\u52D2\u5CA1\u5DDE|\u5967\u798F \u5967\u723E\u592B|\u597D\u5E02\u591A \u958B\u5E02\u5BA2|\u597D\u5E02\u591A\u516C\u53F8 \u958B\u5E02\u5BA2\u516C\u53F8|\u59A5\u745E\u6C0F\u75C7 \u62BD\u52D5\u7A62\u8A9E\u7D9C\u5408\u5FB5|\u59A5\u745E\u75C7 \u62BD\u52D5\u7A62\u8A9E\u7D9C\u5408\u5FB5|\u5A01\u65AF\u5EB7\u8F9B \u5A01\u65AF\u5EB7\u661F|\u5A01\u65AF\u5EB7\u8F9B\u5DDE \u5A01\u65AF\u5EB7\u661F\u5DDE|\u5B0C\u751F\u516C\u53F8 \u5F37\u751F\u516C\u53F8|\u5B50\u97F3 \u8F14\u97F3|\u5B57\u4E32 \u5B57\u7B26\u4E32|\u5B57\u5143 \u5B57\u7B26|\u5B57\u5143\u96C6 \u5B57\u7B26\u96C6|\u5B57\u578B \u5B57\u9AD4|\u5B57\u578B\u6A94 \u5B57\u5EAB|\u5B57\u5C3E \u5F8C\u7DB4|\u5B57\u7BC0\u8DF3\u52D5 \u5B57\u7BC0\u8DF3\u52D5|\u5B57\u9996 \u524D\u7DB4|\u5B58\u53D6 \u8A2A\u554F|\u5B58\u6A94 \u5B58\u76E4|\u5B5F\u5FB7\u723E\u980C \u9580\u5FB7\u723E\u677E|\u5B89\u5730\u5361\u53CA\u5DF4\u5E03\u9054 \u5B89\u63D0\u74DC\u548C\u5DF4\u5E03\u9054|\u5B89\u6BD4\u897F\u6797 \u6C28\u82C4\u897F\u6797|\u5B89\u83AB\u897F\u6797 \u963F\u83AB\u897F\u6797|\u5B8F\u90FD\u62C9\u65AF \u6D2A\u90FD\u62C9\u65AF|\u5B95\u6A5F \u6B7B\u6A5F|\u5B9A\u5740 \u5C0B\u5740|\u5BA3\u544A \u8072\u660E|\u5BC6\u897F\u6839 \u5BC6\u6B47\u6839|\u5BC6\u897F\u6839\u5DDE \u5BC6\u6B47\u6839\u5DDE|\u5BE6\u4F8B \u5BE6\u4F8B|\u5BE6\u9AD4\u5730\u5740 \u7269\u7406\u5730\u5740|\u5BE6\u9AD4\u8A18\u61B6\u9AD4 \u7269\u7406\u5167\u5B58|\u5BEC\u983B \u5BEC\u5E36|\u5BEE\u570B \u8001\u64BE|\u5BF6\u50D1 \u5BF6\u6F54|\u5BF6\u50D1\u516C\u53F8 \u5BF6\u6F54\u516C\u53F8|\u5C08\u6848 \u9805\u76EE|\u5C0D\u4E59\u91AF\u80FA\u57FA\u915A \u5C0D\u4E59\u9170\u6C28\u57FA\u915A|\u5C0D\u6620 \u6620\u5C04|\u5C0D\u8A71\u65B9\u584A \u5C0D\u8A71\u6846|\u5C0D\u8C61 \u5C0D\u8C61|\u5C1A\u6BD4\u4E9E \u8D0A\u6BD4\u4E9E|\u5C24\u62C9 \u6B50\u62C9|\u5C3C\u65E5 \u5C3C\u65E5\u723E|\u5DE2\u72C0 \u5D4C\u5957|\u5DE5\u4F5C\u5217 \u4EFB\u52D9\u6B04|\u5DE5\u4F5C\u7BA1\u7406\u54E1 \u4EFB\u52D9\u7BA1\u7406\u5668|\u5DE8\u96C6 \u5B8F|\u5DE8\u96C6\u51FD\u5F0F \u5B8F\u51FD\u6578|\u5DE8\u96C6\u547C\u53EB \u5B8F\u8ABF\u7528|\u5DE8\u96C6\u547D\u4EE4 \u5B8F\u547D\u4EE4|\u5DE8\u96C6\u5B9A\u7FA9 \u5B8F\u5B9A\u7FA9|\u5DE8\u96C6\u5C55\u958B \u5B8F\u5C55\u958B|\u5DE8\u96C6\u6307\u4EE4 \u5B8F\u6307\u4EE4|\u5DE8\u96C6\u66FF\u63DB \u5B8F\u66FF\u63DB|\u5DE8\u96C6\u7A0B\u5F0F\u8A2D\u8A08 \u5B8F\u7DE8\u7A0B|\u5DE8\u96C6\u8655\u7406 \u5B8F\u8655\u7406|\u5DE8\u96C6\u8A9E\u8A00 \u5B8F\u8A9E\u8A00|\u5DF4\u5E03\u4E9E\u7D10\u5E7E\u5167\u4E9E \u5DF4\u5E03\u4E9E\u65B0\u5E7E\u5167\u4E9E|\u5DF4\u8C9D\u591A \u5DF4\u5DF4\u591A\u65AF|\u5DF4\u91D1\u68EE\u6C0F\u75C7 \u5E15\u91D1\u68EE\u75C5|\u5E02\u5834\u884C\u92B7 \u5E02\u5834\u71DF\u92B7|\u5E03\u5217\u6566 \u5E03\u96F7\u9813|\u5E03\u5217\u6566\u68EE\u6797 \u5E03\u96F7\u9813\u68EE\u6797|\u5E03\u5217\u6566\u68EE\u6797\u5236\u5EA6 \u5E03\u96F7\u9813\u68EE\u6797\u9AD4\u7CFB|\u5E03\u5409\u7D0D\u6CD5\u7D22 \u5E03\u57FA\u7D0D\u6CD5\u7D22|\u5E03\u62C9\u59C6\u65AF \u52C3\u62C9\u59C6\u65AF|\u5E03\u6797 \u5E03\u723E|\u5E03\u745E\u9813 \u5E03\u91CC\u9813|\u5E03\u840A\u8332 \u5E03\u5217\u8332|\u5E15\u91D1\u68EE\u6C0F\u75C7 \u5E15\u91D1\u68EE\u75C5|\u5E1B\u7409 \u5E15\u52DE|\u5E73\u884C\u8A08\u7B97 \u4E26\u884C\u8A08\u7B97|\u5E7E\u5167\u4E9E\u6BD4\u7D22 \u5E7E\u5167\u4E9E\u6BD4\u7D39|\u5E8F\u5217 \u4E32\u884C|\u5E8F\u5217\u57E0 \u4E32\u53E3|\u5E8F\u865F\u7522\u751F\u5668 \u8A3B\u518A\u6A5F|\u5EAB\u6B23\u6C0F\u75C7\u5019\u7FA4 \u5EAB\u6B23\u7D9C\u5408\u5FB5|\u5EB7\u4E43\u72C4\u514B \u5EB7\u6D85\u72C4\u683C|\u5EB7\u4E43\u72C4\u514B\u5DDE \u5EB7\u6D85\u72C4\u683C\u5DDE|\u5EFA\u69CB\u51FD\u5F0F \u69CB\u9020\u51FD\u6578|\u5EFA\u69CB\u5B50 \u69CB\u9020\u5668|\u5EFA\u7ACB \u5275\u5EFA|\u5F15\u6578 \u53C3\u6578|\u5F59\u7DE8 \u5F59\u7DE8|\u5F69\u8272\u8D85\u97F3\u6CE2 \u5F69\u8D85|\u5F71\u50CF \u5716\u50CF|\u5F71\u5370 \u8907\u5370|\u5F71\u7247 \u8996\u983B|\u5F8C\u5929\u514D\u75AB\u7F3A\u4E4F\u75C7\u5019\u7FA4 \u7372\u5F97\u6027\u514D\u75AB\u7F3A\u9677\u7D9C\u5408\u5FB5|\u5F8C\u8A2D\u8CC7\u6599 \u5143\u6578\u64DA|\u5FAA\u74B0 \u5FAA\u74B0|\u5FAE\u63A7\u5236\u5668 \u55AE\u7247\u6A5F|\u5FB7\u5E03\u897F \u5FB7\u5F6A\u897F|\u5FB7\u5F17\u672D\u514B \u5FB7\u6C83\u590F\u514B|\u5FB7\u62C9\u74E6 \u7279\u62C9\u83EF|\u5FB7\u62C9\u74E6\u5DDE \u7279\u62C9\u83EF\u5DDE|\u5FC3\u5BA4\u986B\u52D5 \u5FC3\u5BA4\u986B\u52D5|\u5FC3\u623F\u64B2\u52D5 \u5FC3\u623F\u64B2\u52D5|\u5FC3\u623F\u986B\u52D5 \u5FC3\u623F\u986B\u52D5|\u5FC3\u808C\u6897\u585E \u5FC3\u808C\u6897\u6B7B|\u5FEB\u53D6 \u7DE9\u5B58|\u5FEB\u53D6\u8A18\u61B6\u9AD4 \u9AD8\u901F\u7DE9\u5B58|\u5FEB\u6377\u534A\u5C0E\u9AD4 \u4ED9\u7AE5\u534A\u5C0E\u9AD4|\u5FEB\u9583\u8A18\u61B6\u9AD4 \u9583\u5B58|\u6025\u6027\u547C\u5438\u7A98\u8FEB\u75C7\u5019\u7FA4 \u6025\u6027\u547C\u5438\u7A98\u8FEB\u7D9C\u5408\u5FB5|\u611B\u6ECB\u75C5 \u827E\u6ECB\u75C5|\u611B\u6ECB\u75C5\u60A3 \u827E\u6ECB\u75C5\u4EBA|\u611B\u6ECB\u75C5\u6BD2 \u827E\u6ECB\u75C5\u6BD2|\u611B\u8377\u83EF \u827E\u5967\u74E6|\u611B\u8377\u83EF\u5DDE \u827E\u5967\u74E6\u5DDE|\u611F\u6E2C \u50B3\u611F|\u6162\u6027\u75B2\u52DE\u75C7\u5019\u7FA4 \u6162\u6027\u75B2\u52DE\u7D9C\u5408\u5FB5|\u6182\u9B31\u75C7 \u6291\u9B31\u75C7|\u6212\u65B7\u75C7\u5019\u7FA4 \u6212\u65B7\u7D9C\u5408\u5FB5|\u622A\u5716 \u622A\u5C4F|\u6234\u5967\u8F9B \u4E8C\u5641\u82F1|\u6234\u6D41\u58EB \u6234\u7559\u65AF|\u6253\u958B \u6253\u958B|\u6279\u6B21 \u6279\u91CF|\u6280\u8853\u9577 \u9996\u5E2D\u6280\u8853\u5B98|\u62C9\u6469 \u62C9\u83AB|\u62C9\u7F85 \u62C9\u6D1B|\u62C9\u8D6B\u66FC\u5C3C\u8AFE\u592B \u62C9\u8D6B\u746A\u5C3C\u8AFE\u592B|\u6307\u4EE4\u5F0F\u7A0B\u5F0F\u8A2D\u8A08 \u547D\u4EE4\u5F0F\u7DE8\u7A0B|\u6307\u4EE4\u78BC \u8173\u672C|\u6307\u6A19 \u6307\u91DD|\u6372\u8EF8 \u6EFE\u52D5\u689D|\u6383\u63CF\u5668 \u6383\u63CF\u5100|\u6392\u7A0B \u8ABF\u5EA6|\u63A7\u5236\u4EE3\u78BC \u53E5\u67C4|\u63A7\u5236\u5143\u4EF6 \u63A7\u4EF6|\u63D0\u4F69\u7279 \u8482\u4F69\u7279|\u641C\u5C0B \u641C\u7D22|\u6469\u723E\u7DDA\u7A0B \u6469\u723E\u7DDA\u7A0B|\u647A\u7A4D \u6372\u7A4D|\u64A5\u51FA \u547C\u51FA|\u64F4\u5145\u5957\u4EF6 \u64F4\u5C55|\u64F4\u97F3 \u514D\u63D0|\u64F7\u53D6 \u622A\u53D6|\u651C\u5E36\u578B \u4FBF\u651C\u5F0F|\u651D\u8B77\u817A \u524D\u5217\u817A|\u652F\u6301\u8005 \u652F\u6301\u8005|\u652F\u63F4 \u652F\u6301|\u6548\u80FD \u6027\u80FD|\u6574\u5408 \u96C6\u6210|\u6578\u4F4D \u6578\u5B57|\u6578\u4F4D\u5370\u5237 \u6578\u5B57\u5370\u5237|\u6578\u4F4D\u96FB\u5B50 \u6578\u5B57\u96FB\u5B50|\u6578\u4F4D\u96FB\u8DEF \u6578\u5B57\u96FB\u8DEF|\u6578\u5B57 \u6578\u5B57|\u6578\u64DA \u6578\u64DA|\u6578\u64DA\u6A5F \u8ABF\u88FD\u89E3\u8ABF\u5668|\u6587\u4EF6 \u6587\u6A94|\u6587\u66F8\u8655\u7406 \u6587\u5B57\u8655\u7406|\u65AF\u6D1B\u7DAD\u5C3C\u4E9E \u65AF\u6D1B\u6587\u5C3C\u4E9E|\u65B0\u589E \u6DFB\u52A0|\u65B0\u7F55\u5E03\u590F \u65B0\u7F55\u5E03\u4EC0\u723E|\u65B0\u7F55\u5E03\u590F\u5DDE \u65B0\u7F55\u5E03\u4EC0\u723E\u5DDE|\u65B9\u7A0B\u5F0F \u65B9\u7A0B\u5F0F|\u6620\u8C61 \u93E1\u50CF|\u6620\u8C61\u7BA1 \u986F\u50CF\u7BA1|\u6642\u8108\u983B\u7387 \u6642\u9418\u983B\u7387|\u666E\u7F85\u9AD8\u83F2\u592B \u666E\u7F85\u79D1\u83F2\u8036\u592B|\u666E\u8CFD\u723E \u73C0\u585E\u723E|\u6676\u7247 \u82AF\u7247|\u667A\u6167 \u667A\u80FD|\u667A\u6167\u8CA1\u7522\u6B0A \u77E5\u8B58\u7522\u6B0A|\u66AB\u5B58\u5668 \u5BC4\u5B58\u5668|\u6700\u4F73\u5316 \u512A\u5316|\u6709\u5931\u771F\u58D3\u7E2E \u6709\u640D\u58D3\u7E2E|\u6797\u59C6\u65AF\u57FA-\u9AD8\u6C99\u53EF\u592B \u91CC\u59C6\u65AF\u57FA-\u79D1\u85A9\u79D1\u592B|\u67E5\u5FB7 \u4E4D\u5F97|\u67E5\u8A62 \u67E5\u627E|\u67EF\u666E\u862D \u79D1\u666E\u862D|\u67EF\u96F7\u5229 \u79D1\u96F7\u5229|\u6838\u53D6\u6309\u9215 \u8907\u9078\u6309\u9215|\u6838\u53D6\u65B9\u584A \u8907\u9078\u6846|\u6838\u5FC3 \u5167\u6838|\u683C\u745E\u90A3\u9054 \u683C\u6797\u7D0D\u9054|\u684C\u4E0A\u578B \u684C\u9762\u578B|\u684C\u4E0A\u578B\u96FB\u8166 \u81FA\u5F0F\u6A5F|\u684C\u5E03 \u58C1\u7D19|\u6885\u6E58 \u6885\u897F\u5B89|\u694A\u7D0D\u5091\u514B \u96C5\u7D0D\u5207\u514B|\u69B4\u69E4 \u69B4\u84EE|\u6A19\u982D\u6A94\u6848 \u982D\u6587\u4EF6|\u6A21\u64EC \u6A21\u64EC|\u6A21\u7D44 \u6A21\u584A|\u6A21\u91CC\u897F\u65AF \u6BDB\u91CC\u6C42\u65AF|\u6A5F\u7387 \u6982\u7387|\u6A94\u540D \u6587\u4EF6\u540D|\u6A94\u6848 \u6587\u4EF6|\u6AA2\u8996 \u67E5\u770B|\u6B04\u4F4D \u5B57\u6BB5|\u6B50\u5DF4\u99AC \u5967\u5DF4\u99AC|\u6B63\u5B50 \u6B63\u96FB\u5B50|\u6B63\u5B50\u65B7\u5C64\u9020\u5F71 \u6B63\u96FB\u5B50\u767C\u5C04\u8A08\u7B97\u6A5F\u65B7\u5C64|\u6B63\u7576\u7A0B\u5E8F \u6B63\u7576\u7A0B\u5E8F|\u6B63\u898F\u5316 \u7BC4\u5F0F|\u6B63\u898F\u8868\u793A\u5F0F \u6B63\u5247\u8868\u9054\u5F0F|\u6BCD\u97F3 \u5143\u97F3|\u6BD4\u7279\u5E63 \u6BD4\u7279\u5E63|\u6C23\u6CE1\u6392\u5E8F \u5192\u6CE1\u6392\u5E8F|\u6C38\u73CD \u842C\u8C61|\u6C38\u7E8C\u6027 \u6301\u4E45\u6027|\u6C76\u840A \u6587\u840A|\u6C99\u70CF\u5730\u963F\u62C9\u4F2F \u6C99\u7279\u963F\u62C9\u4F2F|\u6C99\u70CF\u5730\u963F\u7F8E \u6C99\u7279\u963F\u7F8E|\u6C99\u70CF\u5730\u963F\u7F8E\u516C\u53F8 \u6C99\u7279\u963F\u7F8E\u516C\u53F8|\u6CE1\u9EB5 \u65B9\u4FBF\u9EAA|\u6CE2\u514B\u590F\u6D77\u745F\u5A01 \u4F2F\u514B\u5E0C\u723E\u54C8\u6492\u97CB|\u6CE2\u514B\u590F\u6D77\u745F\u5A01\u516C\u53F8 \u4F2F\u514B\u5E0C\u723E\u54C8\u6492\u97CB\u516C\u53F8|\u6CE2\u51F1\u91CC\u5C3C \u535A\u51F1\u91CC\u5C3C|\u6CE2\u58EB\u5C3C\u4E9E\u8D6B\u585E\u54E5\u7DAD\u7D0D \u6CE2\u65AF\u5C3C\u4E9E\u9ED1\u585E\u54E5\u7DAD\u90A3|\u6CE2\u672D\u90A3 \u535A\u8328\u74E6\u7D0D|\u6CE2\u9577\u5206\u6CE2\u591A\u5DE5 \u6CE2\u5206\u8907\u7528|\u6D77\u5167\u5B58\u77E5\u5DF1 \u6D77\u5167\u5B58\u77E5\u5DF1|\u6D77\u98DB\u8332 \u6D77\u83F2\u8328|\u6D88\u606F \u6D88\u606F|\u6E38\u6A19 \u5149\u6A19|\u6EA2\u4F4D \u6EA2\u51FA|\u6ED1\u9F20 \u9F20\u6A19|\u6F14\u7B97\u6CD5 \u7B97\u6CD5|\u6F22\u4ED6\u75C5\u6BD2 \u6F22\u5766\u75C5\u6BD2|\u6F58\u5FB7\u5217\u8332\u57FA \u6F58\u5FB7\u5217\u8328\u57FA|\u70CF\u8332\u5225\u514B \u70CF\u8332\u5225\u514B\u65AF\u5766|\u7121\u5931\u771F\u58D3\u7E2E \u7121\u640D\u58D3\u7E2E|\u71D2\u9304 \u523B\u9304|\u71DF\u904B\u9577 \u9996\u5E2D\u904B\u71DF\u5B98|\u7247\u8A9E \u8A5E\u7D44|\u7269\u4EF6 \u5C0D\u8C61|\u7269\u4EF6\u5C0E\u5411 \u9762\u5411\u5C0D\u8C61|\u72C0\u614B\u5217 \u72C0\u614B\u6B04|\u7345\u5B50\u5C71 \u585E\u62C9\u5229\u6602|\u74DC\u5730\u99AC\u62C9 \u5371\u5730\u99AC\u62C9|\u7518\u6BD4\u4E9E \u5CA1\u6BD4\u4E9E|\u7518\u80FA\u9178 \u7518\u6C28\u9178|\u7532\u786B\u80FA\u9178 \u7532\u786B\u6C28\u9178|\u756B\u7D20 \u50CF\u7D20|\u7570\u4EAE\u80FA\u9178 \u7570\u4EAE\u6C28\u9178|\u7570\u767D\u80FA\u9178 \u7570\u4EAE\u6C28\u9178|\u767B\u5165 \u767B\u9304|\u767B\u51FA \u8A3B\u92B7|\u767B\u9304\u6A94 \u8A3B\u518A\u8868|\u767D\u80FA\u9178 \u4EAE\u6C28\u9178|\u767D\u8840\u7403 \u767D\u7D30\u80DE|\u767D\u907C\u58EB \u67CF\u907C\u8332|\u76E7\u5B89\u9054 \u76E7\u65FA\u9054|\u76EE\u7684\u78BC \u76EE\u6A19\u4EE3\u78BC|\u76F4\u8B6F\u5668 \u89E3\u91CB\u5668|\u76F8\u5BB9 \u517C\u5BB9|\u76F8\u7C3F \u76F8\u518A|\u771F\u5BE6\u6A21\u5F0F \u5BE6\u6A21\u5F0F|\u7761\u7720\u547C\u5438\u4E2D\u6B62\u75C7 \u7761\u7720\u547C\u5438\u66AB\u505C\u7D9C\u5408\u5FB5|\u77FD \u7845|\u7808 \u7839|\u7834\u5716 \u82B1\u5C4F|\u786C\u789F \u786C\u76E4|\u786C\u9AD4 \u786C\u4EF6|\u789F\u7247 \u76E4\u7247|\u78C1\u789F \u78C1\u76E4|\u78C1\u789F\u6A5F\u4EE3\u865F \u76E4\u7B26|\u78C1\u8ECC \u78C1\u9053|\u793E\u5340 \u793E\u5340|\u793E\u7FA4 \u793E\u5340|\u798F\u65AF\u6C7D\u8ECA \u5927\u8846\u6C7D\u8ECA|\u798F\u65AF\u6C7D\u8ECA\u96C6\u5718 \u5927\u8846\u6C7D\u8ECA\u96C6\u5718|\u798F\u65AF\u96C6\u5718 \u5927\u8846\u96C6\u5718|\u7A0B\u5E8F \u9032\u7A0B|\u7A0B\u5E8F\u4E0D\u6B63\u7FA9 \u7A0B\u5E8F\u4E0D\u6B63\u7FA9|\u7A0B\u5E8F\u5C0E\u5411 \u9762\u5411\u904E\u7A0B|\u7A0B\u5E8F\u5F0F\u7A0B\u5F0F\u8A2D\u8A08 \u904E\u7A0B\u5F0F\u7DE8\u7A0B|\u7A0B\u5E8F\u6B63\u7FA9 \u7A0B\u5E8F\u6B63\u7FA9|\u7A0B\u5F0F \u7A0B\u5E8F|\u7A0B\u5F0F\u78BC \u4EE3\u78BC|\u7A0B\u5F0F\u8A2D\u8A08 \u7DE8\u7A0B|\u7A0B\u5F0F\u8A2D\u8A08\u5E2B \u7A0B\u5E8F\u54E1|\u7A0B\u5F0F\u8A9E\u8A00 \u7DE8\u7A0B\u8A9E\u8A00|\u7A3D\u6838 \u5BE9\u8988|\u7A40\u6C28\u91AF\u80FA \u7A40\u6C28\u9170\u80FA|\u7A40\u80FA\u9178 \u7A40\u6C28\u9178|\u7A46\u7D22\u65AF\u57FA \u7A46\u7D22\u723E\u65AF\u57FA|\u7A4D\u9AD4\u96FB\u8DEF \u96C6\u6210\u96FB\u8DEF|\u7A7A\u6C23\u6E05\u6DE8\u6A5F \u7A7A\u6C23\u6DE8\u5316\u5668|\u7A7A\u9593\u591A\u5DE5 \u7A7A\u5206\u8907\u7528|\u7A81\u5C3C\u897F\u4E9E \u7A81\u5C3C\u65AF|\u7B46\u8A18\u578B\u96FB\u8166 \u7B46\u8A18\u672C\u96FB\u8166|\u7BC4\u5F0F \u7BC4\u5F0F|\u7C21\u5831 \u6F14\u793A\u6587\u7A3F|\u7C21\u8A0A \u77ED\u4FE1|\u7C3D\u5E33\u91D1\u878D\u5361 \u501F\u8A18\u5361|\u7C98\u8CBC \u7C98\u8CBC|\u7CBE\u80FA\u9178 \u7CBE\u6C28\u9178|\u7D05\u8840\u7403 \u7D05\u7D30\u80DE|\u7D0D\u7C73\u6BD4\u4E9E \u7D0D\u7C73\u6BD4\u4E9E|\u7D10\u6FA4\u897F \u65B0\u6FA4\u897F|\u7D10\u6FA4\u897F\u5DDE \u65B0\u6FA4\u897F\u5DDE|\u7D10\u897F\u862D \u65B0\u897F\u862D|\u7D22\u7F85\u9580\u7FA4\u5CF6 \u6240\u7F85\u9580\u7FA3\u5CF6|\u7D22\u99AC\u5229\u4E9E \u7D22\u99AC\u91CC|\u7D42\u7AEF\u4F7F\u7528\u8005 \u6700\u7D42\u7528\u6236|\u7D44\u5408\u8A9E\u8A00 \u5F59\u7DE8\u8A9E\u8A00|\u7D44\u80FA\u9178 \u7D44\u6C28\u9178|\u7D44\u8B6F \u5F59\u7DE8|\u7D44\u8B6F\u5668 \u5F59\u7DE8\u5668|\u7D50\u675F\u901A\u8A71 \u639B\u65B7|\u7D72\u80FA\u9178 \u7D72\u6C28\u9178|\u7D81\u67B6\u4E01\u4E01\u7576 \u7D81\u67B6\u4E01\u4E01\u7576|\u7D93\u524D\u75C7\u5019\u7FA4 \u7D93\u524D\u671F\u7D9C\u5408\u5FB5|\u7DAD\u5409\u5C3C\u4E9E \u5F17\u5409\u5C3C\u4E9E|\u7DAD\u5409\u5C3C\u4E9E\u5DDE \u5F17\u5409\u5C3C\u4E9E\u5DDE|\u7DAD\u5FB7\u89D2 \u4F5B\u5F97\u89D2|\u7DB2\u5496 \u7DB2\u5427|\u7DB2\u7D61\u5361 \u7DB2\u5361|\u7DB2\u8DEF \u7DB2\u7D61|\u7DB2\u8DEF\u4E0A\u7684\u82B3\u9130 \u7DB2\u4E0A\u9130\u5C45|\u7DB2\u969B\u7DB2\u8DEF \u4E92\u806F\u7DB2|\u7DDA\u4E0A \u5728\u7DDA|\u7E2E\u5716 \u7E2E\u7565\u5716|\u7E2E\u6392 \u7E2E\u9032|\u7E6B\u7D50 \u7D81\u5B9A|\u7E88\u80FA\u9178 \u7E88\u6C28\u9178|\u7F85\u5FB7\u5CF6 \u7F85\u5F97\u5CF6|\u7F85\u5FB7\u5CF6\u5DDE \u7F85\u5F97\u5CF6\u5DDE|\u7F8E\u5C6C\u7DAD\u4EAC\u7FA4\u5CF6 \u7F8E\u5C6C\u7DAD\u723E\u4EAC\u7FA3\u5CF6|\u7FA9\u5927\u5229 \u610F\u5927\u5229|\u8001\u5E74\u5931\u667A\u75C7 \u8001\u5E74\u7661\u5446\u75C7|\u8056\u514B\u91CC\u65AF\u591A\u798F\u53CA\u5C3C\u7DAD\u65AF \u8056\u57FA\u8328\u548C\u5C3C\u7DAD\u65AF|\u8056\u6587\u68EE\u53CA\u683C\u745E\u90A3\u4E01 \u8056\u6587\u68EE\u7279\u548C\u683C\u6797\u7D0D\u4E01\u65AF|\u8056\u9732\u897F\u4E9E \u8056\u76E7\u897F\u4E9E|\u8056\u99AC\u5229\u8AFE \u8056\u99AC\u529B\u8AFE|\u806F\u7D50\u5668 \u9023\u63A5\u5668|\u806F\u7D61 \u806F\u7E6B|\u80AF\u4E9E \u80AF\u5C3C\u4E9E|\u80F0\u81DF \u80F0\u817A|\u80F1\u80FA\u9178 \u80F1\u6C28\u9178|\u80FA\u57FA\u9178 \u6C28\u57FA\u9178|\u812F\u80FA\u9178 \u812F\u6C28\u9178|\u814E\u75C5\u75C7\u5019\u7FA4 \u814E\u75C5\u7D9C\u5408\u5FB5|\u8155\u96A7\u9053\u75C7\u5019\u7FA4 \u8155\u7BA1\u7D9C\u5408\u5FB5|\u8166\u6897\u585E \u8166\u6897\u6B7B|\u8173\u8E0F\u8ECA \u81EA\u884C\u8ECA|\u81EA\u52D5\u65CB\u8F49\u87A2\u5E55 \u81EA\u52D5\u8F49\u5C4F|\u81EA\u9589\u75C7 \u5B64\u7368\u75C7|\u8208\u5FB7\u5BC6\u7279 \u6B23\u5FB7\u7C73\u7279|\u8272\u80FA\u9178 \u8272\u6C28\u9178|\u827E\u514B\u68EE\u7F8E\u5B5A \u57C3\u514B\u68EE\u7F8E\u5B5A|\u827E\u723E\u52A0 \u57C3\u723E\u52A0|\u82EF\u4E19\u80FA\u9178 \u82EF\u4E19\u6C28\u9178|\u8305\u5229\u5854\u5C3C\u4E9E \u6BDB\u91CC\u5854\u5C3C\u4E9E|\u8340\u767D\u514B \u52F3\u4F2F\u683C|\u83AB\u4E09\u6BD4\u514B \u83AB\u6851\u6BD4\u514B|\u83AB\u672D\u7279 \u83AB\u624E\u7279|\u83DC\u55AE \u83DC\u55AE|\u83EF\u683C\u7D0D \u74E6\u683C\u7D0D|\u83EF\u723E\u9813 \u6C83\u723E\u9813|\u840A\u8A31 \u8CF4\u5E0C|\u840A\u96C5 \u6B50\u840A\u96C5|\u840A\u96C5\u96C6\u5718 \u6B50\u840A\u96C5\u96C6\u5718|\u842C\u7528\u5B57\u5143 \u901A\u914D\u7B26|\u842C\u90A3\u675C \u74E6\u52AA\u963F\u5716|\u8449\u9580 \u4E5F\u9580|\u845B\u4EE4\u5361 \u683C\u6797\u5361|\u845B\u5229\u683C \u683C\u91CC\u683C|\u845B\u62C9\u65AF \u683C\u62C9\u65AF|\u845B\u6469 \u79D1\u6469\u7F85|\u84B2\u9686\u5730 \u5E03\u9686\u8FEA|\u84CB\u4E9E\u90A3 \u572D\u4E9E\u90A3|\u84CB\u5E0C\u6587 \u683C\u4EC0\u6EAB|\u856D\u58EB\u5854\u9AD8\u7DAD\u5951 \u8096\u65AF\u5854\u79D1\u7DAD\u5947|\u856D\u90A6 \u8096\u90A6|\u85A9\u62C9\u6C99\u6CF0 \u85A9\u62C9\u85A9\u8482|\u85A9\u63D0 \u85A9\u8482|\u85CD\u8272\u756B\u9762 \u85CD\u5C4F|\u8607\u5229\u5357 \u8607\u91CC\u5357|\u8607\u80FA\u9178 \u8607\u6C28\u9178|\u8655\u7406\u7A0B\u5E8F \u8655\u7406\u7A0B\u5E8F|\u865B\u64EC\u51FD\u5F0F \u865B\u51FD\u6578|\u865B\u64EC\u6A5F\u5668 \u865B\u64EC\u6A5F|\u865B\u64EC\u78BC \u50DE\u4EE3\u78BC|\u87A2\u5E55 \u5C4F\u5E55|\u8840\u7D05\u7D20 \u8840\u7D05\u86CB\u767D|\u884C\u5167\u51FD\u6578 \u5167\u806F\u51FD\u6578|\u884C\u52D5\u5F0F \u4FBF\u651C\u5F0F|\u884C\u52D5\u6578\u64DA \u79FB\u52D5\u6578\u64DA|\u884C\u52D5\u786C\u789F \u79FB\u52D5\u786C\u76E4|\u884C\u52D5\u7DB2\u8DEF \u79FB\u52D5\u7DB2\u7D61|\u884C\u52D5\u901A\u8A0A \u79FB\u52D5\u901A\u4FE1|\u884C\u52D5\u96FB\u8A71 \u79FB\u52D5\u96FB\u8A71|\u884C\u7A0B \u9032\u7A0B|\u8863\u7D22\u6BD4\u4E9E \u57C3\u585E\u4FC4\u6BD4\u4E9E|\u8868\u793A\u5F0F \u8868\u9054\u5F0F|\u88DD\u7F6E \u8A2D\u5099|\u8907\u88FD \u62F7\u8C9D|\u897F\u5143 \u516C\u5143|\u897F\u7DAD\u5409\u5C3C\u4E9E \u897F\u5F17\u5409\u5C3C\u4E9E|\u897F\u7DAD\u5409\u5C3C\u4E9E\u5DDE \u897F\u5F17\u5409\u5C3C\u4E9E\u5DDE|\u897F\u8C9D\u6D41\u58EB \u897F\u8C9D\u67F3\u65AF|\u8996\u7A97 \u7A97\u53E3|\u8996\u89BA\u5316 \u53EF\u8996\u5316|\u8996\u8A0A \u8996\u983B|\u8996\u8A0A\u6703\u8B70 \u8996\u983B\u6703\u8B70|\u8996\u8A0A\u8A18\u61B6\u9AD4 \u986F\u5B58|\u8996\u8A0A\u901A\u8A71 \u8996\u983B\u901A\u8A71|\u89E3\u6790\u5EA6 \u5206\u8FA8\u7387|\u89E3\u69CB\u51FD\u5F0F \u6790\u69CB\u51FD\u6578|\u89E3\u69CB\u5B50 \u6790\u69CB\u51FD\u6578|\u89E3\u9664\u5B89\u88DD \u5378\u8F09|\u89F8\u63A7 \u89F8\u6478|\u89F8\u63A7\u5F0F\u87A2\u5E55 \u89F8\u6478\u5C4F|\u8A08\u7A0B\u8ECA \u51FA\u79DF\u8ECA|\u8A0A\u606F \u6D88\u606F|\u8A0A\u865F \u4FE1\u865F|\u8A0A\u96DC\u6BD4 \u4FE1\u566A\u6BD4|\u8A18\u61B6\u9AD4 \u5167\u5B58|\u8A2A\u554F \u8A2A\u554F|\u8A2D\u5B9A \u8A2D\u7F6E|\u8A31\u53EF\u6B0A \u6B0A\u9650|\u8A34\u8A1F\u7A0B\u5E8F \u8A34\u8A1F\u7A0B\u5E8F|\u8ABF\u8272\u76E4 \u8ABF\u8272\u76E4|\u8ABF\u8B8A \u8ABF\u88FD|\u8AFE\u9B6F \u7459\u9B6F|\u8B58\u5225\u7B26\u865F \u6A19\u8B58\u7B26|\u8B8A\u6578 \u8B8A\u91CF|\u8C61\u7259\u6D77\u5CB8 \u79D1\u7279\u8FEA\u74E6|\u8C9D\u5357 \u8C9D\u5BE7|\u8C9D\u91CC\u5C3C \u8C9D\u5229\u5C3C|\u8C9D\u91CC\u65AF \u4F2F\u5229\u8332|\u8CBC\u4E0A \u7C98\u8CBC|\u8CC7\u6599 \u6578\u64DA|\u8CC7\u6599\u4F86\u6E90 \u6578\u64DA\u6E90|\u8CC7\u6599\u5009\u5132 \u6578\u64DA\u5009\u5EAB|\u8CC7\u6599\u5305 \u6578\u64DA\u5831|\u8CC7\u6599\u593E \u6587\u4EF6\u593E|\u8CC7\u6599\u5EAB \u6578\u64DA\u5EAB|\u8CC7\u6599\u63A2\u52D8 \u6578\u64DA\u6316\u6398|\u8CC7\u8A0A \u4FE1\u606F|\u8CC7\u8A0A\u5B89\u5168 \u4FE1\u606F\u5B89\u5168|\u8CC7\u8A0A\u7406\u8AD6 \u4FE1\u606F\u8AD6|\u8CC7\u8A0A\u79D1\u6280 \u4FE1\u606F\u6280\u8853|\u8CC7\u8A0A\u9577 \u9996\u5E2D\u4FE1\u606F\u5B98|\u8CD3\u58EB \u5954\u99B3|\u8CF4\u6BD4\u745E\u4E9E \u5229\u6BD4\u91CC\u4E9E|\u8CF4\u7D22\u6258 \u840A\u7D22\u6258|\u8D85\u7A0B\u5F0F\u8A2D\u8A08 \u5143\u7DE8\u7A0B|\u8D85\u97F3\u6CE2 \u8D85\u8072\u6CE2|\u8DF3\u812B\u5B57\u5143 \u8F49\u7FA9\u5B57\u7B26|\u8EDF\u789F\u6A5F \u8EDF\u9A45|\u8EDF\u9AD4 \u8EDF\u4EF6|\u8EDF\u9AD4\u52D5\u7269 \u8EDF\u9AD4\u52D5\u7269|\u8F09\u5165 \u52A0\u8F09|\u8F09\u5165\u7A0B\u5F0F \u5F15\u5C0E\u7A0B\u5E8F|\u8F1D\u9054 \u82F1\u5049\u9054|\u8F9B\u5DF4\u5A01 \u6D25\u5DF4\u5E03\u97CB|\u8FE6\u7D0D \u52A0\u7D0D|\u8FF4\u5708 \u5FAA\u74B0|\u901A\u8A0A \u901A\u4FE1|\u901A\u8A71\u5361 \u901A\u8A0A\u5361|\u901A\u8A71\u8A18\u9304 \u806F\u7E6B\u6B77\u53F2|\u901A\u9053 \u901A\u9053|\u901F\u98DF\u9EB5 \u65B9\u4FBF\u9EAA|\u9023\u7D50 \u93C8\u63A5|\u9023\u7D50\u4E32\u5217 \u93C8\u8868|\u9023\u7DDA \u9023\u63A5|\u9032\u4F4D\u5236 \u9032\u5236|\u9032\u7A0B \u9032\u7A0B|\u9032\u968E \u9AD8\u7D1A|\u9032\u968E\u8A2D\u5B9A \u9AD8\u7D1A\u8A2D\u7F6E|\u9032\u968E\u9078\u9805 \u9AD8\u7D1A\u9078\u9805|\u904B\u7B97\u5143 \u64CD\u4F5C\u6578|\u904B\u7B97\u5B50 \u64CD\u4F5C\u7B26|\u904B\u7B97\u5F0F \u8868\u9054\u5F0F|\u904E\u52D5\u75C7 \u591A\u52D5\u75C7|\u904E\u8F09 \u91CD\u8F09|\u905E\u8FF4 \u905E\u6B78|\u9060\u7AEF \u9060\u7A0B|\u906E\u853D \u5C4F\u853D|\u9078\u55AE \u83DC\u55AE|\u908F\u8F2F\u9598 \u908F\u8F2F\u9580|\u90A3\u675C \u6EAB\u7D0D\u5716\u842C|\u90E8\u843D\u683C \u535A\u5BA2|\u90FD\u6703\u7DB2\u8DEF \u57CE\u57DF\u7DB2|\u916A\u80FA\u9178 \u916A\u6C28\u9178|\u91AF \u9170|\u91CB\u51FA \u767C\u4F48|\u91CD\u65B0\u547D\u540D \u91CD\u547D\u540D|\u91CD\u65B0\u6574\u7406 \u5237\u65B0|\u91CD\u704C \u91CD\u88DD|\u91D1\u6C27\u534A\u5C0E\u9AD4 \u91D1\u5C6C\u6C27\u5316\u7269\u534A\u5C0E\u9AD4|\u91D1\u9470 \u5BC6\u9470|\u923D \u9208|\u9272 \u9426|\u9273 \u9307|\u92C2 \u9387|\u9304\u5F71 \u9304\u50CF|\u933C \u93BF|\u9345 \u9201|\u939D \u9340|\u93A6 \u9465|\u9440 \u9384|\u958B\u555F \u6253\u958B|\u9598\u6D41\u9AD4 \u6676\u9598\u7BA1|\u9598\u9053\u5668 \u7DB2\u95DC|\u9598\u96FB\u8DEF \u9580\u96FB\u8DEF|\u95DC\u806F\u5F0F\u8CC7\u6599\u5EAB \u95DC\u4FC2\u6578\u64DA\u5EAB|\u9632\u5BEB \u5BEB\u4FDD\u8B77|\u9632\u6BD2 \u6BBA\u6BD2|\u963B\u65B7\u5291 \u963B\u6EEF\u5291|\u963F\u62C9\u4F2F\u806F\u5408\u5927\u516C\u570B \u963F\u62C9\u4F2F\u806F\u5408\u914B\u9577\u570B|\u963F\u65AF\u5339\u9748 \u963F\u53F8\u5339\u6797|\u963F\u65AF\u7279\u6377\u5229\u5EB7 \u963F\u65AF\u5229\u5EB7|\u963F\u65AF\u7279\u6377\u5229\u5EB7\u516C\u53F8 \u963F\u65AF\u5229\u5EB7\u516C\u53F8|\u963F\u8332\u6D77\u9ED8\u6C0F\u75C7 \u963F\u723E\u8328\u6D77\u9ED8\u6C0F\u75C7|\u963F\u8332\u6D77\u9ED8\u75C7 \u963F\u723E\u8328\u6D77\u9ED8\u75C7|\u963F\u83AB\u897F\u6797 \u963F\u83AB\u897F\u6797|\u9663\u5217 \u6578\u7D44|\u9664\u932F \u8ABF\u8A66|\u96A8\u8EAB\u789F U\u76E4|\u96DC\u6E4A \u54C8\u5E0C|\u96E2\u7DDA \u812B\u6A5F|\u96E2\u80FA\u9178 \u8CF4\u6C28\u9178|\u96F2\u7AEF\u5132\u5B58 \u96F2\u5B58\u5132|\u96F2\u7AEF\u8A08\u7B97 \u96F2\u8A08\u7B97|\u96F7\u5C04 \u6FC0\u5149|\u96F7\u8AFE\u6C0F\u75C7\u5019\u7FA4 \u96F7\u8AFE\u7D9C\u5408\u5FB5|\u96FB\u6676\u9AD4 \u6676\u9AD4\u7BA1|\u96FB\u8166\u4FDD\u5B89 \u8A08\u7B97\u6A5F\u5B89\u5168|\u96FB\u8166\u65B7\u5C64 \u8A08\u7B97\u6A5F\u65B7\u5C64|\u96FB\u8166\u79D1\u5B78 \u8A08\u7B97\u6A5F\u79D1\u5B78|\u970D\u6D1B\u7DAD\u8332 \u970D\u6D1B\u7DAD\u8328|\u975E\u540C\u6B65 \u7570\u6B65|\u97CB\u672C \u97CB\u4F2F\u6069|\u97CB\u74E6\u7B2C \u7DAD\u74E6\u723E\u7B2C|\u97CC\u9AD4 \u56FA\u4EF6|\u97D3\u5FB7\u723E \u4EA8\u5FB7\u723E|\u97F3\u6548\u5361 \u8072\u5361|\u97F3\u8A0A \u97F3\u983B|\u9801\u5C3E \u9801\u8173|\u9801\u9996 \u9801\u7709|\u9810\u8A2D \u9810\u8A2D|\u9810\u8A2D\u503C \u9ED8\u8A8D\u503C|\u983B\u5BEC \u5E36\u5BEC|\u985E\u522B\u7BC4\u672C \u985E\u6A21\u677F|\u985E\u6BD4 \u6A21\u64EC|\u985E\u6BD4\u96FB\u5B50 \u6A21\u64EC\u96FB\u5B50|\u985E\u6BD4\u96FB\u8DEF \u6A21\u64EC\u96FB\u8DEF|\u9867\u723E\u5FB7 \u53E4\u723E\u5FB7|\u986F\u793A\u5361 \u986F\u5361|\u98DB\u822A\u6A21\u5F0F \u98DB\u884C\u6A21\u5F0F|\u99AC\u51E1\u6C0F\u75C7 \u99AC\u65B9\u7D9C\u5408\u5FB5|\u99AC\u51E1\u6C0F\u75C7\u5019\u7FA4 \u99AC\u65B9\u7D9C\u5408\u5FB5|\u99AC\u5229\u5171\u548C\u570B \u99AC\u91CC\u5171\u548C\u570B|\u99AC\u723E\u5730\u592B \u99AC\u723E\u4EE3\u592B|\u99ED\u5BA2 \u9ED1\u5BA2|\u9AD8\u6548\u80FD\u904B\u7B97 \u9AD8\u6027\u80FD\u8A08\u7B97|\u9AD8\u756B\u8CEA \u9AD8\u6E05|\u9AD8\u7A7A\u5F48\u8DF3 \u8E66\u6975|\u9AD8\u7D1A \u9AD8\u7D1A|\u9AD8\u968E \u9AD8\u7D1A|\u9EA9\u80FA\u9178 \u7A40\u6C28\u9178|\u9EA9\u91AF\u80FA\u9178 \u7A40\u6C28\u9170\u80FA|\u9EBB\u85A9\u8AF8\u585E \u99AC\u85A9\u8AF8\u585E|\u9EBB\u85A9\u8AF8\u585E\u5DDE \u99AC\u85A9\u8AF8\u585E\u5DDE|\u9EC3\u9AD4\u7D20 \u5B55\u916E|\u9EDE\u9078 \u9EDE\u64CA|\u9EDE\u9663\u5716 \u4F4D\u5716", v = "\u4E00\u574F \u4E00\u576F|\u4E00\u76EE\u77AD\u7136 \u4E00\u76EE\u4E86\u7136|\u4E03\u9015 \u4E03\u8FF3|\u4E0A\u9015 \u4E0A\u8FF3|\u4E0A\u934A \u4E0A\u94FE|\u4E0D\u53EF\u8CB2\u8A08 \u4E0D\u53EF\u8D40\u8A08|\u4E0D\u77AD\u89E3 \u4E0D\u4E86\u89E3|\u4E48\u9EBC \u5E7A\u9EBD|\u4E48\u9EBD \u5E7A\u9EBD|\u4E5D\u9015\u5C71 \u4E5D\u8FF3\u5C71|\u4E7E\u4E7E\u6DE8\u6DE8 \u5E72\u5E72\u51C0\u51C0|\u4E7E\u4E7E\u8106\u8106 \u5E72\u5E72\u8106\u8106|\u4E7E\u4F51\u7E23 \u4E7E\u4F51\u53BF|\u4E7E\u5143 \u4E7E\u5143|\u4E7E\u5366 \u4E7E\u5366|\u4E7E\u5609 \u4E7E\u5609|\u4E7E\u5716 \u4E7E\u56FE|\u4E7E\u5764 \u4E7E\u5764|\u4E7E\u5764\u4E00\u64F2 \u4E7E\u5764\u4E00\u63B7|\u4E7E\u5764\u518D\u9020 \u4E7E\u5764\u518D\u9020|\u4E7E\u5764\u5927\u632A\u79FB \u4E7E\u5764\u5927\u632A\u79FB|\u4E7E\u5B85 \u4E7E\u5B85|\u4E7E\u5B89\u7E23 \u4E7E\u5B89\u53BF|\u4E7E\u5B89\u93AE \u4E7E\u5B89\u9547|\u4E7E\u5DDE \u4E7E\u5DDE|\u4E7E\u65B7 \u4E7E\u65AD|\u4E7E\u65E6 \u4E7E\u65E6|\u4E7E\u66DC \u4E7E\u66DC|\u4E7E\u6E05\u5BAE \u4E7E\u6E05\u5BAB|\u4E7E\u76DB\u4E16 \u4E7E\u76DB\u4E16|\u4E7E\u7D05 \u4E7E\u7EA2|\u4E7E\u7DB1 \u4E7E\u7EB2|\u4E7E\u7E23 \u4E7E\u53BF|\u4E7E\u8C61 \u4E7E\u8C61|\u4E7E\u9020 \u4E7E\u9020|\u4E7E\u9053 \u4E7E\u9053|\u4E7E\u95E5\u5A46 \u4E7E\u95FC\u5A46|\u4E7E\u9675 \u4E7E\u9675|\u4E7E\u9686 \u4E7E\u9686|\u4E7E\u9686\u5E74\u9593 \u4E7E\u9686\u5E74\u95F4|\u4E7E\u9686\u7687\u5E1D \u4E7E\u9686\u7687\u5E1D|\u4E8C\u5641\u82F1 \u4E8C\u{2BAC7}\u82F1|\u4EC7\u8B8E \u4EC7\u96E0|\u4EE5\u514D\u85C9\u53E3 \u4EE5\u514D\u501F\u53E3|\u4EE5\u529F\u8986\u904E \u4EE5\u529F\u8986\u8FC7|\u4EFB\u7B46\u6C88\u8A69 \u4EFB\u7B14\u6C88\u8BD7|\u4F94\u5FB7\u8986\u8F09 \u4F94\u5FB7\u8986\u8F7D|\u50A2\u4FF1 \u5BB6\u5177|\u50B7\u4EA1\u6795\u85C9 \u4F24\u4EA1\u6795\u85C9|\u5141\u7955 \u5141\u7955|\u516B\u6FDB\u5C71 \u516B\u6FDB\u5C71|\u5176\u9670\u591A\u8490 \u5176\u9634\u591A\u8490|\u51CC\u85C9 \u51CC\u501F|\u51FA\u919C\u72FC\u85C9 \u51FA\u4E11\u72FC\u85C9|\u51FD\u8986 \u51FD\u590D|\u524B\u67B6 \u524B\u67B6|\u524B\u6BD2 \u524B\u6BD2|\u5343\u937E\u7C9F \u5343\u953A\u7C9F|\u5357\u6C3E \u5357\u6C3E|\u5357\u9015 \u5357\u8FF3|\u53CD\u53CD\u8986\u8986 \u53CD\u53CD\u590D\u590D|\u53CD\u8986 \u53CD\u590D|\u53CD\u8986\u601D\u7DAD \u53CD\u590D\u601D\u7EF4|\u53CD\u8986\u601D\u91CF \u53CD\u590D\u601D\u91CF|\u53CD\u8986\u6027 \u53CD\u590D\u6027|\u540D\u8986\u91D1\u750C \u540D\u590D\u91D1\u74EF|\u5433\u7955 \u5434\u7955|\u5433\u80B2\u6607 \u5434\u80B2\u6607|\u54EA\u5412 \u54EA\u5412|\u56DE\u8986 \u56DE\u590D|\u571F\u574F \u571F\u576F|\u574F\u571F \u576F\u571F|\u574F\u5B50 \u576F\u5B50|\u574F\u5E03 \u576F\u5E03|\u574F\u6236 \u576F\u6237|\u58A8\u6C88\u6C88 \u58A8\u6C89\u6C89|\u58FA\u88CF\u4E7E\u5764 \u58F6\u91CC\u4E7E\u5764|\u5927\u76EE\u4E7E\u9023\u51A5\u9593\u6551\u6BCD\u8B8A\u6587 \u5927\u76EE\u4E7E\u8FDE\u51A5\u95F4\u6551\u6BCD\u53D8\u6587|\u5BAB\u5546\u89D2\u5FB5\u7FBD \u5BAB\u5546\u89D2\u5FB5\u7FBD|\u5C04\u8986 \u5C04\u8986|\u5C3C\u4E7E\u5B50 \u5C3C\u4E7E\u5B50|\u5C3C\u4E7E\u9640 \u5C3C\u4E7E\u9640|\u5E74\u91D0 \u5E74\u91D0|\u5E7A\u9EBC \u5E7A\u9EBD|\u5E7A\u9EBC\u5C0F\u4E11 \u5E7A\u9EBD\u5C0F\u4E11|\u5E7A\u9EBC\u5C0F\u919C \u5E7A\u9EBD\u5C0F\u4E11|\u5EB7\u4E7E \u5EB7\u4E7E|\u5F35\u6607 \u5F20\u6607|\u5F35\u6CD5\u4E7E \u5F20\u6CD5\u4E7E|\u5F77\u5F7F \u4EFF\u4F5B|\u5F77\u5FA8 \u5F77\u5FA8|\u5F90\u80E4\u6607 \u5F90\u80E4\u6607|\u5FA9\u7526 \u590D\u82CF|\u5FB5\u5F26 \u5FB5\u5F26|\u5FB5\u7D43 \u5FB5\u5F26|\u5FB5\u7FBD\u6469\u67EF \u5FB5\u7FBD\u6469\u67EF|\u5FB5\u8072 \u5FB5\u58F0|\u5FB5\u8ABF \u5FB5\u8C03|\u5FB5\u97F3 \u5FB5\u97F3|\u60C5\u6709\u7368\u937E \u60C5\u6709\u72EC\u949F|\u60F3\u50CF \u60F3\u50CF|\u610F\u5FD7\u6D88\u6C88 \u610F\u5FD7\u6D88\u6C89|\u6170\u85C9 \u6170\u85C9|\u6170\u85C9\u7740 \u6170\u85C9\u7740|\u6191\u85C9 \u51ED\u501F|\u6191\u85C9\u7740 \u51ED\u501F\u7740|\u61F7\u91D0 \u6000\u91D0|\u6210\u7526 \u6210\u7526|\u6240\u8CBB\u4E0D\u8CB2 \u6240\u8D39\u4E0D\u8D40|\u624B\u934A \u624B\u94FE|\u6253\u574F \u6253\u576F|\u625E\u683C \u625E\u683C|\u626D\u8F49\u4E7E\u5764 \u626D\u8F6C\u4E7E\u5764|\u6279\u8986 \u6279\u590D|\u627E\u85C9\u53E3 \u627E\u501F\u53E3|\u6298\u621F\u6C88\u6C99 \u6298\u621F\u6C89\u6C99|\u6298\u621F\u6C88\u6CB3 \u6298\u621F\u6C89\u6CB3|\u62C9\u574F \u62C9\u576F|\u62C9\u934A \u62C9\u94FE|\u62C9\u934A\u5DE5\u7A0B \u62C9\u94FE\u5DE5\u7A0B|\u62DC\u8986 \u62DC\u590D|\u6328\u524B \u6328\u524B|\u634F\u574F \u634F\u576F|\u64CA\u6C88 \u51FB\u6C89|\u64DA\u77AD\u89E3 \u636E\u4E86\u89E3|\u6587\u9326\u8986\u9631 \u6587\u9526\u8986\u9631|\u65BC\u4E16\u6210 \u65BC\u4E16\u6210|\u65BC\u4E4E \u65BC\u4E4E|\u65BC\u4EF2\u5B8C \u65BC\u4EF2\u5B8C|\u65BC\u502B \u65BC\u4F26|\u65BC\u5176\u4E00 \u65BC\u5176\u4E00|\u65BC\u5247 \u65BC\u5219|\u65BC\u52C7\u660E \u65BC\u52C7\u660E|\u65BC\u547C\u54C0\u54C9 \u65BC\u547C\u54C0\u54C9|\u65BC\u55AE \u65BC\u5355|\u65BC\u5766 \u65BC\u5766|\u65BC\u5D07\u6587 \u65BC\u5D07\u6587|\u65BC\u5FE0\u7965 \u65BC\u5FE0\u7965|\u65BC\u60DF\u4E00 \u65BC\u60DF\u4E00|\u65BC\u6232 \u65BC\u620F|\u65BC\u6556 \u65BC\u6556|\u65BC\u68A8\u83EF \u65BC\u68A8\u534E|\u65BC\u6E05\u8A00 \u65BC\u6E05\u8A00|\u65BC\u6F5B \u65BC\u6F5C|\u65BC\u7433 \u65BC\u7433|\u65BC\u7A46 \u65BC\u7A46|\u65BC\u7AF9\u5C4B \u65BC\u7AF9\u5C4B|\u65BC\u83DF \u65BC\u83DF|\u65BC\u9091 \u65BC\u9091|\u65BC\u9675\u5B50 \u65BC\u9675\u5B50|\u65CB\u4E7E\u8F49\u5764 \u65CB\u4E7E\u8F6C\u5764|\u65CB\u8F49\u4E7E\u5764 \u65CB\u8F6C\u4E7E\u5764|\u65CB\u8F49\u4E7E\u5764\u4E4B\u529B \u65CB\u8F6C\u4E7E\u5764\u4E4B\u529B|\u660E\u77AD \u660E\u4E86|\u660E\u8986 \u660E\u590D|\u660F\u6C88 \u660F\u6C89|\u6625\u8490 \u6625\u8490|\u6625\u91D0 \u6625\u91D0|\u6697\u6C88\u6C88 \u6697\u6C89\u6C89|\u66F8\u4E2D\u81EA\u6709\u5343\u937E\u7C9F \u4E66\u4E2D\u81EA\u6709\u5343\u953A\u7C9F|\u6709\u5E8F \u6709\u5E8F|\u671D\u4E7E\u5915\u60D5 \u671D\u4E7E\u5915\u60D5|\u6728\u5412 \u6728\u5412|\u674E\u4E7E\u5FB7 \u674E\u4E7E\u5FB7|\u674E\u6607 \u674E\u6607|\u674E\u6607\u52F3 \u674E\u6607\u52CB|\u674E\u6FA4\u9245 \u674E\u6CFD\u949C|\u674E\u7955 \u674E\u7955|\u674E\u934A\u798F \u674E\u94FE\u798F|\u674E\u937E\u90C1 \u674E\u953A\u90C1|\u675F\u8129 \u675F\u8129|\u6771\u6C3E \u4E1C\u6C3E|\u6797\u7526 \u6797\u7526|\u6821\u8B8E \u6821\u96E0|\u6881\u6607\u537F \u6881\u6607\u537F|\u6881\u7AE0\u9245 \u6881\u7AE0\u949C|\u694A\u7526\u68E3 \u6768\u7526\u68E3|\u694A\u806F\u965E \u6768\u8054\u965E|\u6A0A\u65BC\u671F \u6A0A\u65BC\u671F|\u6A61\u6900 \u6A61\u6900|\u6B7B\u6C23\u6C88\u6C88 \u6B7B\u6C14\u6C89\u6C89|\u6BB5\u8129 \u6BB5\u8129|\u6BDB\u574F \u6BDB\u576F|\u6C34\u9015 \u6C34\u8FF3|\u6C3E\u52DD\u4E4B \u6C3E\u80DC\u4E4B|\u6C3E\u5357 \u6C3E\u5357|\u6C3E\u570B \u6C3E\u56FD|\u6C3E\u6C34 \u6C3E\u6C34|\u6C88\u4E0B \u6C89\u4E0B|\u6C88\u4E0D\u4F4F\u6C23 \u6C89\u4E0D\u4F4F\u6C14|\u6C88\u4F4F\u6C23 \u6C89\u4F4F\u6C14|\u6C88\u51A4 \u6C89\u51A4|\u6C88\u539A \u6C89\u539A|\u6C88\u541F \u6C89\u541F|\u6C88\u5BC2 \u6C89\u5BC2|\u6C88\u5F97\u4F4F\u6C23 \u6C89\u5F97\u4F4F\u6C14|\u6C88\u601D \u6C89\u601D|\u6C88\u601D\u5F80\u4E8B \u6C89\u601D\u5F80\u4E8B|\u6C88\u60B6 \u6C89\u95F7|\u6C88\u6C92 \u6C89\u6CA1|\u6C88\u6C92\u6210\u672C \u6C89\u6CA1\u6210\u672C|\u6C88\u6D6E \u6C89\u6D6E|\u6C88\u6D78 \u6C89\u6D78|\u6C88\u6D78\u65BC \u6C89\u6D78\u4E8E|\u6C88\u6DEA \u6C89\u6CA6|\u6C88\u6E4E \u6C89\u6E4E|\u6C88\u6E4E\u9152\u8272 \u6C89\u6E4E\u9152\u8272|\u6C88\u6EBA \u6C89\u6EBA|\u6C88\u6EEF \u6C89\u6EDE|\u6C88\u6EEF\u6027 \u6C89\u6EDE\u6027|\u6C88\u6FB1 \u6C89\u6DC0|\u6C88\u6FB1\u51FA\u4F86 \u6C89\u6DC0\u51FA\u6765|\u6C88\u6FB1\u5291 \u6C89\u6DC0\u5242|\u6C88\u6FB1\u6CD5 \u6C89\u6DC0\u6CD5|\u6C88\u6FB1\u7269 \u6C89\u6DC0\u7269|\u6C88\u6FC1 \u6C89\u6D4A|\u6C88\u7538\u7538 \u6C89\u7538\u7538|\u6C88\u75DB \u6C89\u75DB|\u6C88\u75FC \u6C89\u75FC|\u6C88\u75FE \u6C89\u75B4|\u6C88\u7761 \u6C89\u7761|\u6C88\u7761\u4E0D\u9192 \u6C89\u7761\u4E0D\u9192|\u6C88\u7802\u6C60 \u6C89\u7802\u6C60|\u6C88\u7A4D \u6C89\u79EF|\u6C88\u7A4D\u5CA9 \u6C89\u79EF\u5CA9|\u6C88\u7A4D\u77F3 \u6C89\u79EF\u77F3|\u6C88\u7B52 \u6C89\u7B52|\u6C88\u8239 \u6C89\u8239|\u6C88\u843D \u6C89\u843D|\u6C88\u8A69\u4EFB\u7B46 \u6C88\u8BD7\u4EFB\u7B14|\u6C88\u8FF7 \u6C89\u8FF7|\u6C88\u8FF7\u4E0D\u9192 \u6C89\u8FF7\u4E0D\u9192|\u6C88\u9189 \u6C89\u9189|\u6C88\u91CD \u6C89\u91CD|\u6C88\u964D \u6C89\u964D|\u6C88\u9677 \u6C89\u9677|\u6C88\u975C \u6C89\u9759|\u6C88\u975C\u4E0B\u4F86 \u6C89\u9759\u4E0B\u6765|\u6C88\u9999 \u6C89\u9999|\u6C88\u9B31 \u6C89\u90C1|\u6C88\u9B5A\u843D\u96C1 \u6C89\u9C7C\u843D\u96C1|\u6C88\u9ED8 \u6C89\u9ED8|\u6C88\u9ED8\u4E0D\u8A9E \u6C89\u9ED8\u4E0D\u8BED|\u6C88\u9ED8\u5BE1\u8A00 \u6C89\u9ED8\u5BE1\u8A00|\u6C99\u9015 \u6C99\u8FF3|\u6CB3\u9015 \u6CB3\u8FF3|\u6D41\u5FB5 \u6D41\u5FB5|\u6D6A\u8569\u4E7E\u5764 \u6D6A\u8361\u4E7E\u5764|\u6D6E\u6C88 \u6D6E\u6C89|\u6D77\u54E9 \u6D77\u91CC|\u6DF1\u6C88 \u6DF1\u6C89|\u6DF1\u6C88\u4E0D\u9732 \u6DF1\u6C89\u4E0D\u9732|\u6EAB\u6607\u8C6A \u6E29\u6607\u8C6A|\u6ED1\u85C9 \u6ED1\u501F|\u70CF\u6607 \u4E4C\u6607|\u70CF\u6C88\u6C88 \u4E4C\u6C89\u6C89|\u70CF\u9015 \u4E4C\u8FF3|\u7121\u5E8F \u65E0\u5E8F|\u72D0\u85C9\u864E\u5A01 \u72D0\u501F\u864E\u5A01|\u738B\u5F65\u6607 \u738B\u5F66\u6607|\u73CD\u73E0\u9805\u934A \u73CD\u73E0\u9879\u94FE|\u751A\u9245 \u751A\u949C|\u7526\u751F \u82CF\u751F|\u7526\u9192 \u82CF\u9192|\u7533\u6607\u52F3 \u7533\u6607\u52CB|\u7533\u8986 \u7533\u590D|\u7562\u6607 \u6BD5\u6607|\u767C\u8986 \u53D1\u8986|\u76E7\u8C61\u6607 \u5362\u8C61\u6607|\u76EE\u5284 \u76EE\u5284|\u77AD\u54E8 \u77AD\u54E8|\u77AD\u5982 \u4E86\u5982|\u77AD\u5982\u6307\u638C \u4E86\u5982\u6307\u638C|\u77AD\u671B \u77AD\u671B|\u77AD\u7136 \u4E86\u7136|\u77AD\u7136\u65BC\u5FC3 \u4E86\u7136\u4E8E\u5FC3|\u77AD\u82E5\u6307\u638C \u4E86\u82E5\u6307\u638C|\u77AD\u89E3 \u4E86\u89E3|\u77AD\u89E3\u5230 \u4E86\u89E3\u5230|\u7834\u91DC\u6C88\u821F \u7834\u91DC\u6C89\u821F|\u78DA\u574F \u7816\u576F|\u793A\u8986 \u793A\u590D|\u793E\u9015 \u793E\u8FF3|\u7955\u4E15\u7B08 \u7955\u4E15\u7B08|\u7955\u5F6D\u7956 \u7955\u5F6D\u7956|\u7955\u74CA \u7955\u743C|\u795D\u91D0 \u795D\u91D0|\u795E\u7947 \u795E\u7947|\u7A1F\u8986 \u7980\u590D|\u7AFA\u4E7E \u7AFA\u4E7E|\u7B54\u8986 \u7B54\u590D|\u7BE4\u9EBC \u7B03\u9EBD|\u7C21\u55AE\u660E\u77AD \u7B80\u5355\u660E\u4E86|\u7C4C\u756B \u7B79\u5212|\u7D20\u85C9 \u7D20\u501F|\u8001\u614B\u9F8D\u937E \u8001\u6001\u9F99\u949F|\u8033\u6C88 \u8033\u6C89|\u8089\u8129 \u8089\u8129|\u8098\u624B\u934A\u8DB3 \u8098\u624B\u94FE\u8DB3|\u80E4\u7955 \u80E4\u7955|\u8129\u656C \u8129\u656C|\u8129\u70B3 \u8129\u70B3|\u8129\u8121 \u8129\u8121|\u8129\u812F \u8129\u812F|\u8129\u91D1 \u8129\u91D1|\u812B\u574F \u8131\u576F|\u8176\u8129 \u8176\u8129|\u82F1\u54E9 \u82F1\u91CC|\u8305\u8490 \u8305\u8490|\u8335\u85C9 \u8335\u501F|\u842C\u937E \u4E07\u953A|\u843D\u96C1\u6C88\u9B5A \u843D\u96C1\u6C89\u9C7C|\u8490\u4E8E\u7D05 \u8490\u4E8E\u7EA2|\u8490\u65BC\u7D05 \u8490\u4E8E\u7EA2|\u8490\u72E9 \u8490\u72E9|\u8490\u736E \u8490\u72DD|\u8490\u7375 \u8490\u730E|\u8490\u7530 \u8490\u7530|\u8490\u754B \u8490\u754B|\u8490\u82D7 \u8490\u82D7|\u849C\u85B9 \u849C\u85B9|\u8523\u6607 \u848B\u6607|\u8553\u85B9 \u82B8\u85B9|\u8569\u8986 \u8361\u8986|\u856D\u4E7E \u8427\u4E7E|\u85C9\u4EE3 \u501F\u4EE3|\u85C9\u4EE5 \u501F\u4EE5|\u85C9\u52A9 \u501F\u52A9|\u85C9\u52A9\u65BC \u501F\u52A9\u4E8E|\u85C9\u5349 \u501F\u5349|\u85C9\u53E3 \u501F\u53E3|\u85C9\u55BB \u501F\u55BB|\u85C9\u5BC7\u5175 \u501F\u5BC7\u5175|\u85C9\u5BC7\u5175\u9F4E\u76DC\u7CE7 \u501F\u5BC7\u5175\u8D4D\u76D7\u7CAE|\u85C9\u624B \u501F\u624B|\u85C9\u64DA \u501F\u636E|\u85C9\u6545 \u501F\u6545|\u85C9\u6545\u63A8\u8FAD \u501F\u6545\u63A8\u8F9E|\u85C9\u65B9 \u501F\u65B9|\u85C9\u689D \u501F\u6761|\u85C9\u69C1 \u501F\u69C1|\u85C9\u6A5F \u501F\u673A|\u85C9\u6B64 \u501F\u6B64|\u85C9\u6B64\u6A5F\u6703 \u501F\u6B64\u673A\u4F1A|\u85C9\u751A \u501F\u751A|\u85C9\u7531 \u501F\u7531|\u85C9\u7740 \u501F\u7740|\u85C9\u7AEF \u501F\u7AEF|\u85C9\u7AEF\u751F\u4E8B \u501F\u7AEF\u751F\u4E8B|\u85C9\u7BB8\u4EE3\u7C4C \u501F\u7BB8\u4EE3\u7B79|\u85C9\u8349\u6795\u584A \u501F\u8349\u6795\u5757|\u85C9\u85C9 \u85C9\u85C9|\u85C9\u85C9\u65E0\u540D \u85C9\u85C9\u65E0\u540D|\u85C9\u8A5E \u501F\u8BCD|\u85C9\u8B80 \u501F\u8BFB|\u85C9\u8CC7 \u501F\u8D44|\u8879\u5F97 \u53EA\u5F97|\u8879\u898B\u6A39\u6728 \u53EA\u89C1\u6811\u6728|\u8879\u898B\u6A39\u6728\u4E0D\u898B\u68EE\u6797 \u53EA\u89C1\u6811\u6728\u4E0D\u89C1\u68EE\u6797|\u8881\u7955 \u8881\u7955|\u8896\u88CF\u4E7E\u5764 \u8896\u91CC\u4E7E\u5764|\u88B7\u88A2 \u88B7\u88A2|\u88FD\u574F \u5236\u576F|\u8986\u4E0A \u8986\u4E0A|\u8986\u4F4F \u8986\u4F4F|\u8986\u4FE1 \u590D\u4FE1|\u8986\u5192 \u8986\u5192|\u8986\u5448 \u590D\u5448|\u8986\u547D \u590D\u547D|\u8986\u5893 \u590D\u5893|\u8986\u5B97 \u8986\u5B97|\u8986\u5E33 \u590D\u5E10|\u8986\u5E6C \u8986\u5E31|\u8986\u6210 \u8986\u6210|\u8986\u6309 \u590D\u6309|\u8986\u6587 \u590D\u6587|\u8986\u676F \u8986\u676F|\u8986\u6821 \u590D\u6821|\u8986\u74FF \u8986\u74FF|\u8986\u76C2 \u8986\u76C2|\u8986\u76C6 \u8986\u76C6|\u8986\u76C6\u5B50 \u8986\u76C6\u5B50|\u8986\u76E4 \u8986\u76D8|\u8986\u80B2 \u8986\u80B2|\u8986\u8549\u5C0B\u9E7F \u8986\u8549\u5BFB\u9E7F|\u8986\u9006 \u8986\u9006|\u8986\u91A2 \u8986\u91A2|\u8986\u91AC\u74FF \u8986\u9171\u74FF|\u8986\u96FB \u590D\u7535|\u8986\u9732 \u8986\u9732|\u8986\u9E7F\u5C0B\u8549 \u8986\u9E7F\u5BFB\u8549|\u8986\u9E7F\u907A\u8549 \u8986\u9E7F\u9057\u8549|\u8986\u9F0E \u8986\u9F0E|\u898B\u8986 \u89C1\u590D|\u89D2\u5FB5 \u89D2\u5FB5|\u89D2\u5FB5\u7FBD \u89D2\u5FB5\u7FBD|\u8A08\u756B \u8BA1\u5212|\u8A31\u7526\u9B42 \u8BB8\u7526\u9B42|\u8B8A\u5FB5 \u53D8\u5FB5|\u8B8A\u5FB5\u4E4B\u8072 \u53D8\u5FB5\u4E4B\u58F0|\u8B8A\u5FB5\u4E4B\u97F3 \u53D8\u5FB5\u4E4B\u97F3|\u8B8E\u5B9A \u96E0\u5B9A|\u8C3F\u5DE5 \u8C3F\u5DE5|\u8C82\u8986\u984D \u8C82\u8986\u989D|\u8CB7\u81E3\u8986\u6C34 \u4E70\u81E3\u8986\u6C34|\u8D64\u77F3\u9015 \u8D64\u77F3\u8FF3|\u8E05\u9580\u77AD\u6236 \u8E05\u95E8\u4E86\u6237|\u8EAA\u85C9 \u8E8F\u501F|\u8F09\u6C88\u8F09\u6D6E \u8F7D\u6C89\u8F7D\u6D6E|\u8F09\u6D6E\u8F09\u6C88 \u8F7D\u6D6E\u8F7D\u6C89|\u8F9B\u7955 \u8F9B\u7955|\u9006\u91D0 \u9006\u91D0|\u9015\u53E3 \u8FF3\u53E3|\u9015\u806F \u8FF3\u8054|\u9015\u982D \u8FF3\u5934|\u90ED\u5B50\u4E7E \u90ED\u5B50\u4E7E|\u9152\u9022\u77E5\u5DF1\u5343\u937E\u5C11 \u9152\u9022\u77E5\u5DF1\u5343\u953A\u5C11|\u919E\u85C9 \u915D\u501F|\u91CD\u8986 \u91CD\u590D|\u91D1\u5412 \u91D1\u5412|\u91D1\u6607\u739F \u91D1\u6607\u739F|\u91D1\u934A \u91D1\u94FE|\u921E\u8986 \u94A7\u590D|\u9245\u5B50 \u949C\u5B50|\u9245\u842C \u949C\u4E07|\u9245\u9632 \u949C\u9632|\u9278\u934A \u94F0\u94FE|\u9280\u934A \u94F6\u94FE|\u92FC\u574F \u94A2\u576F|\u9322\u937E\u66F8 \u94B1\u953A\u4E66|\u934A\u589C \u94FE\u5760|\u934A\u5B50 \u94FE\u5B50|\u934A\u5F62 \u94FE\u5F62|\u934A\u689D \u94FE\u6761|\u934A\u9318 \u94FE\u9524|\u934A\u9396 \u94FE\u9501|\u935B\u937E \u953B\u953A|\u937E\u7E47 \u953A\u7E47|\u937E\u842C\u6885 \u953A\u4E07\u6885|\u937E\u91CD\u767C \u953A\u91CD\u53D1|\u937E\u935B \u953A\u953B|\u937E\u9997 \u953A\u9997|\u9396\u934A \u9501\u94FE|\u9435\u934A \u94C1\u94FE|\u947D\u77F3\u9805\u934A \u94BB\u77F3\u9879\u94FE|\u947F\u574F \u51FF\u576F|\u95BB\u9DB4\u6607 \u960E\u9E64\u6607|\u9670\u6C88 \u9634\u6C89|\u9670\u6C88\u6C88 \u9634\u6C89\u6C89|\u9670\u9670\u6C88\u6C88 \u9634\u9634\u6C89\u6C89|\u9673\u5FD7\u6607 \u9648\u5FD7\u6607|\u9673\u6607 \u9648\u6607|\u9673\u7526 \u9648\u7526|\u9676\u574F \u9676\u576F|\u96C1\u6773\u9B5A\u6C88 \u96C1\u6773\u9C7C\u6C89|\u96D6\u8986\u80FD\u5FA9 \u867D\u8986\u80FD\u590D|\u96FB\u8986 \u7535\u590D|\u9732\u8986 \u9732\u8986|\u97D3\u6607\u5EF6 \u97E9\u6607\u5EF6|\u97D3\u7526 \u97E9\u7526|\u9805\u934A \u9879\u94FE|\u9817\u8986 \u9887\u8986|\u9838\u934A \u9888\u94FE|\u985B\u4E7E\u5012\u5764 \u98A0\u4E7E\u5012\u5764|\u985B\u5012\u4E7E\u5764 \u98A0\u5012\u4E7E\u5764|\u9867\u85C9 \u987E\u501F|\u99AE\u7526 \u51AF\u7526|\u9B4F\u5FB5 \u9B4F\u5FB5|\u9B5A\u6C88\u96C1\u6773 \u9C7C\u6C89\u96C1\u6773|\u9EAA\u574F\u5152 \u9762\u576F\u513F|\u9EBC\u4E9B\u65CF \u9EBD\u4E9B\u65CF|\u9EC3\u7526 \u9EC4\u7526|\u9EC3\u937E\u516C \u9EC4\u953A\u516C|\u9ED1\u6C88\u6C88 \u9ED1\u6C89\u6C89|\u9F8D\u937E \u9F99\u949F|\u9F94\u6607 \u9F9A\u6607", m = "\u346F \u3454|\u3473 \u3447|\u3476 \u3439|\u34E8 \u523E|\u35F2 \u{20D7E}|\u361A \u360E|\u3704 \u36AF|\u370F \u36E3|\u3722 \u{217B1}|\u380F \u37C6|\u3823 \u{2BD77}|\u396E \u3918|\u3A5C \u3A2B|\u3A73 \u39D0|\u3A75 \u64DC|\u3E8F \u{2480B}|\u406A \u{251E2}|\u407B \u4025|\u40EE \u9FCE|\u42B7 \u4336|\u42D9 \u433A|\u42DA \u433B|\u42F9 \u433F|\u42FB \u433E|\u4366 \u4360|\u43B1 \u43AC|\u44E3 \u{2C72F}|\u4661 \u464C|\u4700 \u4727|\u477C \u478D|\u4875 \u{2B7E6}|\u4947 \u4982|\u4951 \u9FCF|\u4955 \u{2CB6F}|\u4971 \u497E|\u499B \u49B6|\u499F \u49B7|\u49E2 \u{28E1F}|\u4B84 \u{2B80A}|\u4BC0 \u4BC5|\u4C3E \u9C83|\u4C77 \u4CA3|\u4C7D \u4C9D|\u4C81 \u9CDA|\u4C98 \u9CE4|\u4D09 \u9E6E|\u4E1F \u4E22|\u4E26 \u5E76|\u4E7E \u5E72|\u4E82 \u4E71|\u4E99 \u4E98|\u4E9E \u4E9A|\u4F47 \u4F2B|\u4F48 \u5E03|\u4F54 \u5360|\u4F75 \u5E76|\u4F86 \u6765|\u4F96 \u4ED1|\u4FB6 \u4FA3|\u4FB7 \u5C40|\u4FC1 \u4FE3|\u4FC2 \u7CFB|\u4FD4 \u4F23|\u4FE0 \u4FA0|\u4FE5 \u4F21|\u4FEC \u79C1|\u5000 \u4F25|\u5006 \u4FE9|\u5008 \u4FEB|\u5009 \u4ED3|\u500B \u4E2A|\u5011 \u4EEC|\u5016 \u5E78|\u502B \u4F26|\u5032 \u3448|\u5049 \u4F1F|\u5051 \u343D|\u5074 \u4FA7|\u5075 \u4FA6|\u507D \u4F2A|\u508C \u3437|\u5091 \u6770|\u5096 \u4F27|\u5098 \u4F1E|\u5099 \u5907|\u50A2 \u5BB6|\u50AD \u4F63|\u50AF \u506C|\u50B3 \u4F20|\u50B4 \u4F1B|\u50B5 \u503A|\u50B7 \u4F24|\u50BE \u503E|\u50C2 \u507B|\u50C5 \u4EC5|\u50C9 \u4F65|\u50D1 \u4FA8|\u50D5 \u4EC6|\u50DE \u4F2A|\u50E4 \u{2B8B8}|\u50E5 \u4FA5|\u50E8 \u507E|\u50F1 \u96C7|\u50F9 \u4EF7|\u5100 \u4EEA|\u5101 \u4FCA|\u5102 \u4FAC|\u5104 \u4EBF|\u5108 \u4FA9|\u5109 \u4FED|\u510E \u50A4|\u5110 \u50A7|\u5114 \u4FE6|\u5115 \u4FAA|\u5118 \u5C3D|\u511F \u507F|\u512A \u4F18|\u5132 \u50A8|\u5137 \u4FEA|\u5138 \u3469|\u513A \u50A9|\u513B \u50A5|\u513C \u4FE8|\u5147 \u51F6|\u514C \u5151|\u5152 \u513F|\u5157 \u5156|\u5167 \u5185|\u5169 \u4E24|\u518A \u518C|\u5191 \u80C4|\u51AA \u5E42|\u51C8 \u51C0|\u51CD \u51BB|\u51DC \u51DB|\u51F1 \u51EF|\u5225 \u522B|\u522A \u5220|\u5244 \u522D|\u5247 \u5219|\u524B \u514B|\u524E \u5239|\u5257 \u522C|\u525B \u521A|\u525D \u5265|\u526E \u5250|\u5274 \u5240|\u5275 \u521B|\u5277 \u94F2|\u5283 \u5212|\u5284 \u672D|\u5287 \u5267|\u5289 \u5218|\u528A \u523D|\u528C \u523F|\u528D \u5251|\u528F \u34E5|\u5291 \u5242|\u529A \u3509|\u52C1 \u52B2|\u52D5 \u52A8|\u52D9 \u52A1|\u52DB \u52CB|\u52DD \u80DC|\u52DE \u52B3|\u52E2 \u52BF|\u52E3 \u{2A7DD}|\u52E9 \u52DA|\u52F1 \u52A2|\u52F3 \u52CB|\u52F5 \u52B1|\u52F8 \u529D|\u52FB \u5300|\u532D \u5326|\u532F \u6C47|\u5331 \u532E|\u5340 \u533A|\u5354 \u534F|\u5379 \u6064|\u537B \u5374|\u537D \u5373|\u5399 \u538D|\u53A0 \u5395|\u53A4 \u5386|\u53AD \u538C|\u53B2 \u5389|\u53B4 \u53A3|\u53C3 \u53C2|\u53C4 \u53C1|\u53E2 \u4E1B|\u5412 \u54A4|\u5433 \u5434|\u5436 \u5450|\u5442 \u5415|\u54BC \u5459|\u54E1 \u5458|\u5504 \u5457|\u5538 \u5FF5|\u554F \u95EE|\u5553 \u542F|\u555E \u54D1|\u555F \u542F|\u5562 \u5521|\u558E \u359E|\u559A \u5524|\u55AA \u4E27|\u55AB \u5403|\u55AC \u4E54|\u55AE \u5355|\u55B2 \u54DF|\u55C6 \u545B|\u55C7 \u556C|\u55CA \u551D|\u55CE \u5417|\u55DA \u545C|\u55E9 \u5522|\u55F0 \u{20BB6}|\u55F6 \u54D4|\u5606 \u53F9|\u560D \u55BD|\u5613 \u556F|\u5614 \u5455|\u5616 \u5567|\u5617 \u5C1D|\u561C \u551B|\u5629 \u54D7|\u562E \u5520|\u562F \u5578|\u5630 \u53FD|\u5635 \u54D3|\u5638 \u5452|\u563D \u5574|\u5641 \u6076|\u5653 \u5618|\u565A \u358A|\u565D \u549D|\u5660 \u54D2|\u5665 \u54DD|\u5666 \u54D5|\u566F \u55F3|\u5672 \u54D9|\u5674 \u55B7|\u5678 \u5428|\u5679 \u5F53|\u5680 \u549B|\u5687 \u5413|\u568C \u54DC|\u5690 \u5C1D|\u5695 \u565C|\u5699 \u556E|\u56A5 \u54BD|\u56A6 \u5456|\u56A7 \u{20C37}|\u56A8 \u5499|\u56AE \u5411|\u56B2 \u4EB8|\u56B3 \u55BE|\u56B4 \u4E25|\u56B6 \u5624|\u56C0 \u556D|\u56C1 \u55EB|\u56C2 \u56A3|\u56C5 \u5181|\u56C8 \u5453|\u56C9 \u5570|\u56CC \u82CF|\u56D1 \u5631|\u56EA \u56F1|\u5707 \u56F5|\u570B \u56FD|\u570D \u56F4|\u5712 \u56ED|\u5713 \u5706|\u5716 \u56FE|\u5718 \u56E2|\u57BB \u575D|\u57E1 \u57AD|\u57E8 \u{2BB62}|\u57F0 \u91C7|\u57F7 \u6267|\u5805 \u575A|\u580A \u57A9|\u5816 \u57B4|\u581D \u57DA|\u582F \u5C27|\u5831 \u62A5|\u5834 \u573A|\u584A \u5757|\u584B \u8314|\u584F \u57B2|\u5852 \u57D8|\u5857 \u6D82|\u585A \u51A2|\u5862 \u575E|\u5864 \u57D9|\u5875 \u5C18|\u5878 \u{2BB5F}|\u5879 \u5811|\u587F \u{2A8FB}|\u588A \u57AB|\u589C \u5760|\u58A0 \u{2BB83}|\u58AE \u5815|\u58B0 \u575B|\u58B3 \u575F|\u58B6 \u57AF|\u58BB \u5899|\u58BE \u57A6|\u58C7 \u575B|\u58CB \u57B1|\u58CE \u57D9|\u58D3 \u538B|\u58D7 \u{212E4}|\u58D8 \u5792|\u58D9 \u5739|\u58DA \u5786|\u58DC \u575B|\u58DE \u574F|\u58DF \u5784|\u58E0 \u5785|\u58E2 \u575C|\u58E9 \u575D|\u58EA \u5846|\u58EF \u58EE|\u58FA \u58F6|\u58FC \u58F8|\u58FD \u5BFF|\u5920 \u591F|\u5922 \u68A6|\u5925 \u4F19|\u593E \u5939|\u5950 \u5942|\u5967 \u5965|\u5969 \u5941|\u596A \u593A|\u596C \u5956|\u596E \u594B|\u597C \u59F9|\u599D \u5986|\u59CD \u59D7|\u59E6 \u5978|\u5A19 \u{2BC1B}|\u5A1B \u5A31|\u5A41 \u5A04|\u5A66 \u5987|\u5A6D \u5A05|\u5AA7 \u5A32|\u5AAF \u59AB|\u5AB0 \u36C0|\u5ABC \u5AAA|\u5ABD \u5988|\u5ACB \u8885|\u5AD7 \u59AA|\u5AF5 \u59A9|\u5AFA \u5A34|\u5AFB \u5A34|\u5AFF \u5A73|\u5B00 \u59AB|\u5B03 \u5AAD|\u5B08 \u5A06|\u5B0B \u5A75|\u5B0C \u5A07|\u5B19 \u5AF1|\u5B21 \u5AD2|\u5B24 \u5B37|\u5B2A \u5AD4|\u5B30 \u5A74|\u5B38 \u5A76|\u5B43 \u5A18|\u5B4B \u36E4|\u5B4C \u5A08|\u5B6B \u5B59|\u5B78 \u5B66|\u5B7B \u{21967}|\u5B7F \u5B6A|\u5BAE \u5BAB|\u5BC0 \u91C7|\u5BE2 \u5BDD|\u5BE6 \u5B9E|\u5BE7 \u5B81|\u5BE9 \u5BA1|\u5BEB \u5199|\u5BEC \u5BBD|\u5BF5 \u5BA0|\u5BF6 \u5B9D|\u5C07 \u5C06|\u5C08 \u4E13|\u5C0B \u5BFB|\u5C0D \u5BF9|\u5C0E \u5BFC|\u5C37 \u5C34|\u5C46 \u5C4A|\u5C4D \u5C38|\u5C53 \u5C43|\u5C5C \u5C49|\u5C62 \u5C61|\u5C64 \u5C42|\u5C68 \u5C66|\u5C6C \u5C5E|\u5CA1 \u5188|\u5CEF \u5CF0|\u5CF4 \u5C98|\u5CF6 \u5C9B|\u5CFD \u5CE1|\u5D0D \u5D03|\u5D11 \u6606|\u5D17 \u5C97|\u5D19 \u4ED1|\u5D22 \u5CE5|\u5D2C \u5CBD|\u5D50 \u5C9A|\u5D57 \u5C81|\u5D7D \u{2BD87}|\u5D7E \u37E5|\u5D81 \u5D5D|\u5D84 \u5D2D|\u5D87 \u5C96|\u5D94 \u5D5A|\u5D97 \u5D02|\u5DA0 \u5CE4|\u5DA2 \u5CE3|\u5DA7 \u5CC4|\u5DA8 \u5CC3|\u5DAE \u5D04|\u5DB8 \u5D58|\u5DBA \u5CAD|\u5DBC \u5C7F|\u5DBD \u5CB3|\u5DCB \u5CBF|\u5DD2 \u5CE6|\u5DD4 \u5DC5|\u5DD6 \u5CA9|\u5DD8 \u{2AA58}|\u5DF0 \u5DEF|\u5DF9 \u537A|\u5E25 \u5E05|\u5E2B \u5E08|\u5E33 \u5E10|\u5E36 \u5E26|\u5E40 \u5E27|\u5E43 \u5E0F|\u5E53 \u384E|\u5E57 \u5E3C|\u5E58 \u5E3B|\u5E5F \u5E1C|\u5E63 \u5E01|\u5E6B \u5E2E|\u5E6C \u5E31|\u5E77 \u5E76|\u5E79 \u5E72|\u5E7E \u51E0|\u5EAB \u5E93|\u5EC1 \u5395|\u5EC2 \u53A2|\u5EC4 \u53A9|\u5EC8 \u53A6|\u5ECE \u5EBC|\u5ED5 \u836B|\u5EDA \u53A8|\u5EDD \u53AE|\u5EDE \u{2BDF7}|\u5EDF \u5E99|\u5EE0 \u5382|\u5EE1 \u5E91|\u5EE2 \u5E9F|\u5EE3 \u5E7F|\u5EE9 \u5EEA|\u5EEC \u5E90|\u5EF3 \u5385|\u5F12 \u5F11|\u5F14 \u540A|\u5F33 \u5F2A|\u5F35 \u5F20|\u5F37 \u5F3A|\u5F44 \u{2BE29}|\u5F46 \u522B|\u5F48 \u5F39|\u5F4C \u5F25|\u5F4E \u5F2F|\u5F54 \u5F55|\u5F59 \u6C47|\u5F60 \u5F5F|\u5F65 \u5F66|\u5F6B \u96D5|\u5F72 \u5F68|\u5F7F \u4F5B|\u5F8C \u540E|\u5F91 \u5F84|\u5F9E \u4ECE|\u5FA0 \u5F95|\u5FA9 \u590D|\u5FB5 \u5F81|\u5FB9 \u5F7B|\u6046 \u6052|\u6065 \u803B|\u6085 \u60A6|\u609E \u60AE|\u60B5 \u6005|\u60B6 \u95F7|\u60BD \u51C4|\u60E1 \u6076|\u60F1 \u607C|\u60F2 \u607D|\u60FB \u607B|\u611B \u7231|\u611C \u60EC|\u6128 \u60AB|\u6134 \u6006|\u6137 \u607A|\u613E \u5FFE|\u6144 \u6817|\u614B \u6001|\u614D \u6120|\u6158 \u60E8|\u615A \u60ED|\u615F \u6078|\u6163 \u60EF|\u6164 \u60AB|\u616A \u6004|\u616B \u6002|\u616E \u8651|\u6173 \u60AD|\u6176 \u5E86|\u617A \u396A|\u617C \u621A|\u617E \u6B32|\u6182 \u5FE7|\u618A \u60EB|\u6190 \u601C|\u6191 \u51ED|\u6192 \u6126|\u6196 \u616D|\u619A \u60EE|\u61A4 \u6124|\u61AB \u60AF|\u61AE \u6003|\u61B2 \u5BAA|\u61B6 \u5FC6|\u61C7 \u6073|\u61C9 \u5E94|\u61CC \u603F|\u61CD \u61D4|\u61DE \u8499|\u61DF \u603C|\u61E3 \u61D1|\u61E4 \u393D|\u61E8 \u6079|\u61F2 \u60E9|\u61F6 \u61D2|\u61F7 \u6000|\u61F8 \u60AC|\u61FA \u5FCF|\u61FC \u60E7|\u61FE \u6151|\u6200 \u604B|\u6207 \u6206|\u6214 \u620B|\u6227 \u6217|\u6229 \u622C|\u6230 \u6218|\u6231 \u622F|\u6232 \u620F|\u6236 \u6237|\u625E \u634D|\u62CB \u629B|\u62DA \u62FC|\u6329 \u635D|\u6331 \u6332|\u633E \u631F|\u6368 \u820D|\u636B \u626A|\u6371 \u6328|\u6372 \u5377|\u6383 \u626B|\u6384 \u62A1|\u6386 \u39CF|\u6397 \u631C|\u6399 \u6323|\u639B \u6302|\u63A1 \u91C7|\u63C0 \u62E3|\u63DA \u626C|\u63DB \u6362|\u63EE \u6325|\u63EF \u6404|\u640D \u635F|\u6416 \u6447|\u6417 \u6363|\u6427 \u6247|\u6435 \u63FE|\u6436 \u62A2|\u6451 \u63B4|\u645C \u63BC|\u645F \u6402|\u646F \u631A|\u6473 \u62A0|\u6476 \u629F|\u647A \u6298|\u647B \u63BA|\u6488 \u635E|\u648F \u6326|\u6490 \u6491|\u6493 \u6320|\u649D \u39D1|\u649F \u6322|\u64A3 \u63B8|\u64A5 \u62E8|\u64AB \u629A|\u64B2 \u6251|\u64B3 \u63FF|\u64BB \u631E|\u64BE \u631D|\u64BF \u6361|\u64C1 \u62E5|\u64C4 \u63B3|\u64C7 \u62E9|\u64CA \u51FB|\u64CB \u6321|\u64D3 \u39DF|\u64D4 \u62C5|\u64DA \u636E|\u64E0 \u6324|\u64E1 \u62AC|\u64E3 \u6363|\u64EC \u62DF|\u64EF \u6448|\u64F0 \u62E7|\u64F1 \u6401|\u64F2 \u63B7|\u64F4 \u6269|\u64F7 \u64B7|\u64FA \u6446|\u64FB \u64DE|\u64FC \u64B8|\u64FD \u39F0|\u64FE \u6270|\u6504 \u6445|\u6506 \u64B5|\u650F \u62E2|\u6514 \u62E6|\u6516 \u6484|\u6519 \u6400|\u651B \u64BA|\u651C \u643A|\u651D \u6444|\u6522 \u6512|\u6523 \u631B|\u6524 \u644A|\u652A \u6405|\u652C \u63FD|\u654E \u6559|\u6553 \u655A|\u6557 \u8D25|\u6558 \u53D9|\u6575 \u654C|\u6578 \u6570|\u6582 \u655B|\u6583 \u6BD9|\u6586 \u6569|\u6595 \u6593|\u65AC \u65A9|\u65B7 \u65AD|\u65BC \u4E8E|\u65C2 \u65D7|\u65E3 \u65E2|\u6607 \u5347|\u6642 \u65F6|\u6649 \u664B|\u665B \u{2C02A}|\u665D \u663C|\u6688 \u6655|\u6689 \u6656|\u6690 \u{2C029}|\u6698 \u65F8|\u66A2 \u7545|\u66AB \u6682|\u66C4 \u6654|\u66C6 \u5386|\u66C7 \u6619|\u66C9 \u6653|\u66CF \u5411|\u66D6 \u66A7|\u66E0 \u65F7|\u66E5 \u{23190}|\u66E8 \u663D|\u66EC \u6652|\u66F8 \u4E66|\u6703 \u4F1A|\u6725 \u{266E8}|\u6727 \u80E7|\u672E \u672F|\u6771 \u4E1C|\u67B4 \u62D0|\u67F5 \u6805|\u67FA \u62D0|\u67FB \u67E5|\u6871 \u{23415}|\u687F \u6746|\u6894 \u6800|\u6898 \u67A7|\u689C \u{2C0A9}|\u689D \u6761|\u689F \u67AD|\u68B2 \u68C1|\u68C4 \u5F03|\u68CA \u68CB|\u68D6 \u67A8|\u68D7 \u67A3|\u68DF \u680B|\u68E1 \u3B4E|\u68E7 \u6808|\u68F2 \u6816|\u68F6 \u68BE|\u690F \u6860|\u6932 \u3B4F|\u694A \u6768|\u6953 \u67AB|\u6968 \u6862|\u696D \u4E1A|\u6975 \u6781|\u6998 \u77E9|\u69A6 \u5E72|\u69AA \u6769|\u69AE \u8363|\u69B2 \u6985|\u69BF \u6864|\u69CB \u6784|\u69CD \u67AA|\u69D3 \u6760|\u69E4 \u68BF|\u69E7 \u6920|\u69E8 \u6901|\u69EE \u692E|\u69F3 \u6868|\u69F6 \u6922|\u69FC \u691D|\u6A01 \u6869|\u6A02 \u4E50|\u6A05 \u679E|\u6A11 \u6881|\u6A13 \u697C|\u6A19 \u6807|\u6A1E \u67A2|\u6A22 \u3B64|\u6A23 \u6837|\u6A27 \u699D|\u6A2B \u3B74|\u6A33 \u686A|\u6A38 \u6734|\u6A39 \u6811|\u6A3A \u6866|\u6A3F \u692B|\u6A48 \u6861|\u6A4B \u6865|\u6A5F \u673A|\u6A62 \u692D|\u6A6B \u6A2A|\u6A6F \u{234FF}|\u6A81 \u6AA9|\u6A89 \u67FD|\u6A94 \u6863|\u6A9C \u6867|\u6A9F \u69DA|\u6AA2 \u68C0|\u6AA3 \u6A2F|\u6AAE \u68BC|\u6AAF \u53F0|\u6AB3 \u69DF|\u6AB8 \u67E0|\u6ABB \u69DB|\u6AC3 \u67DC|\u6ACD \u{2C0CA}|\u6AD3 \u6A79|\u6ADA \u6988|\u6ADB \u6809|\u6ADD \u691F|\u6ADE \u6A7C|\u6ADF \u680E|\u6AE5 \u6A71|\u6AE7 \u69E0|\u6AE8 \u680C|\u6AEA \u67A5|\u6AEB \u6A65|\u6AEC \u6987|\u6AF1 \u8616|\u6AF3 \u680A|\u6AF8 \u6989|\u6AFB \u6A31|\u6B04 \u680F|\u6B05 \u6989|\u6B0A \u6743|\u6B0F \u6924|\u6B12 \u683E|\u6B13 \u{235CB}|\u6B16 \u6984|\u6B1E \u68C2|\u6B3D \u94A6|\u6B4E \u53F9|\u6B50 \u6B27|\u6B5F \u6B24|\u6B61 \u6B22|\u6B72 \u5C81|\u6B77 \u5386|\u6B78 \u5F52|\u6B7F \u6B81|\u6B98 \u6B8B|\u6B9E \u6B92|\u6BA4 \u6B87|\u6BA8 \u3C6E|\u6BAB \u6B9A|\u6BAD \u50F5|\u6BAE \u6B93|\u6BAF \u6BA1|\u6BB0 \u3C69|\u6BB2 \u6B7C|\u6BBA \u6740|\u6BBB \u58F3|\u6BBC \u58F3|\u6BC0 \u6BC1|\u6BC6 \u6BB4|\u6BFF \u6BF5|\u6C02 \u7266|\u6C08 \u6BE1|\u6C0C \u6C07|\u6C23 \u6C14|\u6C2B \u6C22|\u6C2C \u6C29|\u6C33 \u6C32|\u6C3E \u6CDB|\u6C4E \u6CDB|\u6C59 \u6C61|\u6C7A \u51B3|\u6C92 \u6CA1|\u6C96 \u51B2|\u6CC1 \u51B5|\u6CDD \u6EAF|\u6D29 \u6CC4|\u6D36 \u6C79|\u6D79 \u6D43|\u6D7F \u{2C1D9}|\u6D87 \u6CFE|\u6D97 \u6D9A|\u6DBC \u51C9|\u6DD2 \u51C4|\u6DDA \u6CEA|\u6DE5 \u6E0C|\u6DE8 \u51C0|\u6DE9 \u51CC|\u6DEA \u6CA6|\u6DF5 \u6E0A|\u6DF6 \u6D9E|\u6DFA \u6D45|\u6E19 \u6DA3|\u6E1B \u51CF|\u6E22 \u6CA8|\u6E26 \u6DA1|\u6E2C \u6D4B|\u6E3E \u6D51|\u6E4A \u51D1|\u6E4B \u{23C97}|\u6E5E \u6D48|\u6E67 \u6D8C|\u6E6F \u6C64|\u6E88 \u6CA9|\u6E96 \u51C6|\u6E9D \u6C9F|\u6EAB \u6E29|\u6EAE \u6D49|\u6EB3 \u6DA2|\u6EBC \u6E7F|\u6EC4 \u6CA7|\u6EC5 \u706D|\u6ECC \u6DA4|\u6ECE \u8365|\u6ED9 \u6C47|\u6EEC \u6CAA|\u6EEF \u6EDE|\u6EF2 \u6E17|\u6EF7 \u5364|\u6EF8 \u6D52|\u6EFB \u6D50|\u6EFE \u6EDA|\u6EFF \u6EE1|\u6F01 \u6E14|\u6F0A \u6E87|\u6F0D \u{2C1F9}|\u6F1A \u6CA4|\u6F22 \u6C49|\u6F23 \u6D9F|\u6F2C \u6E0D|\u6F32 \u6DA8|\u6F35 \u6E86|\u6F38 \u6E10|\u6F3F \u6D46|\u6F41 \u988D|\u6F51 \u6CFC|\u6F54 \u6D01|\u6F55 \u{23C98}|\u6F59 \u6CA9|\u6F5A \u3D0B|\u6F5B \u6F5C|\u6F64 \u6DA6|\u6F6F \u6D54|\u6F70 \u6E83|\u6F77 \u6ED7|\u6F7F \u6DA0|\u6F80 \u6DA9|\u6F86 \u6D47|\u6F87 \u6D9D|\u6F90 \u6C84|\u6F97 \u6DA7|\u6FA0 \u6E11|\u6FA4 \u6CFD|\u6FA6 \u6EEA|\u6FA9 \u6CF6|\u6FAB \u{2C1D5}|\u6FAE \u6D4D|\u6FB1 \u6DC0|\u6FBE \u3CE0|\u6FC1 \u6D4A|\u6FC3 \u6D53|\u6FC4 \u3CE1|\u6FC6 \u{23E23}|\u6FD5 \u6E7F|\u6FD8 \u6CDE|\u6FDA \u6E81|\u6FDB \u8499|\u6FDC \u6D55|\u6FDF \u6D4E|\u6FE4 \u6D9B|\u6FE7 \u3CD4|\u6FEB \u6EE5|\u6FF0 \u6F4D|\u6FF1 \u6EE8|\u6FFA \u6E85|\u6FFC \u6CFA|\u6FFE \u6EE4|\u7002 \u6F9B|\u7005 \u6EE2|\u7006 \u6E0E|\u7007 \u3CBF|\u7009 \u6CFB|\u700B \u6C88|\u700F \u6D4F|\u7015 \u6FD2|\u7018 \u6CF8|\u701D \u6CA5|\u701F \u6F47|\u7020 \u6F46|\u7026 \u6F74|\u7027 \u6CF7|\u7028 \u6FD1|\u7030 \u5F25|\u7032 \u6F4B|\u703E \u6F9C|\u7043 \u6CA3|\u7044 \u6EE0|\u7051 \u6D12|\u7052 \u{2ADFD}|\u7055 \u6F13|\u7058 \u6EE9|\u7059 \u{23EBC}|\u705D \u704F|\u7061 \u3CD5|\u7063 \u6E7E|\u7064 \u6EE6|\u7067 \u6EDF|\u7069 \u6EDF|\u707D \u707E|\u70BA \u4E3A|\u70CF \u4E4C|\u70F4 \u70C3|\u7121 \u65E0|\u7149 \u70BC|\u7152 \u709C|\u7159 \u70DF|\u7162 \u8315|\u7165 \u7115|\u7169 \u70E6|\u716C \u7080|\u7171 \u3DBD|\u7185 \u7174|\u7192 \u8367|\u7197 \u709D|\u71B0 \u{2C27C}|\u71B1 \u70ED|\u71B2 \u988E|\u71BE \u70BD|\u71C0 \u{2C2A4}|\u71C1 \u70E8|\u71C8 \u706F|\u71C9 \u7096|\u71D2 \u70E7|\u71D6 \u{2C288}|\u71D9 \u70EB|\u71DC \u7116|\u71DF \u8425|\u71E6 \u707F|\u71EC \u6BC1|\u71ED \u70DB|\u71F4 \u70E9|\u71F6 \u3DB6|\u71FB \u718F|\u71FC \u70EC|\u71FE \u7118|\u720D \u70C1|\u7210 \u7089|\u721B \u70C2|\u722D \u4E89|\u7232 \u4E3A|\u723A \u7237|\u723E \u5C14|\u7240 \u5E8A|\u7246 \u5899|\u7258 \u724D|\u7274 \u62B5|\u727D \u7275|\u7296 \u8366|\u729B \u7266|\u72A2 \u728A|\u72A7 \u727A|\u72C0 \u72B6|\u72F9 \u72ED|\u72FD \u72C8|\u7319 \u72F0|\u7336 \u72B9|\u733B \u72F2|\u7341 \u72B8|\u7343 \u5446|\u7344 \u72F1|\u7345 \u72EE|\u734E \u5956|\u7368 \u72EC|\u736A \u72EF|\u736B \u7303|\u736E \u72DD|\u7370 \u72DE|\u7371 \u3E8D|\u7372 \u83B7|\u7375 \u730E|\u7377 \u72B7|\u7378 \u517D|\u737A \u736D|\u737B \u732E|\u737C \u7315|\u7380 \u7321|\u73FE \u73B0|\u7431 \u96D5|\u743A \u73D0|\u743F \u73F2|\u744B \u73AE|\u7452 \u739A|\u7463 \u7410|\u7464 \u7476|\u7469 \u83B9|\u746A \u739B|\u7472 \u73B1|\u7489 \u740F|\u748A \u{2B7A9}|\u7495 \u{2C364}|\u7497 \u{2C361}|\u74A1 \u740E|\u74A3 \u7391|\u74A6 \u7477|\u74AB \u73F0|\u74AF \u3EC5|\u74B0 \u73AF|\u74B5 \u7399|\u74B8 \u7478|\u74BD \u73BA|\u74BF \u7487|\u74C5 \u{2C35B}|\u74CA \u743C|\u74CF \u73D1|\u74D4 \u748E|\u74DA \u74D2|\u74DB \u{24A7D}|\u750C \u74EF|\u7515 \u74EE|\u7522 \u4EA7|\u7523 \u4EA7|\u755D \u4EA9|\u7562 \u6BD5|\u756B \u753B|\u7570 \u5F02|\u7575 \u753B|\u7576 \u5F53|\u7587 \u7574|\u758A \u53E0|\u75D9 \u75C9|\u75E0 \u9178|\u75FE \u75B4|\u7602 \u75D6|\u760B \u75AF|\u760D \u75A1|\u7613 \u75EA|\u761E \u7617|\u7621 \u75AE|\u7627 \u759F|\u762E \u7606|\u7632 \u75AD|\u763A \u7618|\u763B \u7618|\u7642 \u7597|\u7646 \u75E8|\u7647 \u75EB|\u7649 \u7605|\u7652 \u6108|\u7658 \u75A0|\u765F \u762A|\u7661 \u75F4|\u7662 \u75D2|\u7664 \u7596|\u7665 \u75C7|\u7667 \u75AC|\u7669 \u765E|\u766C \u7663|\u766D \u763F|\u766E \u763E|\u7670 \u75C8|\u7671 \u762B|\u7672 \u766B|\u767C \u53D1|\u7681 \u7682|\u769A \u7691|\u76B0 \u75B1|\u76B8 \u76B2|\u76BA \u76B1|\u76C3 \u676F|\u76DC \u76D7|\u76DE \u76CF|\u76E1 \u5C3D|\u76E3 \u76D1|\u76E4 \u76D8|\u76E7 \u5362|\u76EA \u8361|\u771E \u771F|\u7725 \u7726|\u773E \u4F17|\u774D \u{2AFA2}|\u774F \u56F0|\u775C \u7741|\u775E \u7750|\u7798 \u770D|\u779C \u4056|\u779E \u7792|\u77B6 \u7786|\u77BC \u7751|\u77C7 \u8499|\u77D3 \u772C|\u77DA \u77A9|\u77EF \u77EB|\u7843 \u6731|\u785C \u7841|\u7864 \u7856|\u7868 \u7817|\u786F \u781A|\u7895 \u57FC|\u78A9 \u7855|\u78AD \u7800|\u78B8 \u781C|\u78BA \u786E|\u78BC \u7801|\u78BD \u40B5|\u78D1 \u7859|\u78DA \u7816|\u78E0 \u7875|\u78E3 \u789C|\u78E7 \u789B|\u78EF \u77F6|\u78FD \u7857|\u78FE \u40C5|\u7904 \u785A|\u790E \u7840|\u7910 \u{2C488}|\u7919 \u788D|\u7926 \u77FF|\u792A \u783A|\u792B \u783E|\u792C \u77FE|\u7931 \u783B|\u7955 \u79D8|\u797F \u7984|\u798D \u7978|\u798E \u796F|\u7995 \u794E|\u79A1 \u7943|\u79A6 \u5FA1|\u79AA \u7985|\u79AE \u793C|\u79B0 \u7962|\u79B1 \u7977|\u79BF \u79C3|\u79C8 \u7C7C|\u7A05 \u7A0E|\u7A08 \u79C6|\u7A0F \u4149|\u7A1C \u68F1|\u7A1F \u7980|\u7A2E \u79CD|\u7A31 \u79F0|\u7A40 \u8C37|\u7A47 \u415F|\u7A4C \u7A23|\u7A4D \u79EF|\u7A4E \u9896|\u7A60 \u79FE|\u7A61 \u7A51|\u7A62 \u79FD|\u7A69 \u7A33|\u7A6B \u83B7|\u7A6D \u7A5E|\u7AA9 \u7A9D|\u7AAA \u6D3C|\u7AAE \u7A77|\u7AAF \u7A91|\u7AB5 \u7A8E|\u7AB6 \u7AAD|\u7ABA \u7AA5|\u7AC4 \u7A9C|\u7AC5 \u7A8D|\u7AC7 \u7AA6|\u7AC8 \u7076|\u7ACA \u7A83|\u7AEA \u7AD6|\u7AF6 \u7ADE|\u7B46 \u7B14|\u7B4D \u7B0B|\u7B67 \u7B15|\u7B74 \u41F2|\u7B87 \u4E2A|\u7B8B \u7B3A|\u7B8F \u7B5D|\u7B9A \u672D|\u7BC0 \u8282|\u7BC4 \u8303|\u7BC9 \u7B51|\u7BCB \u7BA7|\u7BD4 \u7B7C|\u7BE0 \u7B7F|\u7BE2 \u{2C542}|\u7BE4 \u7B03|\u7BE9 \u7B5B|\u7BF3 \u7B5A|\u7BF8 \u{25BBE}|\u7C00 \u7BA6|\u7C0D \u7BD3|\u7C11 \u84D1|\u7C1E \u7BAA|\u7C21 \u7B80|\u7C23 \u7BD1|\u7C2B \u7BAB|\u7C39 \u7B5C|\u7C3D \u7B7E|\u7C3E \u5E18|\u7C43 \u7BEE|\u7C45 \u{25AE3}|\u7C4C \u7B79|\u7C54 \u4264|\u7C59 \u7B93|\u7C5B \u7BEF|\u7C5C \u7BA8|\u7C5F \u7C41|\u7C60 \u7B3C|\u7C64 \u7B7E|\u7C69 \u7B3E|\u7C6A \u7C16|\u7C6C \u7BF1|\u7C6E \u7BA9|\u7C72 \u5401|\u7CB5 \u7CA4|\u7CC9 \u7CBD|\u7CDD \u7CC1|\u7CDE \u7CAA|\u7CE7 \u7CAE|\u7CF0 \u56E2|\u7CF2 \u7C9D|\u7CF4 \u7C74|\u7CF6 \u7C9C|\u7CF9 \u7E9F|\u7CFE \u7EA0|\u7D00 \u7EAA|\u7D02 \u7EA3|\u7D03 \u{2C613}|\u7D04 \u7EA6|\u7D05 \u7EA2|\u7D06 \u7EA1|\u7D07 \u7EA5|\u7D08 \u7EA8|\u7D09 \u7EAB|\u7D0B \u7EB9|\u7D0D \u7EB3|\u7D10 \u7EBD|\u7D13 \u7EBE|\u7D14 \u7EAF|\u7D15 \u7EB0|\u7D16 \u7EBC|\u7D17 \u7EB1|\u7D18 \u7EAE|\u7D19 \u7EB8|\u7D1A \u7EA7|\u7D1B \u7EB7|\u7D1C \u7EAD|\u7D1D \u7EB4|\u7D1E \u{2C618}|\u7D21 \u7EBA|\u7D2C \u4337|\u7D2E \u624E|\u7D30 \u7EC6|\u7D31 \u7EC2|\u7D32 \u7EC1|\u7D33 \u7EC5|\u7D35 \u7EBB|\u7D39 \u7ECD|\u7D3A \u7EC0|\u7D3C \u7ECB|\u7D3F \u7ED0|\u7D40 \u7ECC|\u7D42 \u7EC8|\u7D43 \u5F26|\u7D44 \u7EC4|\u7D45 \u4339|\u7D46 \u7ECA|\u7D4E \u7ED7|\u7D50 \u7ED3|\u7D55 \u7EDD|\u7D5B \u7EE6|\u7D5D \u7ED4|\u7D5E \u7EDE|\u7D61 \u7EDC|\u7D62 \u7EDA|\u7D66 \u7ED9|\u7D68 \u7ED2|\u7D6A \u{2C621}|\u7D70 \u7ED6|\u7D71 \u7EDF|\u7D72 \u4E1D|\u7D73 \u7EDB|\u7D76 \u7EDD|\u7D79 \u7EE2|\u7D7A \u{2B128}|\u7D81 \u7ED1|\u7D83 \u7EE1|\u7D84 \u{2C62B}|\u7D86 \u7EE0|\u7D88 \u7EE8|\u7D89 \u7EE3|\u7D8C \u7EE4|\u7D8E \u{2C629}|\u7D8F \u7EE5|\u7D90 \u433C|\u7D91 \u6346|\u7D93 \u7ECF|\u7D96 \u{2B127}|\u7D9C \u7EFC|\u7D9D \u{2C62D}|\u7D9E \u7F0D|\u7DA0 \u7EFF|\u7DA1 \u{2B7C5}|\u7DA2 \u7EF8|\u7DA3 \u7EFB|\u7DA7 \u{2C62F}|\u7DAA \u{2C62C}|\u7DAB \u7EBF|\u7DAC \u7EF6|\u7DAD \u7EF4|\u7DAF \u7EF9|\u7DB0 \u7EFE|\u7DB1 \u7EB2|\u7DB2 \u7F51|\u7DB3 \u7EF7|\u7DB4 \u7F00|\u7DB5 \u5F69|\u7DB8 \u7EB6|\u7DB9 \u7EFA|\u7DBA \u7EEE|\u7DBB \u7EFD|\u7DBD \u7EF0|\u7DBE \u7EEB|\u7DBF \u7EF5|\u7DC4 \u7EF2|\u7DC7 \u7F01|\u7DCA \u7D27|\u7DCB \u7EEF|\u7DD1 \u7EFF|\u7DD2 \u7EEA|\u7DD3 \u7EEC|\u7DD4 \u7EF1|\u7DD7 \u7F03|\u7DD8 \u7F04|\u7DD9 \u7F02|\u7DDA \u7EBF|\u7DDD \u7F09|\u7DDE \u7F0E|\u7DE0 \u7F14|\u7DE1 \u7F17|\u7DE3 \u7F18|\u7DE6 \u7F0C|\u7DE8 \u7F16|\u7DE9 \u7F13|\u7DEC \u7F05|\u7DEF \u7EAC|\u7DF1 \u7F11|\u7DF2 \u7F08|\u7DF4 \u7EC3|\u7DF6 \u7F0F|\u7DF9 \u7F07|\u7DFB \u81F4|\u7DFC \u7F0A|\u7E08 \u8426|\u7E09 \u7F19|\u7E0A \u7F22|\u7E0B \u7F12|\u7E10 \u7EC9|\u7E11 \u7F23|\u7E15 \u7F0A|\u7E17 \u7F1E|\u7E1B \u7F1A|\u7E1D \u7F1C|\u7E1E \u7F1F|\u7E1F \u7F1B|\u7E23 \u53BF|\u7E27 \u7EE6|\u7E2B \u7F1D|\u7E2D \u7F21|\u7E2E \u7F29|\u7E2F \u{2C642}|\u7E31 \u7EB5|\u7E32 \u7F27|\u7E33 \u4338|\u7E34 \u7EA4|\u7E35 \u7F26|\u7E36 \u7D77|\u7E37 \u7F15|\u7E39 \u7F25|\u7E3D \u603B|\u7E3E \u7EE9|\u7E43 \u7EF7|\u7E45 \u7F2B|\u7E46 \u7F2A|\u7E52 \u7F2F|\u7E54 \u7EC7|\u7E55 \u7F2E|\u7E5A \u7F2D|\u7E5E \u7ED5|\u7E61 \u7EE3|\u7E62 \u7F0B|\u7E69 \u7EF3|\u7E6A \u7ED8|\u7E6B \u7CFB|\u7E6D \u8327|\u7E6E \u7F30|\u7E6F \u7F33|\u7E70 \u7F32|\u7E73 \u7F34|\u7E76 \u{2B137}|\u7E78 \u4341|\u7E79 \u7ECE|\u7E7B \u{26221}|\u7E7C \u7EE7|\u7E7D \u7F24|\u7E7E \u7F31|\u7E7F \u4340|\u7E81 \u{2B138}|\u7E86 \u{2C64A}|\u7E87 \u98A3|\u7E88 \u7F2C|\u7E8A \u7EA9|\u7E8C \u7EED|\u7E8D \u7D2F|\u7E8F \u7F20|\u7E93 \u7F28|\u7E94 \u624D|\u7E95 \u{2C64B}|\u7E96 \u7EA4|\u7E98 \u7F35|\u7E9C \u7F06|\u7F3D \u94B5|\u7F43 \u44E8|\u7F48 \u575B|\u7F4C \u7F42|\u7F4E \u575B|\u7F70 \u7F5A|\u7F75 \u9A82|\u7F77 \u7F62|\u7F85 \u7F57|\u7F86 \u7F74|\u7F88 \u7F81|\u7F8B \u8288|\u7FA3 \u7FA4|\u7FA5 \u7F9F|\u7FA8 \u7FA1|\u7FA9 \u4E49|\u7FB6 \u81BB|\u7FD2 \u4E60|\u7FEB \u73A9|\u7FEC \u7FDA|\u7FF9 \u7FD8|\u7FFD \u7FD9|\u802C \u8027|\u802E \u8022|\u8056 \u5723|\u805E \u95FB|\u806F \u8054|\u8070 \u806A|\u8072 \u58F0|\u8073 \u8038|\u8075 \u8069|\u8076 \u8042|\u8077 \u804C|\u8079 \u804D|\u807D \u542C|\u807E \u804B|\u8085 \u8083|\u8105 \u80C1|\u8108 \u8109|\u811B \u80EB|\u8123 \u5507|\u8129 \u4FEE|\u812B \u8131|\u8139 \u80C0|\u814E \u80BE|\u8156 \u80E8|\u8161 \u8136|\u8166 \u8111|\u816B \u80BF|\u8173 \u811A|\u8178 \u80A0|\u8183 \u817D|\u8195 \u8158|\u819A \u80A4|\u819E \u43DD|\u81A0 \u80F6|\u81A2 \u{2677C}|\u81A9 \u817B|\u81BD \u80C6|\u81BE \u810D|\u81BF \u8113|\u81C9 \u8138|\u81CD \u8110|\u81CF \u8191|\u81D8 \u814A|\u81DA \u80EA|\u81DF \u810F|\u81E0 \u8114|\u81E2 \u81DC|\u81E5 \u5367|\u81E8 \u4E34|\u81FA \u53F0|\u8207 \u4E0E|\u8208 \u5174|\u8209 \u4E3E|\u820A \u65E7|\u8216 \u94FA|\u8218 \u9986|\u8259 \u8231|\u8264 \u8223|\u8266 \u8230|\u826B \u823B|\u8271 \u8270|\u8277 \u8273|\u82BB \u520D|\u82E7 \u82CE|\u8332 \u5179|\u834A \u8346|\u838A \u5E84|\u8396 \u830E|\u83A2 \u835A|\u83A7 \u82CB|\u83EF \u534E|\u83F4 \u5EB5|\u83F8 \u70DF|\u8407 \u82CC|\u840A \u83B1|\u842C \u4E07|\u8434 \u835D|\u8435 \u83B4|\u8449 \u53F6|\u8452 \u836D|\u8464 \u836E|\u8466 \u82C7|\u846F \u836F|\u8477 \u8364|\u848D \u{2B1ED}|\u8490 \u641C|\u8493 \u83BC|\u8494 \u83B3|\u8495 \u8480|\u849E \u8385|\u84BC \u82CD|\u84C0 \u836A|\u84C6 \u5E2D|\u84CB \u76D6|\u84EE \u83B2|\u84EF \u82C1|\u84F4 \u83BC|\u84FD \u835C|\u8504 \u{2C72C}|\u8514 \u535C|\u8518 \u53C2|\u851E \u848C|\u8523 \u848B|\u8525 \u8471|\u8526 \u8311|\u852D \u836B|\u852F \u{2B21F}|\u853F \u{2B1ED}|\u8541 \u8368|\u8546 \u8487|\u854E \u835E|\u8552 \u836C|\u8553 \u82B8|\u8555 \u83B8|\u8558 \u835B|\u8562 \u8489|\u8569 \u8361|\u856A \u829C|\u856D \u8427|\u8577 \u84E3|\u8580 \u8570|\u8588 \u835F|\u858A \u84DF|\u858C \u8297|\u8591 \u59DC|\u8594 \u8537|\u8598 \u8359|\u859F \u83B6|\u85A6 \u8350|\u85A9 \u8428|\u85B3 \u44D5|\u85B4 \u82E7|\u85B5 \u44D3|\u85B9 \u82D4|\u85BA \u8360|\u85CD \u84DD|\u85CE \u8369|\u85DD \u827A|\u85E5 \u836F|\u85EA \u85AE|\u85ED \u44D6|\u85F4 \u8574|\u85F6 \u82C8|\u85F9 \u853C|\u85FA \u853A|\u8600 \u841A|\u8604 \u8572|\u8606 \u82A6|\u8607 \u82CF|\u860A \u8574|\u860B \u82F9|\u861A \u85D3|\u861E \u8539|\u861F \u{26ED5}|\u8622 \u830F|\u862D \u5170|\u863A \u84E0|\u863F \u841D|\u8646 \u8502|\u8649 \u{2C7C1}|\u8655 \u5904|\u865B \u865A|\u865C \u864F|\u865F \u53F7|\u8667 \u4E8F|\u866F \u866C|\u86FA \u86F1|\u86FB \u8715|\u8706 \u86AC|\u8740 \u{2C7FD}|\u8755 \u8680|\u875F \u732C|\u8766 \u867E|\u8768 \u8671|\u8778 \u8717|\u8784 \u86F3|\u879E \u8682|\u87A2 \u8424|\u87AE \u45D6|\u87BB \u877C|\u87BF \u8780|\u87C4 \u86F0|\u87C8 \u8748|\u87CE \u87A8|\u87E3 \u866E|\u87EC \u8749|\u87EF \u86F2|\u87F2 \u866B|\u87F3 \u{2B2BB}|\u87F6 \u86CF|\u87FB \u8681|\u8801 \u8683|\u8805 \u8747|\u8806 \u867F|\u880D \u874E|\u8810 \u86F4|\u8811 \u877E|\u8814 \u869D|\u881F \u8721|\u8823 \u86CE|\u8828 \u87CF|\u8831 \u86CA|\u8836 \u8695|\u883B \u86EE|\u8846 \u4F17|\u884A \u8511|\u8853 \u672F|\u8855 \u540C|\u885A \u80E1|\u885B \u536B|\u885D \u51B2|\u889E \u886E|\u88B7 \u5939|\u88CA \u8885|\u88CF \u91CC|\u88DC \u8865|\u88DD \u88C5|\u88E1 \u91CC|\u88FD \u5236|\u8907 \u590D|\u890C \u88C8|\u8918 \u8886|\u8932 \u88E4|\u8933 \u88E2|\u8938 \u891B|\u893B \u4EB5|\u8940 \u{2B300}|\u8947 \u88E5|\u8949 \u88E5|\u894F \u88AF|\u8956 \u8884|\u895D \u88E3|\u8960 \u88C6|\u8964 \u8934|\u896A \u889C|\u896C \u6446|\u896F \u886C|\u8972 \u88AD|\u8974 \u8955|\u8988 \u6838|\u898B \u89C1|\u898E \u89C3|\u898F \u89C4|\u8993 \u89C5|\u8996 \u89C6|\u8998 \u89C7|\u89A1 \u89CB|\u89A5 \u89CD|\u89A6 \u89CE|\u89AA \u4EB2|\u89AC \u89CA|\u89AF \u89CF|\u89B2 \u89D0|\u89B7 \u89D1|\u89BA \u89C9|\u89BD \u89C8|\u89BF \u89CC|\u89C0 \u89C2|\u89F4 \u89DE|\u89F6 \u89EF|\u89F8 \u89E6|\u8A01 \u8BA0|\u8A02 \u8BA2|\u8A03 \u8BA3|\u8A08 \u8BA1|\u8A0A \u8BAF|\u8A0C \u8BA7|\u8A0E \u8BA8|\u8A0F \u{2C8D9}|\u8A10 \u8BA6|\u8A12 \u8BB1|\u8A13 \u8BAD|\u8A15 \u8BAA|\u8A16 \u8BAB|\u8A17 \u6258|\u8A18 \u8BB0|\u8A1B \u8BB9|\u8A1D \u8BB6|\u8A1F \u8BBC|\u8A22 \u4723|\u8A23 \u8BC0|\u8A25 \u8BB7|\u8A29 \u8BBB|\u8A2A \u8BBF|\u8A2D \u8BBE|\u8A31 \u8BB8|\u8A34 \u8BC9|\u8A36 \u8BC3|\u8A3A \u8BCA|\u8A3B \u6CE8|\u8A3C \u8BC1|\u8A40 \u{27BAA}|\u8A41 \u8BC2|\u8A46 \u8BCB|\u8A4E \u8BB5|\u8A50 \u8BC8|\u8A52 \u8BD2|\u8A54 \u8BCF|\u8A55 \u8BC4|\u8A56 \u8BD0|\u8A57 \u8BC7|\u8A58 \u8BCE|\u8A5B \u8BC5|\u8A5D \u{2C8DE}|\u8A5E \u8BCD|\u8A60 \u548F|\u8A61 \u8BE9|\u8A62 \u8BE2|\u8A63 \u8BE3|\u8A66 \u8BD5|\u8A69 \u8BD7|\u8A6A \u{2C8F3}|\u8A6B \u8BE7|\u8A6C \u8BDF|\u8A6D \u8BE1|\u8A6E \u8BE0|\u8A70 \u8BD8|\u8A71 \u8BDD|\u8A72 \u8BE5|\u8A73 \u8BE6|\u8A75 \u8BDC|\u8A77 \u{2B363}|\u8A7C \u8BD9|\u8A7F \u8BD6|\u8A84 \u8BD4|\u8A85 \u8BDB|\u8A86 \u8BD3|\u8A87 \u5938|\u8A8C \u5FD7|\u8A8D \u8BA4|\u8A91 \u8BF3|\u8A92 \u8BF6|\u8A95 \u8BDE|\u8A98 \u8BF1|\u8A9A \u8BEE|\u8A9E \u8BED|\u8AA0 \u8BDA|\u8AA1 \u8BEB|\u8AA3 \u8BEC|\u8AA4 \u8BEF|\u8AA5 \u8BF0|\u8AA6 \u8BF5|\u8AA8 \u8BF2|\u8AAA \u8BF4|\u8AAC \u8BF4|\u8AB0 \u8C01|\u8AB2 \u8BFE|\u8AB6 \u8C07|\u8AB9 \u8BFD|\u8ABC \u8C0A|\u8ABE \u8A1A|\u8ABF \u8C03|\u8AC2 \u8C04|\u8AC4 \u8C06|\u8AC7 \u8C08|\u8AC9 \u8BFF|\u8ACB \u8BF7|\u8ACD \u8BE4|\u8ACF \u8BF9|\u8AD1 \u8BFC|\u8AD2 \u8C05|\u8AD3 \u{2C8E1}|\u8AD6 \u8BBA|\u8AD7 \u8C02|\u8ADB \u8C00|\u8ADC \u8C0D|\u8ADD \u8C1E|\u8ADE \u8C1D|\u8ADF \u{2C90A}|\u8AE1 \u8C25|\u8AE2 \u8BE8|\u8AE4 \u8C14|\u8AE6 \u8C1B|\u8AE7 \u8C10|\u8AEB \u8C0F|\u8AED \u8C15|\u8AEE \u54A8|\u8AF1 \u8BB3|\u8AF2 \u{2C907}|\u8AF3 \u8C19|\u8AF4 \u{2B36F}|\u8AF6 \u8C0C|\u8AF7 \u8BBD|\u8AF8 \u8BF8|\u8AFA \u8C1A|\u8AFC \u8C16|\u8AFE \u8BFA|\u8B00 \u8C0B|\u8B01 \u8C12|\u8B02 \u8C13|\u8B04 \u8A8A|\u8B05 \u8BCC|\u8B0A \u8C0E|\u8B0E \u8C1C|\u8B0F \u{2B372}|\u8B10 \u8C27|\u8B14 \u8C11|\u8B16 \u8C21|\u8B17 \u8C24|\u8B19 \u8C26|\u8B1A \u8C25|\u8B1B \u8BB2|\u8B1D \u8C22|\u8B20 \u8C23|\u8B21 \u8C23|\u8B28 \u8C1F|\u8B2B \u8C2A|\u8B2C \u8C2C|\u8B2D \u8C2B|\u8B33 \u8BB4|\u8B39 \u8C28|\u8B3E \u8C29|\u8B41 \u54D7|\u8B49 \u8BC1|\u8B4E \u8C32|\u8B4F \u8BA5|\u8B53 \u{2C91D}|\u8B56 \u8C2E|\u8B58 \u8BC6|\u8B59 \u8C2F|\u8B5A \u8C2D|\u8B5C \u8C31|\u8B5E \u{2B37D}|\u8B5F \u566A|\u8B6B \u8C35|\u8B6D \u6BC1|\u8B6F \u8BD1|\u8B70 \u8BAE|\u8B74 \u8C34|\u8B77 \u62A4|\u8B78 \u8BEA|\u8B7D \u8A89|\u8B7E \u8C2B|\u8B80 \u8BFB|\u8B85 \u8C09|\u8B8A \u53D8|\u8B8B \u8A5F|\u8B8C \u4729|\u8B8E \u96E0|\u8B92 \u8C17|\u8B93 \u8BA9|\u8B95 \u8C30|\u8B96 \u8C36|\u8B9A \u8D5E|\u8B9C \u8C20|\u8B9E \u8C33|\u8C3F \u6EAA|\u8C48 \u5C82|\u8C4E \u7AD6|\u8C50 \u4E30|\u8C54 \u8273|\u8C6C \u732A|\u8C76 \u8C6E|\u8C8D \u72F8|\u8C93 \u732B|\u8C99 \u4759|\u8C9D \u8D1D|\u8C9E \u8D1E|\u8C9F \u8D20|\u8CA0 \u8D1F|\u8CA1 \u8D22|\u8CA2 \u8D21|\u8CA7 \u8D2B|\u8CA8 \u8D27|\u8CA9 \u8D29|\u8CAA \u8D2A|\u8CAB \u8D2F|\u8CAC \u8D23|\u8CAF \u8D2E|\u8CB0 \u8D33|\u8CB2 \u8D40|\u8CB3 \u8D30|\u8CB4 \u8D35|\u8CB6 \u8D2C|\u8CB7 \u4E70|\u8CB8 \u8D37|\u8CBA \u8D36|\u8CBB \u8D39|\u8CBC \u8D34|\u8CBD \u8D3B|\u8CBF \u8D38|\u8CC0 \u8D3A|\u8CC1 \u8D32|\u8CC2 \u8D42|\u8CC3 \u8D41|\u8CC4 \u8D3F|\u8CC5 \u8D45|\u8CC7 \u8D44|\u8CC8 \u8D3E|\u8CCA \u8D3C|\u8CD1 \u8D48|\u8CD2 \u8D4A|\u8CD3 \u5BBE|\u8CD5 \u8D47|\u8CD9 \u8D52|\u8CDA \u8D49|\u8CDC \u8D50|\u8CDE \u8D4F|\u8CE0 \u8D54|\u8CE1 \u8D53|\u8CE2 \u8D24|\u8CE3 \u5356|\u8CE4 \u8D31|\u8CE6 \u8D4B|\u8CE7 \u8D55|\u8CEA \u8D28|\u8CEB \u8D4D|\u8CEC \u8D26|\u8CED \u8D4C|\u8CF0 \u4790|\u8CF4 \u8D56|\u8CF5 \u8D57|\u8CFA \u8D5A|\u8CFB \u8D59|\u8CFC \u8D2D|\u8CFD \u8D5B|\u8CFE \u8D5C|\u8D04 \u8D3D|\u8D05 \u8D58|\u8D07 \u8D5F|\u8D08 \u8D60|\u8D0A \u8D5E|\u8D0B \u8D5D|\u8D0D \u8D61|\u8D0F \u8D62|\u8D10 \u8D46|\u8D13 \u8D43|\u8D14 \u8D51|\u8D16 \u8D4E|\u8D17 \u8D5D|\u8D1B \u8D63|\u8D1C \u8D43|\u8D6C \u8D6A|\u8D95 \u8D76|\u8D99 \u8D75|\u8DA8 \u8D8B|\u8DB2 \u8DB1|\u8DE1 \u8FF9|\u8E10 \u8DF5|\u8E30 \u903E|\u8E34 \u8E0A|\u8E4C \u8DC4|\u8E55 \u8DF8|\u8E5F \u8FF9|\u8E60 \u8DD6|\u8E63 \u8E52|\u8E64 \u8E2A|\u8E7A \u8DF7|\u8E82 \u8DF6|\u8E89 \u8DB8|\u8E8A \u8E0C|\u8E8B \u8DFB|\u8E8D \u8DC3|\u8E8E \u47E2|\u8E91 \u8E2F|\u8E92 \u8DDE|\u8E93 \u8E2C|\u8E95 \u8E70|\u8E9A \u8DF9|\u8EA1 \u8E51|\u8EA5 \u8E7F|\u8EA6 \u8E9C|\u8EAA \u8E8F|\u8EC0 \u8EAF|\u8ECA \u8F66|\u8ECB \u8F67|\u8ECC \u8F68|\u8ECD \u519B|\u8ECF \u{2B404}|\u8ED1 \u8F6A|\u8ED2 \u8F69|\u8ED4 \u8F6B|\u8EDB \u8F6D|\u8EDD \u{2CA02}|\u8EDF \u8F6F|\u8EE4 \u8F77|\u8EEB \u8F78|\u8EF2 \u8F71|\u8EF8 \u8F74|\u8EF9 \u8F75|\u8EFA \u8F7A|\u8EFB \u8F72|\u8EFC \u8F76|\u8EFE \u8F7C|\u8F03 \u8F83|\u8F04 \u{28408}|\u8F05 \u8F82|\u8F07 \u8F81|\u8F08 \u8F80|\u8F09 \u8F7D|\u8F0A \u8F7E|\u8F0B \u{2AA36}|\u8F12 \u8F84|\u8F13 \u633D|\u8F14 \u8F85|\u8F15 \u8F7B|\u8F17 \u{2B410}|\u8F1B \u8F86|\u8F1C \u8F8E|\u8F1D \u8F89|\u8F1E \u8F8B|\u8F1F \u8F8D|\u8F25 \u8F8A|\u8F26 \u8F87|\u8F29 \u8F88|\u8F2A \u8F6E|\u8F2C \u8F8C|\u8F2E \u{2B413}|\u8F2F \u8F91|\u8F33 \u8F8F|\u8F36 \u{2CA0E}|\u8F38 \u8F93|\u8F3B \u8F90|\u8F3C \u8F92|\u8F3E \u8F97|\u8F3F \u8206|\u8F40 \u8F92|\u8F42 \u6BC2|\u8F44 \u8F96|\u8F45 \u8F95|\u8F46 \u8F98|\u8F49 \u8F6C|\u8F4D \u8F99|\u8F4E \u8F7F|\u8F54 \u8F9A|\u8F5F \u8F70|\u8F61 \u8F94|\u8F62 \u8F79|\u8F64 \u8F73|\u8FA6 \u529E|\u8FAD \u8F9E|\u8FAE \u8FAB|\u8FAF \u8FA9|\u8FB2 \u519C|\u8FF4 \u56DE|\u9015 \u5F84|\u9019 \u8FD9|\u9023 \u8FDE|\u9031 \u5468|\u9032 \u8FDB|\u904A \u6E38|\u904B \u8FD0|\u904E \u8FC7|\u9054 \u8FBE|\u9055 \u8FDD|\u9059 \u9065|\u905C \u900A|\u905E \u9012|\u9060 \u8FDC|\u9061 \u6EAF|\u9069 \u9002|\u9072 \u8FDF|\u9076 \u7ED5|\u9077 \u8FC1|\u9078 \u9009|\u907A \u9057|\u907C \u8FBD|\u9081 \u8FC8|\u9084 \u8FD8|\u9087 \u8FE9|\u908A \u8FB9|\u908F \u903B|\u9090 \u9026|\u90DF \u90CF|\u90F5 \u90AE|\u9106 \u90D3|\u9109 \u4E61|\u9112 \u90B9|\u9114 \u90AC|\u9116 \u90E7|\u9127 \u9093|\u9129 \u{2CA7D}|\u912D \u90D1|\u9130 \u90BB|\u9132 \u90F8|\u9133 \u{2B461}|\u9134 \u90BA|\u9136 \u90D0|\u913A \u909D|\u9147 \u9142|\u9148 \u90E6|\u9183 \u814C|\u9196 \u915D|\u919C \u4E11|\u919E \u915D|\u919F \u848F|\u91A3 \u7CD6|\u91AB \u533B|\u91AC \u9171|\u91B1 \u9166|\u91B2 \u{2CAA9}|\u91C0 \u917F|\u91C1 \u8845|\u91C3 \u917E|\u91C5 \u917D|\u91CB \u91CA|\u91D0 \u5398|\u91D2 \u9485|\u91D3 \u9486|\u91D4 \u9487|\u91D5 \u948C|\u91D7 \u948A|\u91D8 \u9489|\u91D9 \u948B|\u91DD \u9488|\u91E3 \u9493|\u91E4 \u9490|\u91E6 \u6263|\u91E7 \u948F|\u91E9 \u9492|\u91F4 \u{2CB29}|\u91F5 \u9497|\u91F7 \u948D|\u91F9 \u9495|\u91FA \u948E|\u91FE \u497A|\u91FF \u{2CB31}|\u9200 \u94AF|\u9201 \u94AB|\u9203 \u9498|\u9204 \u94AD|\u9205 \u94A5|\u9207 \u{2B4E7}|\u9208 \u949A|\u9209 \u94A0|\u920D \u949D|\u920E \u94A9|\u9210 \u94A4|\u9211 \u94A3|\u9212 \u9491|\u9214 \u949E|\u9215 \u94AE|\u921E \u94A7|\u9221 \u949F|\u9223 \u9499|\u9225 \u94AC|\u9226 \u949B|\u9227 \u94AA|\u922E \u94CC|\u9230 \u94C8|\u9233 \u94B6|\u9234 \u94C3|\u9237 \u94B4|\u9238 \u94B9|\u9239 \u94CD|\u923A \u94B0|\u923D \u94B8|\u923E \u94C0|\u923F \u94BF|\u9240 \u94BE|\u9245 \u5DE8|\u9246 \u94BB|\u9248 \u94CA|\u9249 \u94C9|\u924A \u{2CB3F}|\u924B \u94C7|\u924D \u94CB|\u9251 \u94C2|\u9255 \u94B7|\u9257 \u94B3|\u925A \u94C6|\u925B \u94C5|\u925D \u{2B7F7}|\u925E \u94BA|\u9262 \u94B5|\u9264 \u94A9|\u9265 \u{2CB38}|\u9266 \u94B2|\u9267 \u{2CB41}|\u926C \u94BC|\u926D \u94BD|\u926E \u{2CB39}|\u9273 \u952B|\u9276 \u94CF|\u9277 \u{2B7F9}|\u9278 \u94F0|\u927A \u94D2|\u927B \u94EC|\u927F \u94EA|\u9280 \u94F6|\u9283 \u94F3|\u9285 \u94DC|\u9288 \u{2B4EF}|\u928D \u94DA|\u9291 \u94E3|\u9293 \u94E8|\u9296 \u94E2|\u9298 \u94ED|\u929A \u94EB|\u929B \u94E6|\u929C \u8854|\u92A0 \u94D1|\u92A3 \u94F7|\u92A5 \u94F1|\u92A6 \u94DF|\u92A8 \u94F5|\u92A9 \u94E5|\u92AA \u94D5|\u92AB \u94EF|\u92AC \u94D0|\u92B1 \u94DE|\u92B3 \u9510|\u92B6 \u{28C47}|\u92B7 \u9500|\u92B9 \u9508|\u92BB \u9511|\u92BC \u9509|\u92C1 \u94DD|\u92C3 \u9512|\u92C5 \u950C|\u92C7 \u94A1|\u92CC \u94E4|\u92CF \u94D7|\u92D0 \u{2CB4E}|\u92D2 \u950B|\u92D7 \u{2B4F6}|\u92D9 \u94FB|\u92DD \u950A|\u92DF \u9513|\u92E3 \u94D8|\u92E4 \u9504|\u92E5 \u9503|\u92E6 \u9514|\u92E8 \u9507|\u92E9 \u94D3|\u92EA \u94FA|\u92ED \u9510|\u92EE \u94D6|\u92EF \u9506|\u92F0 \u9502|\u92F1 \u94FD|\u92F6 \u950D|\u92F8 \u952F|\u92F9 \u{2CB2E}|\u92FC \u94A2|\u9300 \u{2CB2D}|\u9301 \u951E|\u9304 \u5F55|\u9306 \u9516|\u9307 \u952B|\u9308 \u9529|\u930F \u94D4|\u9310 \u9525|\u9312 \u9515|\u9315 \u951F|\u9318 \u9524|\u9319 \u9531|\u931A \u94EE|\u931B \u951B|\u931E \u{2CB5A}|\u931F \u952C|\u9320 \u952D|\u9321 \u951C|\u9322 \u94B1|\u9324 \u{2B4F9}|\u9326 \u9526|\u9328 \u951A|\u9329 \u9520|\u932B \u9521|\u932E \u9522|\u932F \u9519|\u9332 \u5F55|\u9333 \u9530|\u9336 \u8868|\u9338 \u94FC|\u933C \u954E|\u9340 \u951D|\u9341 \u9528|\u9343 \u952A|\u9345 \u94AB|\u9346 \u9494|\u9347 \u9534|\u9348 \u9533|\u934A \u70BC|\u934B \u9505|\u934D \u9540|\u9354 \u9537|\u9358 \u94E1|\u935A \u9496|\u935B \u953B|\u9360 \u953D|\u9364 \u9538|\u9365 \u9532|\u9369 \u9518|\u936C \u9539|\u936D \u{2CB64}|\u9370 \u953E|\u9375 \u952E|\u9376 \u9536|\u937A \u9517|\u937C \u9488|\u937E \u949F|\u9382 \u9541|\u9384 \u953F|\u9387 \u9545|\u938A \u9551|\u938C \u9570|\u9393 \u{2CB69}|\u9394 \u9555|\u9396 \u9501|\u9398 \u9549|\u939A \u9524|\u939B \u9548|\u939D \u{28C4F}|\u93A1 \u9543|\u93A2 \u94A8|\u93A3 \u84E5|\u93A6 \u954F|\u93A7 \u94E0|\u93A9 \u94E9|\u93AA \u953C|\u93AC \u9550|\u93AD \u9547|\u93AE \u9547|\u93B0 \u9552|\u93B2 \u954B|\u93B3 \u954D|\u93B5 \u9553|\u93B6 \u9FD4|\u93B8 \u954C|\u93BF \u954E|\u93C3 \u955E|\u93C7 \u65CB|\u93C8 \u94FE|\u93CC \u9546|\u93CD \u9559|\u93CF \u{2CB6C}|\u93D0 \u9560|\u93D1 \u955D|\u93D7 \u94FF|\u93D8 \u9535|\u93DC \u9557|\u93DD \u9558|\u93DE \u955B|\u93DF \u94F2|\u93E1 \u955C|\u93E2 \u9556|\u93E4 \u9542|\u93E8 \u933E|\u93F0 \u955A|\u93F5 \u94E7|\u93F7 \u9564|\u93F9 \u956A|\u93FA \u497D|\u93FB \u{2CB78}|\u93FD \u9508|\u9403 \u94D9|\u9404 \u{28C51}|\u9407 \u{2B50D}|\u940B \u94F4|\u940D \u{2B50E}|\u940F \u{28C54}|\u9410 \u9563|\u9412 \u94F9|\u9413 \u9566|\u9414 \u9561|\u9418 \u949F|\u9419 \u956B|\u941D \u9562|\u9420 \u9568|\u9425 \u4985|\u9426 \u950E|\u9427 \u950F|\u9428 \u9544|\u9429 \u{2CB7C}|\u942B \u954C|\u942E \u9570|\u942F \u4983|\u9432 \u956F|\u9433 \u956D|\u9435 \u94C1|\u9436 \u956E|\u9438 \u94CE|\u943A \u94DB|\u943D \u{2B7FC}|\u943F \u9571|\u9444 \u94F8|\u944A \u956C|\u944C \u9554|\u9451 \u9274|\u9452 \u9274|\u9454 \u9572|\u9455 \u9527|\u945E \u9574|\u9460 \u94C4|\u9463 \u9573|\u9465 \u9565|\u946A \u{2CB3B}|\u946D \u9567|\u9470 \u94A5|\u9471 \u9575|\u9472 \u9576|\u9477 \u954A|\u9479 \u9569|\u947C \u9523|\u947D \u94BB|\u947E \u92AE|\u947F \u51FF|\u9481 \u9562|\u9482 \u954B|\u9577 \u957F|\u9580 \u95E8|\u9582 \u95E9|\u9583 \u95EA|\u9586 \u95EB|\u9588 \u95EC|\u9589 \u95ED|\u958B \u5F00|\u958C \u95F6|\u958E \u95F3|\u958F \u95F0|\u9591 \u95F2|\u9592 \u95F2|\u9593 \u95F4|\u9594 \u95F5|\u9598 \u95F8|\u95A1 \u9602|\u95A3 \u9601|\u95A4 \u5408|\u95A5 \u9600|\u95A8 \u95FA|\u95A9 \u95FD|\u95AB \u9603|\u95AC \u9606|\u95AD \u95FE|\u95B1 \u9605|\u95B2 \u9605|\u95B6 \u960A|\u95B9 \u9609|\u95BB \u960E|\u95BC \u960F|\u95BD \u960D|\u95BE \u9608|\u95BF \u960C|\u95C3 \u9612|\u95C6 \u677F|\u95C7 \u6697|\u95C8 \u95F1|\u95C9 \u{2CBB1}|\u95CA \u9614|\u95CB \u9615|\u95CC \u9611|\u95CD \u9607|\u95D0 \u9617|\u95D1 \u{2B536}|\u95D2 \u9618|\u95D3 \u95FF|\u95D4 \u9616|\u95D5 \u9619|\u95D6 \u95EF|\u95DC \u5173|\u95DE \u961A|\u95E0 \u9613|\u95E1 \u9610|\u95E2 \u8F9F|\u95E4 \u961B|\u95E5 \u95FC|\u9658 \u9649|\u965D \u9655|\u965E \u5347|\u9663 \u9635|\u9670 \u9634|\u9673 \u9648|\u9678 \u9646|\u967D \u9633|\u9689 \u9667|\u968A \u961F|\u968E \u9636|\u9691 \u{2CBBF}|\u9695 \u9668|\u969B \u9645|\u96A4 \u{2CBCE}|\u96A8 \u968F|\u96AA \u9669|\u96AE \u{2CBC0}|\u96AF \u9666|\u96B1 \u9690|\u96B4 \u9647|\u96B8 \u96B6|\u96BB \u53EA|\u96CB \u96BD|\u96D6 \u867D|\u96D9 \u53CC|\u96DB \u96CF|\u96DC \u6742|\u96DE \u9E21|\u96E2 \u79BB|\u96E3 \u96BE|\u96F2 \u4E91|\u96FB \u7535|\u9711 \u6CBE|\u9722 \u9721|\u9727 \u96FE|\u973D \u9701|\u9742 \u96F3|\u9744 \u972D|\u9746 \u53C7|\u9748 \u7075|\u9749 \u53C6|\u975A \u9753|\u975C \u9759|\u975D \u9754|\u9766 \u817C|\u9768 \u9765|\u978F \u5DE9|\u979D \u7EF1|\u97A6 \u79CB|\u97BD \u9792|\u97C1 \u7F30|\u97C3 \u9791|\u97C6 \u5343|\u97C9 \u97AF|\u97CB \u97E6|\u97CC \u97E7|\u97CD \u97E8|\u97D3 \u97E9|\u97D9 \u97EA|\u97DC \u97EC|\u97DD \u97B2|\u97DE \u97EB|\u97FB \u97F5|\u97FF \u54CD|\u9801 \u9875|\u9802 \u9876|\u9803 \u9877|\u9805 \u9879|\u9806 \u987A|\u9807 \u9878|\u9808 \u987B|\u980A \u987C|\u980C \u9882|\u980D \u{2B806}|\u980E \u9880|\u980F \u9883|\u9810 \u9884|\u9811 \u987D|\u9812 \u9881|\u9813 \u987F|\u9814 \u{2CC56}|\u9817 \u9887|\u9818 \u9886|\u981C \u988C|\u9820 \u{2CC5F}|\u9821 \u9889|\u9824 \u9890|\u9826 \u988F|\u982B \u{2B5AF}|\u982D \u5934|\u982E \u9892|\u9830 \u988A|\u9832 \u988B|\u9834 \u9895|\u9835 \u{2B5B3}|\u9837 \u9894|\u9838 \u9888|\u9839 \u9893|\u983B \u9891|\u983D \u9893|\u9846 \u9897|\u984C \u9898|\u984D \u989D|\u984E \u989A|\u984F \u989C|\u9852 \u9899|\u9853 \u989B|\u9854 \u989C|\u9857 \u{2B5AE}|\u9858 \u613F|\u9859 \u98A1|\u985B \u98A0|\u985E \u7C7B|\u9862 \u989F|\u9865 \u98A2|\u9867 \u987E|\u986B \u98A4|\u986C \u98A5|\u986F \u663E|\u9870 \u98A6|\u9871 \u9885|\u9873 \u989E|\u9874 \u98A7|\u98A8 \u98CE|\u98AD \u98D0|\u98AE \u98D1|\u98AF \u98D2|\u98B1 \u53F0|\u98B3 \u522E|\u98B6 \u98D3|\u98B8 \u98D4|\u98BA \u98CF|\u98BB \u98D6|\u98BC \u98D5|\u98C0 \u98D7|\u98C4 \u98D8|\u98C6 \u98D9|\u98C8 \u98DA|\u98DB \u98DE|\u98E0 \u9963|\u98E2 \u9965|\u98E3 \u9964|\u98E5 \u9966|\u98E9 \u9968|\u98EA \u996A|\u98EB \u996B|\u98ED \u996C|\u98EF \u996D|\u98F1 \u98E7|\u98F2 \u996E|\u98F4 \u9974|\u98FC \u9972|\u98FD \u9971|\u98FE \u9970|\u98FF \u9973|\u9903 \u997A|\u9904 \u9978|\u9905 \u997C|\u9908 \u7CCD|\u9909 \u9977|\u990A \u517B|\u990C \u9975|\u990E \u9979|\u990F \u997B|\u9911 \u997D|\u9912 \u9981|\u9913 \u997F|\u9915 \u9982|\u9916 \u997E|\u9917 \u{2B5E7}|\u9918 \u4F59|\u991A \u80B4|\u991B \u9984|\u991C \u9983|\u991E \u996F|\u9921 \u9985|\u9928 \u9986|\u992C \u7CCA|\u9931 \u7CC7|\u9933 \u9967|\u9935 \u5582|\u9936 \u9989|\u9937 \u9987|\u9938 \u{2980C}|\u993A \u998E|\u993C \u9969|\u993E \u998F|\u993F \u998A|\u9941 \u998C|\u9943 \u998D|\u9945 \u9992|\u9948 \u9990|\u9949 \u9991|\u994A \u9993|\u994B \u9988|\u994C \u9994|\u9951 \u9965|\u9952 \u9976|\u9957 \u98E8|\u9958 \u{2B5F4}|\u995C \u990D|\u995E \u998B|\u9962 \u9995|\u99AC \u9A6C|\u99AD \u9A6D|\u99AE \u51AF|\u99B1 \u9A6E|\u99B3 \u9A70|\u99B4 \u9A6F|\u99B9 \u9A72|\u99BC \u{2B61C}|\u99C1 \u9A73|\u99C3 \u{2B61D}|\u99C9 \u{2CCF6}|\u99D0 \u9A7B|\u99D1 \u9A7D|\u99D2 \u9A79|\u99D3 \u{2CCF5}|\u99D4 \u9A75|\u99D5 \u9A7E|\u99D8 \u9A80|\u99D9 \u9A78|\u99DB \u9A76|\u99DD \u9A7C|\u99DF \u9A77|\u99E1 \u9A82|\u99E2 \u9A88|\u99EA \u{2CCFD}|\u99ED \u9A87|\u99F0 \u9A83|\u99F1 \u9A86|\u99F8 \u9A8E|\u99FC \u{2CCFF}|\u99FF \u9A8F|\u9A01 \u9A8B|\u9A02 \u9A8D|\u9A04 \u{2B627}|\u9A05 \u9A93|\u9A0A \u{2B626}|\u9A0C \u9A94|\u9A0D \u9A92|\u9A0E \u9A91|\u9A0F \u9A90|\u9A11 \u{2CD02}|\u9A16 \u9A9B|\u9A19 \u9A97|\u9A1E \u{2CD03}|\u9A20 \u{2B628}|\u9A24 \u9A99|\u9A27 \u4BC4|\u9A2B \u9A9E|\u9A2D \u9A98|\u9A2E \u9A9D|\u9A30 \u817E|\u9A31 \u{2B62C}|\u9A35 \u{2B62A}|\u9A36 \u9A7A|\u9A37 \u9A9A|\u9A38 \u9A9F|\u9A3E \u9AA1|\u9A40 \u84E6|\u9A41 \u9A9C|\u9A42 \u9A96|\u9A43 \u9AA0|\u9A44 \u9AA2|\u9A45 \u9A71|\u9A4A \u9A85|\u9A4C \u9A95|\u9A4D \u9A81|\u9A4E \u{2CD0A}|\u9A4F \u9AA3|\u9A55 \u9A84|\u9A57 \u9A8C|\u9A5A \u60CA|\u9A5B \u9A7F|\u9A5F \u9AA4|\u9A62 \u9A74|\u9A64 \u9AA7|\u9A65 \u9AA5|\u9A66 \u9AA6|\u9A6A \u9A8A|\u9A6B \u9A89|\u9AAF \u80AE|\u9ACF \u9AC5|\u9AD2 \u810F|\u9AD4 \u4F53|\u9AD5 \u9ACC|\u9AD6 \u9ACB|\u9AEE \u53D1|\u9B06 \u677E|\u9B0D \u80E1|\u9B1A \u987B|\u9B22 \u9B13|\u9B25 \u6597|\u9B27 \u95F9|\u9B28 \u54C4|\u9B29 \u960B|\u9B2E \u9604|\u9B31 \u90C1|\u9B39 \u9B36|\u9B4E \u9B49|\u9B58 \u9B47|\u9B5A \u9C7C|\u9B5B \u9C7D|\u9B5F \u{2B689}|\u9B62 \u9C7E|\u9B68 \u9C80|\u9B6F \u9C81|\u9B74 \u9C82|\u9B77 \u9C7F|\u9B7A \u9C84|\u9B80 \u{2CD8D}|\u9B81 \u9C85|\u9B83 \u9C86|\u9B86 \u{2B696}|\u9B88 \u{2CD8B}|\u9B8A \u9C8C|\u9B8B \u9C89|\u9B8D \u9C8F|\u9B8E \u9C87|\u9B90 \u9C90|\u9B91 \u9C8D|\u9B92 \u9C8B|\u9B93 \u9C8A|\u9B9A \u9C92|\u9B9C \u9C98|\u9B9D \u9C9E|\u9B9E \u9C95|\u9B9F \u{29F7E}|\u9BA0 \u{2CD8F}|\u9BA1 \u{2CD90}|\u9BA3 \u4C9F|\u9BA6 \u9C96|\u9BAA \u9C94|\u9BAB \u9C9B|\u9BAD \u9C91|\u9BAE \u9C9C|\u9BB3 \u9C93|\u9BB6 \u9CAA|\u9BB8 \u{29F83}|\u9BBA \u9C9D|\u9BC0 \u9CA7|\u9BC1 \u9CA0|\u9BC7 \u9CA9|\u9BC9 \u9CA4|\u9BCA \u9CA8|\u9BD2 \u9CAC|\u9BD4 \u9CBB|\u9BD5 \u9CAF|\u9BD6 \u9CAD|\u9BD7 \u9C9E|\u9BDB \u9CB7|\u9BDD \u9CB4|\u9BE1 \u9CB1|\u9BE2 \u9CB5|\u9BE4 \u9CB2|\u9BE7 \u9CB3|\u9BE8 \u9CB8|\u9BEA \u9CAE|\u9BEB \u9CB0|\u9BF0 \u9CB6|\u9BF4 \u9CBA|\u9BF7 \u9CC0|\u9BFB \u{2CD9F}|\u9BFD \u9CAB|\u9BFF \u9CCA|\u9C01 \u9CC8|\u9C02 \u9C97|\u9C03 \u9CC2|\u9C06 \u4CA0|\u9C08 \u9CBD|\u9C09 \u9CC7|\u9C0A \u{2CDA0}|\u9C0C \u4CA1|\u9C0D \u9CC5|\u9C0F \u9CBE|\u9C10 \u9CC4|\u9C12 \u9CC6|\u9C13 \u9CC3|\u9C1B \u9CC1|\u9C1C \u9CD2|\u9C1F \u9CD1|\u9C20 \u9CCB|\u9C23 \u9CA5|\u9C24 \u{2B695}|\u9C25 \u9CCF|\u9C27 \u4CA2|\u9C28 \u9CCE|\u9C29 \u9CD0|\u9C2D \u9CCD|\u9C2E \u9CC1|\u9C31 \u9CA2|\u9C32 \u9CCC|\u9C33 \u9CD3|\u9C35 \u9CD8|\u9C36 \u{2CDAD}|\u9C37 \u9CA6|\u9C39 \u9CA3|\u9C3A \u9CB9|\u9C3B \u9CD7|\u9C3C \u9CDB|\u9C3E \u9CD4|\u9C40 \u{2CDA8}|\u9C42 \u9CC9|\u9C45 \u9CD9|\u9C47 \u{29F8C}|\u9C48 \u9CD5|\u9C49 \u9CD6|\u9C52 \u9CDF|\u9C54 \u9CDD|\u9C56 \u9CDC|\u9C57 \u9CDE|\u9C58 \u9C9F|\u9C5A \u{2CDAE}|\u9C5D \u9CBC|\u9C5F \u9C8E|\u9C60 \u9C99|\u9C63 \u9CE3|\u9C64 \u9CE1|\u9C67 \u9CE2|\u9C68 \u9CBF|\u9C6D \u9C9A|\u9C6F \u9CE0|\u9C72 \u{2B6AD}|\u9C77 \u9CC4|\u9C78 \u9C88|\u9C7A \u9CA1|\u9CE5 \u9E1F|\u9CE7 \u51EB|\u9CE9 \u9E20|\u9CEC \u51EB|\u9CF2 \u9E24|\u9CF3 \u51E4|\u9CF4 \u9E23|\u9CF6 \u9E22|\u9CFE \u4D13|\u9D06 \u9E29|\u9D07 \u9E28|\u9D09 \u9E26|\u9D12 \u9E30|\u9D15 \u9E35|\u9D1B \u9E33|\u9D1D \u9E32|\u9D1E \u9E2E|\u9D1F \u9E31|\u9D23 \u9E2A|\u9D26 \u9E2F|\u9D28 \u9E2D|\u9D2F \u9E38|\u9D30 \u9E39|\u9D34 \u9E3B|\u9D37 \u4D15|\u9D3B \u9E3F|\u9D3F \u9E3D|\u9D41 \u4D14|\u9D42 \u9E3A|\u9D43 \u9E3C|\u9D4F \u{2CDD5}|\u9D50 \u9E40|\u9D51 \u9E43|\u9D52 \u9E46|\u9D53 \u9E41|\u9D5C \u9E48|\u9D5D \u9E45|\u9D5F \u{2B6ED}|\u9D60 \u9E44|\u9D61 \u9E49|\u9D6A \u9E4C|\u9D6C \u9E4F|\u9D6E \u9E50|\u9D6F \u9E4E|\u9D70 \u96D5|\u9D72 \u9E4A|\u9D77 \u9E53|\u9D7E \u9E4D|\u9D84 \u4D16|\u9D87 \u9E2B|\u9D89 \u9E51|\u9D8A \u9E52|\u9D93 \u9E4B|\u9D96 \u9E59|\u9D98 \u9E55|\u9D9A \u9E57|\u9DA0 \u{2CE18}|\u9DA1 \u9E56|\u9DA5 \u9E5B|\u9DA9 \u9E5C|\u9DAA \u4D17|\u9DAC \u9E27|\u9DAF \u83BA|\u9DB1 \u{2CE23}|\u9DB2 \u9E5F|\u9DB4 \u9E64|\u9DB9 \u9E60|\u9DBA \u9E61|\u9DBB \u9E58|\u9DBC \u9E63|\u9DBF \u9E5A|\u9DC0 \u9E5A|\u9DC1 \u9E62|\u9DC2 \u9E5E|\u9DC4 \u9E21|\u9DC9 \u4D18|\u9DCA \u9E5D|\u9DD3 \u9E67|\u9DD6 \u9E65|\u9DD7 \u9E25|\u9DD9 \u9E37|\u9DDA \u9E68|\u9DDF \u{2CE26}|\u9DE5 \u9E36|\u9DE6 \u9E6A|\u9DEB \u9E54|\u9DED \u{2CE2A}|\u9DEF \u9E69|\u9DF2 \u9E6B|\u9DF3 \u9E47|\u9DF4 \u9E47|\u9DF8 \u9E6C|\u9DF9 \u9E70|\u9DFA \u9E6D|\u9DFD \u9E34|\u9E02 \u3D89|\u9E07 \u9E6F|\u9E0A \u4D19|\u9E0C \u9E71|\u9E0F \u9E72|\u9E11 \u{2CE1A}|\u9E15 \u9E2C|\u9E18 \u9E74|\u9E1A \u9E66|\u9E1B \u9E73|\u9E1D \u9E42|\u9E1E \u9E3E|\u9E75 \u5364|\u9E79 \u54B8|\u9E7A \u9E7E|\u9E7C \u78B1|\u9E7D \u76D0|\u9E97 \u4E3D|\u9EA5 \u9EA6|\u9EA9 \u9EB8|\u9EAA \u9762|\u9EAB \u9762|\u9EAC \u{24FF2}|\u9EAF \u66F2|\u9EB3 \u{2A38C}|\u9EB4 \u66F2|\u9EB5 \u9762|\u9EBC \u4E48|\u9EBD \u4E48|\u9EC3 \u9EC4|\u9ECC \u9EC9|\u9EDE \u70B9|\u9EE8 \u515A|\u9EF2 \u9EEA|\u9EF4 \u9709|\u9EF6 \u9EE1|\u9EF7 \u9EE9|\u9EFD \u9EFE|\u9EFF \u9F0B|\u9F02 \u9F0C|\u9F09 \u9F0D|\u9F15 \u51AC|\u9F34 \u9F39|\u9F4A \u9F50|\u9F4B \u658B|\u9F4E \u8D4D|\u9F4F \u9F51|\u9F52 \u9F7F|\u9F54 \u9F80|\u9F55 \u9F81|\u9F57 \u9F82|\u9F58 \u{2CE7C}|\u9F59 \u9F85|\u9F5C \u9F87|\u9F5F \u9F83|\u9F60 \u9F86|\u9F61 \u9F84|\u9F63 \u51FA|\u9F66 \u9F88|\u9F67 \u556E|\u9F6A \u9F8A|\u9F6C \u9F89|\u9F6E \u{2CE88}|\u9F6F \u{2B81C}|\u9F72 \u9F8B|\u9F76 \u816D|\u9F77 \u9F8C|\u9F7C \u{2CE93}|\u9F8D \u9F99|\u9F8E \u5390|\u9F90 \u5E9E|\u9F91 \u4DAE|\u9F94 \u9F9A|\u9F95 \u9F9B|\u9F9C \u9F9F|\u9FC1 \u4724|\u9FD3 \u9FD2|\u{2005E} \u{2003E}|\u{20325} \u{20325}|\u{203E2} \u{203E2}|\u{2040A} \u{2040A}|\u{205E3} \u34C6|\u{20786} \u{20786}|\u{2080E} \u{2080E}|\u{20B19} \u{20B19}|\u{20F24} \u{20F24}|\u{20F43} \u{20F43}|\u{20FD5} \u{20FD5}|\u{210A1} \u{210A1}|\u{210C4} \u{210C4}|\u{210D5} \u{20D1B}|\u{210E4} \u{210E4}|\u{21114} \u{21114}|\u{21123} \u{21123}|\u{2114F} \u{20CA5}|\u{2116F} \u{2116F}|\u{2144D} \u{2BB7C}|\u{2146D} \u{212D7}|\u{214C1} \u{214C1}|\u{214FE} \u{212C0}|\u{21516} \u{21363}|\u{217B5} \u36DF|\u{217EB} \u{217EB}|\u{21839} \u36FF|\u{21883} \u36E0|\u{21B89} \u{21B5C}|\u{21BA3} \u{21B6C}|\u{21CF3} \u{21CC3}|\u{21E17} \u{21E17}|\u{21E6C} \u{21E6C}|\u{21ED5} \u5C81|\u{21F57} \u{21F57}|\u{21FB1} \u37DC|\u{21FD6} \u{21FD6}|\u{22370} \u{22370}|\u{2283C} \u{2283C}|\u{228D0} \u{228D0}|\u{228DA} \u{2261D}|\u{228ED} \u{228ED}|\u{22929} \u{22929}|\u{22931} \u{22931}|\u{2293F} \u{2293F}|\u{22BF7} \u{22BF7}|\u{22D92} \u{22D92}|\u{22DAB} \u{22ADE}|\u{22DEE} \u{22DEE}|\u{22E7F} \u{22B26}|\u{22EB3} \u{22EB3}|\u{23236} \u6685|\u{232CB} \u{232CB}|\u{23350} \u{23350}|\u{2364E} \u3B63|\u{2372C} \u{2372C}|\u{23755} \u{23755}|\u{237BB} \u{23613}|\u{23829} \u{2378E}|\u{23832} \u{23476}|\u{23BE9} \u{23BE9}|\u{23BF4} \u{23BF4}|\u{23BF6} \u6BF6|\u{23F4F} \u{23F4F}|\u{23FB7} \u3CE2|\u{23FC9} \u{23FC9}|\u{24063} \u{23EBD}|\u{24137} \u{24137}|\u{24176} \u{23DF7}|\u{24473} \u{24473}|\u{24479} \u{24479}|\u{2448E} \u{2448E}|\u{244BB} \u{244BB}|\u{244CC} \u{244CC}|\u{244CE} \u{244CE}|\u{244E9} \u{242B0}|\u{24600} \u{24600}|\u{246EE} \u{246EE}|\u{246F1} \u{246F1}|\u{24706} \u{24706}|\u{2482E} \u{2482E}|\u{2489F} \u{2489F}|\u{248BB} \u{248BB}|\u{24A42} \u{24A42}|\u{24ABA} \u3ED8|\u{24AE9} \u3ECF|\u{24B05} \u{24B05}|\u{24CF7} \u{24CF7}|\u{24CF8} \u{24CC4}|\u{24DC3} \u{24DC3}|\u{24E2B} \u{24E2B}|\u{24E94} \u{24E94}|\u{2529D} \u{2517F}|\u{25303} \u{25158}|\u{253DD} \u{253DD}|\u{25565} \u{25430}|\u{25585} \u{2542F}|\u{255B2} \u{255B2}|\u{255C7} \u{255C7}|\u{255FD} \u{2C497}|\u{25710} \u{25710}|\u{25730} \u{25730}|\u{257B5} \u{257B5}|\u{258A2} \u416A|\u{258B6} \u{258B6}|\u{258B7} \u{258B7}|\u{25A10} \u{25A10}|\u{25A82} \u{25A82}|\u{25BE4} \u{25BE4}|\u{25D28} \u{25D28}|\u{25D3C} \u{25D3C}|\u{25D43} \u{25D43}|\u{25D4A} \u{25D4A}|\u{25DBD} \u{25DBD}|\u{25E20} \u{25B8B}|\u{25EE6} \u{25EE6}|\u{25F3D} \u{25E65}|\u{25F56} \u{25F56}|\u{25FAF} \u{25FAF}|\u{25FCA} \u{25FCA}|\u{26016} \u{26016}|\u{26085} \u{26085}|\u{260C4} \u{260C4}|\u{260E9} \u{260E9}|\u{26147} \u{26147}|\u{26148} \u{26148}|\u{261B2} \u{261B2}|\u{26480} \u{26480}|\u{26516} \u{26516}|\u{26627} \u{21CD2}|\u{267FC} \u{267FC}|\u{26805} \u{26805}|\u{2685D} \u{2685D}|\u{26888} \u{26888}|\u{268CE} \u{267D7}|\u{269FA} \u{269FA}|\u{26A99} \u447D|\u{26ABD} \u{26ABD}|\u{26C4C} \u{26C4C}|\u{26F9F} \u{26F9F}|\u{27388} \u{27388}|\u{274AF} \u{274AF}|\u{27525} \u{27525}|\u{2755F} \u{2755F}|\u{27717} \u461E|\u{27735} \u464A|\u{2775E} \u461B|\u{277AB} \u{277AB}|\u{277C0} \u{27767}|\u{27874} \u{27874}|\u{27884} \u{27884}|\u{2799D} \u{2799D}|\u{279A7} \u{279A7}|\u{27A55} \u{27A55}|\u{27A59} \u4725|\u{27A7C} \u{27A7C}|\u{27ADD} \u{27ADD}|\u{27B24} \u{27B24}|\u{27B48} \u{27B48}|\u{27B79} \u{27B79}|\u{27CDF} \u{27CDF}|\u{27D73} \u478C|\u{27D94} \u{27D94}|\u{27DA7} \u478E|\u{27DCE} \u{27DCE}|\u{27E18} \u{27E18}|\u{27E48} \u{27E48}|\u{27F6F} \u{27F6F}|\u{28090} \u{28090}|\u{28123} \u{28123}|\u{2814D} \u{2814D}|\u{281AA} \u{281AA}|\u{281C1} \u{281C1}|\u{281DE} \u{281DE}|\u{281E4} \u{281E4}|\u{281F0} \u{281F0}|\u{281FD} \u{281FD}|\u{2820A} \u{2820A}|\u{2820C} \u{2820C}|\u{282B0} \u4880|\u{282B8} \u4881|\u{282BB} \u{282BB}|\u{282E2} \u4882|\u{28308} \u{28308}|\u{28370} \u{28370}|\u{2838C} \u{2838C}|\u{283AE} \u{283AE}|\u{283E0} \u{283E0}|\u{283E5} \u{283E5}|\u{287BA} \u{287BA}|\u{287CA} \u{287CA}|\u{288BF} \u{288BF}|\u{288C8} \u{288C8}|\u{288DE} \u{288DE}|\u{288E7} \u{288E7}|\u{2893B} \u{28930}|\u{2895B} \u{2895B}|\u{2895F} \u{2895F}|\u{289AB} \u4980|\u{289C0} \u{2CB4A}|\u{289DC} \u4981|\u{289F0} \u{289F0}|\u{289F1} \u{289F1}|\u{28A0F} \u{2CB5B}|\u{28A1B} \u{28A1B}|\u{28A22} \u{28A22}|\u{28A70} \u{28A70}|\u{28A95} \u{28A95}|\u{28AD2} \u{28AD2}|\u{28B16} \u{28B16}|\u{28B46} \u{2CB76}|\u{28B4E} \u{2CB73}|\u{28B56} \u{28B56}|\u{28B78} \u{28B78}|\u{28B82} \u{28B82}|\u{28BB3} \u{28BB3}|\u{28BC5} \u497F|\u{28BDF} \u{28BDF}|\u{28C03} \u{28C03}|\u{28C0B} \u{28C0B}|\u{28C25} \u{28C25}|\u{28C32} \u{28C32}|\u{28CB3} \u{28CB3}|\u{28CD1} \u{28CD1}|\u{28CD5} \u{28CD5}|\u{28D17} \u{28D17}|\u{28D39} \u{28D39}|\u{28D69} \u{28D69}|\u{28D78} \u{28D78}|\u{28D80} \u{28D80}|\u{28D8F} \u{28D8F}|\u{28DAE} \u{28DAE}|\u{28DB2} \u{28DB2}|\u{28DF2} \u{28DF2}|\u{28F33} \u{28F33}|\u{28F4F} \u{28F4F}|\u{29028} \u{29028}|\u{29159} \u{29159}|\u{29396} \u{29396}|\u{293A2} \u{293A2}|\u{293C2} \u{293C2}|\u{293E0} \u{293E0}|\u{293EA} \u{293EA}|\u{293F7} \u{293F7}|\u{29454} \u{29454}|\u{2948E} \u{2948E}|\u{294E3} \u{294E3}|\u{294E5} \u{294E5}|\u{29511} \u{29511}|\u{29533} \u{29533}|\u{295B0} \u{295B0}|\u{295C0} \u{295C0}|\u{295D3} \u{295D3}|\u{295F4} \u{295F4}|\u{29600} \u{29600}|\u{2961D} \u{2961D}|\u{29639} \u{29639}|\u{2963A} \u{2963A}|\u{29648} \u{29648}|\u{2969B} \u{2969B}|\u{296A5} \u{296A5}|\u{296A9} \u{296A9}|\u{296B5} \u{296B5}|\u{296C6} \u{296C6}|\u{296CC} \u{296CC}|\u{296E1} \u{296E1}|\u{296E9} \u{296E9}|\u{29707} \u{29707}|\u{29726} \u{29726}|\u{29735} \u{29735}|\u{29754} \u{29754}|\u{2977D} \u{2977D}|\u{29784} \u{29784}|\u{297A6} \u{297A6}|\u{297AF} \u4B6A|\u{297D0} \u{297D0}|\u{297D7} \u{297D7}|\u{29834} \u{29820}|\u{29863} \u{29863}|\u{2987A} \u{2987A}|\u{298A1} \u{298A1}|\u{298B4} \u{298B4}|\u{298B8} \u{298B8}|\u{298BE} \u{298BE}|\u{298CF} \u{298CF}|\u{298D1} \u4BC3|\u{298EB} \u{298EB}|\u{298F5} \u{298F5}|\u{298FA} \u{298FA}|\u{2990A} \u{2990A}|\u{29919} \u{29919}|\u{29932} \u{29932}|\u{29938} \u{29938}|\u{29944} \u{29944}|\u{29947} \u{29947}|\u{29949} \u{29949}|\u{29951} \u{29951}|\u{299A0} \u{299A0}|\u{299C6} \u{299C6}|\u{29B59} \u{29B59}|\u{29BC1} \u{29BC1}|\u{29BF3} \u{29BF3}|\u{29C00} \u{29C00}|\u{29C39} \u{29C39}|\u{29CE4} \u{29CE4}|\u{29D35} \u{29D35}|\u{29D66} \u{29D66}|\u{29D69} \u{29D69}|\u{29D79} \u{29D79}|\u{29D81} \u{29D81}|\u{29D98} \u4C9E|\u{29DB0} \u{29DB0}|\u{29DB1} \u{29DB1}|\u{29DF0} \u{29DF0}|\u{29E03} \u{29E03}|\u{29E04} \u{29E04}|\u{29E21} \u{29E21}|\u{29E26} \u{29E26}|\u{29ED7} \u{29ED7}|\u{29EEC} \u{29EEC}|\u{29EEE} \u{29EEE}|\u{29F36} \u{29F36}|\u{29F47} \u{29F47}|\u{29FC5} \u{29FC5}|\u{29FE4} \u{29FE4}|\u{29FEA} \u{29FEA}|\u{2A016} \u{2A016}|\u{2A026} \u{2A026}|\u{2A03E} \u{2A03E}|\u{2A048} \u{2A048}|\u{2A056} \u{2A056}|\u{2A086} \u{2A086}|\u{2A0CD} \u{2A0CD}|\u{2A0CF} \u{2A0CF}|\u{2A0D2} \u{2A0D2}|\u{2A0E7} \u{2A0E7}|\u{2A106} \u{2A106}|\u{2A115} \u{2A115}|\u{2A142} \u{2A142}|\u{2A1B7} \u{2A1B7}|\u{2A1F3} \u{2A1F3}|\u{2A23C} \u{2A23C}|\u{2A278} \u{2A278}|\u{2A2FF} \u{2A2FF}|\u{2A32D} \u{2A32D}|\u{2A360} \u{2A360}|\u{2A4F0} \u{2A4F0}|\u{2A535} \u{2A535}|\u{2A600} \u{2A600}|\u{2A62F} \u{2A62F}|\u{2A64F} \u{2A64F}|\u{2A7D6} \u{2A7D6}|\u{2ADD3} \u{2ADD3}|\u{2B4A1} \u{2B4A1}|\u{2B726} \u{2B726}|\u{30EDE} \u{30EDD}", A = "\uF900 \u8C48|\uF901 \u66F4|\uF902 \u8ECA|\uF903 \u8CC8|\uF904 \u6ED1|\uF905 \u4E32|\uF906 \u53E5|\uF907 \u9F9C|\uF908 \u9F9C|\uF909 \u5951|\uF90A \u91D1|\uF90B \u5587|\uF90C \u5948|\uF90D \u61F6|\uF90E \u7669|\uF90F \u7F85|\uF910 \u863F|\uF911 \u87BA|\uF912 \u88F8|\uF913 \u908F|\uF914 \u6A02|\uF915 \u6D1B|\uF916 \u70D9|\uF917 \u73DE|\uF918 \u843D|\uF919 \u916A|\uF91A \u99F1|\uF91B \u4E82|\uF91C \u5375|\uF91D \u6B04|\uF91E \u721B|\uF91F \u862D|\uF920 \u9E1E|\uF921 \u5D50|\uF922 \u6FEB|\uF923 \u85CD|\uF924 \u8964|\uF925 \u62C9|\uF926 \u81D8|\uF927 \u881F|\uF928 \u5ECA|\uF929 \u6717|\uF92A \u6D6A|\uF92B \u72FC|\uF92C \u90CE|\uF92D \u4F86|\uF92E \u51B7|\uF92F \u52DE|\uF930 \u64C4|\uF931 \u6AD3|\uF932 \u7210|\uF933 \u76E7|\uF934 \u8001|\uF935 \u8606|\uF936 \u865C|\uF937 \u8DEF|\uF938 \u9732|\uF939 \u9B6F|\uF93A \u9DFA|\uF93B \u788C|\uF93C \u797F|\uF93D \u7DA0|\uF93E \u83C9|\uF93F \u9304|\uF940 \u9E7F|\uF941 \u8AD6|\uF942 \u58DF|\uF943 \u5F04|\uF944 \u7C60|\uF945 \u807E|\uF946 \u7262|\uF947 \u78CA|\uF948 \u8CC2|\uF949 \u96F7|\uF94A \u58D8|\uF94B \u5C62|\uF94C \u6A13|\uF94D \u6DDA|\uF94E \u6F0F|\uF94F \u7D2F|\uF950 \u7E37|\uF951 \u964B|\uF952 \u52D2|\uF953 \u808B|\uF954 \u51DC|\uF955 \u51CC|\uF956 \u7A1C|\uF957 \u7DBE|\uF958 \u83F1|\uF959 \u9675|\uF95A \u8B80|\uF95B \u62CF|\uF95C \u6A02|\uF95D \u8AFE|\uF95E \u4E39|\uF95F \u5BE7|\uF960 \u6012|\uF961 \u7387|\uF962 \u7570|\uF963 \u5317|\uF964 \u78FB|\uF965 \u4FBF|\uF966 \u5FA9|\uF967 \u4E0D|\uF968 \u6CCC|\uF969 \u6578|\uF96A \u7D22|\uF96B \u53C3|\uF96C \u585E|\uF96D \u7701|\uF96E \u8449|\uF96F \u8AAA|\uF970 \u6BBA|\uF971 \u8FB0|\uF972 \u6C88|\uF973 \u62FE|\uF974 \u82E5|\uF975 \u63A0|\uF976 \u7565|\uF977 \u4EAE|\uF978 \u5169|\uF979 \u51C9|\uF97A \u6881|\uF97B \u7CE7|\uF97C \u826F|\uF97D \u8AD2|\uF97E \u91CF|\uF97F \u52F5|\uF980 \u5442|\uF981 \u5973|\uF982 \u5EEC|\uF983 \u65C5|\uF984 \u6FFE|\uF985 \u792A|\uF986 \u95AD|\uF987 \u9A6A|\uF988 \u9E97|\uF989 \u9ECE|\uF98A \u529B|\uF98B \u66C6|\uF98C \u6B77|\uF98D \u8F62|\uF98E \u5E74|\uF98F \u6190|\uF990 \u6200|\uF991 \u649A|\uF992 \u6F23|\uF993 \u7149|\uF994 \u7489|\uF995 \u79CA|\uF996 \u7DF4|\uF997 \u806F|\uF998 \u8F26|\uF999 \u84EE|\uF99A \u9023|\uF99B \u934A|\uF99C \u5217|\uF99D \u52A3|\uF99E \u54BD|\uF99F \u70C8|\uF9A0 \u88C2|\uF9A1 \u8AAA|\uF9A2 \u5EC9|\uF9A3 \u5FF5|\uF9A4 \u637B|\uF9A5 \u6BAE|\uF9A6 \u7C3E|\uF9A7 \u7375|\uF9A8 \u4EE4|\uF9A9 \u56F9|\uF9AA \u5BE7|\uF9AB \u5DBA|\uF9AC \u601C|\uF9AD \u73B2|\uF9AE \u7469|\uF9AF \u7F9A|\uF9B0 \u8046|\uF9B1 \u9234|\uF9B2 \u96F6|\uF9B3 \u9748|\uF9B4 \u9818|\uF9B5 \u4F8B|\uF9B6 \u79AE|\uF9B7 \u91B4|\uF9B8 \u96B8|\uF9B9 \u60E1|\uF9BA \u4E86|\uF9BB \u50DA|\uF9BC \u5BEE|\uF9BD \u5C3F|\uF9BE \u6599|\uF9BF \u6A02|\uF9C0 \u71CE|\uF9C1 \u7642|\uF9C2 \u84FC|\uF9C3 \u907C|\uF9C4 \u9F8D|\uF9C5 \u6688|\uF9C6 \u962E|\uF9C7 \u5289|\uF9C8 \u677B|\uF9C9 \u67F3|\uF9CA \u6D41|\uF9CB \u6E9C|\uF9CC \u7409|\uF9CD \u7559|\uF9CE \u786B|\uF9CF \u7D10|\uF9D0 \u985E|\uF9D1 \u516D|\uF9D2 \u622E|\uF9D3 \u9678|\uF9D4 \u502B|\uF9D5 \u5D19|\uF9D6 \u6DEA|\uF9D7 \u8F2A|\uF9D8 \u5F8B|\uF9D9 \u6144|\uF9DA \u6817|\uF9DB \u7387|\uF9DC \u9686|\uF9DD \u5229|\uF9DE \u540F|\uF9DF \u5C65|\uF9E0 \u6613|\uF9E1 \u674E|\uF9E2 \u68A8|\uF9E3 \u6CE5|\uF9E4 \u7406|\uF9E5 \u75E2|\uF9E6 \u7F79|\uF9E7 \u88CF|\uF9E8 \u88E1|\uF9E9 \u91CC|\uF9EA \u96E2|\uF9EB \u533F|\uF9EC \u6EBA|\uF9ED \u541D|\uF9EE \u71D0|\uF9EF \u7498|\uF9F0 \u85FA|\uF9F1 \u96A3|\uF9F2 \u9C57|\uF9F3 \u9E9F|\uF9F4 \u6797|\uF9F5 \u6DCB|\uF9F6 \u81E8|\uF9F7 \u7ACB|\uF9F8 \u7B20|\uF9F9 \u7C92|\uF9FA \u72C0|\uF9FB \u7099|\uF9FC \u8B58|\uF9FD \u4EC0|\uF9FE \u8336|\uF9FF \u523A|\uFA00 \u5207|\uFA01 \u5EA6|\uFA02 \u62D3|\uFA03 \u7CD6|\uFA04 \u5B85|\uFA05 \u6D1E|\uFA06 \u66B4|\uFA07 \u8F3B|\uFA08 \u884C|\uFA09 \u964D|\uFA0A \u898B|\uFA0B \u5ED3|\uFA0C \u5140|\uFA0D \u55C0|\uFA10 \u585A|\uFA12 \u6674|\uFA15 \u51DE|\uFA16 \u732A|\uFA17 \u76CA|\uFA18 \u793C|\uFA19 \u795E|\uFA1A \u7965|\uFA1B \u798F|\uFA1C \u9756|\uFA1D \u7CBE|\uFA1E \u7FBD|\uFA20 \u8612|\uFA22 \u8AF8|\uFA25 \u9038|\uFA26 \u90FD|\uFA2A \u98EF|\uFA2B \u98FC|\uFA2C \u9928|\uFA2D \u9DB4|\uFA2E \u90DE|\uFA2F \u96B7|\uFA30 \u4FAE|\uFA31 \u50E7|\uFA32 \u514D|\uFA33 \u52C9|\uFA34 \u52E4|\uFA35 \u5351|\uFA36 \u559D|\uFA37 \u5606|\uFA38 \u5668|\uFA39 \u5840|\uFA3A \u58A8|\uFA3B \u5C64|\uFA3C \u5C6E|\uFA3D \u6094|\uFA3E \u6168|\uFA3F \u618E|\uFA40 \u61F2|\uFA41 \u654F|\uFA42 \u65E2|\uFA43 \u6691|\uFA44 \u6885|\uFA45 \u6D77|\uFA46 \u6E1A|\uFA47 \u6F22|\uFA48 \u716E|\uFA49 \u722B|\uFA4A \u7422|\uFA4B \u7891|\uFA4C \u793E|\uFA4D \u7949|\uFA4E \u7948|\uFA4F \u7950|\uFA50 \u7956|\uFA51 \u795D|\uFA52 \u798D|\uFA53 \u798E|\uFA54 \u7A40|\uFA55 \u7A81|\uFA56 \u7BC0|\uFA57 \u7DF4|\uFA58 \u7E09|\uFA59 \u7E41|\uFA5A \u7F72|\uFA5B \u8005|\uFA5C \u81ED|\uFA5D \u8279|\uFA5E \u8279|\uFA5F \u8457|\uFA60 \u8910|\uFA61 \u8996|\uFA62 \u8B01|\uFA63 \u8B39|\uFA64 \u8CD3|\uFA65 \u8D08|\uFA66 \u8FB6|\uFA67 \u9038|\uFA68 \u96E3|\uFA69 \u97FF|\uFA6A \u983B|\uFA6B \u6075|\uFA6C \u{242EE}|\uFA6D \u8218|\uFA70 \u4E26|\uFA71 \u51B5|\uFA72 \u5168|\uFA73 \u4F80|\uFA74 \u5145|\uFA75 \u5180|\uFA76 \u52C7|\uFA77 \u52FA|\uFA78 \u559D|\uFA79 \u5555|\uFA7A \u5599|\uFA7B \u55E2|\uFA7C \u585A|\uFA7D \u58B3|\uFA7E \u5944|\uFA7F \u5954|\uFA80 \u5A62|\uFA81 \u5B28|\uFA82 \u5ED2|\uFA83 \u5ED9|\uFA84 \u5F69|\uFA85 \u5FAD|\uFA86 \u60D8|\uFA87 \u614E|\uFA88 \u6108|\uFA89 \u618E|\uFA8A \u6160|\uFA8B \u61F2|\uFA8C \u6234|\uFA8D \u63C4|\uFA8E \u641C|\uFA8F \u6452|\uFA90 \u6556|\uFA91 \u6674|\uFA92 \u6717|\uFA93 \u671B|\uFA94 \u6756|\uFA95 \u6B79|\uFA96 \u6BBA|\uFA97 \u6D41|\uFA98 \u6EDB|\uFA99 \u6ECB|\uFA9A \u6F22|\uFA9B \u701E|\uFA9C \u716E|\uFA9D \u77A7|\uFA9E \u7235|\uFA9F \u72AF|\uFAA0 \u732A|\uFAA1 \u7471|\uFAA2 \u7506|\uFAA3 \u753B|\uFAA4 \u761D|\uFAA5 \u761F|\uFAA6 \u76CA|\uFAA7 \u76DB|\uFAA8 \u76F4|\uFAA9 \u774A|\uFAAA \u7740|\uFAAB \u78CC|\uFAAC \u7AB1|\uFAAD \u7BC0|\uFAAE \u7C7B|\uFAAF \u7D5B|\uFAB0 \u7DF4|\uFAB1 \u7F3E|\uFAB2 \u8005|\uFAB3 \u8352|\uFAB4 \u83EF|\uFAB5 \u8779|\uFAB6 \u8941|\uFAB7 \u8986|\uFAB8 \u8996|\uFAB9 \u8ABF|\uFABA \u8AF8|\uFABB \u8ACB|\uFABC \u8B01|\uFABD \u8AFE|\uFABE \u8AED|\uFABF \u8B39|\uFAC0 \u8B8A|\uFAC1 \u8D08|\uFAC2 \u8F38|\uFAC3 \u9072|\uFAC4 \u9199|\uFAC5 \u9276|\uFAC6 \u967C|\uFAC7 \u96E3|\uFAC8 \u9756|\uFAC9 \u97DB|\uFACA \u97FF|\uFACB \u980B|\uFACC \u983B|\uFACD \u9B12|\uFACE \u9F9C|\uFACF \u{2284A}|\uFAD0 \u{22844}|\uFAD1 \u{233D5}|\uFAD2 \u3B9D|\uFAD3 \u4018|\uFAD4 \u4039|\uFAD5 \u{25249}|\uFAD6 \u{25CD0}|\uFAD7 \u{27ED3}|\uFAD8 \u9F43|\uFAD9 \u9F8E|\u{2F800} \u4E3D|\u{2F801} \u4E38|\u{2F802} \u4E41|\u{2F803} \u{20122}|\u{2F804} \u4F60|\u{2F805} \u4FAE|\u{2F806} \u4FBB|\u{2F807} \u5002|\u{2F808} \u507A|\u{2F809} \u5099|\u{2F80A} \u50E7|\u{2F80B} \u50CF|\u{2F80C} \u349E|\u{2F80D} \u{2063A}|\u{2F80E} \u514D|\u{2F80F} \u5154|\u{2F810} \u5164|\u{2F811} \u5177|\u{2F812} \u{2051C}|\u{2F813} \u34B9|\u{2F814} \u5167|\u{2F815} \u518D|\u{2F816} \u{2054B}|\u{2F817} \u5197|\u{2F818} \u51A4|\u{2F819} \u4ECC|\u{2F81A} \u51AC|\u{2F81B} \u51B5|\u{2F81C} \u{291DF}|\u{2F81D} \u51F5|\u{2F81E} \u5203|\u{2F81F} \u34DF|\u{2F820} \u523B|\u{2F821} \u5246|\u{2F822} \u5272|\u{2F823} \u5277|\u{2F824} \u3515|\u{2F825} \u52C7|\u{2F826} \u52C9|\u{2F827} \u52E4|\u{2F828} \u52FA|\u{2F829} \u5305|\u{2F82A} \u5306|\u{2F82B} \u5317|\u{2F82C} \u5349|\u{2F82D} \u5351|\u{2F82E} \u535A|\u{2F82F} \u5373|\u{2F830} \u537D|\u{2F831} \u537F|\u{2F832} \u537F|\u{2F833} \u537F|\u{2F834} \u{20A2C}|\u{2F835} \u7070|\u{2F836} \u53CA|\u{2F837} \u53DF|\u{2F838} \u{20B63}|\u{2F839} \u53EB|\u{2F83A} \u53F1|\u{2F83B} \u5406|\u{2F83C} \u549E|\u{2F83D} \u5438|\u{2F83E} \u5448|\u{2F83F} \u5468|\u{2F840} \u54A2|\u{2F841} \u54F6|\u{2F842} \u5510|\u{2F843} \u5553|\u{2F844} \u5563|\u{2F845} \u5584|\u{2F846} \u5584|\u{2F847} \u5599|\u{2F848} \u55AB|\u{2F849} \u55B3|\u{2F84A} \u55C2|\u{2F84B} \u5716|\u{2F84C} \u5606|\u{2F84D} \u5717|\u{2F84E} \u5651|\u{2F84F} \u5674|\u{2F850} \u5207|\u{2F851} \u58EE|\u{2F852} \u57CE|\u{2F853} \u57F4|\u{2F854} \u580D|\u{2F855} \u578B|\u{2F856} \u5832|\u{2F857} \u5831|\u{2F858} \u58AC|\u{2F859} \u{214E4}|\u{2F85A} \u58F2|\u{2F85B} \u58F7|\u{2F85C} \u5906|\u{2F85D} \u591A|\u{2F85E} \u5922|\u{2F85F} \u5962|\u{2F860} \u{216A8}|\u{2F861} \u{216EA}|\u{2F862} \u59EC|\u{2F863} \u5A1B|\u{2F864} \u5A27|\u{2F865} \u59D8|\u{2F866} \u5A66|\u{2F867} \u36EE|\u{2F868} \u36FC|\u{2F869} \u5B08|\u{2F86A} \u5B3E|\u{2F86B} \u5B3E|\u{2F86C} \u{219C8}|\u{2F86D} \u5BC3|\u{2F86E} \u5BD8|\u{2F86F} \u5BE7|\u{2F870} \u5BF3|\u{2F871} \u{21B18}|\u{2F872} \u5BFF|\u{2F873} \u5C06|\u{2F874} \u5F53|\u{2F875} \u5C22|\u{2F876} \u3781|\u{2F877} \u5C60|\u{2F878} \u5C6E|\u{2F879} \u5CC0|\u{2F87A} \u5C8D|\u{2F87B} \u{21DE4}|\u{2F87C} \u5D43|\u{2F87D} \u{21DE6}|\u{2F87E} \u5D6E|\u{2F87F} \u5D6B|\u{2F880} \u5D7C|\u{2F881} \u5DE1|\u{2F882} \u5DE2|\u{2F883} \u382F|\u{2F884} \u5DFD|\u{2F885} \u5E28|\u{2F886} \u5E3D|\u{2F887} \u5E69|\u{2F888} \u3862|\u{2F889} \u{22183}|\u{2F88A} \u387C|\u{2F88B} \u5EB0|\u{2F88C} \u5EB3|\u{2F88D} \u5EB6|\u{2F88E} \u5ECA|\u{2F88F} \u{2A392}|\u{2F890} \u5EFE|\u{2F891} \u{22331}|\u{2F892} \u{22331}|\u{2F893} \u8201|\u{2F894} \u5F22|\u{2F895} \u5F22|\u{2F896} \u38C7|\u{2F897} \u{232B8}|\u{2F898} \u{261DA}|\u{2F899} \u5F62|\u{2F89A} \u5F6B|\u{2F89B} \u38E3|\u{2F89C} \u5F9A|\u{2F89D} \u5FCD|\u{2F89E} \u5FD7|\u{2F89F} \u5FF9|\u{2F8A0} \u6081|\u{2F8A1} \u393A|\u{2F8A2} \u391C|\u{2F8A3} \u6094|\u{2F8A4} \u{226D4}|\u{2F8A5} \u60C7|\u{2F8A6} \u6148|\u{2F8A7} \u614C|\u{2F8A8} \u614E|\u{2F8A9} \u614C|\u{2F8AA} \u617A|\u{2F8AB} \u618E|\u{2F8AC} \u61B2|\u{2F8AD} \u61A4|\u{2F8AE} \u61AF|\u{2F8AF} \u61DE|\u{2F8B0} \u61F2|\u{2F8B1} \u61F6|\u{2F8B2} \u6210|\u{2F8B3} \u621B|\u{2F8B4} \u625D|\u{2F8B5} \u62B1|\u{2F8B6} \u62D4|\u{2F8B7} \u6350|\u{2F8B8} \u{22B0C}|\u{2F8B9} \u633D|\u{2F8BA} \u62FC|\u{2F8BB} \u6368|\u{2F8BC} \u6383|\u{2F8BD} \u63E4|\u{2F8BE} \u{22BF1}|\u{2F8BF} \u6422|\u{2F8C0} \u63C5|\u{2F8C1} \u63A9|\u{2F8C2} \u3A2E|\u{2F8C3} \u6469|\u{2F8C4} \u647E|\u{2F8C5} \u649D|\u{2F8C6} \u6477|\u{2F8C7} \u3A6C|\u{2F8C8} \u654F|\u{2F8C9} \u656C|\u{2F8CA} \u{2300A}|\u{2F8CB} \u65E3|\u{2F8CC} \u66F8|\u{2F8CD} \u6649|\u{2F8CE} \u3B19|\u{2F8CF} \u6691|\u{2F8D0} \u3B08|\u{2F8D1} \u3AE4|\u{2F8D2} \u5192|\u{2F8D3} \u5195|\u{2F8D4} \u6700|\u{2F8D5} \u669C|\u{2F8D6} \u80AD|\u{2F8D7} \u43D9|\u{2F8D8} \u6717|\u{2F8D9} \u671B|\u{2F8DA} \u6721|\u{2F8DB} \u675E|\u{2F8DC} \u6753|\u{2F8DD} \u{233C3}|\u{2F8DE} \u3B49|\u{2F8DF} \u67FA|\u{2F8E0} \u6785|\u{2F8E1} \u6852|\u{2F8E2} \u6885|\u{2F8E3} \u{2346D}|\u{2F8E4} \u688E|\u{2F8E5} \u681F|\u{2F8E6} \u6914|\u{2F8E7} \u3B9D|\u{2F8E8} \u6942|\u{2F8E9} \u69A3|\u{2F8EA} \u69EA|\u{2F8EB} \u6AA8|\u{2F8EC} \u{236A3}|\u{2F8ED} \u6ADB|\u{2F8EE} \u3C18|\u{2F8EF} \u6B21|\u{2F8F0} \u{238A7}|\u{2F8F1} \u6B54|\u{2F8F2} \u3C4E|\u{2F8F3} \u6B72|\u{2F8F4} \u6B9F|\u{2F8F5} \u6BBA|\u{2F8F6} \u6BBB|\u{2F8F7} \u{23A8D}|\u{2F8F8} \u{21D0B}|\u{2F8F9} \u{23AFA}|\u{2F8FA} \u6C4E|\u{2F8FB} \u{23CBC}|\u{2F8FC} \u6CBF|\u{2F8FD} \u6CCD|\u{2F8FE} \u6C67|\u{2F8FF} \u6D16|\u{2F900} \u6D3E|\u{2F901} \u6D77|\u{2F902} \u6D41|\u{2F903} \u6D69|\u{2F904} \u6D78|\u{2F905} \u6D85|\u{2F906} \u{23D1E}|\u{2F907} \u6D34|\u{2F908} \u6E2F|\u{2F909} \u6E6E|\u{2F90A} \u3D33|\u{2F90B} \u6ECB|\u{2F90C} \u6EC7|\u{2F90D} \u{23ED1}|\u{2F90E} \u6DF9|\u{2F90F} \u6F6E|\u{2F910} \u{23F5E}|\u{2F911} \u{23F8E}|\u{2F912} \u6FC6|\u{2F913} \u7039|\u{2F914} \u701E|\u{2F915} \u701B|\u{2F916} \u3D96|\u{2F917} \u704A|\u{2F918} \u707D|\u{2F919} \u7077|\u{2F91A} \u70AD|\u{2F91B} \u{20525}|\u{2F91C} \u7145|\u{2F91D} \u{24263}|\u{2F91E} \u719C|\u{2F91F} \u{243AB}|\u{2F920} \u7228|\u{2F921} \u7235|\u{2F922} \u7250|\u{2F923} \u{24608}|\u{2F924} \u7280|\u{2F925} \u7295|\u{2F926} \u{24735}|\u{2F927} \u{24814}|\u{2F928} \u737A|\u{2F929} \u738B|\u{2F92A} \u3EAC|\u{2F92B} \u73A5|\u{2F92C} \u3EB8|\u{2F92D} \u3EB8|\u{2F92E} \u7447|\u{2F92F} \u745C|\u{2F930} \u7471|\u{2F931} \u7485|\u{2F932} \u74CA|\u{2F933} \u3F1B|\u{2F934} \u7524|\u{2F935} \u{24C36}|\u{2F936} \u753E|\u{2F937} \u{24C92}|\u{2F938} \u7570|\u{2F939} \u{2219F}|\u{2F93A} \u7610|\u{2F93B} \u{24FA1}|\u{2F93C} \u{24FB8}|\u{2F93D} \u{25044}|\u{2F93E} \u3FFC|\u{2F93F} \u4008|\u{2F940} \u76F4|\u{2F941} \u{250F3}|\u{2F942} \u{250F2}|\u{2F943} \u{25119}|\u{2F944} \u{25133}|\u{2F945} \u771E|\u{2F946} \u771F|\u{2F947} \u771F|\u{2F948} \u774A|\u{2F949} \u4039|\u{2F94A} \u778B|\u{2F94B} \u4046|\u{2F94C} \u4096|\u{2F94D} \u{2541D}|\u{2F94E} \u784E|\u{2F94F} \u788C|\u{2F950} \u78CC|\u{2F951} \u40E3|\u{2F952} \u{25626}|\u{2F953} \u7956|\u{2F954} \u{2569A}|\u{2F955} \u{256C5}|\u{2F956} \u798F|\u{2F957} \u79EB|\u{2F958} \u412F|\u{2F959} \u7A40|\u{2F95A} \u7A4A|\u{2F95B} \u7A4F|\u{2F95C} \u{2597C}|\u{2F95D} \u{25AA7}|\u{2F95E} \u{25AA7}|\u{2F95F} \u7AEE|\u{2F960} \u4202|\u{2F961} \u{25BAB}|\u{2F962} \u7BC6|\u{2F963} \u7BC9|\u{2F964} \u4227|\u{2F965} \u{25C80}|\u{2F966} \u7CD2|\u{2F967} \u42A0|\u{2F968} \u7CE8|\u{2F969} \u7CE3|\u{2F96A} \u7D00|\u{2F96B} \u{25F86}|\u{2F96C} \u7D63|\u{2F96D} \u4301|\u{2F96E} \u7DC7|\u{2F96F} \u7E02|\u{2F970} \u7E45|\u{2F971} \u4334|\u{2F972} \u{26228}|\u{2F973} \u{26247}|\u{2F974} \u4359|\u{2F975} \u{262D9}|\u{2F976} \u7F7A|\u{2F977} \u{2633E}|\u{2F978} \u7F95|\u{2F979} \u7FFA|\u{2F97A} \u8005|\u{2F97B} \u{264DA}|\u{2F97C} \u{26523}|\u{2F97D} \u8060|\u{2F97E} \u{265A8}|\u{2F97F} \u8070|\u{2F980} \u{2335F}|\u{2F981} \u43D5|\u{2F982} \u80B2|\u{2F983} \u8103|\u{2F984} \u440B|\u{2F985} \u813E|\u{2F986} \u5AB5|\u{2F987} \u{267A7}|\u{2F988} \u{267B5}|\u{2F989} \u{23393}|\u{2F98A} \u{2339C}|\u{2F98B} \u8201|\u{2F98C} \u8204|\u{2F98D} \u8F9E|\u{2F98E} \u446B|\u{2F98F} \u8291|\u{2F990} \u828B|\u{2F991} \u829D|\u{2F992} \u52B3|\u{2F993} \u82B1|\u{2F994} \u82B3|\u{2F995} \u82BD|\u{2F996} \u82E6|\u{2F997} \u{26B3C}|\u{2F998} \u82E5|\u{2F999} \u831D|\u{2F99A} \u8363|\u{2F99B} \u83AD|\u{2F99C} \u8323|\u{2F99D} \u83BD|\u{2F99E} \u83E7|\u{2F99F} \u8457|\u{2F9A0} \u8353|\u{2F9A1} \u83CA|\u{2F9A2} \u83CC|\u{2F9A3} \u83DC|\u{2F9A4} \u{26C36}|\u{2F9A5} \u{26D6B}|\u{2F9A6} \u{26CD5}|\u{2F9A7} \u452B|\u{2F9A8} \u84F1|\u{2F9A9} \u84F3|\u{2F9AA} \u8516|\u{2F9AB} \u{273CA}|\u{2F9AC} \u8564|\u{2F9AD} \u{26F2C}|\u{2F9AE} \u455D|\u{2F9AF} \u4561|\u{2F9B0} \u{26FB1}|\u{2F9B1} \u{270D2}|\u{2F9B2} \u456B|\u{2F9B3} \u8650|\u{2F9B4} \u865C|\u{2F9B5} \u8667|\u{2F9B6} \u8669|\u{2F9B7} \u86A9|\u{2F9B8} \u8688|\u{2F9B9} \u870E|\u{2F9BA} \u86E2|\u{2F9BB} \u8779|\u{2F9BC} \u8728|\u{2F9BD} \u876B|\u{2F9BE} \u8786|\u{2F9BF} \u45D7|\u{2F9C0} \u87E1|\u{2F9C1} \u8801|\u{2F9C2} \u45F9|\u{2F9C3} \u8860|\u{2F9C4} \u8863|\u{2F9C5} \u{27667}|\u{2F9C6} \u88D7|\u{2F9C7} \u88DE|\u{2F9C8} \u4635|\u{2F9C9} \u88FA|\u{2F9CA} \u34BB|\u{2F9CB} \u{278AE}|\u{2F9CC} \u{27966}|\u{2F9CD} \u46BE|\u{2F9CE} \u46C7|\u{2F9CF} \u8AA0|\u{2F9D0} \u8AED|\u{2F9D1} \u8B8A|\u{2F9D2} \u8C55|\u{2F9D3} \u{27CA8}|\u{2F9D4} \u8CAB|\u{2F9D5} \u8CC1|\u{2F9D6} \u8D1B|\u{2F9D7} \u8D77|\u{2F9D8} \u{27F2F}|\u{2F9D9} \u{20804}|\u{2F9DA} \u8DCB|\u{2F9DB} \u8DBC|\u{2F9DC} \u8DF0|\u{2F9DD} \u{208DE}|\u{2F9DE} \u8ED4|\u{2F9DF} \u8F38|\u{2F9E0} \u{285D2}|\u{2F9E1} \u{285ED}|\u{2F9E2} \u9094|\u{2F9E3} \u90F1|\u{2F9E4} \u9111|\u{2F9E5} \u{2872E}|\u{2F9E6} \u911B|\u{2F9E7} \u9238|\u{2F9E8} \u92D7|\u{2F9E9} \u92D8|\u{2F9EA} \u927C|\u{2F9EB} \u93F9|\u{2F9EC} \u9415|\u{2F9ED} \u{28BFA}|\u{2F9EE} \u958B|\u{2F9EF} \u4995|\u{2F9F0} \u95B7|\u{2F9F1} \u{28D77}|\u{2F9F2} \u49E6|\u{2F9F3} \u96C3|\u{2F9F4} \u5DB2|\u{2F9F5} \u9723|\u{2F9F6} \u{29145}|\u{2F9F7} \u{2921A}|\u{2F9F8} \u4A6E|\u{2F9F9} \u4A76|\u{2F9FA} \u97E0|\u{2F9FB} \u{2940A}|\u{2F9FC} \u4AB2|\u{2F9FD} \u{29496}|\u{2F9FE} \u980B|\u{2F9FF} \u980B|\u{2FA00} \u9829|\u{2FA01} \u{295B6}|\u{2FA02} \u98E2|\u{2FA03} \u4B33|\u{2FA04} \u9929|\u{2FA05} \u99A7|\u{2FA06} \u99C2|\u{2FA07} \u99FE|\u{2FA08} \u4BCE|\u{2FA09} \u{29B30}|\u{2FA0A} \u9B12|\u{2FA0B} \u9C40|\u{2FA0C} \u9CFD|\u{2FA0D} \u4CCE|\u{2FA0E} \u4CED|\u{2FA0F} \u9D67|\u{2FA10} \u{2A0CE}|\u{2FA11} \u4CF8|\u{2FA12} \u{2A105}|\u{2FA13} \u{2A20E}|\u{2FA14} \u{2A291}|\u{2FA15} \u9EBB|\u{2FA16} \u4D56|\u{2FA17} \u9EF9|\u{2FA18} \u9EFE|\u{2FA19} \u9F05|\u{2FA1A} \u9F0F|\u{2FA1B} \u9F16|\u{2FA1C} \u9F3B|\u{2FA1D} \u{2A600}";
        const C = { hk: [[f, g]], hkp: [[d, f, g]], tw: [[p, h]], twp: [[y, p, h]], jp: [["\u4E00\u7372\u5343\u91D1 \u4E00\u652B\u5343\u91D1|\u4E01\u5BE7 \u53EE\u5680|\u4E01\u91CD \u912D\u91CD|\u4E09\u5DEE\u8DEF \u4E09\u53C9\u8DEF|\u4E16\u8AD6 \u8F3F\u8AD6|\u4E88\u5099 \u9810\u5099|\u4E88\u544A \u9810\u544A|\u4E88\u5B9A \u9810\u5B9A|\u4E88\u611F \u9810\u611F|\u4E88\u6E2C \u9810\u6E2C|\u4E88\u7B97 \u9810\u7B97|\u4E88\u7D04 \u9810\u7D04|\u4E88\u7FD2 \u9810\u7FD2|\u4E88\u8A00 \u9810\u8A00|\u4E88\u9632 \u9810\u9632|\u4E9C\u9234 \u555E\u9234|\u4EA4\u5DEE \u4EA4\u53C9|\u4EE3\u5F01 \u4EE3\u8FAF|\u4F9B\u5BB4 \u9957\u5BB4|\u4FCA\u99AC \u99FF\u99AC|\u4FDD\u5841 \u5821\u58D8|\u500B\u6761\u66F8 \u7B87\u6761\u66F8|\u504F\u5E73 \u6241\u5E73|\u505C\u6CCA \u7887\u6CCA|\u512A\u4FCA \u512A\u99FF|\u5148\u5175 \u5C16\u5175|\u5148\u7AEF \u5C16\u7AEF|\u5148\u92ED \u5C16\u92B3|\u5171\u5F79 \u5171\u8EDB|\u5197\u820C \u9952\u820C|\u51F6\u5668 \u5147\u5668|\u524A\u5CA9 \u947F\u5CA9|\u5305\u4E01 \u5E96\u4E01|\u5305\u5E2F \u7E43\u5E36|\u533A\u753B \u5340\u5283|\u53B3\u7136 \u513C\u7136|\u53CB\u5B9C \u53CB\u8ABC|\u53CD\u4E71 \u53DB\u4E82|\u53CE\u96C6 \u8490\u96C6|\u53D9\u60C5 \u6292\u60C5|\u53F0\u982D \u64E1\u982D|\u5408\u5F01 \u5408\u8FA6|\u559C\u904A\u66F2 \u5B09\u904A\u66F2|\u5606\u9858 \u6B4E\u9858|\u56DE\u8EE2 \u5EFB\u8EE2|\u56DE\u904A \u56DE\u6E38|\u56FD\u969B\u9023\u76DF \u570B\u969B\u806F\u76DF|\u5949\u6301 \u6367\u6301|\u59D4\u7E2E \u840E\u7E2E|\u5B89\u5168\u5F01 \u5B89\u5168\u74E3|\u5C55\u8EE2 \u8F3E\u8F49|\u5E0C\u5C11 \u7A00\u5C11|\u5E7B\u60D1 \u7729\u60D1|\u5E83\u7BC4 \u5EE3\u6CDB|\u5E83\u91CE \u66E0\u91CE|\u5EC3\u865A \u5EE2\u589F|\u5EFA\u576A\u7387 \u5EFA\u853D\u7387|\u5F01\u5225 \u8FA8\u5225|\u5F01\u5F53 \u8FA8\u7576|\u5F01\u624D \u8FAF\u624D|\u5F01\u660E \u8FAF\u660E|\u5F01\u819C \u74E3\u819C|\u5F01\u89E3 \u8FAF\u89E3|\u5F01\u8A3C \u8FAF\u8B49|\u5F01\u8AD6 \u8FAF\u8AD6|\u5F01\u8AD6\u5BB6 \u8FAF\u8AD6\u5BB6|\u5F01\u8B77 \u8FAF\u8B77|\u5F01\u8B77\u58EB \u8FAF\u8B77\u58EB|\u5F01\u8CA1\u5929 \u8FAF\u8CA1\u5929|\u5F01\u99C1 \u8FAF\u99C1|\u5F01\u9AEA \u8FAE\u9AEE|\u5F26\u6B4C \u7D43\u6B4C|\u6069\u7FA9 \u6069\u8ABC|\u610F\u5411 \u610F\u56AE|\u6170\u8B1D\u6599 \u6170\u85C9\u6599|\u61B6\u65AD \u81C6\u65B7|\u61B6\u75C5 \u81C6\u75C5|\u6226\u6CA1 \u6230\u6B7F|\u6247\u60C5 \u717D\u60C5|\u624B\u5E33 \u624B\u5E16|\u6280\u91CF \u4F0E\u5006|\u629C\u7C8B \u629C\u8403|\u62AB\u6B74 \u62AB\u701D|\u62B5\u89E6 \u7274\u89F8|\u62BD\u9078 \u62BD\u7C64|\u62D8\u5F15 \u52FE\u5F15|\u62E0\u51FA \u91B5\u51FA|\u62E0\u91D1 \u91B5\u91D1|\u6398\u524A \u6398\u947F|\u63A7\u9664 \u6263\u9664|\u63F4\u8B77 \u63A9\u8B77|\u653E\u68C4 \u629B\u68C4|\u6563\u6C34 \u6492\u6C34|\u656C\u8B19 \u656C\u8654|\u6577\u5EF6 \u6577\u884D|\u65AD\u56FA \u65B7\u4E4E|\u65CF\u751F \u7C07\u751F|\u6607\u53D9 \u965E\u6558|\u6696\u623F \u7156\u623F|\u6697\u5531 \u6697\u8AA6|\u6697\u591C \u95C7\u591C|\u66B4\u9732 \u66DD\u9732|\u67AF\u6E07 \u6DB8\u6E34|\u683C\u597D \u6070\u597D|\u683C\u5E45 \u6070\u5E45|\u68C4\u640D \u6BC0\u640D|\u6A21\u7D22 \u6478\u7D22|\u6A4B\u982D\u4FDD \u6A4B\u982D\u5821|\u6B20\u7F3A \u6B20\u7F3A|\u6B27\u5DDE \u6B50\u6D32|\u6B27\u5DDE\u9023\u5408 \u6B50\u6D32\u806F\u76DF|\u6B7B\u4F53 \u5C4D\u9AD4|\u6BBF\u90E8 \u81C0\u90E8|\u6BCD\u6307 \u62C7\u6307|\u6C17\u8FEB \u6C23\u9B44|\u6C7A\u5225 \u8A23\u5225|\u6C7A\u58CA \u6C7A\u6F70|\u6C88\u6BBF \u6C88\u6FB1|\u6CB9\u9001\u8239 \u6CB9\u69FD\u8239|\u6CE2\u4E71 \u6CE2\u703E|\u6CE8\u91C8 \u8A3B\u91CB|\u6D17\u6D44 \u6D17\u6ECC|\u6D3B\u767A \u6D3B\u6F51|\u6D78\u900F \u6EF2\u900F|\u6D78\u98DF \u6D78\u8755|\u6D88\u5374 \u92B7\u537B|\u6DF7\u7136 \u6E3E\u7136|\u6E7E\u66F2 \u5F4E\u66F2|\u6EB6\u63A5 \u7194\u63A5|\u6F01\u52B4 \u6F01\u6488|\u6F02\u7136 \u98C4\u7136|\u6FC0\u9AD8 \u6FC0\u6602|\u706B\u708E \u706B\u7130|\u7126\u71E5 \u7126\u8E81|\u7336\u4E88 \u7336\u8C6B|\u73ED\u70B9 \u6591\u9EDE|\u7559\u98F2 \u6E9C\u98F2|\u7565\u596A \u63A0\u596A|\u758E\u901A \u758F\u901A|\u767A\u9175 \u91B1\u9175|\u767D\u4E9C \u767D\u580A|\u76F8\u514B \u76F8\u524B|\u77E5\u6075 \u667A\u6167|\u7834\u68C4 \u7834\u6BC0|\u78BA\u56FA \u78BA\u4E4E|\u7981\u56FA \u7981\u932E|\u7B26\u4E01 \u7B26\u7252|\u7C89\u88C5 \u626E\u88DD|\u7D2B\u73ED \u7D2B\u6591|\u7D42\u606F \u7D42\u7184|\u7DCF\u5408 \u7D9C\u5408|\u7DE8\u96C6 \u7DE8\u8F2F|\u7FA9\u63F4 \u7FA9\u6350|\u8015\u904B\u6A5F \u8015\u8018\u6A5F|\u809D\u5FC3 \u809D\u814E|\u80A9\u7532\u9AA8 \u80A9\u80DB\u9AA8|\u80CC\u5FB3 \u6096\u5FB7|\u8108\u62CD \u8108\u640F|\u81A8\u5F35 \u81A8\u8139|\u82B1\u5F01 \u82B1\u74E3|\u82B3\u7D14 \u82B3\u9187|\u82F1\u77E5 \u53E1\u667A|\u84B8\u7559 \u84B8\u6E9C|\u85AB\u84B8 \u71FB\u84B8|\u85AB\u88FD \u71FB\u88FD|\u8863\u88C5 \u8863\u88F3|\u8870\u9000 \u8870\u9000|\u88D5\u7136 \u60A0\u7136|\u88DC\u4F50 \u8F14\u4F50|\u8A13\u6212 \u8A13\u8AA1|\u8A66\u7DF4 \u8A66\u7149|\u8A6D\u5F01 \u8A6D\u8FAF|\u8B1B\u548C \u5ABE\u548C|\u8C61\u773C \u8C61\u5D4C|\u8CAB\u9332 \u8CAB\u797F|\u8CB7\u5F01 \u8CB7\u8FA6|\u8CDB\u8F9E \u8B9A\u8FAD|\u8E0F\u8972 \u8E48\u8972|\u8ECA\u4E21 \u8ECA\u8F1B|\u8EE2\u5012 \u985B\u5012|\u8F2A\u90ED \u8F2A\u5ED3|\u9000\u8272 \u892A\u8272|\u9014\u7D76 \u675C\u7D55|\u9023\u4FC2 \u9023\u7E6B|\u9023\u5408 \u806F\u5408|\u9023\u5408\u4F1A \u806F\u5408\u6703|\u9023\u5408\u56FD \u806F\u5408\u570B|\u9023\u5408\u8266\u968A \u806F\u5408\u8266\u968A|\u9023\u5408\u8ECD \u806F\u5408\u8ECD|\u9023\u540D \u806F\u540D|\u9023\u60F3 \u806F\u60F3|\u9023\u643A \u806F\u651C|\u9023\u76DF \u806F\u76DF|\u9023\u7ACB \u806F\u7ACB|\u9023\u7D50 \u806F\u7D50|\u9023\u7D50\u5668 \u806F\u7D50\u5668|\u9023\u7D50\u6027 \u806F\u7D50\u6027|\u9023\u7D61 \u806F\u7D61|\u9023\u7D61\u54E1 \u806F\u7D61\u54E1|\u9023\u7D61\u7DB2 \u806F\u7D61\u7DB2|\u9023\u7D61\u7DDA \u806F\u7D61\u7DDA|\u9023\u7D61\u8239 \u806F\u7D61\u8239|\u9023\u90A6 \u806F\u90A6|\u9023\u90A6\u5171\u548C\u56FD \u806F\u90A6\u5171\u548C\u570B|\u9023\u90A6\u5236 \u806F\u90A6\u5236|\u9023\u90A6\u56FD \u806F\u90A6\u570B|\u9023\u90A6\u56FD\u5BB6 \u806F\u90A6\u570B\u5BB6|\u9023\u90A6\u653F\u5E9C \u806F\u90A6\u653F\u5E9C|\u9023\u90A6\u8B70\u4F1A \u806F\u90A6\u8B70\u6703|\u9023\u90A6\u8ECD \u806F\u90A6\u8ECD|\u9023\u968A \u806F\u968A|\u9078\u8003 \u9293\u8861|\u9162\u9178 \u918B\u9178|\u91CE\u5351 \u91CE\u9119|\u9271\u77F3 \u7926\u77F3|\u9593\u6B20 \u9593\u6B47|\u95A2\u6570 \u51FD\u6578|\u95A2\u9023 \u95DC\u806F|\u95A2\u9023\u56F3 \u95DC\u806F\u5716|\u95A2\u9023\u6027 \u95DC\u806F\u6027|\u95A2\u9023\u8A9E \u95DC\u806F\u8A9E|\u9632\u5FA1 \u9632\u79A6|\u967A\u963B \u5DAE\u5CA8|\u969C\u58C1 \u7246\u58C1|\u969C\u5BB3 \u969C\u7919|\u96A0\u6EC5 \u6E6E\u6EC5|\u96C4\u5F01 \u96C4\u8FAF|\u96C6\u843D \u805A\u843D|\u96C7\u7528 \u50F1\u50AD|\u98A8\u8AED \u8AF7\u55A9|\u98DB\u8A9E \u871A\u8A9E|\u9999\u5178 \u9999\u5960|\u9AA8\u683C \u9AA8\u9ABC|\u9AD8\u9032 \u4EA2\u9032|\u9CE5\u89B3 \u9CE5\u77B0", "\u4E07 \u842C|\u4E0E \u8207|\u4E21 \u5169|\u4E26 \u7ADD|\u4E57 \u4E58|\u4E71 \u4E82|\u4E80 \u9F9C|\u4E88 \u8C6B|\u4E89 \u722D|\u4E98 \u4E99|\u4E9C \u4E9E|\u4ECF \u4F5B|\u4EEE \u5047|\u4F1A \u6703|\u4F1D \u50B3|\u4F53 \u9AD4|\u4F59 \u9918|\u4F75 \u5002|\u4FA1 \u50F9|\u5039 \u5109|\u507D \u50DE|\u5150 \u5152|\u515A \u9EE8|\u5186 \u5713|\u5199 \u5BEB|\u51DC \u51DB|\u51E6 \u8655|\u5263 \u528D|\u5264 \u5291|\u5270 \u5269|\u52B1 \u52F5|\u52B4 \u52DE|\u52B9 \u6548|\u52C5 \u6555|\u52E7 \u52F8|\u52F2 \u52F3|\u533A \u5340|\u533B \u91AB|\u5358 \u55AE|\u5373 \u537D|\u53B3 \u56B4|\u53C2 \u53C3|\u53CC \u96D9|\u53CE \u6536|\u53D9 \u654D|\u53F0 \u81FA|\u53F7 \u865F|\u5516 \u555E|\u55B6 \u71DF|\u5631 \u56D1|\u565B \u5699|\u56E3 \u5718|\u56F2 \u570D|\u56F3 \u5716|\u56FD \u570B|\u570F \u5708|\u5727 \u58D3|\u5815 \u58AE|\u5841 \u58D8|\u5869 \u9E7D|\u5897 \u589E|\u58CA \u58DE|\u58CC \u58E4|\u58EE \u58EF|\u58F0 \u8072|\u58F1 \u58F9|\u58F2 \u8CE3|\u5909 \u8B8A|\u5965 \u5967|\u5968 \u596C|\u5B22 \u5B43|\u5B66 \u5B78|\u5B9D \u5BF6|\u5B9F \u5BE6|\u5BDB \u5BEC|\u5BDD \u5BE2|\u5BFE \u5C0D|\u5BFF \u58FD|\u5C02 \u5C08|\u5C06 \u5C07|\u5C2D \u582F|\u5C3D \u76E1|\u5C4A \u5C46|\u5C5E \u5C6C|\u5CB3 \u5DBD|\u5CE1 \u5CFD|\u5DCC \u5DD6|\u5DE3 \u5DE2|\u5DFB \u5377|\u5E2F \u5E36|\u5E30 \u6B78|\u5E81 \u5EF3|\u5E83 \u5EE3|\u5EC3 \u5EE2|\u5F01 \u8FA8|\u5F10 \u8CB3|\u5F25 \u5F4C|\u5F2F \u5F4E|\u5F3E \u5F48|\u5F53 \u7576|\u5F84 \u5F91|\u5F93 \u5F9E|\u5FB3 \u5FB7|\u5FB4 \u5FB5|\u5FDC \u61C9|\u604B \u6200|\u6052 \u6046|\u6075 \u60E0|\u60A9 \u60F1|\u60AA \u60E1|\u60E8 \u6158|\u614E \u613C|\u61D0 \u61F7|\u6226 \u6230|\u622F \u6232|\u623B \u623E|\u6255 \u62C2|\u629C \u62D4|\u629E \u64C7|\u62C5 \u64D4|\u62DD \u62DC|\u62E0 \u64DA|\u62E1 \u64F4|\u6319 \u64E7|\u631F \u633E|\u633F \u63D2|\u635C \u641C|\u63B2 \u63ED|\u63BB \u6414|\u63FA \u6416|\u6442 \u651D|\u6483 \u64CA|\u64B9 \u652A|\u6570 \u6578|\u6589 \u9F4A|\u658E \u9F4B|\u65AD \u65B7|\u65E7 \u820A|\u663C \u665D|\u6643 \u6644|\u6669 \u665A|\u6681 \u66C9|\u66A6 \u66C6|\u66FD \u66FE|\u6761 \u689D|\u6765 \u4F86|\u67A2 \u6A1E|\u6804 \u69AE|\u685C \u6AFB|\u685D \u67A1|\u685F \u68E7|\u6867 \u6A9C|\u691C \u6AA2|\u697C \u6A13|\u697D \u6A02|\u6982 \u69EA|\u69D8 \u6A23|\u69D9 \u69C7|\u6A29 \u6B0A|\u6A2A \u6A6B|\u6B20 \u7F3A|\u6B27 \u6B50|\u6B53 \u6B61|\u6B69 \u6B65|\u6B6F \u9F52|\u6B73 \u6B72|\u6B74 \u6B77|\u6B8B \u6B98|\u6BB4 \u6BC6|\u6BBB \u6BBC|\u6BCE \u6BCF|\u6C17 \u6C23|\u6CA2 \u6FA4|\u6CAA \u6FFE|\u6D44 \u6DE8|\u6D45 \u6DFA|\u6D5C \u6FF1|\u6D99 \u6DDA|\u6E07 \u6E34|\u6E08 \u6FDF|\u6E09 \u6D89|\u6E0B \u6F81|\u6E13 \u6EAA|\u6E29 \u6EAB|\u6E7E \u7063|\u6E7F \u6FD5|\u6E80 \u6EFF|\u6EDD \u7027|\u6EDE \u6EEF|\u6F5C \u6F5B|\u702C \u7028|\u706F \u71C8|\u7089 \u7210|\u70B9 \u9EDE|\u70BA \u7232|\u713C \u71D2|\u72A0 \u72A7|\u72B6 \u72C0|\u72EC \u7368|\u72ED \u72F9|\u731F \u7375|\u732E \u737B|\u7363 \u7378|\u74F6 \u7501|\u753B \u756B|\u7573 \u758A|\u75E9 \u7626|\u75F4 \u7661|\u767A \u767C|\u76D7 \u76DC|\u770C \u7E23|\u771F \u771E|\u7814 \u784F|\u7815 \u788E|\u793C \u79AE|\u7962 \u79B0|\u7977 \u79B1|\u7984 \u797F|\u7985 \u79AA|\u79D8 \u7955|\u79F0 \u7A31|\u7A32 \u7A3B|\u7A42 \u7A57|\u7A4F \u7A69|\u7A63 \u7A70|\u7A83 \u7ACA|\u7ADC \u9F8D|\u7C8B \u7CB9|\u7C9B \u8085|\u7CF8 \u7D72|\u7D4C \u7D93|\u7D75 \u7E6A|\u7D99 \u7E7C|\u7D9A \u7E8C|\u7DCF \u7E3D|\u7DD1 \u7DA0|\u7DD2 \u7DD6|\u7E01 \u7DE3|\u7E04 \u7E69|\u7E26 \u7E31|\u7E4A \u7E96|\u7E4D \u7E61|\u7F36 \u7F50|\u7FFB \u98DC|\u8074 \u807D|\u80C6 \u81BD|\u811A \u8173|\u8131 \u812B|\u8133 \u8166|\u81D3 \u81DF|\u8276 \u8277|\u82A6 \u8606|\u82B8 \u85DD|\u830E \u8396|\u8358 \u838A|\u840C \u8420|\u848B \u8523|\u8535 \u85CF|\u85AB \u85B0|\u85AC \u85E5|\u865A \u865B|\u866B \u87F2|\u8695 \u8836|\u86CD \u87A2|\u86EE \u883B|\u874B \u881F|\u885B \u885E|\u88C5 \u88DD|\u8912 \u8943|\u8987 \u9738|\u899A \u89BA|\u89A7 \u89BD|\u89B3 \u89C0|\u89E6 \u89F8|\u8A33 \u8B6F|\u8A3C \u8B49|\u8A89 \u8B7D|\u8AAC \u8AAA|\u8AAD \u8B80|\u8B21 \u8B20|\u8B72 \u8B93|\u8C4A \u8C50|\u8CDB \u8D0A|\u8DF5 \u8E10|\u8EE2 \u8F49|\u8EFD \u8F15|\u8F9E \u8FAD|\u8FBA \u908A|\u9013 \u905E|\u9045 \u9072|\u9065 \u9059|\u90CE \u90DE|\u90F7 \u9115|\u9154 \u9189|\u91A4 \u91AC|\u91B8 \u91C0|\u91C8 \u91CB|\u9244 \u9435|\u9271 \u945B|\u92AD \u9322|\u92F3 \u9444|\u932C \u934A|\u9332 \u9304|\u93AE \u93AD|\u95A2 \u95DC|\u95B2 \u95B1|\u95D8 \u9B2D|\u9665 \u9677|\u967A \u96AA|\u968F \u96A8|\u96A0 \u96B1|\u96D1 \u96DC|\u970A \u9748|\u9759 \u975C|\u9834 \u7A4E|\u983C \u8CF4|\u9854 \u984F|\u9855 \u986F|\u9905 \u9920|\u99C5 \u9A5B|\u99C6 \u9A45|\u9A12 \u9A37|\u9A13 \u9A57|\u9AC4 \u9AD3|\u9AEA \u9AEE|\u9D0E \u9DD7|\u9D8F \u9DC4|\u9E78 \u9E7C|\u9EA6 \u9EA5|\u9EB9 \u9EB4|\u9EBA \u9EB5|\u9EC4 \u9EC3|\u9ED2 \u9ED1|\u9ED9 \u9ED8|\u9F62 \u9F61"]] }, E = { cn: [[v, m]] }, N = { hk2s: { normalizationChain: [[A]], segmentation: [v], conversionChain: [[f, g], [v, m]] }, hk2sp: { normalizationChain: [[A]], segmentation: [v], conversionChain: [[d, f, g], [v, m]] }, t2s: { normalizationChain: [[A]], conversionChain: [[v, m]] }, tw2s: { normalizationChain: [[A]], segmentation: [v], conversionChain: [[p, h], [v, m]] }, tw2sp: { normalizationChain: [[A]], segmentation: [v], conversionChain: [[y, p, h], [v, m]] } };
        var T = Object.freeze({ __proto__: null, configs: N, from: C, to: E });
        const b = (w = T, function(n2) {
          if (["from", "to"].forEach((e2) => {
            if (!n2 || "string" != typeof n2[e2]) throw new Error("Please provide the `" + e2 + "` option");
            if ("t" !== n2[e2] && !w[e2][n2[e2]]) throw new Error("Unknown `" + e2 + "` locale: " + n2[e2]);
          }), w.configs) {
            const o3 = w.configs[t2 = n2.from, r2 = n2.to, "cn" === t2 ? `s2${r2}` : "cn" === r2 ? "hkp" === t2 ? "hk2sp" : "twp" === t2 ? "tw2sp" : `${t2}2s` : `${t2}2${r2}`];
            if (o3) {
              const n3 = (function(n4, ...t4) {
                let r3 = null;
                n4 && (r3 = new e(), Array.isArray(n4) && n4.every((n5) => "string" == typeof n5) ? r3.loadDictGroup(n4) : r3.loadDict(n4));
                const o4 = t4.map((n5) => {
                  const t5 = new e();
                  return t5.loadDictGroup(n5), t5;
                });
                return function(n5) {
                  const e2 = r3 ? r3.segment(n5) : [n5];
                  return o4.reduce((n6, e3) => n6.map((n7) => e3.convert(n7)), e2).join("");
                };
              })(o3.segmentation, ...o3.conversionChain);
              if (!o3.normalizationChain) return n3;
              const t3 = i(...o3.normalizationChain);
              return function(e2) {
                return n3(t3(e2));
              };
            }
          }
          var t2, r2;
          let o2 = [];
          return ["from", "to"].forEach((e2) => {
            var t3;
            "t" !== n2[e2] && o2.push(...(t3 = w[e2][n2[e2]], Array.isArray(t3) && Array.isArray(t3[0]) ? t3 : [t3]));
          }), i.apply(null, o2);
        });
        var w;
        const L = { Trie: e, ConverterFactory: i, Converter: b, CustomConverter: s, HTMLConverter: u, Locale: T };
        n.Converter = b, n.ConverterFactory = i, n.CustomConverter = s, n.HTMLConverter = u, n.Locale = T, n.Trie = e, n.default = L, Object.defineProperty(n, "__esModule", { value: true });
      });
    }
  });

  // lyrics-island/vendor/pako-inflate.min.js
  var require_pako_inflate_min = __commonJS({
    "lyrics-island/vendor/pako-inflate.min.js"(exports, module) {
      !(function(e, t) {
        "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).pako = {});
      })(exports, (function(e) {
        "use strict";
        var t = (e2, t2, i2, n2) => {
          let a2 = 65535 & e2 | 0, r2 = e2 >>> 16 & 65535 | 0, o2 = 0;
          for (; 0 !== i2; ) {
            o2 = i2 > 2e3 ? 2e3 : i2, i2 -= o2;
            do {
              a2 = a2 + t2[n2++] | 0, r2 = r2 + a2 | 0;
            } while (--o2);
            a2 %= 65521, r2 %= 65521;
          }
          return a2 | r2 << 16 | 0;
        };
        const i = new Uint32Array((() => {
          let e2, t2 = [];
          for (var i2 = 0; i2 < 256; i2++) {
            e2 = i2;
            for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[i2] = e2;
          }
          return t2;
        })());
        var n = (e2, t2, n2, a2) => {
          const r2 = i, o2 = a2 + n2;
          e2 ^= -1;
          for (let i2 = a2; i2 < o2; i2++) e2 = e2 >>> 8 ^ r2[255 & (e2 ^ t2[i2])];
          return -1 ^ e2;
        };
        const a = 16209;
        var r = function(e2, t2) {
          let i2, n2, r2, o2, s2, l2, d2, f2, c2, h2, u2, w2, b2, m2, k2, _2, g2, p2, v2, x2, y2, E2, R2, A2;
          const Z2 = e2.state;
          i2 = e2.next_in, R2 = e2.input, n2 = i2 + (e2.avail_in - 5), r2 = e2.next_out, A2 = e2.output, o2 = r2 - (t2 - e2.avail_out), s2 = r2 + (e2.avail_out - 257), l2 = Z2.dmax, d2 = Z2.wsize, f2 = Z2.whave, c2 = Z2.wnext, h2 = Z2.window, u2 = Z2.hold, w2 = Z2.bits, b2 = Z2.lencode, m2 = Z2.distcode, k2 = (1 << Z2.lenbits) - 1, _2 = (1 << Z2.distbits) - 1;
          e: do {
            w2 < 15 && (u2 += R2[i2++] << w2, w2 += 8, u2 += R2[i2++] << w2, w2 += 8), g2 = b2[u2 & k2];
            t: for (; ; ) {
              if (p2 = g2 >>> 24, u2 >>>= p2, w2 -= p2, p2 = g2 >>> 16 & 255, 0 === p2) A2[r2++] = 65535 & g2;
              else {
                if (!(16 & p2)) {
                  if (0 == (64 & p2)) {
                    g2 = b2[(65535 & g2) + (u2 & (1 << p2) - 1)];
                    continue t;
                  }
                  if (32 & p2) {
                    Z2.mode = 16191;
                    break e;
                  }
                  e2.msg = "invalid literal/length code", Z2.mode = a;
                  break e;
                }
                v2 = 65535 & g2, p2 &= 15, p2 && (w2 < p2 && (u2 += R2[i2++] << w2, w2 += 8), v2 += u2 & (1 << p2) - 1, u2 >>>= p2, w2 -= p2), w2 < 15 && (u2 += R2[i2++] << w2, w2 += 8, u2 += R2[i2++] << w2, w2 += 8), g2 = m2[u2 & _2];
                i: for (; ; ) {
                  if (p2 = g2 >>> 24, u2 >>>= p2, w2 -= p2, p2 = g2 >>> 16 & 255, !(16 & p2)) {
                    if (0 == (64 & p2)) {
                      g2 = m2[(65535 & g2) + (u2 & (1 << p2) - 1)];
                      continue i;
                    }
                    e2.msg = "invalid distance code", Z2.mode = a;
                    break e;
                  }
                  if (x2 = 65535 & g2, p2 &= 15, w2 < p2 && (u2 += R2[i2++] << w2, w2 += 8, w2 < p2 && (u2 += R2[i2++] << w2, w2 += 8)), x2 += u2 & (1 << p2) - 1, x2 > l2) {
                    e2.msg = "invalid distance too far back", Z2.mode = a;
                    break e;
                  }
                  if (u2 >>>= p2, w2 -= p2, p2 = r2 - o2, x2 > p2) {
                    if (p2 = x2 - p2, p2 > f2 && Z2.sane) {
                      e2.msg = "invalid distance too far back", Z2.mode = a;
                      break e;
                    }
                    if (y2 = 0, E2 = h2, 0 === c2) {
                      if (y2 += d2 - p2, p2 < v2) {
                        v2 -= p2;
                        do {
                          A2[r2++] = h2[y2++];
                        } while (--p2);
                        y2 = r2 - x2, E2 = A2;
                      }
                    } else if (c2 < p2) {
                      if (y2 += d2 + c2 - p2, p2 -= c2, p2 < v2) {
                        v2 -= p2;
                        do {
                          A2[r2++] = h2[y2++];
                        } while (--p2);
                        if (y2 = 0, c2 < v2) {
                          p2 = c2, v2 -= p2;
                          do {
                            A2[r2++] = h2[y2++];
                          } while (--p2);
                          y2 = r2 - x2, E2 = A2;
                        }
                      }
                    } else if (y2 += c2 - p2, p2 < v2) {
                      v2 -= p2;
                      do {
                        A2[r2++] = h2[y2++];
                      } while (--p2);
                      y2 = r2 - x2, E2 = A2;
                    }
                    for (; v2 > 2; ) A2[r2++] = E2[y2++], A2[r2++] = E2[y2++], A2[r2++] = E2[y2++], v2 -= 3;
                    v2 && (A2[r2++] = E2[y2++], v2 > 1 && (A2[r2++] = E2[y2++]));
                  } else {
                    y2 = r2 - x2;
                    do {
                      A2[r2++] = A2[y2++], A2[r2++] = A2[y2++], A2[r2++] = A2[y2++], v2 -= 3;
                    } while (v2 > 2);
                    v2 && (A2[r2++] = A2[y2++], v2 > 1 && (A2[r2++] = A2[y2++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (i2 < n2 && r2 < s2);
          v2 = w2 >> 3, i2 -= v2, w2 -= v2 << 3, u2 &= (1 << w2) - 1, e2.next_in = i2, e2.next_out = r2, e2.avail_in = i2 < n2 ? n2 - i2 + 5 : 5 - (i2 - n2), e2.avail_out = r2 < s2 ? s2 - r2 + 257 : 257 - (r2 - s2), Z2.hold = u2, Z2.bits = w2;
        };
        const o = 15, s = new Uint16Array([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0]), l = new Uint8Array([16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78]), d = new Uint16Array([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0]), f = new Uint8Array([16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64]);
        var c = (e2, t2, i2, n2, a2, r2, c2, h2) => {
          const u2 = h2.bits;
          let w2, b2, m2, k2, _2, g2, p2 = 0, v2 = 0, x2 = 0, y2 = 0, E2 = 0, R2 = 0, A2 = 0, Z2 = 0, S2 = 0, T2 = 0, O2 = null;
          const U2 = new Uint16Array(16), D2 = new Uint16Array(16);
          let I2, B2, N2, C2 = null;
          for (p2 = 0; p2 <= o; p2++) U2[p2] = 0;
          for (v2 = 0; v2 < n2; v2++) U2[t2[i2 + v2]]++;
          for (E2 = u2, y2 = o; y2 >= 1 && 0 === U2[y2]; y2--) ;
          if (E2 > y2 && (E2 = y2), 0 === y2) return a2[r2++] = 20971520, a2[r2++] = 20971520, h2.bits = 1, 0;
          for (x2 = 1; x2 < y2 && 0 === U2[x2]; x2++) ;
          for (E2 < x2 && (E2 = x2), Z2 = 1, p2 = 1; p2 <= o; p2++) if (Z2 <<= 1, Z2 -= U2[p2], Z2 < 0) return -1;
          if (Z2 > 0 && (0 === e2 || 1 !== y2)) return -1;
          for (D2[1] = 0, p2 = 1; p2 < o; p2++) D2[p2 + 1] = D2[p2] + U2[p2];
          for (v2 = 0; v2 < n2; v2++) 0 !== t2[i2 + v2] && (c2[D2[t2[i2 + v2]]++] = v2);
          if (0 === e2 ? (O2 = C2 = c2, g2 = 20) : 1 === e2 ? (O2 = s, C2 = l, g2 = 257) : (O2 = d, C2 = f, g2 = 0), T2 = 0, v2 = 0, p2 = x2, _2 = r2, R2 = E2, A2 = 0, m2 = -1, S2 = 1 << E2, k2 = S2 - 1, 1 === e2 && S2 > 852 || 2 === e2 && S2 > 592) return 1;
          for (; ; ) {
            I2 = p2 - A2, c2[v2] + 1 < g2 ? (B2 = 0, N2 = c2[v2]) : c2[v2] >= g2 ? (B2 = C2[c2[v2] - g2], N2 = O2[c2[v2] - g2]) : (B2 = 96, N2 = 0), w2 = 1 << p2 - A2, b2 = 1 << R2, x2 = b2;
            do {
              b2 -= w2, a2[_2 + (T2 >> A2) + b2] = I2 << 24 | B2 << 16 | N2 | 0;
            } while (0 !== b2);
            for (w2 = 1 << p2 - 1; T2 & w2; ) w2 >>= 1;
            if (0 !== w2 ? (T2 &= w2 - 1, T2 += w2) : T2 = 0, v2++, 0 == --U2[p2]) {
              if (p2 === y2) break;
              p2 = t2[i2 + c2[v2]];
            }
            if (p2 > E2 && (T2 & k2) !== m2) {
              for (0 === A2 && (A2 = E2), _2 += x2, R2 = p2 - A2, Z2 = 1 << R2; R2 + A2 < y2 && (Z2 -= U2[R2 + A2], !(Z2 <= 0)); ) R2++, Z2 <<= 1;
              if (S2 += 1 << R2, 1 === e2 && S2 > 852 || 2 === e2 && S2 > 592) return 1;
              m2 = T2 & k2, a2[m2] = E2 << 24 | R2 << 16 | _2 - r2 | 0;
            }
          }
          return 0 !== T2 && (a2[_2 + T2] = p2 - A2 << 24 | 64 << 16 | 0), h2.bits = E2, 0;
        }, h = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_MEM_ERROR: -4, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
        const { Z_FINISH: u, Z_BLOCK: w, Z_TREES: b, Z_OK: m, Z_STREAM_END: k, Z_NEED_DICT: _, Z_STREAM_ERROR: g, Z_DATA_ERROR: p, Z_MEM_ERROR: v, Z_BUF_ERROR: x, Z_DEFLATED: y } = h, E = 16180, R = 16190, A = 16191, Z = 16192, S = 16194, T = 16199, O = 16200, U = 16206, D = 16209, I = (e2) => (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
        function B() {
          this.strm = null, this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new Uint16Array(320), this.work = new Uint16Array(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        const N = (e2) => {
          if (!e2) return 1;
          const t2 = e2.state;
          return !t2 || t2.strm !== e2 || t2.mode < E || t2.mode > 16211 ? 1 : 0;
        }, C = (e2) => {
          if (N(e2)) return g;
          const t2 = e2.state;
          return e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = E, t2.last = 0, t2.havedict = 0, t2.flags = -1, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new Int32Array(852), t2.distcode = t2.distdyn = new Int32Array(592), t2.sane = 1, t2.back = -1, m;
        }, z = (e2) => {
          if (N(e2)) return g;
          const t2 = e2.state;
          return t2.wsize = 0, t2.whave = 0, t2.wnext = 0, C(e2);
        }, F = (e2, t2) => {
          let i2;
          if (N(e2)) return g;
          const n2 = e2.state;
          return t2 < 0 ? (i2 = 0, t2 = -t2) : (i2 = 5 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || t2 > 15) ? g : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = i2, n2.wbits = t2, z(e2));
        }, L = (e2, t2) => {
          if (!e2) return g;
          const i2 = new B();
          e2.state = i2, i2.strm = e2, i2.window = null, i2.mode = E;
          const n2 = F(e2, t2);
          return n2 !== m && (e2.state = null), n2;
        };
        let M, H, j = true;
        const K = (e2) => {
          if (j) {
            M = new Int32Array(512), H = new Int32Array(32);
            let t2 = 0;
            for (; t2 < 144; ) e2.lens[t2++] = 8;
            for (; t2 < 256; ) e2.lens[t2++] = 9;
            for (; t2 < 280; ) e2.lens[t2++] = 7;
            for (; t2 < 288; ) e2.lens[t2++] = 8;
            for (c(1, e2.lens, 0, 288, M, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
            c(2, e2.lens, 0, 32, H, 0, e2.work, { bits: 5 }), j = false;
          }
          e2.lencode = M, e2.lenbits = 9, e2.distcode = H, e2.distbits = 5;
        }, P = (e2, t2, i2, n2) => {
          let a2;
          const r2 = e2.state;
          return null === r2.window && (r2.wsize = 1 << r2.wbits, r2.wnext = 0, r2.whave = 0, r2.window = new Uint8Array(r2.wsize)), n2 >= r2.wsize ? (r2.window.set(t2.subarray(i2 - r2.wsize, i2), 0), r2.wnext = 0, r2.whave = r2.wsize) : (a2 = r2.wsize - r2.wnext, a2 > n2 && (a2 = n2), r2.window.set(t2.subarray(i2 - n2, i2 - n2 + a2), r2.wnext), (n2 -= a2) ? (r2.window.set(t2.subarray(i2 - n2, i2), 0), r2.wnext = n2, r2.whave = r2.wsize) : (r2.wnext += a2, r2.wnext === r2.wsize && (r2.wnext = 0), r2.whave < r2.wsize && (r2.whave += a2))), 0;
        };
        var Y = { inflateReset: z, inflateReset2: F, inflateResetKeep: C, inflateInit: (e2) => L(e2, 15), inflateInit2: L, inflate: (e2, i2) => {
          let a2, o2, s2, l2, d2, f2, h2, B2, C2, z2, F2, L2, M2, H2, j2, Y2, G2, X2, W2, q2, J2, Q2, V2 = 0;
          const $2 = new Uint8Array(4);
          let ee2, te2;
          const ie2 = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
          if (N(e2) || !e2.output || !e2.input && 0 !== e2.avail_in) return g;
          a2 = e2.state, a2.mode === A && (a2.mode = Z), d2 = e2.next_out, s2 = e2.output, h2 = e2.avail_out, l2 = e2.next_in, o2 = e2.input, f2 = e2.avail_in, B2 = a2.hold, C2 = a2.bits, z2 = f2, F2 = h2, Q2 = m;
          e: for (; ; ) switch (a2.mode) {
            case E:
              if (0 === a2.wrap) {
                a2.mode = Z;
                break;
              }
              for (; C2 < 16; ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              if (2 & a2.wrap && 35615 === B2) {
                0 === a2.wbits && (a2.wbits = 15), a2.check = 0, $2[0] = 255 & B2, $2[1] = B2 >>> 8 & 255, a2.check = n(a2.check, $2, 2, 0), B2 = 0, C2 = 0, a2.mode = 16181;
                break;
              }
              if (a2.head && (a2.head.done = false), !(1 & a2.wrap) || (((255 & B2) << 8) + (B2 >> 8)) % 31) {
                e2.msg = "incorrect header check", a2.mode = D;
                break;
              }
              if ((15 & B2) !== y) {
                e2.msg = "unknown compression method", a2.mode = D;
                break;
              }
              if (B2 >>>= 4, C2 -= 4, J2 = 8 + (15 & B2), 0 === a2.wbits && (a2.wbits = J2), J2 > 15 || J2 > a2.wbits) {
                e2.msg = "invalid window size", a2.mode = D;
                break;
              }
              a2.dmax = 1 << a2.wbits, a2.flags = 0, e2.adler = a2.check = 1, a2.mode = 512 & B2 ? 16189 : A, B2 = 0, C2 = 0;
              break;
            case 16181:
              for (; C2 < 16; ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              if (a2.flags = B2, (255 & a2.flags) !== y) {
                e2.msg = "unknown compression method", a2.mode = D;
                break;
              }
              if (57344 & a2.flags) {
                e2.msg = "unknown header flags set", a2.mode = D;
                break;
              }
              a2.head && (a2.head.text = B2 >> 8 & 1), 512 & a2.flags && 4 & a2.wrap && ($2[0] = 255 & B2, $2[1] = B2 >>> 8 & 255, a2.check = n(a2.check, $2, 2, 0)), B2 = 0, C2 = 0, a2.mode = 16182;
            case 16182:
              for (; C2 < 32; ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              a2.head && (a2.head.time = B2), 512 & a2.flags && 4 & a2.wrap && ($2[0] = 255 & B2, $2[1] = B2 >>> 8 & 255, $2[2] = B2 >>> 16 & 255, $2[3] = B2 >>> 24 & 255, a2.check = n(a2.check, $2, 4, 0)), B2 = 0, C2 = 0, a2.mode = 16183;
            case 16183:
              for (; C2 < 16; ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              a2.head && (a2.head.xflags = 255 & B2, a2.head.os = B2 >> 8), 512 & a2.flags && 4 & a2.wrap && ($2[0] = 255 & B2, $2[1] = B2 >>> 8 & 255, a2.check = n(a2.check, $2, 2, 0)), B2 = 0, C2 = 0, a2.mode = 16184;
            case 16184:
              if (1024 & a2.flags) {
                for (; C2 < 16; ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                a2.length = B2, a2.head && (a2.head.extra_len = B2), 512 & a2.flags && 4 & a2.wrap && ($2[0] = 255 & B2, $2[1] = B2 >>> 8 & 255, a2.check = n(a2.check, $2, 2, 0)), B2 = 0, C2 = 0;
              } else a2.head && (a2.head.extra = null);
              a2.mode = 16185;
            case 16185:
              if (1024 & a2.flags && (L2 = a2.length, L2 > f2 && (L2 = f2), L2 && (a2.head && (J2 = a2.head.extra_len - a2.length, a2.head.extra || (a2.head.extra = new Uint8Array(a2.head.extra_len)), a2.head.extra.set(o2.subarray(l2, l2 + L2), J2)), 512 & a2.flags && 4 & a2.wrap && (a2.check = n(a2.check, o2, L2, l2)), f2 -= L2, l2 += L2, a2.length -= L2), a2.length)) break e;
              a2.length = 0, a2.mode = 16186;
            case 16186:
              if (2048 & a2.flags) {
                if (0 === f2) break e;
                L2 = 0;
                do {
                  J2 = o2[l2 + L2++], a2.head && J2 && a2.length < 65536 && (a2.head.name += String.fromCharCode(J2));
                } while (J2 && L2 < f2);
                if (512 & a2.flags && 4 & a2.wrap && (a2.check = n(a2.check, o2, L2, l2)), f2 -= L2, l2 += L2, J2) break e;
              } else a2.head && (a2.head.name = null);
              a2.length = 0, a2.mode = 16187;
            case 16187:
              if (4096 & a2.flags) {
                if (0 === f2) break e;
                L2 = 0;
                do {
                  J2 = o2[l2 + L2++], a2.head && J2 && a2.length < 65536 && (a2.head.comment += String.fromCharCode(J2));
                } while (J2 && L2 < f2);
                if (512 & a2.flags && 4 & a2.wrap && (a2.check = n(a2.check, o2, L2, l2)), f2 -= L2, l2 += L2, J2) break e;
              } else a2.head && (a2.head.comment = null);
              a2.mode = 16188;
            case 16188:
              if (512 & a2.flags) {
                for (; C2 < 16; ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                if (4 & a2.wrap && B2 !== (65535 & a2.check)) {
                  e2.msg = "header crc mismatch", a2.mode = D;
                  break;
                }
                B2 = 0, C2 = 0;
              }
              a2.head && (a2.head.hcrc = a2.flags >> 9 & 1, a2.head.done = true), e2.adler = a2.check = 0, a2.mode = A;
              break;
            case 16189:
              for (; C2 < 32; ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              e2.adler = a2.check = I(B2), B2 = 0, C2 = 0, a2.mode = R;
            case R:
              if (0 === a2.havedict) return e2.next_out = d2, e2.avail_out = h2, e2.next_in = l2, e2.avail_in = f2, a2.hold = B2, a2.bits = C2, _;
              e2.adler = a2.check = 1, a2.mode = A;
            case A:
              if (i2 === w || i2 === b) break e;
            case Z:
              if (a2.last) {
                B2 >>>= 7 & C2, C2 -= 7 & C2, a2.mode = U;
                break;
              }
              for (; C2 < 3; ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              switch (a2.last = 1 & B2, B2 >>>= 1, C2 -= 1, 3 & B2) {
                case 0:
                  a2.mode = 16193;
                  break;
                case 1:
                  if (K(a2), a2.mode = T, i2 === b) {
                    B2 >>>= 2, C2 -= 2;
                    break e;
                  }
                  break;
                case 2:
                  a2.mode = 16196;
                  break;
                case 3:
                  e2.msg = "invalid block type", a2.mode = D;
              }
              B2 >>>= 2, C2 -= 2;
              break;
            case 16193:
              for (B2 >>>= 7 & C2, C2 -= 7 & C2; C2 < 32; ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              if ((65535 & B2) != (B2 >>> 16 ^ 65535)) {
                e2.msg = "invalid stored block lengths", a2.mode = D;
                break;
              }
              if (a2.length = 65535 & B2, B2 = 0, C2 = 0, a2.mode = S, i2 === b) break e;
            case S:
              a2.mode = 16195;
            case 16195:
              if (L2 = a2.length, L2) {
                if (L2 > f2 && (L2 = f2), L2 > h2 && (L2 = h2), 0 === L2) break e;
                s2.set(o2.subarray(l2, l2 + L2), d2), f2 -= L2, l2 += L2, h2 -= L2, d2 += L2, a2.length -= L2;
                break;
              }
              a2.mode = A;
              break;
            case 16196:
              for (; C2 < 14; ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              if (a2.nlen = 257 + (31 & B2), B2 >>>= 5, C2 -= 5, a2.ndist = 1 + (31 & B2), B2 >>>= 5, C2 -= 5, a2.ncode = 4 + (15 & B2), B2 >>>= 4, C2 -= 4, a2.nlen > 286 || a2.ndist > 30) {
                e2.msg = "too many length or distance symbols", a2.mode = D;
                break;
              }
              a2.have = 0, a2.mode = 16197;
            case 16197:
              for (; a2.have < a2.ncode; ) {
                for (; C2 < 3; ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                a2.lens[ie2[a2.have++]] = 7 & B2, B2 >>>= 3, C2 -= 3;
              }
              for (; a2.have < 19; ) a2.lens[ie2[a2.have++]] = 0;
              if (a2.lencode = a2.lendyn, a2.lenbits = 7, ee2 = { bits: a2.lenbits }, Q2 = c(0, a2.lens, 0, 19, a2.lencode, 0, a2.work, ee2), a2.lenbits = ee2.bits, Q2) {
                e2.msg = "invalid code lengths set", a2.mode = D;
                break;
              }
              a2.have = 0, a2.mode = 16198;
            case 16198:
              for (; a2.have < a2.nlen + a2.ndist; ) {
                for (; V2 = a2.lencode[B2 & (1 << a2.lenbits) - 1], j2 = V2 >>> 24, Y2 = V2 >>> 16 & 255, G2 = 65535 & V2, !(j2 <= C2); ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                if (G2 < 16) B2 >>>= j2, C2 -= j2, a2.lens[a2.have++] = G2;
                else {
                  if (16 === G2) {
                    for (te2 = j2 + 2; C2 < te2; ) {
                      if (0 === f2) break e;
                      f2--, B2 += o2[l2++] << C2, C2 += 8;
                    }
                    if (B2 >>>= j2, C2 -= j2, 0 === a2.have) {
                      e2.msg = "invalid bit length repeat", a2.mode = D;
                      break;
                    }
                    J2 = a2.lens[a2.have - 1], L2 = 3 + (3 & B2), B2 >>>= 2, C2 -= 2;
                  } else if (17 === G2) {
                    for (te2 = j2 + 3; C2 < te2; ) {
                      if (0 === f2) break e;
                      f2--, B2 += o2[l2++] << C2, C2 += 8;
                    }
                    B2 >>>= j2, C2 -= j2, J2 = 0, L2 = 3 + (7 & B2), B2 >>>= 3, C2 -= 3;
                  } else {
                    for (te2 = j2 + 7; C2 < te2; ) {
                      if (0 === f2) break e;
                      f2--, B2 += o2[l2++] << C2, C2 += 8;
                    }
                    B2 >>>= j2, C2 -= j2, J2 = 0, L2 = 11 + (127 & B2), B2 >>>= 7, C2 -= 7;
                  }
                  if (a2.have + L2 > a2.nlen + a2.ndist) {
                    e2.msg = "invalid bit length repeat", a2.mode = D;
                    break;
                  }
                  for (; L2--; ) a2.lens[a2.have++] = J2;
                }
              }
              if (a2.mode === D) break;
              if (0 === a2.lens[256]) {
                e2.msg = "invalid code -- missing end-of-block", a2.mode = D;
                break;
              }
              if (a2.lenbits = 9, ee2 = { bits: a2.lenbits }, Q2 = c(1, a2.lens, 0, a2.nlen, a2.lencode, 0, a2.work, ee2), a2.lenbits = ee2.bits, Q2) {
                e2.msg = "invalid literal/lengths set", a2.mode = D;
                break;
              }
              if (a2.distbits = 6, a2.distcode = a2.distdyn, ee2 = { bits: a2.distbits }, Q2 = c(2, a2.lens, a2.nlen, a2.ndist, a2.distcode, 0, a2.work, ee2), a2.distbits = ee2.bits, Q2) {
                e2.msg = "invalid distances set", a2.mode = D;
                break;
              }
              if (a2.mode = T, i2 === b) break e;
            case T:
              a2.mode = O;
            case O:
              if (f2 >= 6 && h2 >= 258) {
                e2.next_out = d2, e2.avail_out = h2, e2.next_in = l2, e2.avail_in = f2, a2.hold = B2, a2.bits = C2, r(e2, F2), d2 = e2.next_out, s2 = e2.output, h2 = e2.avail_out, l2 = e2.next_in, o2 = e2.input, f2 = e2.avail_in, B2 = a2.hold, C2 = a2.bits, a2.mode === A && (a2.back = -1);
                break;
              }
              for (a2.back = 0; V2 = a2.lencode[B2 & (1 << a2.lenbits) - 1], j2 = V2 >>> 24, Y2 = V2 >>> 16 & 255, G2 = 65535 & V2, !(j2 <= C2); ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              if (Y2 && 0 == (240 & Y2)) {
                for (X2 = j2, W2 = Y2, q2 = G2; V2 = a2.lencode[q2 + ((B2 & (1 << X2 + W2) - 1) >> X2)], j2 = V2 >>> 24, Y2 = V2 >>> 16 & 255, G2 = 65535 & V2, !(X2 + j2 <= C2); ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                B2 >>>= X2, C2 -= X2, a2.back += X2;
              }
              if (B2 >>>= j2, C2 -= j2, a2.back += j2, a2.length = G2, 0 === Y2) {
                a2.mode = 16205;
                break;
              }
              if (32 & Y2) {
                a2.back = -1, a2.mode = A;
                break;
              }
              if (64 & Y2) {
                e2.msg = "invalid literal/length code", a2.mode = D;
                break;
              }
              a2.extra = 15 & Y2, a2.mode = 16201;
            case 16201:
              if (a2.extra) {
                for (te2 = a2.extra; C2 < te2; ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                a2.length += B2 & (1 << a2.extra) - 1, B2 >>>= a2.extra, C2 -= a2.extra, a2.back += a2.extra;
              }
              a2.was = a2.length, a2.mode = 16202;
            case 16202:
              for (; V2 = a2.distcode[B2 & (1 << a2.distbits) - 1], j2 = V2 >>> 24, Y2 = V2 >>> 16 & 255, G2 = 65535 & V2, !(j2 <= C2); ) {
                if (0 === f2) break e;
                f2--, B2 += o2[l2++] << C2, C2 += 8;
              }
              if (0 == (240 & Y2)) {
                for (X2 = j2, W2 = Y2, q2 = G2; V2 = a2.distcode[q2 + ((B2 & (1 << X2 + W2) - 1) >> X2)], j2 = V2 >>> 24, Y2 = V2 >>> 16 & 255, G2 = 65535 & V2, !(X2 + j2 <= C2); ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                B2 >>>= X2, C2 -= X2, a2.back += X2;
              }
              if (B2 >>>= j2, C2 -= j2, a2.back += j2, 64 & Y2) {
                e2.msg = "invalid distance code", a2.mode = D;
                break;
              }
              a2.offset = G2, a2.extra = 15 & Y2, a2.mode = 16203;
            case 16203:
              if (a2.extra) {
                for (te2 = a2.extra; C2 < te2; ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                a2.offset += B2 & (1 << a2.extra) - 1, B2 >>>= a2.extra, C2 -= a2.extra, a2.back += a2.extra;
              }
              if (a2.offset > a2.dmax) {
                e2.msg = "invalid distance too far back", a2.mode = D;
                break;
              }
              a2.mode = 16204;
            case 16204:
              if (0 === h2) break e;
              if (L2 = F2 - h2, a2.offset > L2) {
                if (L2 = a2.offset - L2, L2 > a2.whave && a2.sane) {
                  e2.msg = "invalid distance too far back", a2.mode = D;
                  break;
                }
                L2 > a2.wnext ? (L2 -= a2.wnext, M2 = a2.wsize - L2) : M2 = a2.wnext - L2, L2 > a2.length && (L2 = a2.length), H2 = a2.window;
              } else H2 = s2, M2 = d2 - a2.offset, L2 = a2.length;
              L2 > h2 && (L2 = h2), h2 -= L2, a2.length -= L2;
              do {
                s2[d2++] = H2[M2++];
              } while (--L2);
              0 === a2.length && (a2.mode = O);
              break;
            case 16205:
              if (0 === h2) break e;
              s2[d2++] = a2.length, h2--, a2.mode = O;
              break;
            case U:
              if (a2.wrap) {
                for (; C2 < 32; ) {
                  if (0 === f2) break e;
                  f2--, B2 |= o2[l2++] << C2, C2 += 8;
                }
                if (F2 -= h2, e2.total_out += F2, a2.total += F2, 4 & a2.wrap && F2 && (e2.adler = a2.check = a2.flags ? n(a2.check, s2, F2, d2 - F2) : t(a2.check, s2, F2, d2 - F2)), F2 = h2, 4 & a2.wrap && (a2.flags ? B2 : I(B2)) !== a2.check) {
                  e2.msg = "incorrect data check", a2.mode = D;
                  break;
                }
                B2 = 0, C2 = 0;
              }
              a2.mode = 16207;
            case 16207:
              if (a2.wrap && a2.flags) {
                for (; C2 < 32; ) {
                  if (0 === f2) break e;
                  f2--, B2 += o2[l2++] << C2, C2 += 8;
                }
                if (4 & a2.wrap && B2 !== (4294967295 & a2.total)) {
                  e2.msg = "incorrect length check", a2.mode = D;
                  break;
                }
                B2 = 0, C2 = 0;
              }
              a2.mode = 16208;
            case 16208:
              Q2 = k;
              break e;
            case D:
              Q2 = p;
              break e;
            case 16210:
              return v;
            default:
              return g;
          }
          return e2.next_out = d2, e2.avail_out = h2, e2.next_in = l2, e2.avail_in = f2, a2.hold = B2, a2.bits = C2, (a2.wsize || F2 !== e2.avail_out && a2.mode < D && (a2.mode < U || i2 !== u)) && P(e2, e2.output, e2.next_out, F2 - e2.avail_out), z2 -= e2.avail_in, F2 -= e2.avail_out, e2.total_in += z2, e2.total_out += F2, a2.total += F2, 4 & a2.wrap && F2 && (e2.adler = a2.check = a2.flags ? n(a2.check, s2, F2, e2.next_out - F2) : t(a2.check, s2, F2, e2.next_out - F2)), e2.data_type = a2.bits + (a2.last ? 64 : 0) + (a2.mode === A ? 128 : 0) + (a2.mode === T || a2.mode === S ? 256 : 0), (0 === z2 && 0 === F2 || i2 === u) && Q2 === m && (Q2 = x), Q2;
        }, inflateEnd: (e2) => {
          if (N(e2)) return g;
          let t2 = e2.state;
          return t2.window && (t2.window = null), e2.state = null, m;
        }, inflateGetHeader: (e2, t2) => {
          if (N(e2)) return g;
          const i2 = e2.state;
          return 0 == (2 & i2.wrap) ? g : (i2.head = t2, t2.done = false, m);
        }, inflateSetDictionary: (e2, i2) => {
          const n2 = i2.length;
          let a2, r2, o2;
          return N(e2) ? g : (a2 = e2.state, 0 !== a2.wrap && a2.mode !== R ? g : a2.mode === R && (r2 = 1, r2 = t(r2, i2, n2, 0), r2 !== a2.check) ? p : (o2 = P(e2, i2, n2, n2), o2 ? (a2.mode = 16210, v) : (a2.havedict = 1, m)));
        }, inflateInfo: "pako inflate (from Nodeca project)" };
        const G = (e2, t2) => Object.prototype.hasOwnProperty.call(e2, t2);
        var X = function(e2) {
          const t2 = Array.prototype.slice.call(arguments, 1);
          for (; t2.length; ) {
            const i2 = t2.shift();
            if (i2) {
              if ("object" != typeof i2) throw new TypeError(i2 + "must be non-object");
              for (const t3 in i2) G(i2, t3) && (e2[t3] = i2[t3]);
            }
          }
          return e2;
        }, W = (e2) => {
          let t2 = 0;
          for (let i3 = 0, n2 = e2.length; i3 < n2; i3++) t2 += e2[i3].length;
          const i2 = new Uint8Array(t2);
          for (let t3 = 0, n2 = 0, a2 = e2.length; t3 < a2; t3++) {
            let a3 = e2[t3];
            i2.set(a3, n2), n2 += a3.length;
          }
          return i2;
        };
        let q = true;
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (e2) {
          q = false;
        }
        const J = new Uint8Array(256);
        for (let e2 = 0; e2 < 256; e2++) J[e2] = e2 >= 252 ? 6 : e2 >= 248 ? 5 : e2 >= 240 ? 4 : e2 >= 224 ? 3 : e2 >= 192 ? 2 : 1;
        J[254] = J[254] = 1;
        var Q = (e2) => {
          if ("function" == typeof TextEncoder && TextEncoder.prototype.encode) return new TextEncoder().encode(e2);
          let t2, i2, n2, a2, r2, o2 = e2.length, s2 = 0;
          for (a2 = 0; a2 < o2; a2++) i2 = e2.charCodeAt(a2), 55296 == (64512 & i2) && a2 + 1 < o2 && (n2 = e2.charCodeAt(a2 + 1), 56320 == (64512 & n2) && (i2 = 65536 + (i2 - 55296 << 10) + (n2 - 56320), a2++)), s2 += i2 < 128 ? 1 : i2 < 2048 ? 2 : i2 < 65536 ? 3 : 4;
          for (t2 = new Uint8Array(s2), r2 = 0, a2 = 0; r2 < s2; a2++) i2 = e2.charCodeAt(a2), 55296 == (64512 & i2) && a2 + 1 < o2 && (n2 = e2.charCodeAt(a2 + 1), 56320 == (64512 & n2) && (i2 = 65536 + (i2 - 55296 << 10) + (n2 - 56320), a2++)), i2 < 128 ? t2[r2++] = i2 : i2 < 2048 ? (t2[r2++] = 192 | i2 >>> 6, t2[r2++] = 128 | 63 & i2) : i2 < 65536 ? (t2[r2++] = 224 | i2 >>> 12, t2[r2++] = 128 | i2 >>> 6 & 63, t2[r2++] = 128 | 63 & i2) : (t2[r2++] = 240 | i2 >>> 18, t2[r2++] = 128 | i2 >>> 12 & 63, t2[r2++] = 128 | i2 >>> 6 & 63, t2[r2++] = 128 | 63 & i2);
          return t2;
        }, V = (e2, t2) => {
          const i2 = t2 || e2.length;
          if ("function" == typeof TextDecoder && TextDecoder.prototype.decode) return new TextDecoder().decode(e2.subarray(0, t2));
          let n2, a2;
          const r2 = new Array(2 * i2);
          for (a2 = 0, n2 = 0; n2 < i2; ) {
            let t3 = e2[n2++];
            if (t3 < 128) {
              r2[a2++] = t3;
              continue;
            }
            let o2 = J[t3];
            if (o2 > 4) r2[a2++] = 65533, n2 += o2 - 1;
            else {
              for (t3 &= 2 === o2 ? 31 : 3 === o2 ? 15 : 7; o2 > 1 && n2 < i2; ) t3 = t3 << 6 | 63 & e2[n2++], o2--;
              o2 > 1 ? r2[a2++] = 65533 : t3 < 65536 ? r2[a2++] = t3 : (t3 -= 65536, r2[a2++] = 55296 | t3 >> 10 & 1023, r2[a2++] = 56320 | 1023 & t3);
            }
          }
          return ((e3, t3) => {
            if (t3 < 65534 && e3.subarray && q) return String.fromCharCode.apply(null, e3.length === t3 ? e3 : e3.subarray(0, t3));
            let i3 = "";
            for (let n3 = 0; n3 < t3; n3++) i3 += String.fromCharCode(e3[n3]);
            return i3;
          })(r2, a2);
        }, $ = (e2, t2) => {
          (t2 = t2 || e2.length) > e2.length && (t2 = e2.length);
          let i2 = t2 - 1;
          for (; i2 >= 0 && 128 == (192 & e2[i2]); ) i2--;
          return i2 < 0 || 0 === i2 ? t2 : i2 + J[e2[i2]] > t2 ? i2 : t2;
        }, ee = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
        var te = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
        var ie = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
        };
        const ne = Object.prototype.toString, { Z_NO_FLUSH: ae, Z_FINISH: re, Z_OK: oe, Z_STREAM_END: se, Z_NEED_DICT: le, Z_STREAM_ERROR: de, Z_DATA_ERROR: fe, Z_MEM_ERROR: ce } = h;
        function he(e2) {
          this.options = X({ chunkSize: 65536, windowBits: 15, to: "" }, e2 || {});
          const t2 = this.options;
          t2.raw && t2.windowBits >= 0 && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(t2.windowBits >= 0 && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), t2.windowBits > 15 && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new te(), this.strm.avail_out = 0;
          let i2 = Y.inflateInit2(this.strm, t2.windowBits);
          if (i2 !== oe) throw new Error(ee[i2]);
          if (this.header = new ie(), Y.inflateGetHeader(this.strm, this.header), t2.dictionary && ("string" == typeof t2.dictionary ? t2.dictionary = Q(t2.dictionary) : "[object ArrayBuffer]" === ne.call(t2.dictionary) && (t2.dictionary = new Uint8Array(t2.dictionary)), t2.raw && (i2 = Y.inflateSetDictionary(this.strm, t2.dictionary), i2 !== oe))) throw new Error(ee[i2]);
        }
        function ue(e2, t2) {
          const i2 = new he(t2);
          if (i2.push(e2), i2.err) throw i2.msg || ee[i2.err];
          return i2.result;
        }
        he.prototype.push = function(e2, t2) {
          const i2 = this.strm, n2 = this.options.chunkSize, a2 = this.options.dictionary;
          let r2, o2, s2;
          if (this.ended) return false;
          for (o2 = t2 === ~~t2 ? t2 : true === t2 ? re : ae, "[object ArrayBuffer]" === ne.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length; ; ) {
            for (0 === i2.avail_out && (i2.output = new Uint8Array(n2), i2.next_out = 0, i2.avail_out = n2), r2 = Y.inflate(i2, o2), r2 === le && a2 && (r2 = Y.inflateSetDictionary(i2, a2), r2 === oe ? r2 = Y.inflate(i2, o2) : r2 === fe && (r2 = le)); i2.avail_in > 0 && r2 === se && i2.state.wrap > 0 && 0 !== e2[i2.next_in]; ) Y.inflateReset(i2), r2 = Y.inflate(i2, o2);
            switch (r2) {
              case de:
              case fe:
              case le:
              case ce:
                return this.onEnd(r2), this.ended = true, false;
            }
            if (s2 = i2.avail_out, i2.next_out && (0 === i2.avail_out || r2 === se)) if ("string" === this.options.to) {
              let e3 = $(i2.output, i2.next_out), t3 = i2.next_out - e3, a3 = V(i2.output, e3);
              i2.next_out = t3, i2.avail_out = n2 - t3, t3 && i2.output.set(i2.output.subarray(e3, e3 + t3), 0), this.onData(a3);
            } else this.onData(i2.output.length === i2.next_out ? i2.output : i2.output.subarray(0, i2.next_out));
            if (r2 !== oe || 0 !== s2) {
              if (r2 === se) return r2 = Y.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, true;
              if (0 === i2.avail_in) break;
            }
          }
          return true;
        }, he.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, he.prototype.onEnd = function(e2) {
          e2 === oe && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = W(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        };
        var we = he, be = ue, me = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, ue(e2, t2);
        }, ke = ue, _e = h, ge = { Inflate: we, inflate: be, inflateRaw: me, ungzip: ke, constants: _e };
        e.Inflate = we, e.constants = _e, e.default = ge, e.inflate = be, e.inflateRaw = me, e.ungzip = ke, Object.defineProperty(e, "__esModule", { value: true });
      }));
    }
  });

  // lyrics-island/index.js
  var require_index = __commonJS({
    "lyrics-island/index.js"(exports, module) {
      "use strict";
      var KUGOU_LYRICS_ROOT = "https://lyrics.kugou.com";
      var POLL_INTERVAL_MS = 1e3;
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
        if (value === null || value === void 0) return "";
        return String(value);
      }
      function trimString(value) {
        return asString(value).trim();
      }
      function toNumber(value, fallback) {
        if (value === null || value === void 0 || value === "") return fallback;
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
          "\u9084": "\u8FD8",
          "\u6703": "\u4F1A",
          "\u958B": "\u5F00",
          "\u8072": "\u58F0",
          "\u7D66": "\u7ED9",
          "\u55AE": "\u5355",
          "\u64A5": "\u62E8",
          "\u9727": "\u96FE",
          "\u904E": "\u8FC7",
          "\u88E1": "\u91CC",
          "\u9019": "\u8FD9",
          "\u500B": "\u4E2A",
          "\u5011": "\u4EEC",
          "\u4F86": "\u6765",
          "\u6642": "\u65F6",
          "\u8AAA": "\u8BF4",
          "\u807D": "\u542C",
          "\u611B": "\u7231",
          "\u5922": "\u68A6",
          "\u98A8": "\u98CE",
          "\u96E2": "\u79BB",
          "\u8B93": "\u8BA9",
          "\u5F8C": "\u540E",
          "\u5F9E": "\u4ECE",
          "\u5C0D": "\u5BF9",
          "\u70BA": "\u4E3A",
          "\u8207": "\u4E0E",
          "\u7121": "\u65E0",
          "\u9EDE": "\u70B9",
          "\u7E3D": "\u603B",
          "\u7576": "\u5F53",
          "\u898B": "\u89C1",
          "\u9577": "\u957F",
          "\u9593": "\u95F4",
          "\u96E3": "\u96BE",
          "\u6A23": "\u6837",
          "\u767C": "\u53D1",
          "\u73FE": "\u73B0",
          "\u842C": "\u4E07",
          "\u6B72": "\u5C81",
          "\u570B": "\u56FD",
          "\u756B": "\u753B",
          "\u8A5E": "\u8BCD",
          "\u6A02": "\u4E50",
          "\u982D": "\u5934",
          "\u9032": "\u8FDB",
          "\u9060": "\u8FDC",
          "\u7D42": "\u7EC8",
          "\u8A18": "\u8BB0",
          "\u932F": "\u9519",
          "\u9858": "\u613F",
          "\u6DDA": "\u6CEA",
          "\u820A": "\u65E7",
          "\u9AD4": "\u4F53",
          "\u9580": "\u95E8",
          "\u554F": "\u95EE",
          "\u8655": "\u5904",
          "\u5225": "\u522B",
          "\u5BEB": "\u5199",
          "\u96BB": "\u53EA",
          "\u96D9": "\u53CC",
          "\u89AA": "\u4EB2",
          "\u96F2": "\u4E91",
          "\u8F49": "\u8F6C",
          "\u52D5": "\u52A8"
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
            logWarning("\u7B80\u4F53\u8F6C\u6362\u5668\u521D\u59CB\u5316\u5931\u8D25\uFF0C\u4F7F\u7528\u8F7B\u91CF\u8F6C\u6362");
          }
        }
        if (traditionalToSimplifiedConverter) {
          try {
            return traditionalToSimplifiedConverter(text);
          } catch (error) {
          }
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
        return value === null || value === void 0 ? fallback : value;
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
        return trimString(value).toLowerCase().replace(/[\u2018\u2019\u201c\u201d]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
      }
      function cleanTrackTitle(value) {
        var title = trimString(value);
        if (!settingBool("cleanVideoTitles", true)) return title;
        title = title.replace(/\s*[\[(]\s*(official\s*)?(music\s*)?(video|audio|mv|visuali[sz]er|lyrics?|lyric\s*video|hd|4k)\s*[\])]\s*/gi, " ").replace(/\s*[-|]\s*(official\s*)?(music\s*)?(video|audio|mv|visuali[sz]er|lyrics?|lyric\s*video)\s*$/gi, "").replace(/\s+/g, " ").trim();
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
          title,
          artist,
          album,
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
        if (snapshot.clockAuthoritative === true) {
          clock.initialized = true;
          clock.identity = nextIdentity;
          clock.positionSeconds = observed + (playing ? Math.max(0, now - capturedAt) / 1e3 * rate : 0);
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
        var wallDelta = Math.max(0, (now - clock.updatedAtEpochMs) / 1e3);
        var captureDelta = Math.max(0, (capturedAt - clock.observedCapturedAtEpochMs) / 1e3);
        var observedDelta = observed - clock.observedElapsedSeconds;
        var observationChanged = Math.abs(observedDelta) >= 0.02;
        var observationJumped = observedDelta < -0.2 || observedDelta > 5;
        if (playing) {
          if (observationChanged) {
            clock.positionSeconds = observed;
          } else {
            clock.positionSeconds += (captureDelta > 0 ? captureDelta : wallDelta) * clock.rate;
          }
        } else if (observationChanged || observationJumped) {
          clock.positionSeconds = observed;
        } else if (clock.playing && wallDelta > 0) {
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
            clockElapsed += (now - clock.updatedAtEpochMs) / 1e3 * clock.rate;
          }
          var clockDuration = toNumber(snapshot.durationSeconds, 0);
          return clockDuration > 0 ? clamp(clockElapsed, 0, clockDuration) : Math.max(0, clockElapsed);
        }
        var elapsed = Math.max(0, toNumber(snapshot.elapsedSeconds, 0));
        var capturedAt = toNumber(snapshot.capturedAtEpochMs, atEpochMs || Date.now());
        if (isPlaying(snapshot) && capturedAt > 0 && now > capturedAt) {
          elapsed += (now - capturedAt) / 1e3 * Math.max(0.01, toNumber(snapshot.playbackRate, 1));
        }
        var duration = toNumber(snapshot.durationSeconds, 0);
        return duration > 0 ? clamp(elapsed, 0, duration) : elapsed;
      }
      function parseLrc(value) {
        var rows = asString(value).split(/\r?\n/);
        var offsetTag = asString(value).match(/\[offset:\s*([+-]?\d+)\s*\]/i);
        var fileOffset = offsetTag ? toNumber(offsetTag[1], 0) / 1e3 : 0;
        var parsed = [];
        var i;
        for (i = 0; i < rows.length; i += 1) {
          var row = rows[i];
          var timestampPattern = /\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]/g;
          var timestamps = [];
          var match;
          while ((match = timestampPattern.exec(row)) !== null) {
            timestamps.push(Math.max(0, Number(match[1]) * 60 + Number(match[2]) - fileOffset));
          }
          if (!timestamps.length) continue;
          var text = row.replace(/\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]/g, "").trim();
          if (!text) text = "\u266A";
          var j;
          for (j = 0; j < timestamps.length; j += 1) {
            parsed.push({ time: timestamps[j], text });
          }
        }
        parsed.sort(function(a, b) {
          return a.time - b.time;
        });
        var deduped = [];
        for (i = 0; i < parsed.length; i += 1) {
          var previous = deduped.length ? deduped[deduped.length - 1] : null;
          if (previous && Math.abs(previous.time - parsed[i].time) < 1e-3 && previous.text === parsed[i].text) continue;
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
        var shift = offset ? Number(offset[1]) / 1e3 : 0;
        var lines = [];
        text.split(/\r?\n/).slice(0, 2e3).forEach(function(row) {
          if (row.length > 8192) return;
          var match = row.match(/^\s*\[(\d+),(\d+)\](.*)$/);
          if (!match) return;
          var words = [], word, pattern = /([\s\S]*?)\((\d+),(\d+)\)/g;
          while ((word = pattern.exec(match[3])) !== null) {
            words.push({
              text: word[1],
              time: Math.max(0, Number(word[2]) / 1e3 - shift),
              endTime: Math.max(0, (Number(word[2]) + Number(word[3])) / 1e3 - shift)
            });
          }
          var lineText = match[3].replace(/\(\d+,\d+\)/g, "");
          if (words.map(function(item) {
            return item.text;
          }).join("") !== lineText) words = [];
          if (!lineText.trim()) return;
          lines.push({ time: Math.max(0, Number(match[1]) / 1e3 - shift), text: lineText, words });
        });
        return lines.sort(function(a, b) {
          return a.time - b.time;
        });
      }
      function qrcAsLrc(lines) {
        return lines.map(function(line) {
          var minute = Math.floor(line.time / 60), second = (line.time - minute * 60).toFixed(3);
          return "[" + minute + ":" + (Number(second) < 10 ? "0" : "") + second + "]" + line.text;
        }).join("\n");
      }
      function parsePlainLyrics(value) {
        return asString(value).split(/\r?\n/).map(function(line) {
          return trimString(line);
        }).filter(function(line) {
          return !!line;
        }).slice(0, MAX_PLAIN_LINES);
      }
      function kugouDurationSeconds(candidate) {
        var value = Math.max(0, toNumber(candidate && candidate.duration, 0));
        return value > 1e4 ? value / 1e3 : value;
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
          return { candidate, score: scoreKugouCandidate(candidate, metadata) };
        }).filter(function(item) {
          return item.score >= 28;
        }).sort(function(left, right) {
          return right.score - left.score;
        }).map(function(item) {
          return item.candidate;
        });
      }
      function parseJSONOrJSONP(text) {
        try {
          return JSON.parse(text);
        } catch (error) {
        }
        var wrapper = trimString(text).match(/^[\w.]+\s*\(\s*([\s\S]*)\s*\)\s*;?$/);
        if (wrapper) {
          try {
            return JSON.parse(wrapper[1]);
          } catch (error) {
          }
        }
        return null;
      }
      function parseHttpData(response) {
        if (!response) return null;
        if (response.data !== null && response.data !== void 0) {
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
            error: trimString(error && error.message ? error.message : error) || "\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25"
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
          bytes.push(first << 2 | second >> 4);
          if (thirdCharacter !== "=") bytes.push((second & 15) << 4 | third >> 2);
          if (fourthCharacter !== "=") bytes.push((third & 3) << 6 | fourth);
        }
        var output = "";
        for (index = 0; index < bytes.length; ) {
          var byte = bytes[index++];
          if (byte < 128) {
            output += String.fromCharCode(byte);
          } else if (byte < 224 && index < bytes.length) {
            output += String.fromCharCode((byte & 31) << 6 | bytes[index++] & 63);
          } else if (byte < 240 && index + 1 < bytes.length) {
            output += String.fromCharCode((byte & 15) << 12 | (bytes[index++] & 63) << 6 | bytes[index++] & 63);
          } else if (index + 2 < bytes.length) {
            var codePoint = (byte & 7) << 18 | (bytes[index++] & 63) << 12 | (bytes[index++] & 63) << 6 | bytes[index++] & 63;
            codePoint -= 65536;
            output += String.fromCharCode(55296 + (codePoint >> 10), 56320 + (codePoint & 1023));
          }
        }
        return output;
      }
      function scoreQQCandidate(song, metadata) {
        if (!song || !trimString(song.mid) || normalizedText(song.name || song.title) !== normalizedText(metadata.title)) return -Infinity;
        var artists = (Array.isArray(song.singer) ? song.singer : []).map(function(item) {
          return trimString(item.name);
        });
        var artist = normalizedText(artists.join(" "));
        var wantedArtist = normalizedText(metadata.artist);
        if (wantedArtist && (!artist || artist !== wantedArtist && artist.indexOf(wantedArtist) < 0)) return -Infinity;
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
            flattened.push({ song: item, score });
          });
        });
        return flattened.sort(function(a, b) {
          return b.score - a.score;
        }).map(function(item) {
          return item.song;
        });
      }
      async function lookupQQLyrics(metadata) {
        var headers = { "Referer": "https://y.qq.com/", "Content-Type": "application/json" };
        var search = await requestJSON("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          method: "POST",
          headers,
          body: JSON.stringify({
            comm: { ct: 11, cv: "1003006" },
            req_1: {
              module: "music.search.SearchCgiService",
              method: "DoSearchForQQMusicLite",
              param: {
                num_per_page: 20,
                page_num: 1,
                query: [metadata.artist, metadata.title].filter(Boolean).join(" "),
                search_type: 7,
                remoteplace: "search.android.keyboard",
                grp: 1
              }
            }
          })
        });
        var section = search.data && search.data.req_1;
        var body = section && section.data && section.data.body;
        if (!section || section.code !== 0 || !body) return null;
        var songs = rankedQQCandidates(body.item_song || body.song && body.song.list, metadata).slice(0, 3);
        for (var i = 0; i < songs.length; i += 1) {
          var song = songs[i];
          var qrc = "", lrc = "";
          if (toNumber(song.id, 0) > 0 && typeof globalThis.__superIslandDecodeQRC === "function") {
            try {
              var wordResult = await requestJSON("https://u.y.qq.com/cgi-bin/musicu.fcg", {
                method: "POST",
                headers,
                body: JSON.stringify({ comm: { ct: 11, cv: "1003006" }, req_1: {
                  module: "music.musichallSong.PlayLyricInfo",
                  method: "GetPlayLyricInfo",
                  param: {
                    songID: Number(song.id),
                    qrc: 1,
                    crypt: 1,
                    ct: 19,
                    cv: 2111,
                    lrc_t: 0,
                    qrc_t: 0,
                    trans: 0,
                    roma: 0,
                    type: 0
                  }
                } })
              });
              var wordSection = wordResult.data && wordResult.data.req_1;
              if (wordSection && wordSection.code === 0 && wordSection.data && wordSection.data.lyric) {
                var decoded = globalThis.__superIslandDecodeQRC(wordSection.data.lyric);
                var wordLines = parseQrc(decoded);
                if (wordLines.some(function(line) {
                  return line.words.length > 1;
                })) {
                  qrc = decoded;
                  lrc = qrcAsLrc(wordLines);
                }
              }
            } catch (error) {
              logWarning("\u9010\u5B57\u6B4C\u8BCD\u6682\u4E0D\u53EF\u7528\uFF0C\u7EE7\u7EED\u8BFB\u53D6\u9010\u884C\u6B4C\u8BCD");
            }
          }
          if (!lrc) {
            var download = await requestJSON("https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?" + [
              encodedPair("songmid", song.mid),
              encodedPair("format", "jsonp"),
              encodedPair("callback", "MusicJsonCallback_lrc"),
              encodedPair("platform", "yqq"),
              encodedPair("needNewCode", 0)
            ].join("&"), { headers });
            var data = asObject(download.data) || {};
            if (data.code !== 0) continue;
            lrc = decodeBase64Utf8(data.lyric);
          }
          if (!parseLrc(lrc).length) continue;
          return { payload: {
            trackName: trimString(song.name || song.title),
            artistName: song.singer.map(function(item) {
              return trimString(item.name);
            }).join(" / "),
            albumName: trimString(song.album && (song.album.name || song.album.title)),
            duration: toNumber(song.interval, 0),
            instrumental: false,
            plainLyrics: "",
            syncedLyrics: lrc,
            lyricSource: "qqmusic",
            wordSyncedLyrics: qrc
          }, metadata, source: "qqmusic" };
        }
        return null;
      }
      function timelinesAgree(left, right) {
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
          if (votes > support) {
            best = index;
            support = votes;
          }
        });
        return documents[support >= 2 ? best : 0];
      }
      async function lookupLyricsPayload(snapshot) {
        var metadata = lookupMetadata(snapshot);
        if (!metadata.title) {
          return { error: "\u5F53\u524D\u5A92\u4F53\u6CA1\u6709\u6B4C\u66F2\u6807\u9898" };
        }
        if (trimString(snapshot.bundleIdentifier).indexOf("com.tencent.QQMusic") === 0) {
          var qq = await lookupQQLyrics(metadata);
          if (qq) return qq;
          logWarning("QQ \u97F3\u4E50\u6B4C\u8BCD\u4E0D\u53EF\u7528\uFF0C\u5C1D\u8BD5\u5907\u7528\u6B4C\u8BCD\u6E90");
        }
        var keyword = [metadata.artist, metadata.title].filter(Boolean).join(" - ");
        var searchPairs = [
          encodedPair("ver", 1),
          encodedPair("man", "yes"),
          encodedPair("client", "pc"),
          encodedPair("keyword", keyword || metadata.title)
        ];
        if (metadata.duration > 0) searchPairs.push(encodedPair("duration", metadata.duration * 1e3));
        var search = await requestJSON(KUGOU_LYRICS_ROOT + "/search?" + searchPairs.join("&"));
        if (search.status === 429) return { error: "\u9177\u72D7\u6B4C\u8BCD\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5" };
        if (search.status === 0 && search.error) return { error: search.error };
        var searchData = asObject(search.data) || {};
        var candidates = rankedKugouCandidates(searchData.candidates, metadata).slice(0, 4);
        if (!candidates.length) return { error: "\u9177\u72D7\u6CA1\u6709\u627E\u5230\u5339\u914D\u7684\u6B4C\u8BCD" };
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
              syncedLyrics,
              lyricSource: "kugou"
            },
            metadata,
            source: "kugou"
          } });
        }
        var selected = selectKugouDocument(documents);
        if (selected) return selected.result;
        return { error: "\u9177\u72D7\u6B4C\u8BCD\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5" };
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
        state.cacheOrder = state.cacheOrder.filter(function(existingKey) {
          return existingKey !== key;
        });
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
        if (wordSynced.some(function(line) {
          return line.words.length > 1;
        })) synced = wordSynced;
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
            SuperIsland.island.select();
          }
        } catch (error) {
          logWarning("\u65E0\u6CD5\u66F4\u65B0\u6B4C\u8BCD\u5C9B\u663E\u793A\u72B6\u6001");
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
        if (!force && settingBool("cacheLyrics", true) && asObject(state.cache[key]) && payloadMatchesSnapshot(state.cache[key], snapshot)) {
          applyLyricsPayload(state.cache[key], key, "cache");
          maybeRevealForNewTrack();
          return;
        }
        var result = await lookupLyricsPayload(snapshot);
        if (serial !== state.requestSerial || key !== state.lyricsKey) return;
        var live = asObject(SuperIsland.system.getNowPlaying());
        if (!live || lyricsCacheKey(live) !== key) {
          void tick();
          return;
        }
        if (result && result.payload && payloadMatchesSnapshot(result.payload, snapshot)) {
          applyLyricsPayload(result.payload, key, result.source);
          logInfo("\u5DF2\u5339\u914D\u6B4C\u8BCD\uFF1A" + trimString(result.payload.trackName));
          maybeRevealForNewTrack();
          return;
        }
        clearLyrics("missing");
        state.errorMessage = trimString(result && result.error) || "\u6CA1\u6709\u627E\u5230\u5339\u914D\u7684\u6B4C\u8BCD";
        logWarning(state.errorMessage);
      }
      function payloadMatchesSnapshot(payload, snapshot) {
        var metadata = lookupMetadata(snapshot);
        return scoreKugouCandidate({
          id: "validation",
          accesskey: "validation",
          song: payload.trackName,
          singer: payload.artistName,
          duration: payload.duration
        }, metadata) >= 28;
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
        if (state.syncedLines.length) return "\u266A " + simplifyChinese(trimString(state.snapshot && state.snapshot.title));
        return "";
      }
      function truncateText(value, maximumLength) {
        var text = trimString(value);
        var limit = Math.max(1, Math.floor(toNumber(maximumLength, 18)));
        if (text.length <= limit) return text;
        return text.slice(0, Math.max(1, limit - 1)) + "\u2026";
      }
      function adjustTrackOffset(delta) {
        if (!state.lyricsKey) return;
        var next = clamp(currentTrackOffset() + delta, -10, 10);
        next = Math.round(next * 10) / 10;
        state.trackOffsets[trackOffsetKey(state.snapshot)] = next;
        storeSet("trackOffsets", state.trackOffsets);
        try {
          SuperIsland.playFeedback("selection");
        } catch (error) {
        }
      }
      function resetTrackOffset() {
        if (!state.lyricsKey) return;
        delete state.trackOffsets[trackOffsetKey(state.snapshot)];
        storeSet("trackOffsets", state.trackOffsets);
        try {
          SuperIsland.playFeedback("selection");
        } catch (error) {
        }
      }
      function loadPersistedState() {
        var persistedVersion = toNumber(storeGet("cacheSchemaVersion", 0), 0);
        state.cache = persistedVersion === CACHE_SCHEMA_VERSION ? asObject(storeGet("lyricsCache", {})) || {} : {};
        state.cacheOrder = persistedVersion === CACHE_SCHEMA_VERSION ? storeGet("lyricsCacheOrder", []) : [];
        if (!Array.isArray(state.cacheOrder)) state.cacheOrder = [];
        state.trackOffsets = asObject(storeGet("trackOffsets", {})) || {};
        var interfaceMigrationVersion = toNumber(storeGet("interfaceMigrationVersion", 0), 0);
        if (interfaceMigrationVersion < 4 && typeof SuperIsland.settings.set === "function") {
          if (Math.abs(settingNumber("globalOffsetSeconds", 0) - 0.4) < 1e-3) {
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
              SuperIsland.system && typeof SuperIsland.system.getNowPlaying === "function" ? SuperIsland.system.getNowPlaying() : null
            );
          } catch (error) {
            snapshot = null;
            logWarning("\u65E0\u6CD5\u8BFB\u53D6\u5F53\u524D\u64AD\u653E\u4FE1\u606F\uFF0C\u8BF7\u68C0\u67E5 media \u6743\u9650");
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
            void loadLyricsForSnapshot(snapshot, false);
          }
        } finally {
          tickInFlight = false;
        }
      }
      function startPolling() {
        if (pollTimer !== null) return;
        void tick();
        pollTimer = setInterval(function() {
          void tick();
        }, POLL_INTERVAL_MS);
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
          return View.nowPlayingArtwork({ size, cornerRadius: 4 });
        }
        return View.icon("music.note", { size: 13, color: accentColor() });
      }
      function compactView() {
        void tick();
        if (!state.snapshot || !trimString(state.snapshot.title)) {
          return View.hstack([
            View.icon("music.note", { size: 13, color: white(0.55) }),
            View.text("\u6B4C\u8BCD\u5F85\u673A", { style: "footnote", color: white(0.6), lineLimit: 1 })
          ], { spacing: 6, align: "center" });
        }
        if (state.lookupStatus === "loading") {
          return View.hstack([
            compactArtwork(18),
            View.text("\u6B63\u5728\u5339\u914D\u6B4C\u8BCD", { style: "footnote", color: white(0.72), lineLimit: 1 })
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
        void tick();
        var lines = state.syncedLines.map(function(line) {
          var converted = simplifyChinese(line.text);
          var offset = 0;
          var words = converted.length === line.text.length && Array.isArray(line.words) ? line.words.map(function(word) {
            var text = converted.slice(offset, offset + word.text.length);
            offset += word.text.length;
            return { time: word.time, endTime: word.endTime, text };
          }) : [];
          return { time: line.time, text: converted, words };
        });
        return View.nowPlayingLyrics({
          lines,
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
      function expandedView() {
        return playerLyricsView();
      }
      function fullExpandedView() {
        return playerLyricsView();
      }
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
          leading: function() {
            return minimalLeadingView();
          },
          trailing: function() {
            return minimalTrailingView();
          },
          precedence: function() {
            return 1;
          }
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
          cleanTrackTitle,
          parseLrc,
          parseQrc,
          parsePlainLyrics,
          scoreKugouCandidate,
          rankedKugouCandidates,
          decodeBase64Utf8,
          simplifyChinese,
          resetPlaybackClock,
          updatePlaybackClock,
          effectiveElapsedSeconds,
          applyLyricsPayload,
          currentLyricIndex,
          tick,
          loadLyricsForSnapshot,
          lyricsCacheKey,
          trackIdentity,
          payloadMatchesSnapshot,
          lookupLyricsPayload,
          rankedQQCandidates,
          selectKugouDocument,
          state
        };
      }
    }
  });

  // lyrics-island/bundle-entry.js
  var import_opencc_t2cn = __toESM(require_opencc_t2cn());

  // lyrics-island/vendor/qrc-codec.mjs
  var import_pako_inflate_min = __toESM(require_pako_inflate_min(), 1);
  var KEY_1 = new Uint8Array([33, 64, 35, 41, 40, 42, 36, 37]);
  var KEY_2 = new Uint8Array([49, 50, 51, 90, 88, 67, 33, 64]);
  var KEY_3 = new Uint8Array([33, 64, 35, 41, 40, 78, 72, 76]);
  var S_BOXES = [
    [
      14,
      4,
      13,
      1,
      2,
      15,
      11,
      8,
      3,
      10,
      6,
      12,
      5,
      9,
      0,
      7,
      0,
      15,
      7,
      4,
      14,
      2,
      13,
      1,
      10,
      6,
      12,
      11,
      9,
      5,
      3,
      8,
      4,
      1,
      14,
      8,
      13,
      6,
      2,
      11,
      15,
      12,
      9,
      7,
      3,
      10,
      5,
      0,
      15,
      12,
      8,
      2,
      4,
      9,
      1,
      7,
      5,
      11,
      3,
      14,
      10,
      0,
      6,
      13
    ],
    [
      15,
      1,
      8,
      14,
      6,
      11,
      3,
      4,
      9,
      7,
      2,
      13,
      12,
      0,
      5,
      10,
      3,
      13,
      4,
      7,
      15,
      2,
      8,
      15,
      12,
      0,
      1,
      10,
      6,
      9,
      11,
      5,
      0,
      14,
      7,
      11,
      10,
      4,
      13,
      1,
      5,
      8,
      12,
      6,
      9,
      3,
      2,
      15,
      13,
      8,
      10,
      1,
      3,
      15,
      4,
      2,
      11,
      6,
      7,
      12,
      0,
      5,
      14,
      9
    ],
    [
      10,
      0,
      9,
      14,
      6,
      3,
      15,
      5,
      1,
      13,
      12,
      7,
      11,
      4,
      2,
      8,
      13,
      7,
      0,
      9,
      3,
      4,
      6,
      10,
      2,
      8,
      5,
      14,
      12,
      11,
      15,
      1,
      13,
      6,
      4,
      9,
      8,
      15,
      3,
      0,
      11,
      1,
      2,
      12,
      5,
      10,
      14,
      7,
      1,
      10,
      13,
      0,
      6,
      9,
      8,
      7,
      4,
      15,
      14,
      3,
      11,
      5,
      2,
      12
    ],
    [
      7,
      13,
      14,
      3,
      0,
      6,
      9,
      10,
      1,
      2,
      8,
      5,
      11,
      12,
      4,
      15,
      13,
      8,
      11,
      5,
      6,
      15,
      0,
      3,
      4,
      7,
      2,
      12,
      1,
      10,
      14,
      9,
      10,
      6,
      9,
      0,
      12,
      11,
      7,
      13,
      15,
      1,
      3,
      14,
      5,
      2,
      8,
      4,
      3,
      15,
      0,
      6,
      10,
      10,
      13,
      8,
      9,
      4,
      5,
      11,
      12,
      7,
      2,
      14
    ],
    [
      2,
      12,
      4,
      1,
      7,
      10,
      11,
      6,
      8,
      5,
      3,
      15,
      13,
      0,
      14,
      9,
      14,
      11,
      2,
      12,
      4,
      7,
      13,
      1,
      5,
      0,
      15,
      10,
      3,
      9,
      8,
      6,
      4,
      2,
      1,
      11,
      10,
      13,
      7,
      8,
      15,
      9,
      12,
      5,
      6,
      3,
      0,
      14,
      11,
      8,
      12,
      7,
      1,
      14,
      2,
      13,
      6,
      15,
      0,
      9,
      10,
      4,
      5,
      3
    ],
    [
      12,
      1,
      10,
      15,
      9,
      2,
      6,
      8,
      0,
      13,
      3,
      4,
      14,
      7,
      5,
      11,
      10,
      15,
      4,
      2,
      7,
      12,
      9,
      5,
      6,
      1,
      13,
      14,
      0,
      11,
      3,
      8,
      9,
      14,
      15,
      5,
      2,
      8,
      12,
      3,
      7,
      0,
      4,
      10,
      1,
      13,
      11,
      6,
      4,
      3,
      2,
      12,
      9,
      5,
      15,
      10,
      11,
      14,
      1,
      7,
      6,
      0,
      8,
      13
    ],
    [
      4,
      11,
      2,
      14,
      15,
      0,
      8,
      13,
      3,
      12,
      9,
      7,
      5,
      10,
      6,
      1,
      13,
      0,
      11,
      7,
      4,
      9,
      1,
      10,
      14,
      3,
      5,
      12,
      2,
      15,
      8,
      6,
      1,
      4,
      11,
      13,
      12,
      3,
      7,
      14,
      10,
      15,
      6,
      8,
      0,
      5,
      9,
      2,
      6,
      11,
      13,
      8,
      1,
      4,
      10,
      7,
      9,
      5,
      0,
      15,
      14,
      2,
      3,
      12
    ],
    [
      13,
      2,
      8,
      4,
      6,
      15,
      11,
      1,
      10,
      9,
      3,
      14,
      5,
      0,
      12,
      7,
      1,
      15,
      13,
      8,
      10,
      3,
      7,
      4,
      12,
      5,
      6,
      11,
      0,
      14,
      9,
      2,
      7,
      11,
      4,
      1,
      9,
      12,
      14,
      2,
      0,
      6,
      10,
      13,
      15,
      3,
      5,
      8,
      2,
      1,
      14,
      7,
      4,
      10,
      8,
      13,
      15,
      12,
      9,
      0,
      3,
      5,
      6,
      11
    ]
  ];
  var P_BOX = [
    16,
    7,
    20,
    21,
    29,
    12,
    28,
    17,
    1,
    15,
    23,
    26,
    5,
    18,
    31,
    10,
    2,
    8,
    24,
    14,
    32,
    27,
    3,
    9,
    19,
    13,
    30,
    6,
    22,
    11,
    4,
    25
  ];
  var E_BOX_TABLE = [
    32,
    1,
    2,
    3,
    4,
    5,
    4,
    5,
    6,
    7,
    8,
    9,
    8,
    9,
    10,
    11,
    12,
    13,
    12,
    13,
    14,
    15,
    16,
    17,
    16,
    17,
    18,
    19,
    20,
    21,
    20,
    21,
    22,
    23,
    24,
    25,
    24,
    25,
    26,
    27,
    28,
    29,
    28,
    29,
    30,
    31,
    32,
    1
  ];
  var KEY_RND_SHIFT = [
    1,
    1,
    2,
    2,
    2,
    2,
    2,
    2,
    1,
    2,
    2,
    2,
    2,
    2,
    2,
    1
  ];
  var KEY_PERM_C = [
    56,
    48,
    40,
    32,
    24,
    16,
    8,
    0,
    57,
    49,
    41,
    33,
    25,
    17,
    9,
    1,
    58,
    50,
    42,
    34,
    26,
    18,
    10,
    2,
    59,
    51,
    43,
    35
  ];
  var KEY_PERM_D = [
    62,
    54,
    46,
    38,
    30,
    22,
    14,
    6,
    61,
    53,
    45,
    37,
    29,
    21,
    13,
    5,
    60,
    52,
    44,
    36,
    28,
    20,
    12,
    4,
    27,
    19,
    11,
    3
  ];
  var KEY_COMPRESSION = [
    13,
    16,
    10,
    23,
    0,
    4,
    2,
    27,
    14,
    5,
    20,
    9,
    22,
    18,
    11,
    3,
    25,
    7,
    15,
    6,
    26,
    19,
    12,
    1,
    40,
    51,
    30,
    36,
    46,
    54,
    29,
    39,
    50,
    44,
    32,
    47,
    43,
    48,
    38,
    55,
    33,
    52,
    45,
    41,
    49,
    35,
    28,
    31
  ];
  var Mode = /* @__PURE__ */ (function(Mode2) {
    Mode2[Mode2["Encrypt"] = 0] = "Encrypt";
    Mode2[Mode2["Decrypt"] = 1] = "Decrypt";
    return Mode2;
  })({});
  function permuteFromKeyBytes(key, table) {
    let output = 0n;
    let currentBitMask = 1n << BigInt(table.length - 1);
    for (let i = 0; i < table.length; i++) {
      const pos = table[i];
      const wordIndex = pos >> 5;
      const bitInWord = pos & 31;
      const byteInWord = bitInWord >> 3;
      const bitInByte = bitInWord & 7;
      if (key[wordIndex * 4 + 3 - byteInWord] >> 7 - bitInByte & 1) output |= currentBitMask;
      currentBitMask >>= 1n;
    }
    return output;
  }
  function rotateLeft28Bit(value, amount) {
    const BITS_28_MASK = 4294967280n;
    const val = value & BITS_28_MASK;
    return (val << BigInt(amount) | val >> BigInt(28 - amount)) & BITS_28_MASK;
  }
  function keySchedule(key, mode) {
    const schedule = new Int32Array(32);
    const c0 = permuteFromKeyBytes(key, KEY_PERM_C);
    const d0 = permuteFromKeyBytes(key, KEY_PERM_D);
    let c = c0 << 4n;
    let d = d0 << 4n;
    for (let i = 0; i < 16; i++) {
      const shift = KEY_RND_SHIFT[i];
      c = rotateLeft28Bit(c, shift);
      d = rotateLeft28Bit(d, shift);
      const toGen = mode === Mode.Decrypt ? 15 - i : i;
      let subkey48bit = 0n;
      for (let k = 0; k < KEY_COMPRESSION.length; k++) {
        const pos = KEY_COMPRESSION[k];
        if ((pos < 28 ? c >> BigInt(31 - pos) & 1n : d >> BigInt(31 - (pos - 27)) & 1n) === 1n) subkey48bit |= 1n << BigInt(47 - k);
      }
      const b5 = Number(subkey48bit >> 40n & 255n);
      const b4 = Number(subkey48bit >> 32n & 255n);
      const b3 = Number(subkey48bit >> 24n & 255n);
      const high24 = b5 << 16 | b4 << 8 | b3;
      const b2 = Number(subkey48bit >> 16n & 255n);
      const b1 = Number(subkey48bit >> 8n & 255n);
      const b0 = Number(subkey48bit & 255n);
      const low24 = b2 << 16 | b1 << 8 | b0;
      schedule[toGen * 2] = high24;
      schedule[toGen * 2 + 1] = low24;
    }
    return schedule;
  }
  var IP_RULE = [
    34,
    42,
    50,
    58,
    2,
    10,
    18,
    26,
    36,
    44,
    52,
    60,
    4,
    12,
    20,
    28,
    38,
    46,
    54,
    62,
    6,
    14,
    22,
    30,
    40,
    48,
    56,
    64,
    8,
    16,
    24,
    32,
    33,
    41,
    49,
    57,
    1,
    9,
    17,
    25,
    35,
    43,
    51,
    59,
    3,
    11,
    19,
    27,
    37,
    45,
    53,
    61,
    5,
    13,
    21,
    29,
    39,
    47,
    55,
    63,
    7,
    15,
    23,
    31
  ];
  var INV_IP_RULE = [
    37,
    5,
    45,
    13,
    53,
    21,
    61,
    29,
    38,
    6,
    46,
    14,
    54,
    22,
    62,
    30,
    39,
    7,
    47,
    15,
    55,
    23,
    63,
    31,
    40,
    8,
    48,
    16,
    56,
    24,
    64,
    32,
    33,
    1,
    41,
    9,
    49,
    17,
    57,
    25,
    34,
    2,
    42,
    10,
    50,
    18,
    58,
    26,
    35,
    3,
    43,
    11,
    51,
    19,
    59,
    27,
    36,
    4,
    44,
    12,
    52,
    20,
    60,
    28
  ];
  var IP_LEFT_TABLE = new Int32Array(2048);
  var IP_RIGHT_TABLE = new Int32Array(2048);
  var INV_IP_LEFT_TABLE = new Int32Array(2048);
  var INV_IP_RIGHT_TABLE = new Int32Array(2048);
  function generatePermutationTables() {
    const applyPermutation = (input, rule) => {
      let output = 0n;
      for (let i = 0; i < 64; i++) {
        const srcBit1Based = rule[i];
        if (input >> BigInt(64 - srcBit1Based) & 1n) output |= 1n << BigInt(63 - i);
      }
      return output;
    };
    for (let bytePos = 0; bytePos < 8; bytePos++) for (let byteVal = 0; byteVal < 256; byteVal++) {
      const permuted = applyPermutation(BigInt(byteVal) << BigInt(56 - bytePos * 8), IP_RULE);
      const idx = bytePos << 8 | byteVal;
      IP_LEFT_TABLE[idx] = Number(permuted >> 32n & 4294967295n);
      IP_RIGHT_TABLE[idx] = Number(permuted & 4294967295n);
    }
    for (let blockPos = 0; blockPos < 8; blockPos++) for (let blockVal = 0; blockVal < 256; blockVal++) {
      const permuted = applyPermutation(BigInt(blockVal) << BigInt(56 - blockPos * 8), INV_IP_RULE);
      const idx = blockPos << 8 | blockVal;
      INV_IP_LEFT_TABLE[idx] = Number(permuted >> 32n & 4294967295n);
      INV_IP_RIGHT_TABLE[idx] = Number(permuted & 4294967295n);
    }
  }
  generatePermutationTables();
  function calculateSboxIndex(a) {
    return a & 32 | (a & 31) >> 1 | (a & 1) << 4;
  }
  function applyQqPboxPermutation(input) {
    let output = 0;
    for (let i = 0; i < 32; i++) {
      const sourceBit1Based = P_BOX[i];
      const destBitMask = 1 << 31 - i;
      if ((input & 1 << 32 - sourceBit1Based) !== 0) output |= destBitMask;
    }
    return output;
  }
  var SP_TABLE = new Int32Array(512);
  function generateSpTables() {
    for (let sBoxIdx = 0; sBoxIdx < 8; sBoxIdx++) for (let sBoxInput = 0; sBoxInput < 64; sBoxInput++) {
      const sBoxIndex = calculateSboxIndex(sBoxInput);
      const prePBoxVal = S_BOXES[sBoxIdx][sBoxIndex] << 28 - sBoxIdx * 4;
      SP_TABLE[sBoxIdx << 6 | sBoxInput] = applyQqPboxPermutation(prePBoxVal);
    }
  }
  generateSpTables();
  var EBOX_HIGH_TABLE = new Int32Array(1024);
  var EBOX_LOW_TABLE = new Int32Array(1024);
  function generateEBoxTables() {
    for (let chunkIdx = 0; chunkIdx < 4; chunkIdx++) {
      const shiftIn32 = (3 - chunkIdx) * 8;
      for (let byteVal = 0; byteVal < 256; byteVal++) {
        let high24 = 0;
        let low24 = 0;
        const input = byteVal << shiftIn32;
        for (let i = 0; i < 24; i++) if (input >>> 32 - E_BOX_TABLE[i] & 1) high24 |= 1 << 23 - i;
        for (let i = 24; i < 48; i++) if (input >>> 32 - E_BOX_TABLE[i] & 1) low24 |= 1 << 47 - i;
        const tableIdx = chunkIdx << 8 | byteVal;
        EBOX_HIGH_TABLE[tableIdx] = high24;
        EBOX_LOW_TABLE[tableIdx] = low24;
      }
    }
  }
  generateEBoxTables();
  function fFunction(state, keyHigh24, keyLow24) {
    const b0 = state >>> 24 & 255;
    const b1 = state >>> 16 & 255;
    const b2 = state >>> 8 & 255;
    const b3 = state & 255;
    const eboxHigh24 = EBOX_HIGH_TABLE[b0] | EBOX_HIGH_TABLE[256 | b1] | EBOX_HIGH_TABLE[512 | b2] | EBOX_HIGH_TABLE[768 | b3];
    const eboxLow24 = EBOX_LOW_TABLE[b0] | EBOX_LOW_TABLE[256 | b1] | EBOX_LOW_TABLE[512 | b2] | EBOX_LOW_TABLE[768 | b3];
    const xorHigh24 = eboxHigh24 ^ keyHigh24;
    const xorLow24 = eboxLow24 ^ keyLow24;
    return SP_TABLE[xorHigh24 >>> 18 & 63] | SP_TABLE[64 | xorHigh24 >>> 12 & 63] | SP_TABLE[128 | xorHigh24 >>> 6 & 63] | SP_TABLE[192 | xorHigh24 & 63] | SP_TABLE[256 | xorLow24 >>> 18 & 63] | SP_TABLE[320 | xorLow24 >>> 12 & 63] | SP_TABLE[384 | xorLow24 >>> 6 & 63] | SP_TABLE[448 | xorLow24 & 63];
  }
  function desCrypt(input, output, keySchedule2) {
    let left = 0;
    let right = 0;
    for (let i = 0; i < 8; i++) {
      const idx = i << 8 | input[i];
      left |= IP_LEFT_TABLE[idx];
      right |= IP_RIGHT_TABLE[idx];
    }
    for (let i = 0; i < 15; i++) {
      const temp = right;
      right = (left ^ fFunction(right, keySchedule2[i * 2], keySchedule2[i * 2 + 1])) >>> 0;
      left = temp;
    }
    left = (left ^ fFunction(right, keySchedule2[30], keySchedule2[31])) >>> 0;
    let outLeft = 0;
    let outRight = 0;
    for (let i = 0; i < 4; i++) {
      const idxL = i << 8 | left >>> 24 - i * 8 & 255;
      outLeft |= INV_IP_LEFT_TABLE[idxL];
      outRight |= INV_IP_RIGHT_TABLE[idxL];
      const idxR = i + 4 << 8 | right >>> 24 - i * 8 & 255;
      outLeft |= INV_IP_LEFT_TABLE[idxR];
      outRight |= INV_IP_RIGHT_TABLE[idxR];
    }
    output[0] = outLeft >>> 24 & 255;
    output[1] = outLeft >>> 16 & 255;
    output[2] = outLeft >>> 8 & 255;
    output[3] = outLeft & 255;
    output[4] = outRight >>> 24 & 255;
    output[5] = outRight >>> 16 & 255;
    output[6] = outRight >>> 8 & 255;
    output[7] = outRight & 255;
  }
  function hexToUint8Array(hex) {
    if (typeof Buffer !== "undefined") return Buffer.from(hex, "hex");
    if (hex.length % 2 !== 0) throw new Error("\u65E0\u6548\u7684\u5341\u516D\u8FDB\u5236\u5B57\u7B26\u4E32: \u957F\u5EA6\u5FC5\u987B\u662F\u5076\u6570");
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    return bytes;
  }
  var DES_BLOCK_SIZE = 8;
  var QqMusicCodec = class {
    encryptSchedule;
    decryptSchedule;
    constructor() {
      this.decryptSchedule = [
        keySchedule(KEY_3, Mode.Decrypt),
        keySchedule(KEY_2, Mode.Encrypt),
        keySchedule(KEY_1, Mode.Decrypt)
      ];
      this.encryptSchedule = [
        keySchedule(KEY_1, Mode.Encrypt),
        keySchedule(KEY_2, Mode.Decrypt),
        keySchedule(KEY_3, Mode.Encrypt)
      ];
    }
    /**
    * 解密一个8字节的数据块。
    */
    decryptBlock(input, output) {
      const temp1 = new Uint8Array(8);
      const temp2 = new Uint8Array(8);
      desCrypt(input, temp1, this.decryptSchedule[0]);
      desCrypt(temp1, temp2, this.decryptSchedule[1]);
      desCrypt(temp2, output, this.decryptSchedule[2]);
    }
    /**
    * 加密一个8字节的数据块。
    */
    encryptBlock(input, output) {
      const temp1 = new Uint8Array(8);
      const temp2 = new Uint8Array(8);
      desCrypt(input, temp1, this.encryptSchedule[0]);
      desCrypt(temp1, temp2, this.encryptSchedule[1]);
      desCrypt(temp2, output, this.encryptSchedule[2]);
    }
  };
  var CODEC = new QqMusicCodec();
  function decompress(data) {
    const inflater = new import_pako_inflate_min.default.Inflate({ to: "string", chunkSize: 16384 });
    let output = "";
    inflater.onData = (chunk) => {
      if (output.length + chunk.length > 262144) throw new Error("QRC output exceeds limit");
      output += chunk;
    };
    inflater.push(data, true);
    if (inflater.err) throw new Error(inflater.msg || "Invalid QRC compression");
    return output.replace(/^\uFEFF/, "");
  }
  function decryptQrc(encryptedHexString) {
    if (typeof encryptedHexString !== "string" || encryptedHexString.length > 262144 || !/^[0-9a-f]+$/i.test(encryptedHexString)) throw new Error("Invalid QRC encoding");
    const encryptedBytes = hexToUint8Array(encryptedHexString);
    if (encryptedBytes.length % DES_BLOCK_SIZE !== 0) throw new Error(`\u52A0\u5BC6\u6570\u636E\u957F\u5EA6\u4E0D\u662F${DES_BLOCK_SIZE}\u7684\u500D\u6570`);
    const decryptedData = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i += DES_BLOCK_SIZE) {
      const chunk = encryptedBytes.subarray(i, i + DES_BLOCK_SIZE);
      const outChunk = decryptedData.subarray(i, i + DES_BLOCK_SIZE);
      CODEC.decryptBlock(chunk, outChunk);
    }
    const decompressedBytes = decompress(decryptedData);
    return decompressedBytes;
  }

  // lyrics-island/bundle-entry.js
  var import_index = __toESM(require_index());
  globalThis.OpenCC = import_opencc_t2cn.default && import_opencc_t2cn.default.Converter ? import_opencc_t2cn.default : import_opencc_t2cn.default.default || import_opencc_t2cn.default;
  globalThis.__superIslandDecodeQRC = decryptQrc;
})();
/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
