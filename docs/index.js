// @ts-check

function __eval(s) {
  return eval(s);
}

(function () {
  var isIE = !!navigator.userAgent.match(/(msie |rv:)(\d+(\.?_?\d+)+)/i);
  var h = iuai.elem,
    style = iuai.style,
    get = iuai.getElem;

  style("*", { fontFamily: "monospace" });
  style("#app", { height: "100%", display: "flex", flexDirection: "column" });
  isIE && style("*", { fontSize: "11px" });
  style("textarea", {
    width: "100%",
    height: "calc(50% - 16px)",
    resize: "vertical",
    tabSize: "2",
  });
  style(".checkbox", { display: "inline-flex", alignItems: "center" });
  style("#buttons", {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  });
  style("#buttons > *", { margin: "5px 5px 5px 0" });

  var app = h("div", { id: "app" }, [
    h("textarea", { id: "t-out", readOnly: true }),
    h("div", { id: "buttons" }, [
      h("span", { className: "checkbox" }, [
        h("input", { id: "i-time", type: "checkbox" }),
        h("span", "time"),
      ]),
      h("button", { id: "b-clear", onclick: clear, disabled: true }, "clear"),
      h("button", { id: "b-last", onclick: last, disabled: true }, "last"),
      h("button", { id: "b-run", onclick: run, disabled: true }, "run"),
    ]),
    h("textarea", {
      id: "t-in",
      oninput: handleInput,
      onkeydown: handleKeyDown,
    }),
  ]);

  function run() {
    var text = get("t-in", "textarea").value;
    if (!text) return;

    var start = +new Date();
    try {
      var res = __eval("(" + text + ")");
      console.log(res);
    } catch (err) {
      console.error(err);
    }
    var end = +new Date();
    if (get("i-time", "input").checked) console.log(end - start + "ms");

    addToHist(text);
    save();
    setIn("");
  }

  var hist = [],
    hist_i = 0;
  function last() {
    if (hist_i) setIn(hist[--hist_i]);
    if (!hist_i) get("b-last", "button").disabled = true;
  }

  var _log = console.log;
  console.log = function () {
    _log.apply(console, arguments);
    print(arguments);
  };

  var _clear = console.clear;
  function clear() {
    _clear.apply(console, arguments);
    setOut("");
  }
  console.clear = clear;

  var _error = console.error;
  console.error = function () {
    _error.apply(console, arguments);
    print((arguments[0] || {}).message ? [arguments[0].message] : arguments);
  };

  function setIn(text) {
    get("t-in", "textarea").value = text;
    get("b-run", "button").disabled = !text;
  }

  function setOut(text) {
    get("t-out", "textarea").value = text;
    get("b-clear", "button").disabled = !text;
  }

  function addToHist(text) {
    if (!hist.length || hist[hist.length - 1] !== text)
      hist_i = hist.push(text);
    else hist_i = hist.length;
    get("b-last", "button").disabled = false;
  }

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

  var print = (function () {
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
      var outValue = get("t-out", "textarea").value;
      setOut(
        (outValue ? outValue + "\n" : outValue) +
          (args.length === 1 ? [args[0]] : Array.apply(null, args))
            .map(obj2str)
            .join(" ")
      );
      get("t-out").scrollTop = get("t-out").scrollHeight;
    };
  })();

  function load() {
    hist = JSON.parse(localStorage.getItem("console") || "[]");
    hist_i = hist.length;
    get("b-last", "button").disabled = !hist_i;
  }
  function save() {
    localStorage.setItem("console", JSON.stringify(hist.slice(-50)));
  }

  document.body.appendChild(app);
  load();

  var buttonsHeight = get("buttons").offsetHeight;
  buttonsHeight !== 32 &&
    style("textarea", { height: "calc(50% - " + buttonsHeight / 2 + "px)" });
})();
