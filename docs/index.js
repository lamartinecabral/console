// @ts-check

function __eval(s) {
  return eval(s);
}

(function () {
  var isIE = !!navigator.userAgent.match(/(msie |rv:)(\d+(\.?_?\d+)+)/i);
  var h = iuai.elem,
    style = iuai.style,
    get = iuai.getElem;

  /*
   * CSS
   */

  style("*", { fontFamily: "monospace" });
  style("#app", { display: "flex", flexDirection: "column" });
  isIE && style("*", { fontSize: "11px" });
  style("#d-out", { overflow: "auto" });
  style("#t-out", { width: "100%" });
  style(".col1", { width: "1ch", userSelect: "none", verticalAlign: "top" });
  style(".command .col2", { color: "gray" });
  style(".result .col2", { background: "#eee" });
  style(".col2 pre", { whiteSpace: "pre-wrap" });
  style("pre", { margin: "0" });
  style(".checkbox", { display: "inline-flex", alignItems: "center" });
  style("#buttons", {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  });
  style("#buttons > *", { margin: "5px 5px 5px 0" });
  style("textarea", {
    width: "100%",
    resize: "vertical",
    tabSize: "2",
  });

  /*
   * HTML
   */

  var buttons = h("div", { id: "buttons" }, [
    h("span", { className: "checkbox", title: "Show execution time" }, [
      h("input", { id: "i-time", type: "checkbox" }),
      h("span", "time"),
    ]),
    h(
      "button",
      {
        id: "b-clear",
        onclick: clear,
        disabled: true,
        title: "Clear log",
      },
      "clear"
    ),
    h(
      "button",
      {
        id: "b-last",
        onclick: last,
        disabled: true,
        title: "Restore last script",
      },
      "last"
    ),
    h(
      "button",
      { id: "b-run", onclick: run, disabled: true, title: "Run script" },
      "run"
    ),
  ]);

  var app = h("div", { id: "app" }, [
    h("div", { id: "d-out" }, [h("table", { id: "t-out" })]),
    buttons,
    h("textarea", {
      id: "t-in",
      rows: 8,
      oninput: handleInput,
      onkeydown: handleKeyDown,
    }),
  ]);

  /*
   * JS
   */

  function run() {
    var text = get("t-in", "textarea").value;
    pushCommand(text);

    var start = +new Date();
    try {
      console.log(__eval(text));
    } catch (err) {
      console.error(err);
    }
    if (get("i-time", "input").checked) {
      console.log(+new Date() - start + "ms");
    }

    hist.save();
    setIn("");
  }

  function last() {
    if (hist.idx) setIn(hist.arr[--hist.idx]);
    if (!hist.idx) get("b-last", "button").disabled = true;
  }

  var _clear = console.clear;
  function clear() {
    _clear.apply(console, arguments);
    var out = get("t-out", "table");
    while (out.firstChild) out.removeChild(out.firstChild);
    get("b-clear", "button").disabled = true;
  }
  console.clear = clear;

  var _log = console.log;
  console.log = function () {
    _log.apply(console, arguments);
    pushResult(argsToString(arguments));
  };

  var _error = console.error;
  console.error = function () {
    _error.apply(console, arguments);
    pushResult(argsToString(arguments));
  };

  function handleInput(ev) {
    get("b-run", "button").disabled = !ev.target.value;
  }

  function handleKeyDown(ev) {
    if (isIE || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (ev.keyCode === 9 || ev.key === "Tab") {
      ev.preventDefault();
      return document.execCommand("insertText", false, "\t");
    } else if (ev.keyCode === 13 || ev.key === "Enter") {
      ev.preventDefault();
      var ident = "";
      var target = get("t-in", "textarea");
      for (var j = target.selectionStart; j; ) {
        var char = target.value[--j];
        if (char === "\n") break;
        if (char === " " || char === "\t") ident = char + ident;
        else ident = "";
      }
      return document.execCommand("insertText", false, "\n" + ident);
    }
  }

  function setIn(text) {
    get("t-in", "textarea").value = text;
    get("b-run", "button").disabled = !text;
  }

  function pushResult(text) {
    get("t-out", "table").appendChild(
      h("tr", { className: "result" }, [
        h("td", { className: "col1" }, "<"),
        h("td", { className: "col2" }, [h("pre", text || "")]),
      ])
    );
    get("b-clear", "button").disabled = false;
    document.body.scrollTop = document.body.scrollHeight;
  }

  function pushCommand(text) {
    if (!text) throw new TypeError("command should not be empty");
    get("t-out", "table").appendChild(
      h("tr", { className: "command" }, [
        h("td", { className: "col1" }, ">"),
        h("td", { className: "col2" }, [h("pre", text)]),
      ])
    );
    hist.add(text);
    get("b-last", "button").disabled = false;
  }

  /*
   * UTILS
   */

  var argsToString = (function () {
    var jsonReplacer = function (k, a) {
      if (typeof a === "function")
        return "[function " + (a.constructor.name || "Function") + "]";
      if (typeof a === "number")
        return isNaN(a) || !isFinite(a) ? String(a) : a;
      if (typeof a === "boolean") return a;
      if (typeof a !== "object") return String(a);
      if (k || !a) return a;
      var b = Array.isArray(a) ? [] : {};
      for (var i in a) {
        if (!a[i] || typeof a[i] !== "object") b[i] = a[i];
        else if (Array.isArray(a[i])) b[i] = a[i];
        else if (!a[i].constructor || a[i].constructor === Object) b[i] = a[i];
        else b[i] = String(a[i]);
      }
      return b;
    };
    var obj2str = function (obj) {
      if (obj && typeof obj === "object") {
        try {
          return JSON.stringify(obj, jsonReplacer, 2);
        } catch (_) {
          try {
            return String(obj);
          } catch (_) {
            return "[object unknown]";
          }
        }
      }
      return String(obj);
    };
    return function (args) {
      return (args.length === 1 ? [args[0]] : Array.apply(null, args))
        .map(obj2str)
        .join(" ");
    };
  })();

  var hist = {
    arr: [""].slice(0, 0),
    idx: 0,
    add: function (text) {
      if (!this.arr.length || this.arr[this.arr.length - 1] !== text)
        this.idx = this.arr.push(text);
      else this.idx = this.arr.length;
    },
    load: function () {
      this.arr = JSON.parse(localStorage.getItem("console") || "[]");
      this.idx = this.arr.length;
    },
    save: function () {
      localStorage.setItem("console", JSON.stringify(this.arr.slice(-50)));
    },
  };

  /*
   * INIT
   */

  document.body.appendChild(app);
  hist.load();
  get("b-last", "button").disabled = !hist.idx;
})();
