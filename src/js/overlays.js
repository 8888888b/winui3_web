/*!
 * WinUI 3 for the Web — Overlays
 * Flyout / MenuFlyout / ContentDialog / ToolTip / TeachingTip
 */
(function (global) {
  "use strict";
  const WinUI = global.WinUI;
  const U = WinUI.util;
  const icon = WinUI.icon;

  /* ==================================================================
   * 菜单面板
   * ================================================================== */
  /**
   * @param {Array} items [{label,icon,accel,checked,disabled,separator,value}]
   * @param {Function} onSelect
   */
  WinUI.menuPanel = function (items, onSelect) {
    const panel = U.el("div", { class: "wui-flyout wui-menu", role: "menu" });
    panel.innerHTML = items
      .map((item, i) => {
        if (item.separator) return '<div class="wui-menu__separator"></div>';
        return (
          '<button type="button" class="wui-menu__item" role="menuitem" data-index="' +
          i +
          '"' +
          (item.disabled ? " disabled" : "") +
          ' aria-checked="' +
          (item.checked ? "true" : "false") +
          '">' +
          (item.checked
            ? '<span class="wui-menu__check">' + icon("check") + "</span>"
            : "") +
          (item.icon ? icon(item.icon) : "") +
          "<span>" +
          U.esc(item.label) +
          "</span>" +
          (item.accel ? '<span class="wui-menu__accel">' + U.esc(item.accel) + "</span>" : "") +
          "</button>"
        );
      })
      .join("");

    panel.querySelectorAll(".wui-menu__item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = items[parseInt(btn.dataset.index, 10)];
        if (item && item.disabled) return;
        if (onSelect) onSelect(item, btn);
        if (panel._wuiClose) panel._wuiClose();
      });
    });
    return panel;
  };

  /**
   * 在锚点处打开菜单
   * @returns {{close:Function,panel:HTMLElement}}
   */
  WinUI.showMenu = function (anchor, items, opts) {
    opts = opts || {};
    const panel = WinUI.menuPanel(items, opts.onSelect);
    WinUI.layerHost().appendChild(panel);
    WinUI.position(anchor, panel, { gap: 4, align: opts.align || "start" });
    WinUI.dismissable(panel, anchor, () => panel.remove());
    WinUI.focusFirst(panel);
    return {
      panel: panel,
      close() {
        panel.remove();
      },
    };
  };

  /* ==================================================================
   * Flyout
   * ================================================================== */
  WinUI.flyout = function (anchor, content, opts) {
    opts = opts || {};
    const panel = U.el("div", { class: "wui-flyout", role: "dialog" });
    if (typeof content === "string") panel.innerHTML = content;
    else if (content) panel.appendChild(content);
    if (opts.className) panel.classList.add(opts.className);
    WinUI.layerHost().appendChild(panel);
    WinUI.position(anchor, panel, { gap: opts.gap == null ? 8 : opts.gap, align: opts.align });
    const destroy = WinUI.dismissable(panel, anchor, () => {
      panel.remove();
      if (opts.onClose) opts.onClose();
    });
    return {
      panel: panel,
      close() {
        destroy();
        panel.remove();
      },
    };
  };

  /* ==================================================================
   * ContentDialog
   * ================================================================== */
  /**
   * @param {{title:string,body:string|Node,primaryText?:string,secondaryText?:string,
   *          closeText?:string,defaultButton?:string,wide?:boolean,danger?:boolean}} opts
   * @returns {Promise<'primary'|'secondary'|'close'>}
   */
  WinUI.dialog = function (opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      const smoke = U.el("div", { class: "wui-smoke" });
      const dialog = U.el("div", {
        class: "wui-dialog" + (opts.wide ? " wui-dialog--wide" : ""),
        role: "dialog",
        "aria-modal": "true",
      });

      const title = U.el("div", { class: "wui-dialog__title" });
      title.textContent = opts.title || "";
      title.hidden = !opts.title;

      const body = U.el("div", { class: "wui-dialog__body" });
      if (typeof opts.body === "string") body.innerHTML = opts.body;
      else if (opts.body) body.appendChild(opts.body);

      const actions = U.el("div", { class: "wui-dialog__actions" });

      function makeBtn(label, variant) {
        const b = U.el("button", { class: "wui-btn" + (variant ? " wui-btn--" + variant : ""), type: "button" });
        b.textContent = label;
        return b;
      }

      let primary;
      if (opts.primaryText) {
        primary = makeBtn(opts.primaryText, opts.danger ? "accent" : "accent");
        if (opts.danger) primary.style.background = "var(--wui-critical)", (primary.style.color = "#fff");
        actions.appendChild(primary);
      }
      if (opts.secondaryText) {
        const sec = makeBtn(opts.secondaryText);
        sec.addEventListener("click", () => finish("secondary"));
        actions.appendChild(sec);
      }
      const close = makeBtn(opts.closeText || "取消");
      close.addEventListener("click", () => finish("close"));
      actions.appendChild(close);

      dialog.appendChild(title);
      dialog.appendChild(body);
      dialog.appendChild(actions);
      smoke.appendChild(dialog);
      document.body.appendChild(smoke);

      const untrap = WinUI.trapFocus(dialog);
      const prevFocus = document.activeElement;

      function onKey(e) {
        if (e.key === "Escape") {
          e.stopPropagation();
          finish("close");
        }
      }
      document.addEventListener("keydown", onKey, true);

      function finish(result) {
        document.removeEventListener("keydown", onKey, true);
        untrap();
        smoke.remove();
        if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
        resolve(result);
      }

      if (primary) primary.addEventListener("click", () => finish("primary"));
      smoke.addEventListener("pointerdown", (e) => {
        if (e.target === smoke) finish("close");
      });

      requestAnimationFrame(() => {
        if (primary && opts.defaultButton !== "close") primary.focus();
        else close.focus();
      });
    });
  };

  /* ==================================================================
   * ToolTip
   * ================================================================== */
  let tipEl = null;
  let tipTimer = null;
  let tipAnchor = null;

  WinUI.showToolTip = function (anchor, text, opts) {
    opts = opts || {};
    WinUI.hideToolTip();
    tipAnchor = anchor;
    tipEl = U.el("div", { class: "wui-tooltip", role: "tooltip" });
    tipEl.innerHTML = typeof text === "string" ? U.esc(text) : "";
    document.body.appendChild(tipEl);
    const placement = opts.placement || "top";
    WinUI.position(anchor, tipEl, { gap: 6, placement: placement, align: "center" });
    return tipEl;
  };

  WinUI.hideToolTip = function () {
    clearTimeout(tipTimer);
    if (tipEl) {
      tipEl.remove();
      tipEl = null;
    }
    tipAnchor = null;
  };

  /** 全局 data-tooltip 支持 */
  function initTooltips() {
    document.addEventListener("pointerover", (e) => {
      const target = e.target.closest && e.target.closest("[data-tooltip]");
      if (!target || target === tipAnchor) return;
      clearTimeout(tipTimer);
      tipTimer = setTimeout(() => {
        const text = target.getAttribute("data-tooltip");
        if (text) WinUI.showToolTip(target, text);
      }, 550);
    });
    document.addEventListener("pointerout", (e) => {
      const target = e.target.closest && e.target.closest("[data-tooltip]");
      if (target && !target.contains(e.relatedTarget)) WinUI.hideToolTip();
    });
    document.addEventListener("pointerdown", () => WinUI.hideToolTip(), true);
    window.addEventListener("blur", () => WinUI.hideToolTip());
  }

  /* ==================================================================
   * TeachingTip
   * ================================================================== */
  WinUI.teachingTip = function (anchor, opts) {
    opts = opts || {};
    const panel = U.el("div", { class: "wui-teaching-tip", role: "dialog" });
    panel.innerHTML =
      '<div class="wui-teaching-tip__arrow"></div>' +
      '<div class="wui-teaching-tip__title">' +
      U.esc(opts.title || "") +
      "</div>" +
      '<div class="wui-teaching-tip__body">' +
      (opts.body || "") +
      "</div>" +
      '<div class="wui-teaching-tip__footer">' +
      '<button type="button" class="wui-btn wui-btn--subtle wui-btn--sm" data-act="close">' +
      U.esc(opts.closeText || "关闭") +
      "</button>" +
      (opts.actionText
        ? '<button type="button" class="wui-btn wui-btn--accent wui-btn--sm" data-act="action">' +
          U.esc(opts.actionText) +
          "</button>"
        : "") +
      "</div>";

    document.body.appendChild(panel);
    WinUI.position(anchor, panel, { gap: 12, placement: opts.placement || "bottom", align: "start" });

    const rect = anchor.getBoundingClientRect();
    const arrow = panel.querySelector(".wui-teaching-tip__arrow");
    const panelRect = panel.getBoundingClientRect();
    arrow.style.left = U.clamp(rect.left + rect.width / 2 - panelRect.left - 6, 10, panelRect.width - 22) + "px";
    if (panelRect.top > rect.bottom) arrow.style.top = "-7px";
    else arrow.style.bottom = "-7px";

    function close() {
      panel.remove();
      if (opts.onClose) opts.onClose();
    }
    panel.querySelector('[data-act="close"]').addEventListener("click", close);
    const action = panel.querySelector('[data-act="action"]');
    if (action)
      action.addEventListener("click", () => {
        if (opts.onAction) opts.onAction();
        close();
      });

    const dismiss = WinUI.dismissable(panel, anchor, close);
    return { panel: panel, close: dismiss };
  };

  /* ==================================================================
   * 初始化
   * ================================================================== */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTooltips);
  } else {
    initTooltips();
  }
})(window);
