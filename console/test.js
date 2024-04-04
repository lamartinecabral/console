!(function () {
  "use strict";

  var test = {};

  test.feat = function () {
    return [
      "/[a-z]/g", //             4
      "CSS", //                 28
      "URL", //                 32
      "Promise", //             33
      "for(var x of []){}", //  38
      "Map", //                 38
      "ServiceWorker", //       40
      "`1`", //                 41
      "0b11", //                41
      "fetch", //               42
      "()=>{}", //              45
      "[].find.name", //        45
      "Object.assign.name", //  45
      "[...[]]", //             46
      "function f(...x){}", //  47
      "let x=1", //             49
      "class C{}", //           49
      "var {x} = {x:1}", //     49
      "2**3", //                52
      "document.append.name", //54
      "async()=>await 1", //    55
      "CSS.supports.name", //   61
      "1n", //                  67
      "0??1", //                80
      "var x=0;x||=1", //       85
      "structuredClone", //     98
      "[].toSorted.name", //   110
    ].reduce(function (a, val) {
      try {
        if (typeof val === "string") {
          eval("(function(){" + val + "})()");
          a.push("OK " + val);
        } else a.push("" + val);
      } catch (e) {
        a.push(val + " " + e.name);
      }
      return a;
    }, []);
  };

  function findDivisorSync(value) {
    if (value < 0 || value !== +(+value).toFixed(0))
      throw new TypeError("value must be a positive integer");
    if (value <= 1) return value;
    for (var i = 2; i * i <= value; ++i) if (value % i === 0) return i;
    return value;
  }

  test.primeSync = function (value) {
    if (value === undefined) value = 1e14 + 31;
    var start = Date.now();
    var divisor = findDivisorSync(value);
    var isprime = value >= 2 && divisor === value;
    return (
      value +
      " is" +
      (isprime ? "" : " not") +
      " a prime number" +
      (!isprime && divisor ? ", it is divisible by " + divisor : "") +
      ". It took " +
      (Date.now() - start) +
      " ms"
    );
  };

  function findDivisor(value, callback) {
    var work1k = function (i) {
      try {
        var begin = i;
        for (; i * i <= value && i < begin + 1e4; ++i)
          if (value % i === 0) return callback(null, i);
        if (i - begin !== 1e4) return callback(null, value);
        setTimeout(function () {
          work1k(i);
        }, 0);
      } catch (err) {
        callback(err);
      }
    };
    setTimeout(function () {
      try {
        if (value < 0 || value !== +(+value).toFixed(0))
          throw new TypeError("value must be a positive integer");
        if (value <= 1) callback(null, value);
        else work1k(2);
      } catch (err) {
        callback(err);
      }
    }, 0);
  }

  test.prime = function (value) {
    if (value === undefined) value = 1e14 + 31;
    var start = Date.now();

    var intervalId = setInterval(function () {
      console.log("still calculating, please wait a little longer...");
    }, 4000);

    findDivisor(value, function (error, divisor) {
      if (error) console.error(error);
      else {
        var isprime = value >= 2 && divisor === value;
        clearInterval(intervalId);
        console.log(
          value +
            " is" +
            (isprime ? "" : " not") +
            " a prime number" +
            (!isprime && divisor ? ", it is divisible by " + divisor : "") +
            ". It took " +
            (Date.now() - start) +
            " ms"
        );
      }
    });

    return (
      "We are going to check if " +
      value +
      " is a prime number asynchronously. This may take a while..."
    );
  };

  test.render = function (value) {
    if (value === undefined) value = 1e5;
    var start = Date.now();
    for (var i = 0; i < 1e5; ++i) {
      var div = document.createElement("div");
      document.body.appendChild(div);
      document.body.removeChild(div);
    }
    return (
      value +
      " div elements were added and removed. It took " +
      (Date.now() - start) +
      "ms"
    );
  };

  (("undefined" != typeof self && self) || globalThis).__test = test;
})();
