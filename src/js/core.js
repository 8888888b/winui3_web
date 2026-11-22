/*!
 * WinUI 3 for the Web — Core
 * 主题（浅色 / 深色 / 高对比）、强调色色阶、图标、组件基类。
 */
(function (global) {
  "use strict";

  const WinUI = (global.WinUI = global.WinUI || {});
  WinUI.version = "1.0.0";

  /* ================================================================
   * 图标集（16x16，线性描边，对齐 Fluent 图标的视觉重量）
   * ================================================================ */
  function gear() {
    let teeth = "";
    for (let i = 0; i < 8; i++) {
      teeth += `<rect x="7.05" y="1.5" width="1.9" height="2.6" rx="0.6" transform="rotate(${
        i * 45
      } 8 8)"/>`;
    }
    return `<circle cx="8" cy="8" r="4.3"/>${teeth}<circle cx="8" cy="8" r="1.5"/>`;
  }

  function star() {
    return `<path d="M8 2.1l1.83 3.72 4.1.6-2.97 2.9.7 4.1L8 11.48l-3.66 1.94.7-4.1L2.07 6.42l4.1-.6z" fill="currentColor" stroke="none"/>`;
  }

  const ICONS = {
    "chevron-down": '<path d="M3.5 5.75 8 10.25l4.5-4.5"/>',
    "chevron-up": '<path d="M3.5 10.25 8 5.75l4.5 4.5"/>',
    "chevron-left": '<path d="M10.25 3.5 5.75 8l4.5 4.5"/>',
    "chevron-right": '<path d="M5.75 3.5 10.25 8l-4.5 4.5"/>',
    check: '<path d="M3 8.4 6.2 11.5 13 4.5"/>',
    close: '<path d="M4 4l8 8M12 4l-8 8"/>',
    add: '<path d="M8 3.2v9.6M3.2 8h9.6"/>',
    subtract: '<path d="M3.2 8h9.6"/>',
    search: '<circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2 13.8 13.8"/>',
    settings: gear(),
    home: '<path d="M2.5 7.1 8 2.6l5.5 4.5V13a1 1 0 0 1-1 1h-3v-4h-3v4h-3a1 1 0 0 1-1-1z"/>',
    folder:
      '<path d="M2 4.6a1 1 0 0 1 1-1h3.1l1.4 1.7H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>',
    document:
      '<path d="M4 2.5h4.8L12.5 6v7.5H4z"/><path d="M8.6 2.6V6.2h3.7"/><path d="M6 9h4M6 11h3"/>',
    mail: '<rect x="2" y="3.6" width="12" height="8.8" rx="1.2"/><path d="m2.6 4.6 5.4 4 5.4-4"/>',
    calendar:
      '<rect x="2.2" y="3.4" width="11.6" height="10.2" rx="1.4"/><path d="M2.2 6.6h11.6M5.4 2.2v2.2M10.6 2.2v2.2"/>',
    person: '<circle cx="8" cy="5.6" r="2.7"/><path d="M2.9 13.6c.6-2.5 2.6-3.9 5.1-3.9s4.5 1.4 5.1 3.9"/>',
    more: '<circle cx="3.4" cy="8" r="1.05" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.05" fill="currentColor" stroke="none"/><circle cx="12.6" cy="8" r="1.05" fill="currentColor" stroke="none"/>',
    info: '<circle cx="8" cy="8" r="6"/><path d="M8 7.2v4.2"/><circle cx="8" cy="4.9" r="0.85" fill="currentColor" stroke="none"/>',
    warning: '<path d="M8 2.4 14.4 13.2H1.6z"/><path d="M8 6.2v3.4"/><circle cx="8" cy="11.5" r="0.8" fill="currentColor" stroke="none"/>',
    error: '<circle cx="8" cy="8" r="6"/><path d="m5.8 5.8 4.4 4.4M10.2 5.8l-4.4 4.4"/>',
    success: '<circle cx="8" cy="8" r="6"/><path d="m5 8.2 2.2 2.2 4-4.4"/>',
    star: star(),
    heart:
      '<path d="M8 13.3S2.4 10 2.4 6.2A2.9 2.9 0 0 1 8 5a2.9 2.9 0 0 1 5.6 1.2C13.6 10 8 13.3 8 13.3z"/>',
    lock: '<rect x="3.4" y="7" width="9.2" height="6.8" rx="1.3"/><path d="M5.6 7V5.4a2.4 2.4 0 0 1 4.8 0V7"/>',
    eye: '<path d="M1.8 8S4.3 3.9 8 3.9 14.2 8 14.2 8 11.7 12.1 8 12.1 1.8 8 1.8 8z"/><circle cx="8" cy="8" r="2.1"/>',
    "eye-off":
      '<path d="M1.8 8S4.3 3.9 8 3.9 14.2 8 14.2 8 11.7 12.1 8 12.1 1.8 8 1.8 8z"/><circle cx="8" cy="8" r="2.1"/><path d="m2.6 13.4 10.8-10.8"/>',
    globe:
      '<circle cx="8" cy="8" r="6"/><path d="M2 8h12"/><ellipse cx="8" cy="8" rx="2.6" ry="6"/>',
    wifi: '<path d="M2.4 6.2a8 8 0 0 1 11.2 0"/><path d="M4.6 8.8a5 5 0 0 1 6.8 0"/><path d="M6.7 11.2a2.1 2.1 0 0 1 2.6 0"/><circle cx="8" cy="13.2" r="0.8" fill="currentColor" stroke="none"/>',
    volume:
      '<path d="M3 6.4h2.2L9 3.4v9.2L5.2 9.6H3z"/><path d="M11.2 5.8a3.2 3.2 0 0 1 0 4.4"/><path d="M12.9 4a5.6 5.6 0 0 1 0 8"/>',
    sun: '<circle cx="8" cy="8" r="3.1"/><path d="M8 1.4v1.8M8 12.8v1.8M1.4 8h1.8M12.8 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3"/>',
    moon: '<path d="M13.2 9.6A5.8 5.8 0 0 1 6.4 2.8a5.8 5.8 0 1 0 6.8 6.8z"/>',
    contrast: '<circle cx="8" cy="8" r="6"/><path d="M8 2v12a6 6 0 0 0 0-12z" fill="currentColor" stroke="none"/>',
    play: '<path d="M5 3.4 12.4 8 5 12.6z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="4.4" y="3.4" width="2.6" height="9.2" rx="0.7" fill="currentColor" stroke="none"/><rect x="9" y="3.4" width="2.6" height="9.2" rx="0.7" fill="currentColor" stroke="none"/>',
    download: '<path d="M8 2.6v7.2"/><path d="M4.8 6.8 8 10l3.2-3.2"/><path d="M2.8 12.6h10.4"/>',
    upload: '<path d="M8 10.2V3"/><path d="M4.8 6 8 2.8 11.2 6"/><path d="M2.8 12.6h10.4"/>',
    save: '<path d="M3 2.8h7.2L13 5.6v7.6H3z"/><path d="M5.4 2.8v3.6h5.2V2.8"/><rect x="5.2" y="9" width="5.6" height="4.2"/>',
    delete:
      '<path d="M3 4.6h10"/><path d="M5.6 4.6V3.2h4.8v1.4"/><path d="M4.4 4.6 5 13h6l.6-8.4"/><path d="M6.8 7v3.4M9.2 7v3.4"/>',
    edit: '<path d="M11.2 2.4 13.6 4.8 6 12.4H3.6v-2.4z"/><path d="m10 3.6 2.4 2.4"/>',
    copy: '<rect x="5.4" y="5.4" width="8.2" height="8.2" rx="1.2"/><path d="M10.6 5.4V3.6a1.2 1.2 0 0 0-1.2-1.2H3.6a1.2 1.2 0 0 0-1.2 1.2v5.8a1.2 1.2 0 0 0 1.2 1.2h1.8"/>',
    share:
      '<circle cx="12.2" cy="3.8" r="1.9"/><circle cx="3.8" cy="8" r="1.9"/><circle cx="12.2" cy="12.2" r="1.9"/><path d="m5.5 7.1 4.9-2.4M5.5 8.9l4.9 2.4"/>',
    filter: '<path d="M2.4 3.6h11.2L9.4 8.4v4.2L6.6 11V8.4z"/>',
    sort: '<path d="M4.4 3v10M2.2 10.8 4.4 13l2.2-2.2"/><path d="M11.6 13V3M9.4 5.2 11.6 3l2.2 2.2"/>',
    grid: '<rect x="2.6" y="2.6" width="4.6" height="4.6" rx="1"/><rect x="8.8" y="2.6" width="4.6" height="4.6" rx="1"/><rect x="2.6" y="8.8" width="4.6" height="4.6" rx="1"/><rect x="8.8" y="8.8" width="4.6" height="4.6" rx="1"/>',
    list: '<path d="M3 4.2h1M6 4.2h7M3 8h1M6 8h7M3 11.8h1M6 11.8h7"/>',
    refresh:
      '<path d="M13 8a5 5 0 1 1-1.6-3.7"/><path d="M13.2 2.6v3.2H10"/>',
    fullscreen:
      '<path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3"/>',
    "zoom-in":
      '<circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2 13.8 13.8M7 5.2v3.6M5.2 7h3.6"/>',
    "zoom-out":
      '<circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2 13.8 13.8M5.2 7h3.6"/>',
    cart: '<path d="M2 3.2h1.8l1.6 7.2h6.5l1.5-5.4H4.4"/><circle cx="6.4" cy="12.6" r="1"/><circle cx="11.4" cy="12.6" r="1"/>',
    cloud: '<path d="M4.6 11.6h6.6a2.8 2.8 0 0 0 .3-5.6A4 4 0 0 0 4 6.6a2.6 2.6 0 0 0 .6 5z"/>',
    code: '<path d="M5.6 5.2 2.4 8l3.2 2.8M10.4 5.2 13.6 8l-3.2 2.8M9.2 3.4 6.8 12.6"/>',
    palette:
      '<path d="M8 2.4a5.6 5.6 0 1 0 0 11.2c1 0 1.3-.7 1.3-1.4 0-1.4 1.2-2 2.4-2h.7c.7 0 1.2-.6 1.2-1.4A5.6 5.6 0 0 0 8 2.4z"/><circle cx="5.4" cy="6.4" r="0.9" fill="currentColor" stroke="none"/><circle cx="9.4" cy="5.2" r="0.9" fill="currentColor" stroke="none"/><circle cx="10.8" cy="8.6" r="0.9" fill="currentColor" stroke="none"/>',
    image:
      '<rect x="2.4" y="3.2" width="11.2" height="9.6" rx="1.4"/><circle cx="5.6" cy="6.2" r="1.1"/><path d="m3.2 11.4 3.4-3.2 2.2 2 2-1.8 2.4 3"/>',
    video: '<rect x="2.4" y="4" width="7.4" height="8" rx="1.2"/><path d="m9.8 7 3.8-2v6l-3.8-2z"/>',
    music: '<circle cx="5.2" cy="11.6" r="1.8"/><circle cx="11.6" cy="10.4" r="1.8"/><path d="M7 11.6V4.6l6.4-1.6v7.4"/>',
    link: '<path d="M6.4 9.6 9.6 6.4"/><path d="M7.2 4.4 8.6 3a2.8 2.8 0 0 1 4 4l-1.4 1.4"/><path d="M8.8 11.6 7.4 13a2.8 2.8 0 0 1-4-4l1.4-1.4"/>',
    phone:
      '<path d="M4.8 2.4h2l1 2.6-1.4 1a7 7 0 0 0 3.6 3.6l1-1.4 2.6 1v2c0 1-.8 1.8-1.8 1.8C7.2 13 3 8.8 3 4.2c0-1 .8-1.8 1.8-1.8z"/>',
    location:
      '<path d="M8 13.4s4.4-4.2 4.4-7.2a4.4 4.4 0 1 0-8.8 0C3.6 9.2 8 13.4 8 13.4z"/><circle cx="8" cy="6.2" r="1.6"/>',
    clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4.4V8l2.6 1.6"/>',
    flag: '<path d="M3.4 13.6V2.6c3-1.6 5.2 1.4 8.2 0v6.6c-3 1.4-5.2-1.6-8.2 0"/>',
    bookmark: '<path d="M4.2 2.6h7.6v10.8L8 10.6l-3.8 2.8z"/>',
    tag: '<path d="M2.6 8.2V3.4a.8.8 0 0 1 .8-.8h4.8l5.2 5.2-5.6 5.6z"/><circle cx="5.6" cy="5.6" r="0.9" fill="currentColor" stroke="none"/>',
    "arrow-left": '<path d="M13 8H3.4M6.8 4.4 3.2 8l3.6 3.6"/>',
    "arrow-right": '<path d="M3 8h9.6M9.2 4.4 12.8 8l-3.6 3.6"/>',
    "arrow-up": '<path d="M8 13V3.4M4.4 6.8 8 3.2l3.6 3.6"/>',
    "arrow-down": '<path d="M8 3v9.6M4.4 9.2 8 12.8l3.6-3.6"/>',
    menu: '<path d="M2.6 4.2h10.8M2.6 8h10.8M2.6 11.8h10.8"/>',
    external:
      '<path d="M9 3h4v4"/><path d="m12.6 3.4-5.4 5.4"/><path d="M12.4 9v3.6a.9.9 0 0 1-.9.9H3.4a.9.9 0 0 1-.9-.9V4.5a.9.9 0 0 1 .9-.9H7"/>',
    undo: '<path d="M4 6.4h6a3.4 3.4 0 0 1 0 6.8H7"/><path d="M6.4 3.6 3.6 6.4l2.8 2.8"/>',
    redo: '<path d="M12 6.4H6a3.4 3.4 0 0 0 0 6.8h3"/><path d="m9.6 3.6 2.8 2.8-2.8 2.8"/>',
    print:
      '<path d="M4.4 6V2.8h7.2V6"/><rect x="2.6" y="6" width="10.8" height="4.6" rx="1.2"/><path d="M4.4 9.4h7.2v3.8H4.4z"/>',
    bug: '<rect x="4.4" y="5.4" width="7.2" height="7.4" rx="3.6"/><path d="M2.6 7.6h2M11.4 7.6h2M2.6 11h2M11.4 11h2M5.6 4 4.2 2.6M10.4 4l1.4-1.4M8 5.4v7.4"/>',
    rocket:
      '<path d="M8 2.4c2.2 1.4 3.4 3.6 3.4 6.2L8 11.4 4.6 8.6c0-2.6 1.2-4.8 3.4-6.2z"/><circle cx="8" cy="6.6" r="1.2"/><path d="M5 9.8 3.4 13l2.4-.6M11 9.8l1.6 3.2-2.4-.6"/>',
    book: '<path d="M3 3.4c1.8-.8 3.4-.8 5 0v9.2c-1.6-.8-3.2-.8-5 0z"/><path d="M13 3.4c-1.8-.8-3.4-.8-5 0v9.2c1.6-.8 3.2-.8 5 0z"/>',
    layers:
      '<path d="M8 2.6 13.6 5.6 8 8.6 2.4 5.6z"/><path d="m2.4 8.4 5.6 3 5.6-3"/><path d="m2.4 11.2 5.6 3 5.6-3"/>',
    database:
      '<ellipse cx="8" cy="4" rx="5" ry="1.8"/><path d="M3 4v8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V4"/><path d="M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8"/>',
    chart: '<path d="M2.6 12.8h10.8"/><rect x="4" y="8" width="2" height="4" rx="0.6"/><rect x="7" y="5.4" width="2" height="6.6" rx="0.6"/><rect x="10" y="7" width="2" height="5" rx="0.6"/>',
    server:
      '<rect x="2.6" y="2.8" width="10.8" height="4.2" rx="1"/><rect x="2.6" y="9" width="10.8" height="4.2" rx="1"/><circle cx="5" cy="4.9" r="0.7" fill="currentColor" stroke="none"/><circle cx="5" cy="11.1" r="0.7" fill="currentColor" stroke="none"/>',
    key: '<circle cx="5.4" cy="8" r="2.4"/><path d="M7.8 8h5.6M11.4 8v2M13.4 8v1.4"/>',
    shield: '<path d="M8 2.4 13 4.2v3.6c0 3-2.2 4.8-5 5.8-2.8-1-5-2.8-5-5.8V4.2z"/>',
    speed: '<path d="M13.6 11.2a6 6 0 1 0-11.2 0"/><path d="M8 8.6 10.6 6"/><circle cx="8" cy="9.4" r="1.1"/>',
    window:
      '<rect x="2.4" y="3.2" width="11.2" height="9.6" rx="1.4"/><path d="M2.4 6h11.2"/>',
    minimize: '<path d="M2.6 8h10.8"/>',
    maximize: '<rect x="2.8" y="2.8" width="10.4" height="10.4" rx="1"/>',
    restore:
      '<rect x="2.8" y="5.6" width="7.6" height="7.6" rx="1"/><path d="M5.6 5.6V3.6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"/>',
    sparkle:
      '<path d="M8 2.4l1.1 3.1 3.1 1.1-3.1 1.1L8 10.8 6.9 7.7 3.8 6.6l3.1-1.1z"/><path d="M12.2 10.4l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z"/>',
    terminal: '<rect x="2.4" y="3.2" width="11.2" height="9.6" rx="1.2"/><path d="m5 6.4 2 1.8-2 1.8M8.6 10.4h3"/>',
    users:
      '<circle cx="6" cy="6" r="2.2"/><path d="M2.4 12.6c.4-2 1.8-3.2 3.6-3.2s3.2 1.2 3.6 3.2"/><path d="M10.4 4.2a2 2 0 0 1 0 3.8M11.4 9.6c1.2.3 2 1.3 2.3 2.8"/>',
    pin: '<path d="M8 2.4 13 7.4l-2 .4-3 3-.4 2.8-3.4-3.4-3-3 2.8-.4 3-3z"/>',
  };

  WinUI.icons = ICONS;

  /**
   * 生成图标标记
   * @param {string} name 图标名
   * @param {string} [cls] 额外类名
   */
  WinUI.icon = function (name, cls) {
    const body = ICONS[name] || ICONS.info;
    return (
      '<span class="wui-icon' +
      (cls ? " " + cls : "") +
      '" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
      'stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
      body +
      "</svg></span>"
    );
  };

  /** 将 icon 名称或标记解析为 HTML */
  WinUI.iconHTML = function (icon) {
    if (!icon) return "";
    if (icon.indexOf("<") === 0) return icon;
    return WinUI.icon(icon);
  };

  /* ================================================================
   * 工具函数
   * ================================================================ */
  const U = (WinUI.util = {
    clamp: (v, min, max) => Math.min(max, Math.max(min, v)),

    uid: (() => {
      let n = 0;
      return (prefix) => (prefix || "wui") + "-" + ++n;
    })(),

    /** 创建元素 */
    el(tag, attrs, html) {
      const node = document.createElement(tag);
      if (attrs) {
        for (const key in attrs) {
          if (key === "class") node.className = attrs[key];
          else if (key === "text") node.textContent = attrs[key];
          else if (attrs[key] != null) node.setAttribute(key, attrs[key]);
        }
      }
      if (html != null) node.innerHTML = html;
      return node;
    },

    /** 取出全部子节点（同时从原节点移除），用于「保留内容再重建骨架」 */
    take(parent) {
      const nodes = Array.prototype.slice.call(parent.childNodes);
      while (parent.firstChild) parent.removeChild(parent.firstChild);
      return nodes;
    },

    esc(str) {      return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    },

    debounce(fn, wait) {
      let t;
      return function () {
        const args = arguments;
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait || 150);
      };
    },

    /** 六位十六进制转 rgb */
    hexToRgb(hex) {
      let h = String(hex).replace("#", "").trim();
      if (h.length === 3)
        h = h
          .split("")
          .map((c) => c + c)
          .join("");
      if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
      };
    },

    rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    },

    hslToHex(h, s, l) {
      h = ((h % 360) + 360) % 360;
      s = U.clamp(s, 0, 100) / 100;
      l = U.clamp(l, 0, 100) / 100;
      const k = (n) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      const toHex = (x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, "0");
      return "#" + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
    },

    /** 相对亮度（用于决定强调色上的文字颜色） */
    luminance(rgb) {
      const f = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
    },
  });

  /* ================================================================
   * 主题与强调色
   * ================================================================ */
  const STORAGE = {
    theme: "winui.theme",
    accent: "winui.accent",
  };

  const themeListeners = new Set();
  const accentListeners = new Set();

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* 忽略隐私模式 */
    }
  }

  const Theme = (WinUI.theme = {
    mode: "system",
    resolved: "light",

    /** 当前系统偏好 */
    system() {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    },

    resolve(mode) {
      if (mode === "system") return Theme.system();
      if (mode === "high-contrast") return "high-contrast";
      return mode === "dark" ? "dark" : "light";
    },

    /**
     * 设置主题
     * @param {'light'|'dark'|'system'|'high-contrast'} mode
     */
    set(mode, persist) {
      Theme.mode = mode || "system";
      const resolved = Theme.resolve(Theme.mode);
      Theme.resolved = resolved;
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.setAttribute("data-theme-mode", Theme.mode);
      if (persist !== false) write(STORAGE.theme, Theme.mode);
      Accent.apply();
      themeListeners.forEach((fn) => fn(resolved, Theme.mode));
      window.dispatchEvent(
        new CustomEvent("wuithemechange", { detail: { theme: resolved, mode: Theme.mode } })
      );
    },

    toggle() {
      const next = Theme.resolved === "dark" ? "light" : "dark";
      Theme.set(next);
      return next;
    },

    onChange(fn) {
      themeListeners.add(fn);
      return () => themeListeners.delete(fn);
    },

    init() {
      const explicit = document.documentElement.getAttribute("data-theme-mode");
      const saved = read(STORAGE.theme);
      Theme.set(explicit || saved || "system", false);
      if (window.matchMedia) {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
          if (Theme.mode === "system") Theme.set("system", false);
        };
        if (mq.addEventListener) mq.addEventListener("change", handler);
        else if (mq.addListener) mq.addListener(handler);
      }
    },
  });

  const Accent = (WinUI.accent = {
    /** 用户选定的基色（#RRGGBB） */
    base: "#0078d4",

    set(hex, persist) {
      const rgb = U.hexToRgb(hex);
      if (!rgb) return;
      Accent.base = "#" + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, "0")).join("");
      if (persist !== false) write(STORAGE.accent, Accent.base);
      Accent.apply();
      accentListeners.forEach((fn) => fn(Accent.base));
      window.dispatchEvent(new CustomEvent("wuiaccentchange", { detail: { accent: Accent.base } }));
    },

    /** 依据当前主题重新计算色阶并写入 CSS 变量 */
    apply() {
      const rgb = U.hexToRgb(Accent.base) || { r: 0, g: 120, b: 212 };
      const hsl = U.rgbToHsl(rgb.r, rgb.g, rgb.b);
      const dark = Theme.resolved === "dark" || Theme.resolved === "high-contrast";

      let l = hsl.l;
      if (dark) l = hsl.l + (100 - hsl.l) * 0.47;
      else l = hsl.l * 0.86;

      const make = (lightness) => U.hslToHex(hsl.h, hsl.s, U.clamp(lightness, 0, 100));
      const base = make(l);
      const hover = make(dark ? l + 5 : l + 6.5);
      const pressed = make(dark ? l - 8 : l - 5);
      const tintRgb = U.hexToRgb(base);
      const tintAlpha = dark ? 0.12 : 0.08;

      const root = document.documentElement.style;
      root.setProperty("--wui-accent", base);
      root.setProperty("--wui-accent-hover", hover);
      root.setProperty("--wui-accent-pressed", pressed);
      root.setProperty("--wui-accent-text", U.luminance(tintRgb) > 0.5 ? "#000000" : "#ffffff");
      root.setProperty(
        "--wui-accent-tint",
        `rgba(${tintRgb.r}, ${tintRgb.g}, ${tintRgb.b}, ${tintAlpha})`
      );
      root.setProperty(
        "--wui-accent-tint-strong",
        `rgba(${tintRgb.r}, ${tintRgb.g}, ${tintRgb.b}, ${dark ? 0.22 : 0.16})`
      );
      document.documentElement.setAttribute("data-accent-hex", base);
    },

    onChange(fn) {
      accentListeners.add(fn);
      return () => accentListeners.delete(fn);
    },

    init() {
      const saved = read(STORAGE.accent);
      Accent.base = saved || "#0078d4";
      Accent.apply();
    },

    /** 常用强调色（Windows 个性化默认色板） */
    palette: [
      "#0078d4",
      "#0099bc",
      "#00b294",
      "#10893e",
      "#498205",
      "#767676",
      "#847545",
      "#c239b3",
      "#881798",
      "#b146c2",
      "#e3008c",
      "#c42b1c",
      "#ca5010",
      "#986f0b",
      "#004e8c",
      "#4f6bed",
    ],
  });

  WinUI.setTheme = (mode) => Theme.set(mode);
  WinUI.getTheme = () => ({ mode: Theme.mode, resolved: Theme.resolved });
  WinUI.setAccent = (hex) => Accent.set(hex);
  WinUI.getAccent = () => Accent.base;

  /* ================================================================
   * 组件基类
   * ================================================================ */
  class WuiElement extends HTMLElement {
    constructor() {
      super();
      this._built = false;
      this._silent = false;
    }

    connectedCallback() {
      if (!this._built) {
        this._built = true;
        this.build();
      }
      this._runSync(null);
    }

    disconnectedCallback() {
      if (this._cleanup) this._cleanup();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this._built || this._silent) return;
      if (oldValue === newValue) return;
      this._runSync(name);
    }

    /**
     * 带重入锁的同步执行。
     * 组件 sync() 里经常需要写 aria-* / data-* 属性，若其中任一属性在
     * observedAttributes 中就会形成「同步 → 改属性 → 再同步」的死循环。
     * 这里统一加锁，杜绝该类问题。
     */
    _runSync(name) {
      if (this._syncLock) return;
      this._syncLock = true;
      try {
        this.sync(name);
      } finally {
        this._syncLock = false;
      }
    }

    build() {}
    sync() {}

    get a() {
      return {
        str: (n, d) => (this.hasAttribute(n) ? this.getAttribute(n) : d),
        bool: (n) => this.hasAttribute(n),
        num: (n, d) => {
          const v = parseFloat(this.getAttribute(n));
          return Number.isNaN(v) ? d : v;
        },
      };
    }

    emit(type, detail) {
      this.dispatchEvent(new CustomEvent(type, { detail: detail, bubbles: true, composed: true }));
    }

    /** 不触发 attributeChangedCallback 的属性同步 */
    setAttr(name, value) {
      this._silent = true;
      if (value === false || value == null) this.removeAttribute(name);
      else this.setAttribute(name, value === true ? "" : value);
      this._silent = false;
    }
  }

  WinUI.WuiElement = WuiElement;

  WinUI.define = function (tag, cls, attrs) {
    if (customElements.get(tag)) return customElements.get(tag);
    if (attrs) cls.observedAttributes = attrs;
    customElements.define(tag, cls);
    return cls;
  };

  /* ================================================================
   * 键盘 / 指针焦点模式
   * ================================================================ */
  function initFocusMode() {
    const root = document.documentElement;
    root.setAttribute("data-focus-mode", "pointer");
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Tab" || e.key === "ArrowUp" || e.key === "ArrowDown")
          root.setAttribute("data-focus-mode", "keyboard");
      },
      true
    );
    document.addEventListener(
      "pointerdown",
      () => root.setAttribute("data-focus-mode", "pointer"),
      true
    );
  }

  /* ================================================================
   * 初始化
   * ================================================================ */
  function init() {
    initFocusMode();
    Theme.init();
    Accent.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
