/*!
 * WinUI 3 for the Web — Navigation & Collections
 * NavigationView / TabView / ListView / GridView / TreeView / Expander /
 * CommandBar / BreadcrumbBar / PipsPager / PersonPicture / CalendarView / DatePicker
 */
(function (global) {
  "use strict";
  const WinUI = global.WinUI;
  const U = WinUI.util;
  const W = WinUI.WuiElement;
  const icon = WinUI.icon;

  /* ==================================================================
   * NavigationView
   * ================================================================== */
  class WuiNavView extends W {
    static observedAttributes = ["pane-mode", "header", "brand", "icon", "pane-open"];

    build() {
      this.classList.add("wui-nav");
      const items = [];
      const footer = [];
      const registered = [];
      const headerSlot = [];
      const content = [];

      const childNodes = Array.prototype.slice.call(this.children);
      childNodes.forEach((el) => {
        const tag = el.tagName;
        const slot = el.getAttribute("slot");
        if (slot === "footer") footer.push(el);
        else if (slot === "header") headerSlot.push(el);
        else if (tag === "WUI-NAV-ITEM" || tag === "WUI-NAV-GROUP") items.push(el);
        else content.push(el);
      });

      const pane = U.el("aside", { class: "wui-nav__pane" });
      const top = U.el("div", { class: "wui-nav__top" });
      const hamburger = U.el("button", {
        class: "wui-nav__hamburger",
        type: "button",
        "aria-label": "切换导航",
      });
      hamburger.innerHTML = icon("menu", "wui-icon--lg");
      top.appendChild(hamburger);

      const brand = U.el("div", { class: "wui-nav__brand" });
      brand.innerHTML =
        this.hasAttribute("icon") ? icon(this.getAttribute("icon"), "wui-icon--lg") : "";
      const brandText = U.el("span", { class: "wui-nav__brand-text" });
      brandText.textContent = this.getAttribute("brand") || "应用";
      brand.appendChild(brandText);
      top.appendChild(brand);

      const scroll = U.el("div", { class: "wui-nav__scroll wui-scroll" });

      // 组装导航项（组展开为标题 + 子项）
      function decorate(item) {
        item.classList.add("wui-nav__item");
        registered.push(item);
        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "link");
        if (!item.querySelector(":scope > .wui-nav__item-text")) {
          const nodes = U.take(item);
          if (item.hasAttribute("icon")) {
            item.insertAdjacentHTML("afterbegin", icon(item.getAttribute("icon")));
          }
          const text = U.el("span", { class: "wui-nav__item-text" });
          nodes.forEach((n) => text.appendChild(n));
          item.appendChild(text);
        }
        if (item.hasAttribute("badge")) {
          const b = U.el("span", { class: "wui-badge" });
          b.textContent = item.getAttribute("badge");
          item.appendChild(b);
        }
        if (item.hasAttribute("dot")) {
          item.insertAdjacentHTML("beforeend", '<span class="wui-badge wui-badge--dot"></span>');
        }
        return item;
      }

      items.forEach((el) => {
        if (el.tagName === "WUI-NAV-GROUP") {
          const head = U.el("div", { class: "wui-nav__group-header" });
          head.textContent = el.getAttribute("header") || "";
          scroll.appendChild(head);
          Array.prototype.slice.call(el.children).forEach((child) => {
            scroll.appendChild(decorate(child));
          });
          el.remove();
        } else {
          scroll.appendChild(decorate(el));
        }
      });

      const footerEl = U.el("div", { class: "wui-nav__footer" });
      footer.forEach((el) => footerEl.appendChild(decorate(el)));

      pane.appendChild(top);
      pane.appendChild(scroll);
      if (footer.length) pane.appendChild(footerEl);

      const scrim = U.el("div", { class: "wui-nav__scrim" });

      const navContent = U.el("div", { class: "wui-nav__content" });
      const header = U.el("header", { class: "wui-nav__header" });
      const headerTitle = U.el("div", { class: "wui-nav__header-title" });
      headerTitle.textContent = this.getAttribute("header") || "";
      header.appendChild(headerTitle);
      headerSlot.forEach((el) => header.appendChild(el));
      navContent.appendChild(header);

      const body = U.el("div", { class: "wui-nav__content-body", style: "display:flex;flex:1 1 auto;min-height:0;position:relative" });
      content.forEach((el) => body.appendChild(el));
      navContent.appendChild(body);

      this.innerHTML = "";
      this.appendChild(pane);
      this.appendChild(scrim);
      this.appendChild(navContent);

      this._pane = pane;
      this._scroll = scroll;
      this._items = registered;
      this._headerTitle = headerTitle;
      this._body = body;
      this._usersetMode = null;

      hamburger.addEventListener("click", () => {
        if (this._mode === "minimal") {
          this.setAttribute("data-pane-open", this.getAttribute("data-pane-open") === "true" ? "false" : "true");
        } else {
          this.setAttribute("pane-mode", this._mode === "compact" ? "expanded" : "compact");
        }
      });
      scrim.addEventListener("click", () => this.setAttribute("data-pane-open", "false"));

      this._onNavClick = (e) => {
        const item = e.target.closest(".wui-nav__item");
        if (!item) return;
        this.select(item);
      };
      pane.addEventListener("click", this._onNavClick);
      pane.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          const item = e.target.closest(".wui-nav__item");
          if (item) {
            e.preventDefault();
            this.select(item);
          }
        }
      });

      // 自适应
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => this._applyAutoMode());
        this._ro.observe(this);
      }
      window.addEventListener("resize", () => this._applyAutoMode());

      // 初始选中
      const initial =
        this.querySelector('.wui-nav__item[selected], .wui-nav__item[aria-current="page"]') ||
        registered[0];
      if (initial) this.select(initial, true);
    }

    _applyAutoMode() {
      const requested = this.getAttribute("pane-mode") || "auto";
      let mode = requested;
      if (requested === "auto") {
        const w = this.clientWidth;
        mode = w < 700 ? "minimal" : w < 1000 ? "compact" : "expanded";
      }
      this._mode = mode;
      this.setAttribute("data-pane-mode", mode);
      this.setAttribute("data-pane-open", this.getAttribute("data-pane-open") || "false");
    }

    select(item, silent) {
      if (!item) return;
      (this._items || []).forEach((el) => {
        el.removeAttribute("aria-current");
        el.removeAttribute("selected");
      });
      item.setAttribute("aria-current", "page");
      const label = item.querySelector(".wui-nav__item-text");
      const title = label ? label.textContent : "";
      if (title) this._headerTitle.textContent = title;

      const page = item.getAttribute("page") || item.getAttribute("target");
      if (page) {
        const pages = this._body.querySelectorAll("[data-page]");
        let matched = false;
        pages.forEach((p) => {
          const on = p.getAttribute("data-page") === page;
          p.hidden = !on;
          if (on) matched = true;
        });
        if (matched && this._mode === "minimal") this.setAttribute("data-pane-open", "false");
      }
      if (!silent) this.emit("navigate", { page: page, label: title, item: item });
    }

    sync() {
      this._applyAutoMode();
      const header = this.getAttribute("header");
      if (header) this._headerTitle.textContent = header;
      const brandText = this.querySelector(".wui-nav__brand-text");
      if (brandText && this.hasAttribute("brand")) brandText.textContent = this.getAttribute("brand");
    }
  }

  /* ==================================================================
   * TabView
   * ================================================================== */
  class WuiTabView extends W {
    static observedAttributes = ["addable"];

    build() {
      this.classList.add("wui-tabview");
      this._tabs = [];
      const tabs = Array.prototype.filter.call(
        this.children,
        (el) => el.tagName === "WUI-TAB"
      );

      const strip = U.el("div", { class: "wui-tabview__strip", role: "tablist" });
      const body = U.el("div", { class: "wui-tabview__body" });

      this.innerHTML = "";
      this.appendChild(strip);
      this.appendChild(body);
      this._strip = strip;
      this._body = body;

      tabs.forEach((tab) => this._addTab(tab));

      if (this.hasAttribute("addable")) {
        const add = U.el("button", {
          class: "wui-tabview__add",
          type: "button",
          "aria-label": "新建标签页",
        });
        add.innerHTML = icon("add");
        add.addEventListener("click", () => this.emit("add", {}));
        strip.appendChild(add);
      }

      const initial = this._tabs.findIndex((t) => t.tab.hasAttribute("selected"));
      this.select(initial < 0 ? 0 : initial, true);
    }

    _addTab(tab) {
      const i = this._tabs.length;
      const header =
        tab.getAttribute("header") || tab.getAttribute("label") || "标签页 " + (i + 1);
      const btn = U.el("button", { class: "wui-tab", type: "button", role: "tab" });
      btn.innerHTML =
        (tab.hasAttribute("icon") ? icon(tab.getAttribute("icon"), "wui-tab__icon") : "") +
        '<span class="wui-tab__text">' +
        U.esc(header) +
        "</span>" +
        (tab.hasAttribute("closable")
          ? '<span class="wui-tab__close" role="button" aria-label="关闭">' +
            icon("close") +
            "</span>"
          : "");

      const addBtn = this._strip.querySelector(".wui-tabview__add");
      if (addBtn) this._strip.insertBefore(btn, addBtn);
      else this._strip.appendChild(btn);

      tab.classList.add("wui-tabview__page");
      tab.setAttribute("role", "tabpanel");
      this._body.appendChild(tab);

      const entry = { tab: tab, btn: btn };
      this._tabs.push(entry);

      btn.addEventListener("click", (e) => {
        if (e.target.closest(".wui-tab__close")) {
          this.closeTab(entry);
          return;
        }
        this.select(this._tabs.indexOf(entry));
      });
      return entry;
    }

    select(index, silent) {
      this._tabs.forEach((entry, i) => {
        const on = i === index;
        entry.btn.setAttribute("aria-selected", on ? "true" : "false");
        entry.btn.setAttribute("tabindex", on ? "0" : "-1");
        entry.tab.setAttribute("data-active", on ? "true" : "false");
        entry.tab.setAttribute("aria-hidden", on ? "false" : "true");
      });
      this._active = index;
      if (!silent) this.emit("select", { index: index });
    }

    closeTab(entry) {
      const i = this._tabs.indexOf(entry);
      if (i < 0) return;
      this._tabs.splice(i, 1);
      entry.btn.remove();
      entry.tab.remove();
      this.emit("close", { index: i, header: entry.btn.textContent.trim() });
      if (this._tabs.length) this.select(Math.min(i, this._tabs.length - 1), true);
    }

    addTab(header, contentHTML) {
      const tab = document.createElement("wui-tab");
      tab.setAttribute("header", header);
      tab.setAttribute("closable", "");
      tab.innerHTML = contentHTML || "";
      this._addTab(tab);
      this.select(this._tabs.length - 1);
      return tab;
    }

    sync() {}
  }

  /* ==================================================================
   * ListView
   * ================================================================== */
  class WuiListView extends W {
    static observedAttributes = ["selection-mode", "selected-index"];

    build() {
      this.classList.add("wui-listview");
      this.setAttribute("role", "listbox");
      const items = Array.prototype.filter.call(this.children, (el) => el.tagName === "WUI-LIST-ITEM");
      items.forEach((item) => this._decorate(item));

      this._items = items;
      this.addEventListener("click", (e) => {
        const item = e.target.closest("wui-list-item");
        if (!item) return;
        this._pick(item);
      });
      this.addEventListener("keydown", (e) => {
        const items = this._items;
        const i = items.indexOf(document.activeElement.closest("wui-list-item"));
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const next = items[U.clamp(i + (e.key === "ArrowDown" ? 1 : -1), 0, items.length - 1)];
          if (next) {
            next.focus();
            if (this.getAttribute("selection-mode") !== "none") this._pick(next);
          }
        }
      });

      const initial = items.findIndex((i) => i.hasAttribute("selected"));
      if (initial >= 0) this.select(initial, true);
    }

    _decorate(item) {
      if (item._decorated) return;
      item._decorated = true;
      item.classList.add("wui-list-item");
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "option");

      const nodes = U.take(item);
      const body = U.el("div", { class: "wui-list-item__body" });
      const title = U.el("div", { class: "wui-list-item__title" });
      nodes.forEach((n) => title.appendChild(n));
      body.appendChild(title);
      if (item.hasAttribute("subtitle")) {
        const sub = U.el("div", { class: "wui-list-item__subtitle" });
        sub.textContent = item.getAttribute("subtitle");
        body.appendChild(sub);
      }

      item.innerHTML =
        (item.hasAttribute("icon") ? icon(item.getAttribute("icon"), "wui-list-item__icon") : "") ;
      item.appendChild(body);
      if (item.hasAttribute("meta")) {
        const meta = U.el("div", { class: "wui-list-item__meta" });
        meta.textContent = item.getAttribute("meta");
        item.appendChild(meta);
      }
    }

    _pick(item) {
      this.select(this._items.indexOf(item));
      this.emit("select", {
        index: this._items.indexOf(item),
        value: item.getAttribute("value") || item.textContent.trim(),
      });
    }

    select(index, silent) {
      if (this.getAttribute("selection-mode") === "none") return;
      const multi = this.getAttribute("selection-mode") === "multiple";
      this._items.forEach((item, i) => {
        const on = multi ? i === index || item.getAttribute("aria-selected") === "true" : i === index;
        item.setAttribute("aria-selected", on ? "true" : "false");
      });
      this._selected = index;
      if (!silent) {
        const item = this._items[index];
        if (item) item.scrollIntoView({ block: "nearest" });
      }
    }

    sync() {
      const idx = parseInt(this.getAttribute("selected-index"), 10);
      if (!Number.isNaN(idx)) this.select(idx, true);
    }
  }

  /* ==================================================================
   * GridView
   * ================================================================== */
  class WuiGridView extends W {
    static observedAttributes = ["selected-index", "selection-mode"];

    build() {
      this.classList.add("wui-gridview");
      this.setAttribute("role", "listbox");
      this._items = Array.prototype.filter.call(this.children, (el) => el.tagName === "WUI-GRID-ITEM");

      this._items.forEach((item) => {
        item.classList.add("wui-grid-item");
        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "option");
        const nodes = U.take(item);
        const title = U.el("div", { class: "wui-grid-item__title" });
        nodes.forEach((n) => title.appendChild(n));
        item.innerHTML =
          (item.hasAttribute("icon") ? icon(item.getAttribute("icon"), "wui-icon--lg wui-grid-item__media") : "") +
          (item.hasAttribute("subtitle")
            ? '<div class="wui-caption">' + U.esc(item.getAttribute("subtitle")) + "</div>"
            : "");
        item.appendChild(title);
        item.setAttribute("aria-selected", item.hasAttribute("selected") ? "true" : "false");
      });

      this.addEventListener("click", (e) => {
        const item = e.target.closest("wui-grid-item");
        if (!item) return;
        const i = this._items.indexOf(item);
        this._items.forEach((el) => el.setAttribute("aria-selected", "false"));
        item.setAttribute("aria-selected", "true");
        this.emit("select", { index: i, value: item.textContent.trim() });
      });
    }

    sync() {
      const idx = parseInt(this.getAttribute("selected-index"), 10);
      if (!Number.isNaN(idx) && this._items) {
        this._items.forEach((el, i) => el.setAttribute("aria-selected", i === idx ? "true" : "false"));
      }
    }
  }

  /* ==================================================================
   * TreeView
   * ================================================================== */
  class WuiTreeView extends W {
    build() {
      this.classList.add("wui-tree");
      this.setAttribute("role", "tree");
      this.addEventListener("click", (e) => {
        const row = e.target.closest(".wui-tree__row");
        if (!row) return;
        const node = row.parentElement;
        if (e.target.closest(".wui-tree__chevron")) {
          node.setAttribute("data-expanded", node.getAttribute("data-expanded") === "true" ? "false" : "true");
          return;
        }
        this.querySelectorAll(".wui-tree__row").forEach((r) => r.setAttribute("aria-selected", "false"));
        row.setAttribute("aria-selected", "true");
        this.emit("select", { label: row.textContent.trim(), node: node });
      });
    }
    sync() {}
  }

  class WuiTreeNode extends W {
    static observedAttributes = ["label", "expanded", "icon", "has-children"];

    build() {
      this.classList.add("wui-tree__node");
      this.setAttribute("role", "treeitem");
      const children = Array.prototype.filter.call(this.children, (el) => el.tagName === "WUI-TREE-NODE");
      const label = this.getAttribute("label") || this.textContent.trim();

      const row = U.el("div", { class: "wui-tree__row", tabindex: "0" });
      row.innerHTML =
        '<span class="wui-tree__chevron">' +
        icon("chevron-right") +
        "</span>" +
        (this.hasAttribute("icon") ? icon(this.getAttribute("icon"), "wui-tree__icon") : "") +
        "<span>" +
        U.esc(label) +
        "</span>";

      this.innerHTML = "";
      this.appendChild(row);
      const wrap = U.el("div", { class: "wui-tree__children" });
      children.forEach((c) => wrap.appendChild(c));
      this.appendChild(wrap);

      this.setAttribute("data-has-children", children.length ? "true" : "false");
      if (children.length && !this.hasAttribute("expanded")) this.setAttribute("data-expanded", "false");
      if (this.hasAttribute("expanded")) this.setAttribute("data-expanded", "true");
    }

    sync() {
      if (this.hasAttribute("expanded")) this.setAttribute("data-expanded", "true");
    }
  }

  /* ==================================================================
   * Expander
   * ================================================================== */
  class WuiExpander extends W {
    static observedAttributes = ["expanded", "header"];

    build() {
      this.classList.add("wui-expander");
      const nodes = U.take(this);

      const header = U.el("button", { class: "wui-expander__header", type: "button" });
      header.innerHTML =
        '<span class="wui-expander__chevron">' +
        icon("chevron-right") +
        '</span><span class="wui-expander__label"></span>';
      const content = U.el("div", { class: "wui-expander__content" });
      nodes.forEach((n) => content.appendChild(n));

      this.innerHTML = "";
      this.appendChild(header);
      this.appendChild(content);
      this._label = header.querySelector(".wui-expander__label");
      this._content = content;

      header.addEventListener("click", () => {
        const open = this.getAttribute("data-expanded") === "true";
        this.setAttribute("data-expanded", open ? "false" : "true");
        this.emit(open ? "collapse" : "expand", {});
      });
    }

    sync() {
      this._label.textContent = this.getAttribute("header") || "";
      if (this.hasAttribute("expanded")) this.setAttribute("data-expanded", "true");
      else if (!this.hasAttribute("data-expanded")) this.setAttribute("data-expanded", "false");
    }
  }

  /* ==================================================================
   * CommandBar
   * ================================================================== */
  class WuiCommandBar extends W {
    build() {
      this.classList.add("wui-commandbar");
      this.setAttribute("role", "toolbar");
    }
    sync() {}
  }

  class WuiAppBarButton extends W {
    static observedAttributes = ["icon", "label", "disabled"];

    build() {
      this.classList.add("wui-appbar-btn");
      this.setAttribute("role", "button");
      this.setAttribute("tabindex", "0");
      this.addEventListener("click", () => this.emit("click", {}));
      this.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    }

    sync() {
      const label = this.getAttribute("label") || "";
      this.innerHTML =
        icon(this.getAttribute("icon") || "more") + "<span>" + U.esc(label) + "</span>";
      this.setAttribute("aria-label", label);
      this.setAttribute("aria-disabled", this.hasAttribute("disabled") ? "true" : "false");
      this.style.opacity = this.hasAttribute("disabled") ? "0.4" : "";
    }
  }

  /* ==================================================================
   * BreadcrumbBar
   * ================================================================== */
  class WuiBreadcrumb extends W {
    static observedAttributes = ["items"];

    build() {
      this.classList.add("wui-breadcrumb");
      this.setAttribute("role", "navigation");
      this.setAttribute("aria-label", "面包屑");
      this.addEventListener("click", (e) => {
        const btn = e.target.closest(".wui-breadcrumb__item");
        if (!btn) return;
        this.emit("select", {
          index: parseInt(btn.dataset.index, 10),
          label: btn.textContent.trim(),
        });
      });
    }

    sync() {
      const items = (this.getAttribute("items") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      this.innerHTML = items
        .map((label, i) => {
          const last = i === items.length - 1;
          const crumb =
            '<button type="button" class="wui-breadcrumb__item" data-index="' +
            i +
            '"' +
            (last ? ' aria-current="page"' : "") +
            ">" +
            U.esc(label) +
            "</button>";
          const sep = last
            ? ""
            : '<span class="wui-breadcrumb__sep">' + icon("chevron-right") + "</span>";
          return crumb + sep;
        })
        .join("");
    }
  }

  /* ==================================================================
   * PipsPager
   * ================================================================== */
  class WuiPipsPager extends W {
    static observedAttributes = ["count", "selected"];

    build() {
      this.classList.add("wui-pips");
      this.addEventListener("click", (e) => {
        const pip = e.target.closest(".wui-pips__pip");
        if (!pip) return;
        this.setAttribute("selected", pip.dataset.index);
      });
    }

    sync() {
      const count = parseInt(this.getAttribute("count"), 10) || 5;
      const selected = parseInt(this.getAttribute("selected"), 10) || 0;
      this.innerHTML = Array.from({ length: count })
        .map(
          (_, i) =>
            '<button type="button" class="wui-pips__pip" data-index="' +
            i +
            '" aria-label="第 ' +
            (i + 1) +
            ' 页"' +
            (i === selected ? ' aria-current="true"' : "") +
            "></button>"
        )
        .join("");
    }
  }

  /* ==================================================================
   * PersonPicture
   * ================================================================== */
  class WuiPerson extends W {
    static observedAttributes = ["initials", "size", "src", "badge"];

    build() {
      this.classList.add("wui-person");
    }

    sync() {
      const size = this.getAttribute("size");
      this.classList.toggle("wui-person--sm", size === "sm");
      this.classList.toggle("wui-person--lg", size === "lg");
      this.classList.toggle("wui-person--xl", size === "xl");
      const src = this.getAttribute("src");
      const initials = (this.getAttribute("initials") || this.textContent.trim() || "?").slice(0, 2);
      this.innerHTML =
        (src ? '<img src="' + U.esc(src) + '" alt="">' : U.esc(initials).toUpperCase()) +
        (this.hasAttribute("badge") ? '<span class="wui-person__badge"></span>' : "");
    }
  }

  /* ==================================================================
   * CalendarView
   * ================================================================== */
  const MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const DOW = ["一", "二", "三", "四", "五", "六", "日"];

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function toISO(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  class WuiCalendar extends W {
    static observedAttributes = ["value"];

    build() {
      this.classList.add("wui-calendar");
      const today = new Date();
      const initial = this.hasAttribute("value") ? new Date(this.getAttribute("value")) : today;
      this._view = new Date(initial.getFullYear(), initial.getMonth(), 1);
      this._selected = initial;

      this.addEventListener("click", (e) => {
        const nav = e.target.closest("[data-nav]");
        if (nav) {
          const dir = nav.dataset.nav === "prev" ? -1 : 1;
          this._view = new Date(this._view.getFullYear(), this._view.getMonth() + dir, 1);
          this._render();
          return;
        }
        const day = e.target.closest(".wui-calendar__day");
        if (day && day.dataset.date) {
          this._selected = new Date(day.dataset.date);
          this.setAttr("value", toISO(this._selected));
          this._render();
          this.emit("change", { value: toISO(this._selected) });
          this.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }

    _render() {
      const view = this._view;
      const year = view.getFullYear();
      const month = view.getMonth();
      const first = new Date(year, month, 1);
      const startOffset = (first.getDay() + 6) % 7; // 周一为首列
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevDays = new Date(year, month, 0).getDate();
      const todayISO = toISO(new Date());
      const selectedISO = this._selected ? toISO(this._selected) : "";

      let cells = "";
      for (let i = 0; i < 42; i++) {
        const dayNum = i - startOffset + 1;
        let d;
        let outside = false;
        if (dayNum < 1) {
          d = new Date(year, month - 1, prevDays + dayNum);
          outside = true;
        } else if (dayNum > daysInMonth) {
          d = new Date(year, month + 1, dayNum - daysInMonth);
          outside = true;
        } else {
          d = new Date(year, month, dayNum);
        }
        const iso = toISO(d);
        const cls =
          "wui-calendar__day" +
          (outside ? " wui-calendar__day--outside" : "") +
          (iso === todayISO ? " wui-calendar__day--today" : "") +
          (iso === selectedISO ? " wui-calendar__day--selected" : "");
        cells += '<button type="button" class="' + cls + '" data-date="' + iso + '">' + d.getDate() + "</button>";
      }

      this.innerHTML =
        '<div class="wui-calendar__header">' +
        '<button type="button" class="wui-btn wui-btn--subtle wui-btn--icon wui-btn--sm" data-nav="prev" aria-label="上个月">' +
        icon("chevron-left") +
        "</button>" +
        '<div class="wui-calendar__title">' +
        year +
        " 年 " +
        MONTHS[month] +
        "</div>" +
        '<button type="button" class="wui-btn wui-btn--subtle wui-btn--icon wui-btn--sm" data-nav="next" aria-label="下个月">' +
        icon("chevron-right") +
        "</button>" +
        "</div>" +
        '<div class="wui-calendar__grid">' +
        DOW.map((d) => '<div class="wui-calendar__dow">' + d + "</div>").join("") +
        cells +
        "</div>";
    }

    sync() {
      if (this.hasAttribute("value")) {
        const d = new Date(this.getAttribute("value"));
        if (!Number.isNaN(d.getTime())) {
          this._selected = d;
          this._view = new Date(d.getFullYear(), d.getMonth(), 1);
        }
      }
      this._render();
    }
  }

  /* ==================================================================
   * DatePicker
   * ================================================================== */
  class WuiDatePicker extends W {
    static observedAttributes = ["value", "header"];

    build() {
      this.classList.add("wui-field");
      this.innerHTML = "";
      this._header = U.el("div", { class: "wui-field__header" });
      this._box = U.el("div", { class: "wui-datepicker" });
      this.appendChild(this._header);
      this.appendChild(this._box);
      this._date = new Date();

      this._box.addEventListener("click", (e) => {
        if (e.target.closest(".wui-datepicker__segment")) this._open();
      });
    }

    _open() {
      if (this._panel) return;
      const panel = U.el("div", { class: "wui-calendar", style: "position:fixed" });
      const cal = document.createElement("wui-calendar");
      cal.setAttribute("value", toISO(this._date));
      panel.appendChild(cal);
      document.body.appendChild(panel);
      WinUI.position(this._box, panel, { gap: 4 });
      this._panel = panel;

      cal.addEventListener("change", (e) => {
        this._date = new Date(e.detail.value);
        this.setAttr("value", toISO(this._date));
        this._render();
        this.emit("change", { value: toISO(this._date) });
        this._close();
      });
      this._cleanup = WinUI.dismissable(panel, this._box, () => this._close());
    }

    _close() {
      if (this._panel) {
        this._panel.remove();
        this._panel = null;
      }
      if (this._cleanup) this._cleanup();
    }

    _render() {
      const d = this._date;
      const seg = (text) =>
        '<button type="button" class="wui-datepicker__segment"><span>' +
        text +
        '</span><span class="wui-icon">' +
        icon("chevron-down") +
        "</span></button>";
      this._box.innerHTML =
        seg(d.getFullYear() + " 年") + seg(MONTHS[d.getMonth()]) + seg(d.getDate() + " 日");
    }

    sync() {
      const header = this.getAttribute("header");
      this._header.textContent = header || "";
      this._header.hidden = !header;
      if (this.hasAttribute("value")) {
        const d = new Date(this.getAttribute("value"));
        if (!Number.isNaN(d.getTime())) this._date = d;
      }
      this._render();
    }
  }

  /* ==================================================================
   * 注册
   * ================================================================== */
  WinUI.define("wui-nav-view", WuiNavView, WuiNavView.observedAttributes);
  WinUI.define("wui-tab-view", WuiTabView, WuiTabView.observedAttributes);
  WinUI.define("wui-list-view", WuiListView, WuiListView.observedAttributes);
  WinUI.define("wui-grid-view", WuiGridView, WuiGridView.observedAttributes);
  WinUI.define("wui-tree-view", WuiTreeView);
  WinUI.define("wui-tree-node", WuiTreeNode, WuiTreeNode.observedAttributes);
  WinUI.define("wui-expander", WuiExpander, WuiExpander.observedAttributes);
  WinUI.define("wui-command-bar", WuiCommandBar);
  WinUI.define("wui-app-bar-button", WuiAppBarButton, WuiAppBarButton.observedAttributes);
  WinUI.define("wui-breadcrumb", WuiBreadcrumb, WuiBreadcrumb.observedAttributes);
  WinUI.define("wui-pips-pager", WuiPipsPager, WuiPipsPager.observedAttributes);
  WinUI.define("wui-person", WuiPerson, WuiPerson.observedAttributes);
  WinUI.define("wui-calendar", WuiCalendar, WuiCalendar.observedAttributes);
  WinUI.define("wui-date-picker", WuiDatePicker, WuiDatePicker.observedAttributes);
})(window);
