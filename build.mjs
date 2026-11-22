/*!
 * WinUI 3 for the Web — 构建脚本
 *
 * 零依赖：只把 src/ 下的模块按顺序拼成单文件，并做保守压缩（保留换行，避免 ASI 问题）。
 *
 *   node build.mjs            生成 dist/
 *   node build.mjs --no-min   只生成未压缩产物
 */

import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const OUT = join(ROOT, "dist");

const CSS_ORDER = ["tokens.css", "winui.css", "controls.css", "surfaces.css"];
const JS_ORDER = ["core.js", "popup.js", "inputs.js", "collections.js", "overlays.js", "xaml.js"];

const BANNER_CSS = `/*!
 * WinUI 3 for the Web v${pkg.version}
 * Windows 11 / WinUI 3 视觉体系的纯 CSS 复刻（设计令牌 + 全部控件样式）
 * MIT License · https://github.com/8888888b/winui3_web
 * 构建产物，请勿直接编辑；源码在 src/css/
 */
`;

const BANNER_JS = `/*!
 * WinUI 3 for the Web v${pkg.version}
 * Windows 11 / WinUI 3 视觉体系的纯 JavaScript 复刻（Web Components，零依赖）
 * MIT License · https://github.com/8888888b/winui3_web
 * 构建产物，请勿直接编辑；源码在 src/js/
 */
`;

/* ---------------------------------------------------------------- 压缩 */

