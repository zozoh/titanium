///////////////////////////////////////
function explainKeyDisplay(key, keyDisplayBy) {
  // Translate the key
  if (_.isFunction(keyDisplayBy)) {
    return keyDisplayBy(key);
  }
  // Tranlsate as key path
  if (_.isArray(keyDisplayBy)) {
    let keyPath = key.split(".");
    let kdiss = [];
    for (let i = 0; i < keyPath.length; i++) {
      let kph = keyPath[i];
      let kdb = _.nth(keyDisplayBy, i);
      if (kdb) {
        kdiss.push(kdb[kph] || kph);
      } else {
        kdiss.push(kph);
      }
    }
    return kdiss.join(".");
  }
  // Simple translate
  if (keyDisplayBy) {
    return _.get(keyDisplayBy, key) || key;
  }
  // Use original value
  return key;
}
///////////////////////////////////////
function DoAutoMatch(input) {
  // nil
  if (Ti.Util.isNil(input)) {
    return new NilMatch();
  }
  // Boolean
  if (_.isBoolean(input)) {
    return BooleanMatch(input);
  }
  // Number
  if (_.isNumber(input)) {
    return NumberMatch(input);
  }
  // function
  if (_.isFunction(input)) {
    return input;
  }
  // Array
  if (_.isArray(input)) {
    let ms = [];
    for (let o of input) {
      let m = DoAutoMatch(o);
      ms.push(m);
    }
    return ParallelMatch(...ms);
  }
  // Map
  if (_.isPlainObject(input)) {
    // Special Function
    if (input["$Nil"]) {
      return NilMatch(input["$Nil"]);
    }
    if (input["$NotNil"]) {
      return NotNilMatch(input["$NotNil"]);
    }
    if (input["$Null"]) {
      return NulllMatch(input["$Null"]);
    }
    if (input["$Undefined"]) {
      return UndefinedMatch(input["$Undefined"]);
    }
    if (input["$Type"]) {
      return TypeMatch(input["$Type"]);
    }
    if (input.matchMode == "findInArray" && input.matchBy) {
      return MapFindInArrayMatch(input);
    }
    // General Map Match
    return MapMatch(input);
  }
  // String
  if (_.isString(input)) {
    return AutoStrMatch(input);
  }
  // Regex
  if (_.isRegExp(input)) {
    return function (val) {
      return input.test(val);
    };
  }
  throw Ti.Err.make("e.match.unsupport", input);
}
///////////////////////////////////////
function AutoStrMatch(input) {
  // nil
  if (Ti.Util.isNil(input)) {
    return NilMatch();
  }
  // empty
  if ("" == input) {
    return EmptyMatch();
  }

  let _W = (fn) => fn;
  if (input.startsWith("!")) {
    _W = (fn) => NotMatch(fn);
    input = input.substring(1).trim();
  }

  // blank
  if (Ti.S.isBlank(input) || "[BLANK]" == input) {
    return _W(BlankMatch());
  }
  // Range
  let m = /^([(\[])([^\]]+)([)\]])$/.exec(input);
  if (m) {
    return _W(NumberRangeMatch(m));
  }
  // Regex
  if (/^!?\^/.test(input)) {
    return _W(RegexMatch(input));
  }
  // Wildcard
  if (/\*/.test(input)) {
    return _W(WildcardMatch(input));
  }
  // StringMatch
  return _W(StringMatch(input));
}
///////////////////////////////////////
function BlankMatch() {
  let re = function (val) {
    return Ti.Util.isNil(val) || Ti.S.isBlank(val);
  };
  //...............................
  re.explainText = function ({ blank = "i18n:am-blank" } = {}) {
    return Ti.I18n.text(blank);
  };
  //...............................
  return re;
}
///////////////////////////////////////
function BooleanMatch(bool) {
  let b = bool ? true : false;
  //...............................
  let re = function (val) {
    //let ib = val ? true : false
    return b === val;
  };
  //...............................
  re.explainText = function ({
    boolTrue = "i18n:am-boolTrue",
    boolFalse = "i18n:am-boolFalse"
  } = {}) {
    return b ? Ti.I18n.text(boolTrue) : Ti.I18n.text(boolFalse);
  };
  //...............................
  return re;
}
///////////////////////////////////////
function NumberMatch(n) {
  let re = function (val) {
    return val == n;
  };
  //...............................
  re.explainText = function ({ equals = "i18n:am-equals" } = {}) {
    let s = Ti.I18n.text(equals);
    return Ti.S.renderBy(s, { val: n });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function EmptyMatch() {
  let re = function (val) {
    return _.isEmpty(val);
  };
  //...............................
  re.explainText = function ({ empty = "i18n:am-empty" } = {}) {
    return Ti.I18n.text(empty);
  };
  //...............................
  return re;
}
///////////////////////////////////////
function ExistsMatch(key, not = false) {
  let re = function (val) {
    //let v = _.get(val, key)
    return !_.isUndefined(val) ^ not;
  };
  //...............................
  re.explainText = function ({
    exists = "i18n:am-exists",
    noexists = "i18n:am-noexists",
    keyDisplayBy
  } = {}) {
    let k = not ? noexists : exists;
    let s = Ti.I18n.text(k);
    let t = explainKeyDisplay(key, keyDisplayBy);
    return Ti.S.renderBy(s, { val: t });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function NumberRangeMatch(input) {
  let m = input;
  if (_.isString(input)) {
    m = /^([(\[])([^\]]+)([)\]])$/.exec(input);
  }
  if (!m) {
    return function () {
      return false;
    };
  }
  let str = _.trim(m[2]);
  let vals = str.split(/[,:;~]/g);
  let left = {
    val: _.trim(_.first(vals)),
    open: "(" == m[1]
  };
  let right = {
    val: _.trim(_.last(vals)),
    open: ")" == m[3]
  };
  if (_.isString(left.val) && left.val) {
    left.val *= 1;
  } else {
    left.val = NaN;
  }
  if (_.isString(right.val) && right.val) {
    right.val *= 1;
  } else {
    right.val = NaN;
  }
  //...............................
  let re = function (val) {
    let n = val * 1;
    if (isNaN(n)) return false;

    if (!isNaN(left.val)) {
      if (left.open && n <= left.val) return false;

      if (n < left.val) return false;
    }

    if (!isNaN(right.val)) {
      if (right.open && n >= right.val) return false;

      if (n > right.val) return false;
    }

    if (left.val === right.val) {
      if (left.open || right.open) {
        return val != left.val;
      }
      return val == left.val;
    }

    return true;
  };
  //...............................
  re.explainText = function ({
    equals = "i18n:am-equals",
    notEquals = "i18n:am-notEquals",
    and = "i18n:am-and",
    gt = "i18n:am-gt",
    gte = "i18n:am-gte",
    lt = "i18n:am-lt",
    lte = "i18n:am-lte"
  } = {}) {
    // [12]
    if (left.val == right.val) {
      let s;
      if (left.open || right.open) {
        s = Ti.I18n.text(notEquals);
      } else {
        s = Ti.I18n.text(equals);
      }
      return Ti.S.renderBy(s, { val: left.val });
    }
    let ss = [];
    // (12,]  || [12,] || [12,) || (12,)
    if (!isNaN(left.val)) {
      let s0 = left.open ? Ti.I18n.text(gt) : Ti.I18n.text(gte);
      ss.push(Ti.S.renderBy(s0, { val: left.val }));
    }
    // (,12]  || [,12] || [,12) || (,12)
    if (!isNaN(right.val)) {
      let s1 = right.open ? Ti.I18n.text(lt) : Ti.I18n.text(lte);
      ss.push(Ti.S.renderBy(s1, { val: right.val }));
    }
    if (ss.length > 1) {
      let sep = Ti.I18n.text(and);
      return ss.join(sep);
    }
    return ss[0];
  };
  //...............................
  return re;
}
///////////////////////////////////////
function MapFindInArrayMatch(map) {
  let matchFn = TiAutoMatch.parse(map.matchBy);
  let not = map.not ? true : false;
  let re = function (val) {
    let vals = _.concat(val);
    for (let v of vals) {
      if (matchFn(v)) {
        return true ^ not ? true : false;
      }
    }
    return false ^ not ? true : false;
  };
  //...............................
  re.explainText = function (payload = {}) {
    let cTxt = matchFn.explainText(payload);
    let k = payload.findInArray || "i18n:am-findInArray";
    let s = Ti.I18n.text(k);
    return Ti.S.renderBy(s, { val: cTxt });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function MapMatch(map) {
  // Pre-build
  let matchs = [];
  _.forEach(map, (val, key) => {
    let not = key.startsWith("!");
    let explainIgnoreKey = false;
    let m;
    if (not) {
      key = key.substring(1).trim();
    }
    // {key:"[EXISTS]"}
    if (null != val) {
      // Exists
      if ("[EXISTS]" == val) {
        m = ExistsMatch(key, not);
        explainIgnoreKey = true;
      }
      // No Exists
      else if ("![EXISTS]" == val) {
        not = !not;
        m = ExistsMatch(key, not);
        explainIgnoreKey = true;
      }
    }
    // Other match
    if (!m) {
      m = DoAutoMatch(val);
      if (not) {
        m = NotMatch(m);
      }
    }
    matchs.push({ key, m, explainIgnoreKey });
  });
  // return matcher
  let re = function (val) {
    if (!val || !_.isPlainObject(val)) {
      return false;
    }
    for (let it of matchs) {
      let key = it.key;
      let v = _.get(val, key);
      let m = it.m;
      if (!m(v)) return false;
    }
    return true;
  };
  //...............................
  /**
   *
   * @param {String} payload.and : 'i18n:am-and'
   * @param {Object|Array|Function} payload.keyDisplayBy :
   * Use to tranlate the key in object to local text.
   * It could be Map(`{}`) or Array(`[{},{}]`) or even Function
   *  - `{}` Map - Indicate the each key mapping, key path was supported.
   *  - `[{}..]` Array - the key in object is in path form.
   *             it will be split to path, and each item in path will match
   *             the relative element in Array. If fail to found in Array
   *             it will keep the original value to display.
   *  - Function - Customized function to render the key `Fn(key)`
   * @returns
   */
  re.explainText = function (payload = {}) {
    if (_.isEmpty(matchs)) {
      return Ti.I18n.text(payload.emptyItems || "i18n:hm-am-empty");
    }
    let ss = [];
    let keyDisplayBy = payload.keyDisplayBy;
    for (let it of matchs) {
      let tt = it.m.explainText(payload);
      // [EXISTS] or  ![EXISTS]
      if (it.explainIgnoreKey) {
        ss.push(tt);
      }
      // Others
      else {
        let ks = explainKeyDisplay(it.key, keyDisplayBy);
        ss.push(`'${ks}'${tt}`);
      }
    }
    let andKey = payload["and"] || "i18n:am-and";
    let and = Ti.I18n.text(andKey);
    return ss.join(and);
  };
  //...............................
  return re;
}
///////////////////////////////////////
function NotNilMatch(input) {
  if (!input) {
    return (val) => !Ti.Util.isNil(val);
  }
  //...............................
  let re = (val) => {
    let v = _.get(val, input);
    return !Ti.Util.isNil(v);
  };
  //...............................
  re.explainText = function ({
    notNil = "i18n:am-notNil",
    notNilOf = "i18n:am-notNilOf"
  } = {}) {
    if (!input) {
      return Ti.I18n.textf(notNil);
    }
    let s = Ti.I18n.text(notNilOf);
    return Ti.S.renderBy(s, { val: input });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function NilMatch(input) {
  if (!input) {
    return (val) => Ti.Util.isNil(val);
  }
  //...............................
  let re = (val) => {
    let v = _.get(val, input);
    return Ti.Util.isNil(v);
  };
  //...............................
  re.explainText = function (
    payload = {
      "nil`": "i18n:am-nil",
      "nil`Of": "i18n:am-nilOf"
    }
  ) {
    _.de;
    if (!input) {
      return Ti.I18n.textf(payload["nil"]);
    }
    let s = Ti.I18n.text(payload["nilOf"]);
    return Ti.S.renderBy(s, { val: input });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function NulllMatch(input) {
  if (!input) {
    return (val) => _.isNull(val);
  }
  //...............................
  let re = (val) => {
    let v = _.get(val, input);
    return _.isNull(v);
  };
  //...............................
  re.explainText = function (
    payload = {
      "null": "i18n:am-null",
      "nullOf": "i18n:am-nullOf"
    }
  ) {
    if (!input) {
      return Ti.I18n.textf(payload["null"]);
    }
    let s = Ti.I18n.text(payload["nullOf"]);
    return Ti.S.renderBy(s, { val: input });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function UndefinedMatch(input) {
  if (!input) {
    return (val) => _.isUndefined(val);
  }
  //...............................
  let re = (val) => {
    //console.log("undefined match ", val)
    let v = _.get(val, input);
    return _.isUndefined(v);
  };
  //...............................
  re.explainText = function (
    payload = {
      "undefined": "i18n:am-undefined",
      "undefinedOf": "i18n:am-undefinedOf"
    }
  ) {
    if (!input) {
      return Ti.I18n.textf(payload["undefined"]);
    }
    let s = Ti.I18n.text(payload["undefinedOf"]);
    return Ti.S.renderBy(s, { val: input });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function NotMatch(m) {
  let re = function (input) {
    return !m(input);
  };
  //...............................
  re.explainText = function (payload = {}) {
    let s = Ti.I18n.text(payload.not || "i18n:am-not");
    return s + m.explainText(payload);
  };
  //...............................
  return re;
}
///////////////////////////////////////
function TypeMatch(input) {
  let expectType = input;
  //...............................
  let re = (val) => {
    return expectType == typeof val;
  };
  //...............................
  re.explainText = function ({ equalsType = "i18n:am-equalsType" } = {}) {
    let s = Ti.I18n.text(equalsType);
    return Ti.S.renderBy(s, { val: wildcard });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function ParallelMatch(...ms) {
  let re = function (val) {
    if (_.isEmpty(ms)) return false;
    for (let m of ms) {
      if (m(val)) return true;
    }
    return false;
  };
  //...............................
  re.explainText = function (payload = {}) {
    if (_.isEmpty(ms)) {
      return "";
    }
    if (ms.length == 1) {
      return ms[0].explainText(payload);
    }
    let ss = [];
    for (let m of ms) {
      ss.push(m.explainText(payload));
    }
    let orKey = payload["or"] || "i18n:am-or";
    let or = Ti.I18n.text(orKey);
    return ss.join("; " + or);
  };
  //...............................
  return re;
}
///////////////////////////////////////
function RegexMatch(regex) {
  let not = false;
  if (regex.startsWith("!")) {
    not = true;
    regex = regex.substring(1).trim();
  }
  let P = new RegExp(regex);
  //...............................
  let re = function (val) {
    if (Ti.Util.isNil(val)) return not;
    return P.test(val) ? !not : not;
  };
  //...............................
  re.explainText = function ({
    matchOf = "i18n:am-matchOf",
    notMatchOf = "i18n:am-notMatchOf"
  }) {
    let k = not ? notMatchOf : matchOf;
    let s = Ti.I18n.text(k);
    return Ti.S.renderBy(s, { val: wildcard });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function StringMatch(input) {
  let ignoreCase = false;
  if (input.startsWith("~~")) {
    ignoreCase = true;
    input = input.substring(2).toUpperCase();
  }
  //...............................
  let re = function (val) {
    if (Ti.Util.isNil(val)) {
      return Ti.Util.isNil(input);
    }
    if (ignoreCase) {
      return input == val.toUpperCase();
    }
    return input == val;
  };
  //...............................
  re.explainText = function ({
    equalsIgnoreCase = "i18n:am-equalsIgnoreCase",
    equals = "i18n:am-equals"
  }) {
    let k = ignoreCase ? equalsIgnoreCase : equals;
    let s = Ti.I18n.text(k);
    return Ti.S.renderBy(s, { val: input });
  };
  //...............................
  return re;
}
///////////////////////////////////////
function WildcardMatch(wildcard) {
  let not = false;
  if (wildcard.startsWith("!")) {
    not = true;
    wildcard = wildcard.substring(1).trim();
  }
  let regex = "^" + wildcard.replaceAll("*", ".*") + "$";
  let P = new RegExp(regex);
  //...............................
  let re = function (val) {
    if (Ti.Util.isNil(val)) return not;
    return P.test(val) ? !not : not;
  };
  //...............................
  re.explainText = function ({ matchOf = "i18n:am-matchOf" } = {}) {
    let s = Ti.I18n.text(matchOf);
    return Ti.S.renderBy(s, { val: wildcard });
  };
  //...............................
  return re;
}
///////////////////////////////////////
const TiAutoMatch = {
  parse(input) {
    if (_.isFunction(input)) {
      input.explainText = () => {
        return Ti.I18n.get("am-not-sure");
      };
      return input;
    }
    if (Ti.Util.isNil(input)) {
      let re = () => false;
      re.explainText = () => {
        return Ti.I18n.get("am-must-false");
      };
      return re;
    }
    if (_.isBoolean(input)) {
      let re = () => input;
      re.explainText = () => {
        return Ti.I18n.get(input ? "am-must-true" : "am-must-false");
      };
      return re;
    }
    return DoAutoMatch(input);
  },
  test(input, val) {
    if (_.isFunction(input)) {
      return input(val);
    }
    if (Ti.Util.isNil(input)) {
      return false;
    }
    if (_.isBoolean(input)) {
      return input;
    }
    return DoAutoMatch(input)(val);
  }
};
///////////////////////////////////////
export const AutoMatch = TiAutoMatch;
