/*!
 * WinUI 3 for the Web — XAML 渲染桥
 * 让你直接粘贴 WinUI 3 的 XAML 片段并在浏览器中渲染（支持常用控件与布局）。
 */
(function (global) {
  "use strict";
  const WinUI = global.WinUI;
  const U = WinUI.util;

  const TAGS = {
    Button: { tag: "wui-button" },
    RepeatButton: { tag: "wui-button" },
    HyperlinkButton: { tag: "wui-button", attrs: { variant: "hyperlink" } },
    ToggleButton: { tag: "wui-button", bool: { toggle: true } },
    SplitButton: { tag: "wui-split-button" },
    DropDownButton: { tag: "wui-dropdown-button" },
    CheckBox: { tag: "wui-checkbox" },
    RadioButton: { tag: "wui-radio" },
    ToggleSwitch: { tag: "wui-switch" },
    TextBox: { tag: "wui-textbox" },
    PasswordBox: { tag: "wui-password-box" },
    NumberBox: { tag: "wui-numberbox" },
    AutoSuggestBox: { tag: "wui-autosuggest" },
    ComboBox: { tag: "wui-combobox" },
    ComboBoxItem: { tag: "option" },
    Slider: { tag: "wui-slider" },
    RatingControl: { tag: "wui-rating" },
    ProgressBar: { tag: "wui-progress-bar" },
    ProgressRing: { tag: "wui-progress-ring" },
    InfoBar: { tag: "wui-infobar" },
    InfoBadge: { tag: "wui-badge" },
    Expander: { tag: "wui-expander" },
    ListView: { tag: "wui-list-view" },
    ListViewItem: { tag: "wui-list-item" },
    GridView: { tag: "wui-grid-view" },
    GridViewItem: { tag: "wui-grid-item" },
    TreeView: { tag: "wui-tree-view" },
    TreeViewItem: { tag: "wui-tree-node" },
    NavigationView: { tag: "wui-nav-view" },
    NavigationViewItem: { tag: "wui-nav-item" },
    TabView: { tag: "wui-tab-view" },
    TabViewItem: { tag: "wui-tab" },
    PersonPicture: { tag: "wui-person" },
    CalendarView: { tag: "wui-calendar" },
    CalendarDatePicker: { tag: "wui-date-picker" },
    DatePicker: { tag: "wui-date-picker" },
    BreadcrumbBar: { tag: "wui-breadcrumb" },
    PipsPager: { tag: "wui-pips-pager" },
    CommandBar: { tag: "wui-command-bar" },
    AppBarButton: { tag: "wui-app-bar-button" },
    StackPanel: { tag: "div", cls: "wui-stack" },
    Grid: { tag: "div", cls: "wui-grid" },
    Border: { tag: "div", cls: "wui-card" },
    ScrollViewer: { tag: "div", cls: "wui-scrollbox" },
    RelativePanel: { tag: "div", cls: "wui-stack" },
    TextBlock: { tag: "div" },
    RichTextBlock: { tag: "div" },
    Image: { tag: "img" },
    WebView2: { tag: "div", cls: "wui-empty", text: "WebView" },
  };

  const ATTRS = {
    Content: "content",
    Text: "value",
    Header: "header",
    PlaceholderText: "placeholder",
    Description: "description",
    IsChecked: "checked",
    IsExpanded: "expanded",
    IsClosable: "closable",
    Severity: "severity",
    Value: "value",
    Minimum: "min",
    Maximum: "max",
    SmallChange: "step",
    SelectedIndex: "selected-index",
    MaxRating: "max",
    Icon: "icon",
    Glyph: "icon",
    Title: "title",
    Message: "message",
    Label: "label",
    Width: "width",
    Height: "height",
    Margin: "margin",
    Padding: "padding",
    Spacing: "spacing",
    CornerRadius: "radius",
    Orientation: "orientation",
    IsReadOnly: "readonly",
    IsEnabled: "isenabled",
    IsIndeterminate: "indeterminate",
    IsActive: "indeterminate",
    ShowValue: "show-value",
    FontSize: "fontsize",
    FontWeight: "fontweight",
    Foreground: "foreground",
  };

  const SKIP = /^(x:|d:|mc:|AutomationProperties|ToolTipService|Grid\.|Canvas\.|VisualState|Name$|Style$|Background$|BorderBrush$|BorderThickness$)/;

  /** 布尔型属性：XAML 的 True/False → HTML 的空属性 */
  const BOOL = /^(checked|expanded|closable|readonly|indeterminate|selected|show-value|toggle)$/;

  /** Margin/Padding "12,8,12,8" → CSS */
  function box(value) {
    const parts = String(value)
      .split(",")
      .map((v) => parseFloat(v))
      .filter((v) => !Number.isNaN(v));
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0] + "px";
    if (parts.length === 2) return parts[1] + "px " + parts[0] + "px";
    if (parts.length === 4)
      return parts[1] + "px " + parts[2] + "px " + parts[3] + "px " + parts[0] + "px";
    return "";
  }

  function resourceValue(value) {
    if (typeof value !== "string") return value;
    if (/^\{.*\}$/.test(value.trim())) return null;
    return value;
  }

  function applyAttrs(el, node, map) {
    const style = {};
    Array.prototype.forEach.call(node.attributes, (attr) => {
      const name = attr.name;
      if (SKIP.test(name)) return;
      const rawValue = resourceValue(attr.value);
      if (rawValue == null) return;

      if (name === "IsEnabled" && String(attr.value).toLowerCase() === "false") {
        el.setAttribute("disabled", "");
        return;
      }
      if (name === "Width") {
        style.width = rawValue + "px";
        return;
      }
      if (name === "Height") {
        style.height = rawValue + "px";
        return;
      }
      if (name === "Margin" || name === "Padding") {
        style[name.toLowerCase()] = box(rawValue);
        return;
      }
      if (name === "Spacing") {
        style.gap = rawValue + "px";
        return;
      }
      if (name === "CornerRadius") {
        style.borderRadius = box(rawValue);
        return;
      }
      if (name === "Foreground") {
        style.color = /Accent/.test(attr.value) ? "var(--wui-accent)" : "";
        return;
      }
      if (name === "Background" || name === "BorderBrush") return;

      const mapped = ATTRS[name];
      if (mapped) {
        if (mapped === "content") {
          el.setAttribute("label", rawValue);
          return;
        }
        if (BOOL.test(mapped)) {
          if (String(rawValue).toLowerCase() !== "false") el.setAttribute(mapped, "");
          return;
        }
        el.setAttribute(mapped, rawValue);
        return;
      }
      // 直接透传小写化的已知属性
      if (/^(ToolTip|Tag|Name|Selected|SelectedIndex)$/.test(name)) return;
      el.setAttribute(name.toLowerCase(), rawValue);
    });

    const decls = Object.keys(style)
      .filter((k) => style[k])
      .map((k) => k + ":" + style[k])
      .join(";");
    if (decls) {
      const current = (el.getAttribute("style") || "").replace(/;\s*$/, "");
      el.setAttribute("style", current ? current + ";" + decls : decls);
    }

    if (map.attrs) {
      Object.keys(map.attrs).forEach((k) => el.setAttribute(k, map.attrs[k]));
    }
    if (map.bool) {
      Object.keys(map.bool).forEach((k) => {
        if (map.bool[k]) el.setAttribute(k, "");
      });
    }
  }

  function textStyle(el, node) {
    const size = parseFloat(node.getAttribute("FontSize"));
    const weight = node.getAttribute("FontWeight");
    if (!Number.isNaN(size)) el.style.fontSize = size + "px";
    if (weight === "SemiBold" || weight === "Bold") el.style.fontWeight = "600";
    const cls = node.getAttribute("Style");
    if (cls && /TitleTextBlockStyle/.test(cls)) el.classList.add("wui-title");
    else if (cls && /SubtitleTextBlockStyle/.test(cls)) el.classList.add("wui-subtitle");
    else if (cls && /BodyStrongTextBlockStyle/.test(cls)) el.classList.add("wui-body-strong");
    else if (cls && /CaptionTextBlockStyle/.test(cls)) el.classList.add("wui-caption");
  }

  function convert(node, doc) {
    if (node.nodeType === 3) return document.createTextNode(node.nodeValue);
    if (node.nodeType !== 1) return null;

    const tagName = node.nodeName;
    if (/Definitions$/.test(tagName) || tagName === "Grid.RowDefinitions") return null;

    const map = TAGS[tagName] || { tag: "div" };
    let el;
    if (map.tag === "option") {
      el = document.createElement("option");
      el.textContent = node.textContent.trim();
      if (node.getAttribute("Content")) el.textContent = node.getAttribute("Content");
      return el;
    }
    el = document.createElement(map.tag);
    if (map.cls) el.className = map.cls;

    applyAttrs(el, node, map);

    if (map.tag === "div" && tagName === "StackPanel") {
      const orientation = node.getAttribute("Orientation");
      if (orientation === "Horizontal") el.classList.add("wui-stack--row");
      else el.style.gap = el.style.gap || "8px";
    }
    if (map.tag === "div" && tagName === "TextBlock") {
      textStyle(el, node);
    }

    // Content 属性作为文本
    const content = resourceValue(node.getAttribute("Content"));
    if (content) {
      if (map.tag === "wui-button" || map.tag === "wui-tab") el.textContent = content;
      else el.setAttribute("label", content);
    }

    // ToggleSwitch / CheckBox 的 Header 更适合作为行内标签
    if (["wui-switch", "wui-checkbox", "wui-radio"].indexOf(map.tag) >= 0 && el.hasAttribute("header")) {
      el.setAttribute("label", el.getAttribute("header"));
      el.removeAttribute("header");
    }

    Array.prototype.forEach.call(node.childNodes, (child) => {
      const converted = convert(child, doc);
      if (converted) el.appendChild(converted);
    });

    if (tagName === "TextBlock" && !el.textContent.trim() && node.getAttribute("Text")) {
      el.textContent = node.getAttribute("Text");
    }
    // TextBlock 的 Text 已作为文本内容，不再保留 value 属性
    if (tagName === "TextBlock" || tagName === "RichTextBlock") el.removeAttribute("value");
    return el;
  }

  /**
   * 渲染 XAML 到容器
   * @param {string} source
   * @param {HTMLElement} container
   * @returns {{ok:boolean,error?:string}}
   */
  WinUI.renderXAML = function (source, container) {
    const xml = '<XamlRoot xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">' + source + "</XamlRoot>";
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) {
      return { ok: false, error: err.textContent.replace(/\s+/g, " ").slice(0, 220) };
    }
    const root = doc.documentElement;
    const frag = document.createDocumentFragment();
    Array.prototype.forEach.call(root.childNodes, (child) => {
      const node = convert(child, doc);
      if (node) frag.appendChild(node);
    });
    container.innerHTML = "";
    container.appendChild(frag);
    return { ok: true };
  };

  /** 常用 XAML 示例 */
  WinUI.xamlSample = `<StackPanel Spacing="12">
  <TextBlock Text="欢迎使用 WinUI 3 for the Web" Style="{StaticResource TitleTextBlockStyle}" />
  <TextBlock Text="下面这些控件由 XAML 实时渲染" Foreground="{ThemeResource TextFillColorSecondaryBrush}" />
  <StackPanel Orientation="Horizontal" Spacing="8">
    <Button Content="标准按钮" />
    <Button Content="强调按钮" Style="{StaticResource AccentButtonStyle}" />
    <TextBox Header="用户名" PlaceholderText="请输入" Width="220" />
    <ToggleSwitch Header="通知" IsChecked="True" />
  </StackPanel>
  <InfoBar Title="XAML 可用" Message="你也可以在示例页里直接编辑这段代码。" Severity="Success" IsClosable="True" />
  <ProgressBar Value="62" />
</StackPanel>`;
})(window);
