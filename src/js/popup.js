/*!
 * WinUI 3 for the Web — Popup 基础设施
 * 统一浮层宿主、定位（含翻转 / 边界收敛）、外部点击关闭。
 */
(function (global) {
  "use strict";
  const WinUI = global.WinUI;

  let hostEl = null;

  /** 浮层宿主（fixed 覆盖全屏，pointer-events: none，子元素可交互） */
  WinUI.layerHost = function () {
    if (!hostEl) {
      hostEl = document.createElement("div");
      hostEl.className = "wui-layer-host";
      document.body.appendChild(hostEl);
    }
    return hostEl;
  };

  /**
   * 将浮层定位到锚点
   * @param {HTMLElement} anchor
   * @param {HTMLElement} panel
   * @param {{placement?:string,gap?:number,align?:string,viewport?:number}} [opts]
   */
  WinUI.position = function (anchor, panel, opts) {
    opts = opts || {};
    const gap = opts.gap == null ? 4 : opts.gap;
    const pad = opts.viewport == null ? 8 : opts.viewport;
    const rect = anchor.getBoundingClientRect();
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const placement = opts.placement || "bottom";

    let left;
    let top;

    if (placement === "right" || placement === "left") {
      left = placement === "right" ? rect.right + gap : rect.left - pw - gap;
      top = rect.top;
      if (left + pw > vw - pad) left = rect.left - pw - gap;
      if (left < pad) left = Math.min(rect.right + gap, vw - pw - pad);
      if (top + ph > vh - pad) top = Math.max(pad, vh - ph - pad);
      top = Math.max(pad, top);
    } else {
      const above = placement === "top";
      top = above ? rect.top - ph - gap : rect.bottom + gap;
      if (!above && top + ph > vh - pad) {
        // 下方放不下 → 翻转到上方
        const flipped = rect.top - ph - gap;
        top = flipped >= pad ? flipped : Math.max(pad, vh - ph - pad);
      } else if (above && top < pad) {
        top = rect.bottom + gap;
      }

      const align = opts.align || (placement === "bottom" || placement === "top" ? "start" : "start");
      if (align === "center") left = rect.left + rect.width / 2 - pw / 2;
      else if (align === "end") left = rect.right - pw;
      else left = rect.left;

      if (left + pw > vw - pad) left = vw - pw - pad;
      if (left < pad) left = pad;
    }

    panel.style.left = Math.round(left) + "px";
    panel.style.top = Math.round(top) + "px";
    return { left: left, top: top };
  };

  /** 点击浮层外部 / Esc 关闭 */
  WinUI.dismissable = function (panel, anchor, onClose) {
    const timer = setTimeout(() => {
      function onDown(e) {
        if (panel.contains(e.target)) return;
        if (anchor && (anchor === e.target || anchor.contains(e.target))) return;
        close();
      }
      function onKey(e) {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      }
      function close() {
        document.removeEventListener("pointerdown", onDown, true);
        document.removeEventListener("keydown", onKey, true);
        window.removeEventListener("resize", close);
        if (onClose) onClose();
      }
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("keydown", onKey, true);
      window.addEventListener("resize", close);
      panel._wuiClose = close;
    }, 0);

    return function () {
      clearTimeout(timer);
      if (panel._wuiClose) panel._wuiClose();
    };
  };

  /** 使浮层内部可获得焦点 */
  WinUI.focusFirst = function (panel) {
    const target = panel.querySelector(
      '[autofocus],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input,select,textarea'
    );
    if (target) target.focus({ preventScroll: true });
  };

  /** 焦点陷阱（对话框用） */
  WinUI.trapFocus = function (container) {
    function onKey(e) {
      if (e.key !== "Tab") return;
      const items = Array.prototype.filter.call(
        container.querySelectorAll(
          'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        ),
        (el) => el.offsetParent !== null
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener("keydown", onKey);
    return () => container.removeEventListener("keydown", onKey);
  };
})(window);
