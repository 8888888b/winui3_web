/*!
 * WinUI 3 for the Web — Inputs
 * Button / CheckBox / RadioButton / ToggleSwitch / TextBox / PasswordBox /
 * NumberBox / AutoSuggestBox / ComboBox / Slider / RatingControl / Progress
 */
(function (global) {
  "use strict";
  const WinUI = global.WinUI;
  const U = WinUI.util;
  const W = WinUI.WuiElement;
  const icon = WinUI.icon;

  const STAR_D =
    "M8 2.1l1.83 3.72 4.1.6-2.97 2.9.7 4.1L8 11.48l-3.66 1.94.7-4.1L2.07 6.42l4.1-.6z";

  function starSvg(filled) {
    return (
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' +
      STAR_D +
      '" fill="' +
      (filled ? "currentColor" : "none") +
      '" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>'
    );
  }

  /* ==================================================================
   * Button
   * ================================================================== */
  class WuiButton extends W {
    static observedAttributes = [
      "variant",
      "size",
      "icon",
      "disabled",
      "checked",
      "chevron",
      "tooltip",
    ];

    build() {
      this.classList.add("wui-btn");
      if (!this.hasAttribute("role")) this.setAttribute("role", "button");
      this._tabIndex();

      this._onClick = (e) => {
        if (this.hasAttribute("disabled")) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        if (this.hasAttribute("toggle")) {
          const next = !this.hasAttribute("checked");
          this.setAttr("checked", next);
          this.sync();
          this.emit("toggle", { checked: next });
        }
      };
      this.addEventListener("click", this._onClick);

      this._onKey = (e) => {
        if (e.key === " " || e.key === "Enter") {
          if (e.key === " ") e.preventDefault();
          if (e.repeat) return;
          this.click();
        }
      };
      this.addEventListener("keydown", this._onKey);

      if (this.hasAttribute("tooltip")) this.setAttribute("title", this.getAttribute("tooltip"));
    }

    _tabIndex() {
      this.setAttribute("tabindex", this.hasAttribute("disabled") ? "-1" : "0");
    }

    sync() {
      const variant = this.getAttribute("variant");
      const size = this.getAttribute("size");
      const disabled = this.hasAttribute("disabled");
      const isToggle = this.hasAttribute("toggle");
      const checked = this.hasAttribute("checked");

      this.classList.add("wui-btn");
      this.classList.toggle("wui-btn--accent", variant === "accent");
      this.classList.toggle("wui-btn--subtle", variant === "subtle");
      this.classList.toggle("wui-btn--hyperlink", variant === "hyperlink");
      this.classList.toggle("wui-btn--accent-outline", variant === "accent-outline");
      this.classList.toggle("wui-btn--sm", size === "sm");
      this.classList.toggle("wui-btn--lg", size === "lg");
      this.classList.toggle("wui-btn--stretch", this.hasAttribute("stretch"));
      this.classList.toggle(
        "wui-btn--icon",
        this.hasAttribute("icon") && !this.textContent.trim()
      );

      if (isToggle) {
        this.setAttribute("aria-pressed", checked ? "true" : "false");
        this.setAttribute("aria-checked", checked ? "true" : "false");
      } else {
        this.removeAttribute("aria-pressed");
        this.removeAttribute("aria-checked");
      }

      if (disabled) {
        this.setAttribute("aria-disabled", "true");
        this.setAttribute("tabindex", "-1");
      } else {
        this.removeAttribute("aria-disabled");
        this.setAttribute("tabindex", "0");
      }

      // 前置图标
      const iconName = this.getAttribute("icon");
      let iconEl = this.querySelector(":scope > .wui-btn__icon");
      if (iconName) {
        if (!iconEl) {
          this.insertAdjacentHTML("afterbegin", icon(iconName, "wui-btn__icon"));
        } else {
          iconEl.outerHTML = icon(iconName, "wui-btn__icon");
        }
      } else if (iconEl) {
        iconEl.remove();
      }

      // 下拉箭头
      let chev = this.querySelector(":scope > .wui-btn__chevron");
      if (this.hasAttribute("chevron")) {
        if (!chev) {
          this.insertAdjacentHTML(
            "beforeend",
            '<span class="wui-btn__chevron">' + icon("chevron-down") + "</span>"
          );
        }
      } else if (chev) {
        chev.remove();
      }
    }
  }

  /* ==================================================================
   * DropDownButton / SplitButton
   * ================================================================== */
  class WuiDropDownButton extends W {
    static observedAttributes = ["label", "icon", "items", "variant", "disabled", "size"];

    build() {
      this.style.display = "inline-flex";
      this._btn = document.createElement("button");
      this._btn.type = "button";
      this._btn.className = "wui-btn";
      this._btn.style.width = "100%";
      this.innerHTML = "";
      this.appendChild(this._btn);

      this._btn.addEventListener("click", () => this._open());
      this._btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this._open();
        }
      });
    }

    sync() {
      const label = this.getAttribute("label") || "";
      const iconName = this.getAttribute("icon");
      const variant = this.getAttribute("variant");
      const size = this.getAttribute("size");
      const disabled = this.hasAttribute("disabled");
      this._btn.className = "wui-btn";
      if (variant === "accent") this._btn.classList.add("wui-btn--accent");
      if (variant === "subtle") this._btn.classList.add("wui-btn--subtle");
      if (size === "sm") this._btn.classList.add("wui-btn--sm");
      this._btn.disabled = disabled;
      this._btn.innerHTML =
        (iconName ? icon(iconName, "wui-btn__icon") : "") +
        '<span class="wui-btn__label">' +
        U.esc(label) +
        "</span>" +
        '<span class="wui-btn__chevron">' +
        icon("chevron-down") +
        "</span>";
    }

    _open() {
      if (this.hasAttribute("disabled")) return;
      const items = (this.getAttribute("items") || "").split(",").filter(Boolean);
      const panel = WinUI.menuPanel(
        items.map((label, i) => ({ label: label.trim(), value: i })),
        (item) => {
          this.emit("select", item);
        }
      );
      WinUI.layerHost().appendChild(panel);
      WinUI.position(this._btn, panel, { gap: 4 });
      WinUI.dismissable(panel, this._btn, () => panel.remove());
      WinUI.focusFirst(panel);
    }
  }

  class WuiSplitButton extends W {
    static observedAttributes = ["label", "icon", "items", "variant", "disabled", "size"];

    build() {
      this.classList.add("wui-splitbtn");
      this._main = document.createElement("button");
      this._main.type = "button";
      this._more = document.createElement("button");
      this._more.type = "button";
      this._more.setAttribute("aria-label", "更多选项");
      this.appendChild(this._main);
      this.appendChild(this._more);

      this._main.addEventListener("click", () => this.emit("click", {}));
      this._more.addEventListener("click", () => this._open());
    }

    sync() {
      const variant = this.getAttribute("variant");
      const size = this.getAttribute("size");
      const disabled = this.hasAttribute("disabled");
      const cls = (base) => {
        let c = "wui-btn wui-btn--subtle " + base;
        if (variant === "accent") c += " wui-btn--accent";
        if (size === "sm") c += " wui-btn--sm";
        return c;
      };
      this._main.className = cls("wui-splitbtn__main");
      this._more.className = cls("wui-splitbtn__more");
      const label = this.getAttribute("label") || "";
      const iconName = this.getAttribute("icon");
      this._main.innerHTML =
        (iconName ? icon(iconName, "wui-btn__icon") : "") + "<span>" + U.esc(label) + "</span>";
      this._more.innerHTML = icon("chevron-down");
      this._main.disabled = disabled;
      this._more.disabled = disabled;
    }

    _open() {
      const items = (this.getAttribute("items") || "").split(",").filter(Boolean);
      const panel = WinUI.menuPanel(
        items.map((label, i) => ({ label: label.trim(), value: i })),
        (item) => this.emit("select", item)
      );
      WinUI.layerHost().appendChild(panel);
      WinUI.position(this._more, panel, { gap: 4, align: "end" });
      WinUI.dismissable(panel, this._more, () => panel.remove());
      WinUI.focusFirst(panel);
    }
  }

  /* ==================================================================
   * CheckBox / RadioButton / ToggleSwitch
   * ================================================================== */
  class WuiCheckbox extends W {
    static observedAttributes = ["checked", "disabled", "indeterminate", "label"];

    build() {
      this.classList.add("wui-checkbox");
      this.setAttribute("role", "checkbox");

      this._label = document.createElement("span");
      this._label.className = "wui-checkbox__label";

      this._box = document.createElement("span");
      this._box.className = "wui-checkbox__box";
      this._box.innerHTML =
        '<svg viewBox="0 0 12 12"><path d="M2 6.4 4.7 9 10 3.2"/></svg>';

      const content = U.take(this);
      this.appendChild(this._box);
      this.appendChild(this._label);
      content.forEach((n) => this._label.appendChild(n));

      this._onClick = () => this.toggle();
      this.addEventListener("click", this._onClick);
      this.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    toggle() {
      if (this.hasAttribute("disabled")) return;
      const next = !this.hasAttribute("checked");
      this.setAttr("checked", next);
      this.setAttr("indeterminate", false);
      this.sync();
      this.emit("change", { checked: next });
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }

    sync() {
      const checked = this.hasAttribute("checked");
      const mixed = this.hasAttribute("indeterminate");
      this.setAttribute("aria-checked", mixed ? "mixed" : checked ? "true" : "false");
      this.setAttribute("tabindex", this.hasAttribute("disabled") ? "-1" : "0");
      this.setAttribute(
        "aria-disabled",
        this.hasAttribute("disabled") ? "true" : this.getAttribute("aria-disabled") || "false"
      );
      if (!this._label.textContent.trim()) {
        this._label.textContent = this.getAttribute("label") || "";
        this._label.hidden = !this._label.textContent;
      }
    }
  }

  class WuiRadio extends W {
    static observedAttributes = ["checked", "disabled", "name", "label", "inline"];

    build() {
      this.classList.add("wui-radio");
      this.setAttribute("role", "radio");

      this._label = document.createElement("span");
      this._label.className = "wui-radio__label";
      this._dot = document.createElement("span");
      this._dot.className = "wui-radio__dot";

      const content = U.take(this);
      this.appendChild(this._dot);
      this.appendChild(this._label);
      content.forEach((n) => this._label.appendChild(n));

      this.addEventListener("click", () => this.select());
      this.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          this.select();
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          this._step(1);
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          this._step(-1);
        }
      });
    }

    select() {
      if (this.hasAttribute("disabled")) return;
      const name = this.getAttribute("name");
      if (name) {
        document.querySelectorAll('wui-radio[name="' + name + '"]').forEach((r) => {
          if (r !== this) {
            r.setAttr("checked", false);
            r.sync();
          }
        });
      }
      this.setAttr("checked", true);
      this.sync();
      this.emit("change", { value: this.getAttribute("value") });
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }

    _step(dir) {
      const name = this.getAttribute("name");
      if (!name) return;
      const list = Array.prototype.slice.call(
        document.querySelectorAll('wui-radio[name="' + name + '"]:not([disabled])')
      );
      const i = list.indexOf(this);
      const next = list[(i + dir + list.length) % list.length];
      if (next) {
        next.select();
        next.focus();
      }
    }

    sync() {
      const checked = this.hasAttribute("checked");
      this.setAttribute("aria-checked", checked ? "true" : "false");
      this.setAttribute("tabindex", this.hasAttribute("disabled") ? "-1" : "0");
      this.classList.toggle("wui-radio--inline", this.hasAttribute("inline"));
      if (!this._label.textContent.trim()) {
        this._label.textContent = this.getAttribute("label") || "";
        this._label.hidden = !this._label.textContent;
      }
    }
  }

  class WuiSwitch extends W {
    static observedAttributes = ["checked", "disabled", "label", "on-content", "off-content"];

    build() {
      this.classList.add("wui-switch");
      this.setAttribute("role", "switch");

      this._label = document.createElement("span");
      this._label.className = "wui-switch__label";
      this._track = document.createElement("span");
      this._track.className = "wui-switch__track";
      this._knob = document.createElement("span");
      this._knob.className = "wui-switch__knob";
      this._track.appendChild(this._knob);

      const content = U.take(this);
      this.appendChild(this._track);
      this.appendChild(this._label);
      content.forEach((n) => this._label.appendChild(n));

      this.addEventListener("click", () => this.toggle());
      this.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          this.toggle();
        } else if (e.key === "ArrowLeft") {
          this._set(false);
        } else if (e.key === "ArrowRight") {
          this._set(true);
        }
      });
    }

    toggle() {
      this._set(!this.hasAttribute("checked"));
    }

    _set(v) {
      if (this.hasAttribute("disabled")) return;
      this.setAttr("checked", v);
      this.sync();
      this.emit("change", { checked: !!v });
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }

    sync() {
      const checked = this.hasAttribute("checked");
      this.setAttribute("aria-checked", checked ? "true" : "false");
      this.setAttribute("tabindex", this.hasAttribute("disabled") ? "-1" : "0");
      if (!this._label.textContent.trim()) {
        this._label.textContent = this.getAttribute("label") || "";
        this._label.hidden = !this._label.textContent;
      }
    }
  }

  /* ==================================================================
   * 文本输入基类
   * ================================================================== */
  class TextInputBase extends W {
    static observedAttributes = [
      "header",
      "placeholder",
      "value",
      "description",
      "error",
      "disabled",
      "readonly",
      "multiline",
      "clearable",
      "required",
      "maxlength",
      "icon",
    ];

    get inputType() {
      return "text";
    }
    get isPassword() {
      return false;
    }

    build() {
      this.classList.add("wui-field");
      const initialText = this.textContent.trim();
      this.innerHTML = "";

      this._headerEl = U.el("div", { class: "wui-field__header" });
      this._box = U.el("div", { class: "wui-textbox" });
      this._descEl = U.el("div", { class: "wui-field__desc" });
      this._errEl = U.el("div", { class: "wui-field__error" });
      this._descEl.hidden = true;
      this._errEl.hidden = true;

      if (this.hasAttribute("icon")) {
        this._box.insertAdjacentHTML("beforeend", icon(this.getAttribute("icon"), "wui-textbox__prefix"));
      }

      const multiline = this.hasAttribute("multiline");
      this._input = document.createElement(multiline ? "textarea" : "input");
      this._input.className = "wui-textbox__input";
      if (!multiline) this._input.type = this.inputType;
      if (multiline) this._input.rows = 3;
      this._box.appendChild(this._input);

      if (this.isPassword) {
        this._action = U.el("button", {
          class: "wui-textbox__action",
          type: "button",
          "aria-label": "显示密码",
        });
        this._action.innerHTML = icon("eye");
        this._box.appendChild(this._action);
        this._action.addEventListener("click", () => {
          const reveal = this._input.type === "password";
          this._input.type = reveal ? "text" : "password";
          this._action.innerHTML = icon(reveal ? "eye-off" : "eye");
          this._action.setAttribute("aria-label", reveal ? "隐藏密码" : "显示密码");
        });
      } else if (this.hasAttribute("clearable")) {
        this._action = U.el("button", {
          class: "wui-textbox__action",
          type: "button",
          "aria-label": "清除",
        });
        this._action.innerHTML = icon("close");
        this._box.appendChild(this._action);
        this._action.addEventListener("click", () => {
          this.value = "";
          this._input.focus();
          this._emit();
        });
      }

      this.appendChild(this._headerEl);
      this.appendChild(this._box);
      this.appendChild(this._descEl);
      this.appendChild(this._errEl);

      if (!this.hasAttribute("value") && initialText) this._value = initialText;
      else this._value = this.getAttribute("value") || "";

      this._input.value = this._value;

      this._onInput = () => {
        this._value = this._input.value;
        this._silent = true;
        this.setAttribute("value", this._value);
        this._silent = false;
        this._box.classList.toggle("wui-textbox--has-value", !!this._value);
        this._emit();
      };
      this._input.addEventListener("input", this._onInput);
      this._input.addEventListener("change", () => this.emit("change", { value: this._value }));

      this._input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !this.hasAttribute("multiline")) {
          this.emit("submit", { value: this._value });
        }
      });
    }

    _emit() {
      this.emit("input", { value: this._value });
    }

    get value() {
      return this._input ? this._input.value : this.getAttribute("value") || "";
    }

    set value(v) {
      if (!this._input) return;
      this._input.value = v == null ? "" : v;
      this._value = this._input.value;
      this._silent = true;
      this.setAttribute("value", this._value);
      this._silent = false;
      this._box.classList.toggle("wui-textbox--has-value", !!this._value);
    }

    sync() {
      const header = this.getAttribute("header");
      this._headerEl.innerHTML = header
        ? U.esc(header) +
          (this.hasAttribute("required")
            ? '<span class="wui-field__required" aria-hidden="true">*</span>'
            : "")
        : "";
      this._headerEl.hidden = !header;

      const desc = this.getAttribute("description");
      this._descEl.textContent = desc || "";
      this._descEl.hidden = !desc;

      const error = this.getAttribute("error");
      this._errEl.innerHTML = error ? icon("error", "wui-icon--sm") + "<span>" + U.esc(error) + "</span>" : "";
      this._errEl.hidden = !error;
      this._box.classList.toggle("wui-textbox--error", !!error);

      const placeholder = this.getAttribute("placeholder");
      if (placeholder) this._input.placeholder = placeholder;
      else this._input.removeAttribute("placeholder");

      const disabled = this.hasAttribute("disabled");
      this._input.disabled = disabled;
      this._box.classList.toggle("wui-textbox--disabled", disabled);

      this._input.readOnly = this.hasAttribute("readonly");

      if (this.hasAttribute("multiline") && this._input.tagName !== "TEXTAREA") {
        this._input = this._replaceInput("textarea");
      }
      this._box.classList.toggle("wui-textbox--multiline", this.hasAttribute("multiline"));

      const maxlength = this.getAttribute("maxlength");
      if (maxlength) this._input.setAttribute("maxlength", maxlength);
      else this._input.removeAttribute("maxlength");

      const value = this.getAttribute("value");
      if (value != null && value !== this._input.value && document.activeElement !== this._input) {
        this._input.value = value;
        this._value = value;
      }
      this._box.classList.toggle("wui-textbox--has-value", !!this._input.value);

      if (this._action && !this.isPassword) this._action.hidden = !this._input.value;
    }

    _replaceInput(tag) {
      const next = document.createElement(tag);
      next.className = "wui-textbox__input";
      next.value = this._input.value;
      this._input.replaceWith(next);
      next.addEventListener("input", this._onInput);
      return next;
    }
  }

  class WuiTextBox extends TextInputBase {}

  class WuiPasswordBox extends TextInputBase {
    get inputType() {
      return "password";
    }
    get isPassword() {
      return true;
    }
  }

  /* ==================================================================
   * NumberBox
   * ================================================================== */
  class WuiNumberBox extends W {
    static observedAttributes = [
      "header",
      "value",
      "min",
      "max",
      "step",
      "disabled",
      "description",
      "placeholder",
      "show-spin",
    ];

    build() {
      this.classList.add("wui-field");
      this.innerHTML = "";
      this._headerEl = U.el("div", { class: "wui-field__header" });
      this._box = U.el("div", { class: "wui-numberbox" });

      this._input = document.createElement("input");
      this._input.className = "wui-numberbox__input";
      this._input.type = "text";
      this._input.inputMode = "decimal";
      this._box.appendChild(this._input);

      this._spin = U.el("div", { class: "wui-numberbox__spin" });
      this._spin.innerHTML =
        '<button type="button" aria-label="增加">' +
        icon("chevron-up") +
        '</button><button type="button" aria-label="减少">' +
        icon("chevron-down") +
        "</button>";
      this._box.appendChild(this._spin);

      this.appendChild(this._headerEl);
      this.appendChild(this._box);

      this._spin.children[0].addEventListener("click", () => this._nudge(1));
      this._spin.children[1].addEventListener("click", () => this._nudge(-1));

      this._input.addEventListener("change", () => this._commit(this._input.value));
      this._input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          this._nudge(1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this._nudge(-1);
        } else if (e.key === "Enter") {
          this._commit(this._input.value);
        }
      });
    }

    get min() {
      const v = parseFloat(this.getAttribute("min"));
      return Number.isNaN(v) ? -Infinity : v;
    }

    get max() {
      const v = parseFloat(this.getAttribute("max"));
      return Number.isNaN(v) ? Infinity : v;
    }

    get step() {
      const v = parseFloat(this.getAttribute("step"));
      return Number.isNaN(v) ? 1 : v;
    }

    get value() {
      const v = parseFloat(this._input.value);
      return Number.isNaN(v) ? 0 : v;
    }

    _nudge(dir) {
      if (this.hasAttribute("disabled")) return;
      this._commit((this.value || 0) + dir * this.step);
    }

    _commit(raw) {
      let v = parseFloat(String(raw).replace(/[^0-9.+-]/g, ""));
      if (Number.isNaN(v)) v = 0;
      v = U.clamp(v, this.min, this.max);
      v = Math.round(v * 100000) / 100000;
      this._input.value = String(v);
      this.setAttr("value", v);
      this.emit("change", { value: v });
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }

    sync() {
      const header = this.getAttribute("header");
      this._headerEl.textContent = header || "";
      this._headerEl.hidden = !header;

      const value = this.getAttribute("value");
      if (value != null && document.activeElement !== this._input) this._input.value = value;
      else if (value == null && !this._input.value) this._input.value = "0";

      this._input.placeholder = this.getAttribute("placeholder") || "";
      this._input.disabled = this.hasAttribute("disabled");
      this._spin.hidden = this.hasAttribute("show-spin") ? false : this._spin.hidden;
      if (!this.hasAttribute("show-spin")) this._spin.style.display = "none";
      else this._spin.style.display = "";
    }
  }

  /* ==================================================================
   * AutoSuggestBox
   * ================================================================== */
  class WuiAutoSuggest extends W {
    static observedAttributes = ["placeholder", "value", "items", "header", "icon"];

    build() {
      this.classList.add("wui-field", "wui-autosuggest");
      this.innerHTML = "";
      this._headerEl = U.el("div", { class: "wui-field__header" });
      this._box = U.el("div", { class: "wui-textbox" });
      this._box.insertAdjacentHTML("beforeend", icon("search", "wui-textbox__prefix"));
      this._input = document.createElement("input");
      this._input.className = "wui-textbox__input";
      this._input.type = "search";
      this._box.appendChild(this._input);
      this.appendChild(this._headerEl);
      this.appendChild(this._box);

      this._input.addEventListener("input", () => this._show());
      this._input.addEventListener("focus", () => this._show());
      this._input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          this._move(e.key === "ArrowDown" ? 1 : -1);
        } else if (e.key === "Enter") {
          const sel = this._panel && this._panel.querySelector('[aria-selected="true"]');
          if (sel) this._choose(sel.dataset.value);
          else this.emit("query", { query: this._input.value });
        } else if (e.key === "Escape") {
          this._hide();
        }
      });
    }

    get _items() {
      return (this.getAttribute("items") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    _show() {
      const q = this._input.value.trim().toLowerCase();
      const list = this._items.filter((i) => !q || i.toLowerCase().includes(q));
      if (!list.length) return this._hide();
      if (!this._panel) {
        this._panel = U.el("div", { class: "wui-suggest-list", role: "listbox" });
        this.appendChild(this._panel);
      }
      this._panel.innerHTML = list
        .map(
          (item, i) =>
            '<div class="wui-suggest-item" role="option" data-value="' +
            U.esc(item) +
            '" aria-selected="' +
            (i === 0) +
            '">' +
            icon("search") +
            "<span>" +
            U.esc(item) +
            "</span></div>"
        )
        .join("");
      this._panel.hidden = false;
      this._panel.querySelectorAll(".wui-suggest-item").forEach((el) => {
        el.addEventListener("mousedown", (e) => {
          e.preventDefault();
          this._choose(el.dataset.value);
        });
      });
    }

    _hide() {
      if (this._panel) this._panel.hidden = true;
    }

    _move(dir) {
      if (!this._panel || this._panel.hidden) return this._show();
      const items = Array.prototype.slice.call(this._panel.children);
      let i = items.findIndex((el) => el.getAttribute("aria-selected") === "true");
      items.forEach((el) => el.setAttribute("aria-selected", "false"));
      i = (i + dir + items.length) % items.length;
      items[i].setAttribute("aria-selected", "true");
    }

    _choose(value) {
      this._input.value = value;
      this._hide();
      this.emit("select", { value: value });
      this.emit("input", { value: value });
    }

    sync() {
      const header = this.getAttribute("header");
      this._headerEl.textContent = header || "";
      this._headerEl.hidden = !header;
      this._input.placeholder = this.getAttribute("placeholder") || "搜索";
      const value = this.getAttribute("value");
      if (value != null && document.activeElement !== this._input) this._input.value = value;
    }
  }

  /* ==================================================================
   * ComboBox
   * ================================================================== */
  class WuiComboBox extends W {
    static observedAttributes = ["header", "placeholder", "items", "selected-index", "value", "disabled"];

    build() {
      this.classList.add("wui-field");
      this.innerHTML = "";
      this._headerEl = U.el("div", { class: "wui-field__header" });
      this._combo = U.el("div", { class: "wui-combobox", role: "combobox", tabindex: "0" });
      this._combo.setAttribute("aria-haspopup", "listbox");
      this._combo.setAttribute("aria-expanded", "false");

      this._combo.innerHTML =
        '<button type="button" class="wui-combobox__button" tabindex="-1">' +
        '<span class="wui-combobox__value wui-combobox__value--placeholder"></span>' +
        '<span class="wui-combobox__chevron">' +
        icon("chevron-down") +
        "</span></button>";

      this.appendChild(this._headerEl);
      this.appendChild(this._combo);

      this._valueEl = this._combo.querySelector(".wui-combobox__value");

      this._combo.addEventListener("click", () => this._toggle());
      this._combo.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          this._open();
        } else if (e.key === "Escape") {
          this._close();
        }
      });
    }

    get options() {
      const opts = Array.prototype.map.call(this.querySelectorAll("option"), (o) => ({
        label: o.textContent.trim(),
        value: o.value || o.textContent.trim(),
      }));
      if (opts.length) return opts;
      return (this.getAttribute("items") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ label: s, value: s }));
    }

    get selectedIndex() {
      const v = this.getAttribute("selected-index");
      return v == null ? -1 : parseInt(v, 10);
    }

    set selectedIndex(i) {
      this.setAttr("selected-index", i);
      this.sync();
      this.emit("change", { index: i, value: (this.options[i] || {}).value });
    }

    _toggle() {
      if (this.hasAttribute("disabled")) return;
      if (this._panel) this._close();
      else this._open();
    }

    _open() {
      if (this.hasAttribute("disabled")) return;
      const options = this.options;
      if (!options.length) return;
      if (this._panel) this._panel.remove();

      const panel = U.el("div", { class: "wui-combobox__dropdown", role: "listbox" });
      panel.style.position = "fixed";
      panel.innerHTML = options
        .map(
          (o, i) =>
            '<div class="wui-combobox__item" role="option" data-index="' +
            i +
            '" aria-selected="' +
            (i === this.selectedIndex) +
            '">' +
            U.esc(o.label) +
            "</div>"
        )
        .join("");
      document.body.appendChild(panel);
      panel.style.minWidth = this._combo.offsetWidth + "px";
      panel.style.width = this._combo.offsetWidth + "px";
      WinUI.position(this._combo, panel, { gap: 4 });
      this._panel = panel;
      this._combo.setAttribute("aria-expanded", "true");

      panel.querySelectorAll(".wui-combobox__item").forEach((el) => {
        el.addEventListener("click", () => {
          this.selectedIndex = parseInt(el.dataset.index, 10);
          this._close();
          this._combo.focus();
        });
      });

      this._cleanup = WinUI.dismissable(panel, this._combo, () => this._close());
      const sel = panel.querySelector('[aria-selected="true"]');
      if (sel) sel.scrollIntoView({ block: "nearest" });
    }

    _close() {
      if (this._panel) {
        this._panel.remove();
        this._panel = null;
      }
      this._combo.setAttribute("aria-expanded", "false");
      if (this._cleanup) this._cleanup();
    }

    sync() {
      const header = this.getAttribute("header");
      this._headerEl.textContent = header || "";
      this._headerEl.hidden = !header;

      const options = this.options;
      const idx = this.selectedIndex;
      const placeholder = this.getAttribute("placeholder") || "请选择";
      const disabled = this.hasAttribute("disabled");

      if (idx >= 0 && options[idx]) {
        this._valueEl.textContent = options[idx].label;
        this._valueEl.classList.remove("wui-combobox__value--placeholder");
      } else {
        this._valueEl.textContent = placeholder;
        this._valueEl.classList.add("wui-combobox__value--placeholder");
      }
      this._combo.setAttribute("tabindex", disabled ? "-1" : "0");
      this._combo.style.opacity = disabled ? "0.5" : "";
      this._combo.style.pointerEvents = disabled ? "none" : "";
    }
  }

  /* ==================================================================
   * Slider
   * ================================================================== */
  class WuiSlider extends W {
    static observedAttributes = ["min", "max", "step", "value", "disabled", "show-value"];

    build() {
      this.classList.add("wui-slider");
      this.setAttribute("role", "slider");
      this.setAttribute("tabindex", "0");
      this.innerHTML =
        '<div class="wui-slider__track"><div class="wui-slider__rail">' +
        '<div class="wui-slider__fill"></div></div><div class="wui-slider__thumb"></div></div>' +
        '<span class="wui-slider__value"></span>';
      this._track = this.querySelector(".wui-slider__track");
      this._fill = this.querySelector(".wui-slider__fill");
      this._thumb = this.querySelector(".wui-slider__thumb");
      this._valueEl = this.querySelector(".wui-slider__value");

      this._dragging = false;

      this._track.addEventListener("pointerdown", (e) => {
        if (this.hasAttribute("disabled")) return;
        this._dragging = true;
        this._track.setPointerCapture(e.pointerId);
        this._setFromPointer(e);
      });
      this._track.addEventListener("pointermove", (e) => {
        if (this._dragging) this._setFromPointer(e);
      });
      this._track.addEventListener("pointerup", (e) => {
        if (!this._dragging) return;
        this._dragging = false;
        try {
          this._track.releasePointerCapture(e.pointerId);
        } catch (err) {}
        this.emit("change", { value: this.value });
        this.dispatchEvent(new Event("change", { bubbles: true }));
      });
      this._track.addEventListener("pointercancel", () => (this._dragging = false));

      this.addEventListener("keydown", (e) => {
        if (this.hasAttribute("disabled")) return;
        const step = this.step;
        let v = this.value;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") v += step;
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") v -= step;
        else if (e.key === "Home") v = this.min;
        else if (e.key === "End") v = this.max;
        else if (e.key === "PageUp") v += step * 10;
        else if (e.key === "PageDown") v -= step * 10;
        else return;
        e.preventDefault();
        this.value = v;
        this.emit("change", { value: this.value });
      });
    }

    get min() {
      const v = parseFloat(this.getAttribute("min"));
      return Number.isNaN(v) ? 0 : v;
    }
    get max() {
      const v = parseFloat(this.getAttribute("max"));
      return Number.isNaN(v) ? 100 : v;
    }
    get step() {
      const v = parseFloat(this.getAttribute("step"));
      return Number.isNaN(v) ? 1 : v;
    }
    get value() {
      const v = parseFloat(this.getAttribute("value"));
      return Number.isNaN(v) ? this.min : v;
    }
    set value(v) {
      v = U.clamp(v, this.min, this.max);
      v = Math.round(v / this.step) * this.step;
      v = Math.round(v * 1000) / 1000;
      this.setAttr("value", v);
      this._paint();
    }

    _setFromPointer(e) {
      const rect = this._track.querySelector(".wui-slider__rail").getBoundingClientRect();
      const ratio = U.clamp((e.clientX - rect.left) / rect.width, 0, 1);
      this.value = this.min + ratio * (this.max - this.min);
      this.emit("input", { value: this.value });
    }

    _paint() {
      const pct = ((this.value - this.min) / (this.max - this.min || 1)) * 100;
      this._fill.style.width = pct + "%";
      this._thumb.style.left = pct + "%";
      this._valueEl.textContent = String(this.value);
      this._valueEl.hidden = !this.hasAttribute("show-value");
      this.setAttribute("aria-valuenow", this.value);
      this.setAttribute("aria-valuemin", this.min);
      this.setAttribute("aria-valuemax", this.max);
    }

    sync() {
      this._paint();
      const disabled = this.hasAttribute("disabled");
      this.setAttribute("aria-disabled", disabled ? "true" : "false");
      this.setAttribute("tabindex", disabled ? "-1" : "0");
      if (this._valueEl) this._valueEl.style.display = this.hasAttribute("show-value") ? "" : "none";
    }
  }

  /* ==================================================================
   * RatingControl
   * ================================================================== */
  class WuiRating extends W {
    static observedAttributes = ["value", "max", "disabled", "caption"];

    build() {
      this.classList.add("wui-rating");
      this.setAttribute("role", "slider");
      this.setAttribute("tabindex", "0");
      this._stars = [];
      this._render();

      this._onClick = (e) => {
        const star = e.target.closest(".wui-rating__star");
        if (!star || this.hasAttribute("disabled")) return;
        const i = this._stars.indexOf(star);
        if (i < 0) return;
        this.value = i + 1 === this.value ? 0 : i + 1;
        this.emit("change", { value: this.value });
        this.dispatchEvent(new Event("change", { bubbles: true }));
      };
      this.addEventListener("click", this._onClick);

      this.addEventListener("pointermove", (e) => {
        const star = e.target.closest(".wui-rating__star");
        if (!star) return;
        const i = this._stars.indexOf(star);
        this._preview(i + 1);
      });
      this.addEventListener("pointerleave", () => this._preview(0));

      this.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          this.value = Math.min(this.max, this.value + 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          this.value = Math.max(0, this.value - 1);
        } else return;
        this.emit("change", { value: this.value });
      });
    }

    get max() {
      return parseInt(this.getAttribute("max"), 10) || 5;
    }
    get value() {
      return parseFloat(this.getAttribute("value")) || 0;
    }
    set value(v) {
      this.setAttr("value", v);
      this._paint();
    }

    _render() {
      const max = this.max;
      this.innerHTML = "";
      this._stars = [];
      for (let i = 0; i < max; i++) {
        const s = U.el("span", { class: "wui-rating__star" });
        s.innerHTML = starSvg(false);
        this.appendChild(s);
        this._stars.push(s);
      }
      this._captionEl = U.el("span", { class: "wui-rating__caption" });
      this.appendChild(this._captionEl);
    }

    _paint(n) {
      const value = n == null ? this.value : n;
      this._stars.forEach((s, i) => {
        const on = i < value;
        s.classList.toggle("wui-rating__star--on", on);
        s.innerHTML = starSvg(on);
      });
      this._captionEl.textContent = this.hasAttribute("caption")
        ? value + " / " + this.max
        : "";
      this.setAttribute("aria-valuenow", value);
      this.setAttribute("aria-valuemax", this.max);
    }

    _preview(n) {
      this._paint(n || undefined);
    }

    sync() {
      if (this._stars.length !== this.max) this._render();
      this._paint();
      this.setAttribute("aria-disabled", this.hasAttribute("disabled") ? "true" : "false");
    }
  }

  /* ==================================================================
   * ProgressBar / ProgressRing / InfoBadge / InfoBar
   * ================================================================== */
  class WuiProgressBar extends W {
    static observedAttributes = ["value", "indeterminate", "paused", "error"];

    build() {
      this.classList.add("wui-progress");
      this.innerHTML = '<div class="wui-progress__fill"></div><div class="wui-progress__dot"></div>';
      this._fill = this.querySelector(".wui-progress__fill");
      this._dot = this.querySelector(".wui-progress__dot");
      this.setAttribute("role", "progressbar");
    }

    sync() {
      const indeterminate = this.hasAttribute("indeterminate");
      this.classList.toggle("wui-progress--indeterminate", indeterminate);
      this.classList.toggle("wui-progress--paused", this.hasAttribute("paused"));
      this.classList.toggle("wui-progress--error", this.hasAttribute("error"));
      const v = U.clamp(parseFloat(this.getAttribute("value")) || 0, 0, 100);
      this._fill.style.width = indeterminate ? "40%" : v + "%";
      this._dot.style.display = indeterminate ? "" : "none";
      this.setAttribute("aria-valuenow", indeterminate ? "" : v);
      this.removeAttribute("aria-valuenow");
      if (!indeterminate) this.setAttribute("aria-valuenow", v);
    }
  }

  class WuiProgressRing extends W {
    static observedAttributes = ["value", "indeterminate", "size", "show-value"];

    build() {
      this.classList.add("wui-ring");
      this.innerHTML =
        '<svg class="wui-ring__svg" viewBox="0 0 32 32">' +
        '<circle class="wui-ring__track" cx="16" cy="16" r="14"></circle>' +
        '<circle class="wui-ring__arc" cx="16" cy="16" r="14"></circle>' +
        "</svg>" +
        '<span class="wui-ring__label"></span>';
      this._arc = this.querySelector(".wui-ring__arc");
      this._label = this.querySelector(".wui-ring__label");
      this._circ = 2 * Math.PI * 14;
      this._arc.style.strokeDasharray = this._circ;
      this._arc.style.strokeDashoffset = this._circ;
    }

    sync() {
      const size = this.getAttribute("size");
      if (size) this.style.setProperty("--size", size + "px");
      const indeterminate = this.hasAttribute("indeterminate");
      this.classList.toggle("wui-ring--indeterminate", indeterminate);
      const v = U.clamp(parseFloat(this.getAttribute("value")) || 0, 0, 100);
      if (!indeterminate) {
        this._arc.style.strokeDashoffset = this._circ * (1 - v / 100);
        this._arc.style.strokeDasharray = this._circ;
      } else {
        this._arc.style.strokeDashoffset = 0;
        this._arc.style.strokeDasharray = "";
      }
      this._label.textContent = this.hasAttribute("show-value") && !indeterminate ? v + "%" : "";
      this.setAttribute("role", "progressbar");
    }
  }

  class WuiBadge extends W {
    static observedAttributes = ["variant", "value"];

    build() {
      this.classList.add("wui-badge");
      this._sync();
    }

    _sync() {
      const v = this.getAttribute("value");
      if (v != null) this.textContent = v;
      const variant = this.getAttribute("variant");
      this.classList.toggle("wui-badge--dot", variant === "dot");
      this.classList.toggle("wui-badge--critical", variant === "critical");
      this.classList.toggle("wui-badge--attention", variant === "attention");
      this.classList.toggle("wui-badge--subtle", variant === "subtle");
    }

    sync() {
      this._sync();
    }
  }

  class WuiInfoBar extends W {
    static observedAttributes = ["severity", "title", "message", "closable"];

    build() {
      this.classList.add("wui-infobar");
      this.setAttribute("role", "status");
      const actions = U.take(this);

      this._icon = U.el("div", { class: "wui-infobar__icon" });
      this._body = U.el("div", { class: "wui-infobar__body" });
      this._title = U.el("div", { class: "wui-infobar__title" });
      this._msg = U.el("div", { class: "wui-infobar__message" });
      this._actions = U.el("div", { class: "wui-infobar__action" });
      this._body.appendChild(this._title);
      this._body.appendChild(this._msg);

      this.appendChild(this._icon);
      this.appendChild(this._body);
      this.appendChild(this._actions);
      actions.forEach((n) => this._actions.appendChild(n));

      this._close = U.el("button", {
        class: "wui-infobar__close",
        type: "button",
        "aria-label": "关闭",
      });
      this._close.innerHTML = icon("close");
      this._close.addEventListener("click", () => {
        this.hidden = true;
        this.emit("close", {});
      });
      this.appendChild(this._close);
    }

    sync() {
      const severity = (this.getAttribute("severity") || "informational").toLowerCase();
      this.classList.remove(
        "wui-infobar--info",
        "wui-infobar--success",
        "wui-infobar--caution",
        "wui-infobar--error"
      );
      const map = {
        informational: ["info", "info"],
        info: ["info", "info"],
        success: ["success", "success"],
        warning: ["caution", "warning"],
        caution: ["caution", "warning"],
        error: ["error", "error"],
      };
      const conf = map[severity] || map.informational;
      this.classList.add("wui-infobar--" + conf[0]);
      this._icon.innerHTML = icon(conf[1]);

      const title = this.getAttribute("title");
      const message = this.getAttribute("message");
      this._title.textContent = title || "";
      this._title.hidden = !title;
      this._msg.textContent = message || "";
      this._msg.hidden = !message;
      this._close.hidden = !this.hasAttribute("closable");
    }
  }

  /* ==================================================================
   * 注册
   * ================================================================== */
  WinUI.define("wui-button", WuiButton, WuiButton.observedAttributes);
  WinUI.define("wui-dropdown-button", WuiDropDownButton, WuiDropDownButton.observedAttributes);
  WinUI.define("wui-split-button", WuiSplitButton, WuiSplitButton.observedAttributes);
  WinUI.define("wui-checkbox", WuiCheckbox, WuiCheckbox.observedAttributes);
  WinUI.define("wui-radio", WuiRadio, WuiRadio.observedAttributes);
  WinUI.define("wui-switch", WuiSwitch, WuiSwitch.observedAttributes);
  WinUI.define("wui-textbox", WuiTextBox, WuiTextBox.observedAttributes);
  WinUI.define("wui-password-box", WuiPasswordBox, WuiPasswordBox.observedAttributes);
  WinUI.define("wui-numberbox", WuiNumberBox, WuiNumberBox.observedAttributes);
  WinUI.define("wui-autosuggest", WuiAutoSuggest, WuiAutoSuggest.observedAttributes);
  WinUI.define("wui-combobox", WuiComboBox, WuiComboBox.observedAttributes);
  WinUI.define("wui-slider", WuiSlider, WuiSlider.observedAttributes);
  WinUI.define("wui-rating", WuiRating, WuiRating.observedAttributes);
  WinUI.define("wui-progress-bar", WuiProgressBar, WuiProgressBar.observedAttributes);
  WinUI.define("wui-progress-ring", WuiProgressRing, WuiProgressRing.observedAttributes);
  WinUI.define("wui-badge", WuiBadge, WuiBadge.observedAttributes);
  WinUI.define("wui-infobar", WuiInfoBar, WuiInfoBar.observedAttributes);
})(window);