/** 逐字符扫描，能识别字符串 / 模板串 / 正则字面量 / 注释，返回剥离注释后的代码。 */
function stripComments(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  // `/` 出现在这些符号之后视为正则字面量的开始
  const REGEX_PREV = "(,=:[!&|?{};+-*%^~<>";

  while (i < n) {
    const c = src[i];
    const d = src[i + 1];

    if (c === "/" && d === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? n : end + 2;
      out += " "; // 块注释可能夹在两个标识符之间（a/*x*/b），补空格更安全
      continue;
    }
    if (c === "/" && d === "/") {
      const end = src.indexOf("\n", i + 2);
      i = end < 0 ? n : end; // 保留换行，避免 ASI 变化
      continue;
    }
    if (c === "/") {
      let k = out.length - 1;
      while (k >= 0 && /\s/.test(out[k])) k--;
      const prev = k >= 0 ? out[k] : "";
      if (!prev || REGEX_PREV.includes(prev)) {
        // 正则字面量：原样复制，注意转义与字符类里的引号
        out += c;
        i++;
        let inClass = false;
        while (i < n) {
          const ch = src[i];
          if (ch === "\\") {
            out += ch + (src[i + 1] ?? "");
            i += 2;
            continue;
          }
          if (ch === "\n") break; // 正则不跨行，遇到换行说明判断失误，及时收手
          out += ch;
          i++;
          if (ch === "[") inClass = true;
          else if (ch === "]") inClass = false;
          else if (ch === "/" && !inClass) {
            while (i < n && /[a-z]/.test(src[i])) {
              out += src[i];
              i++;
            }
            break;
          }
        }
        continue;
      }
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += c;
      i++;
      while (i < n) {
        const ch = src[i];
        if (ch === "\\") {
          out += ch + (src[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += ch;
        i++;
        if (ch === quote) break;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

const KEEP_SPACE_BEFORE_PAREN = /(^|[\s;{}])(@media|@supports|@container|@layer|and|or|not|only|in)$/;

/** CSS 压缩：去注释、去缩进、收敛空白；括号内保留单词间隔（calc 等依赖空格）。 */
function minifyCSS(src) {
  const code = stripComments(src);
  let out = "";
  let depth = 0;
  let inStr = null;
  let i = 0;
  const n = code.length;
  while (i < n) {
    const c = code[i];
    if (inStr) {
      out += c;
      if (c === "\\") {
        out += code[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = c;
      out += c;
      i++;
      continue;
    }
    if (c === "(") depth++;
    if (c === ")") depth = Math.max(0, depth - 1);
    if (/\s/.test(c)) {
      let j = i;
      while (j < n && /\s/.test(code[j])) j++;
      const prev = out[out.length - 1] || "";
      const next = code[j] || "";
      // 结构性符号两侧的空白一律去掉
      const structural = /[{};,>~+():]/.test(prev) || /[{};,>~+()]/.test(next);
      // `@media (` / `and (` 这类必须保留的空格
      const mustKeep = next === "(" && KEEP_SPACE_BEFORE_PAREN.test(out);
      if (!structural || mustKeep) {
        if (!/^\s/.test(out) && out.length) out += " ";
      }
      i = j;
      continue;
    }
    if (c === "{" || c === "}" || c === ";" || c === ",") {
      out = out.replace(/\s+$/, "");
      out += c;
      i++;
      continue;
    }
    if (c === ":" && depth === 0) {
      out = out.replace(/\s+$/, "");
      out += c;
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out.replace(/[ \t]*\n[ \t]*/g, "\n").replace(/\n{2,}/g, "\n").trim() + "\n";
}

/**
 * JS 压缩：去注释、去缩进与空行、行内连续空白收敛为一个空格。
 * 逐字符扫描并跟踪字符串 / 模板串（含 ${} 嵌套），因此多行模板字面量不会被破坏。
 */
function minifyJS(src) {
  const code = stripComments(src);
  let out = "";
  let i = 0;
  const n = code.length;
  const tplStack = []; // 模板串内 ${ 的花括号深度

  const copyString = (quote) => {
    out += quote;
    i++;
    while (i < n) {
      const ch = code[i];
      if (ch === "\\") {
        out += ch + (code[i + 1] ?? "");
        i += 2;
        continue;
      }
      out += ch;
      i++;
      if (ch === quote) return;
    }
  };

  while (i < n) {
    const c = code[i];
    if (c === '"' || c === "'") {
      copyString(c);
      continue;
    }
    if (c === "`") {
      // 模板串：内部原样保留，遇到 ${ 才回到代码模式
      out += c;
      i++;
      while (i < n) {
        const ch = code[i];
        if (ch === "\\") {
          out += ch + (code[i + 1] ?? "");
          i += 2;
          continue;
        }
        if (ch === "`") {
          out += ch;
          i++;
          break;
        }
        if (ch === "$" && code[i + 1] === "{") {
          out += "${";
          i += 2;
          tplStack.push(1);
          break;
        }
        out += ch;
        i++;
      }
      continue;
    }
    if (c === "{" && tplStack.length) tplStack[tplStack.length - 1]++;
    if (c === "}" && tplStack.length) {
      if (tplStack[tplStack.length - 1] === 1) {
        tplStack.pop();
        out += "}";
        i++;
        // 回到模板串继续吃字符
        while (i < n) {
          const ch = code[i];
          if (ch === "\\") {
            out += ch + (code[i + 1] ?? "");
            i += 2;
            continue;
          }
          if (ch === "`") {
            out += ch;
            i++;
            break;
          }
          if (ch === "$" && code[i + 1] === "{") {
            out += "${";
            i += 2;
            tplStack.push(1);
            break;
          }
          out += ch;
          i++;
        }
        continue;
      }
      tplStack[tplStack.length - 1]--;
    }
    if (c === "\n") {
      out = out.replace(/[ \t]+$/, "");
      if (out.length && out[out.length - 1] !== "\n") out += "\n";
      i++;
      while (i < n && (code[i] === " " || code[i] === "\t")) i++;
      continue;
    }
    if (c === " " || c === "\t") {
      let j = i;
      while (j < n && (code[j] === " " || code[j] === "\t")) j++;
      const prev = out[out.length - 1] || "";
      if (prev && prev !== "\n" && !/^[{(:;,]$/.test(prev)) out += " ";
      i = j;
      continue;
    }
    out += c;
    i++;
  }
  return joinSafeLines(out.replace(/\n{2,}/g, "\n").trim()) + "\n";
}

/**
 * 把「上一行以 ; { , ( [ : = 等结尾」的换行去掉，进一步缩小体积。
 * 只在这些明确的位置合并，避免触碰 ASI（换行即分号）的边界。
 */
function joinSafeLines(code) {
  const lines = code.split("\n");
  const out = [];
  for (const line of lines) {
    if (!out.length) {
      out.push(line);
      continue;
    }
    const prev = out[out.length - 1];
    const safePrev = /[;{,(:[=+\-*/%&|?<>!]$/.test(prev) || /(=>|&&|\|\|)$/.test(prev);
    const safeNext = !/^[([`+\-*/]/.test(line); // 下一行以括号 / 反引号开头时不合并
    if (safePrev && safeNext) out[out.length - 1] = prev + (prev.endsWith(";") || prev.endsWith(",") ? "" : " ") + line;
    else out.push(line);
  }
  return out.join("\n");
}

/* ---------------------------------------------------------------- 打包 */

function bundleCss(files, minify) {
  const parts = files.map((f) => {
    const body = readFileSync(join(ROOT, "src/css", f), "utf8").trim();
    return `/* ---- ${f} ---- */\n${body}\n`;
  });
  const raw = BANNER_CSS + "\n" + parts.join("\n");
  return minify ? BANNER_CSS + "\n" + minifyCSS(raw.replace(BANNER_CSS, "")) : raw;
}

function bundleJs(files, minify) {
  const parts = files.map((f) => {
    const body = readFileSync(join(ROOT, "src/js", f), "utf8").trim();
    return `/* ---- ${f} ---- */\n${body}\n`;
  });
  const raw = BANNER_JS + "\n" + parts.join("\n;\n");
  return minify ? BANNER_JS + "\n" + minifyJS(raw.replace(BANNER_JS, "")) : raw;
}

/* ---------------------------------------------------------------- 执行 */

const wantMin = !process.argv.includes("--no-min");
mkdirSync(OUT, { recursive: true });

const outputs = [
  ["winui3.css", bundleCss(CSS_ORDER, false)],
  ["winui3.js", bundleJs(JS_ORDER, false)],
];
if (wantMin) {
  outputs.push(["winui3.min.css", bundleCss(CSS_ORDER, true)]);
  outputs.push(["winui3.min.js", bundleJs(JS_ORDER, true)]);
}

const kb = (b) => (b / 1024).toFixed(1).padStart(6) + " KB";

for (const [name, content] of outputs) {
  const file = join(OUT, name);
  writeFileSync(file, content, "utf8");
  console.log(`  ${name.padEnd(16)} ${kb(Buffer.byteLength(content))}`);
}

const rawTotal = outputs.slice(0, 2).reduce((a, [, c]) => a + Buffer.byteLength(c), 0);
const zip = outputs.length > 2 ? outputs.slice(2).reduce((a, [, c]) => a + Buffer.byteLength(c), 0) : 0;
console.log(`\n  v${pkg.version} · 未压缩合计 ${kb(rawTotal)}${wantMin ? ` · 压缩后合计 ${kb(zip)}` : ""}`);
