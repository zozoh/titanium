const TiStr = {
  intToChineseNumber(input, capitalized=false) {
    if(capitalized){
      return TiStr._to_chinese_number(input, {
        CN_NC0 : "零壹贰叁肆伍陆柒捌玖", CN_NU0 : "个拾佰仟万亿"
      })  
    }
    return TiStr._to_chinese_number(input)
  },
  _to_chinese_number(
    input,
    { CN_NC0 = "零一二三四五六七八九", CN_NU0 = "个十百千万亿" } = {}
  ) {
    let re = "";

    // 考虑负数
    if (input < 0) {
      re += "负";
      input *= -1;
    }

    // 优化零
    if (input == 0) {
      re += CN_NC0[0];
      return re;
    }

    // 直接就是个位数
    if (input < 10) {
      let c = CN_NC0[input];
      re += c;
      return re;
    }

    // 准备拆分各个位，数组 0 表示个位
    //let ns = new int[10];
    let ns = [];
    let len = 0;

    // 挨个来
    let n = input;
    while (n > 0) {
      let nd = parseInt(n / 10);
      ns[len++] = n - nd * 10;
      n = nd;
    }
    let lastNSIndex = len - 1;
    // 现在我们有一个数字数组
    // [2][3][0][9] ...
    // 个 十 百 千 ...
    let lastN;
    let maxI;
    let lastI;
    //
    // 分作三段输出
    //
    // ................................
    // 亿位段
    if (len > 8) {
      maxI = Math.min(lastNSIndex, 11);
      lastN = -1;
      for (let i = maxI; i >= 8; i--) {
        n = ns[i];
        // 不能输出零零
        if (n == 0 && lastN <= 0) {
          continue;
        }
        let s_n = CN_NC0[n];
        re += s_n;
        // 单位
        if (i > 8 && (n > 0 || lastN > 0)) {
          let s_u = CN_NU0[i - 8];
          re += s_u;
        }
        // 记录最后一次输出的数字
        lastN = n;
      }
      // 检查，最后一个字符是 '零' 改成 '亿'
      // 否则加个 '亿'
      lastI = re.length - 1;
      if (re[lastI] == CN_NC0[0]) {
        //re[lastI] = CN_NU0[5];
        re = re.substring(0,lastI) + CN_NU0[5]
      } else {
        re += CN_NU0[5];
      }
    }
    // ................................
    // 万位段
    if (len > 4) {
      maxI = Math.min(lastNSIndex, 7);
      lastN = -1;
      for (let i = maxI; i >= 4; i--) {
        n = ns[i];
        // 不能输出零零
        if (n == 0 && lastN <= 0) {
          continue;
        }
        let s_n = CN_NC0[n];
        re += s_n;
        // 单位
        if (i > 4 && (n > 0 || lastN > 0)) {
          let s_u = CN_NU0[i - 4];
          re += s_u;
        }
        // 记录最后一次输出的数字
        lastN = n;
      }
      // 检查，最后一个字符是 '零' 改成 '万'
      // 否则加个 '万'
      if (lastN >= 0) {
        lastI = re.length - 1;
        if (re[lastI] == CN_NC0[0]) {
          //re[lastI] = CN_NU0[4];
          re = re.substring(0,lastI) + CN_NU0[4]
        } else {
          re += CN_NU0[4];
        }
      }
    }

    // ................................
    // 个位段
    maxI = Math.min(lastNSIndex, 3);
    lastN = -1;
    for (let i = maxI; i >= 0; i--) {
      n = ns[i];
      // 不能输出零零
      if (n == 0 && lastN == 0) {
        continue;
      }
      let s_n = CN_NC0[n];
      // 十一 至 十九
      if (i != 1 || n != 1 || maxI > 1) {
        re += s_n;
      }
      // 单位
      if (i > 0 && n > 0) {
        let s_u = CN_NU0[i];
        re += s_u;
      }
      // 记录最后一次输出的数字
      lastN = n;
    }

    // 输出前，检查，最后一个字符是 '零' 删掉它
    lastI = re.length - 1;
    if (re[lastI] == CN_NC0[0]) {
      return re.substring(0, lastI);
    }

    return re;
  },
  sBlank(str, dft) {
    if (TiStr.isBlank(str)) return dft;
    return str;
  },
  isBlank(str) {
    if (_.isNumber(str) || _.isBoolean(str)) {
      return false;
    }
    if (_.isString(str)) return !str || /^\s*$/.test(str);
    return str ? false : true;
  },
  splitIgnoreBlank(input, sep = ",") {
    if (!input || !_.isString(input)) return [];
    let list = input.split(sep);
    let l2 = _.filter(list, (li) => !TiStr.isBlank(li));
    return _.map(l2, (li) => _.trim(li));
  },
  renderVars(vars = {}, fmt = "", { iteratee, regex, safe } = {}) {
    if (_.isString(vars) || _.isNumber(vars)) {
      vars = { val: vars };
    }
    if (!vars || _.isEmpty(vars)) {
      return _.isArray(vars) ? [] : "";
    }
    return TiStr.renderBy(fmt, vars, {
      iteratee,
      regex,
      safe
    });
  },
  /***
   * Replace the placeholder
   */
  renderBy(
    str = "",
    vars = {},
    { iteratee, regex = /(\${1,2})\{([^}]+)\}/g, safe = false } = {}
  ) {
    if (!str) {
      return _.isArray(vars) ? [] : "";
    }
    // Make sure the `vars` empty-free
    vars = vars || {};
    if (safe) {
      let r2 = _.isRegExp(safe) ? safe : undefined;
      vars = TiStr.safeDeep(vars, r2);
    }
    // Normlized args
    if (_.isRegExp(iteratee)) {
      regex = iteratee;
      iteratee = undefined;
    }
    // Default iteratee
    if (!iteratee) {
      iteratee = ({ varName, vars, matched } = {}) => {
        if (matched.startsWith("$$")) {
          return matched.substring(1);
        }
        // find default
        let dft = matched;
        let pos = varName.indexOf("?");
        if (pos > 0) {
          dft = _.trim(varName.substring(pos + 1));
          varName = _.trim(varName.substring(0, pos));
        }
        // I18n ?
        let i18n = false;
        if (varName.startsWith("i18n:")) {
          i18n = true;
          varName = varName.substring(5).trim();
        }
        // pick value
        let reValue = Ti.Util.fallback(Ti.Util.getOrPick(vars, varName), dft);
        if (i18n) {
          return Ti.I18n.get(reValue);
        }
        return reValue;
      };
    }
    // Array
    if (_.isArray(vars)) {
      let re = [];
      for (let i = 0; i < vars.length; i++) {
        let vars2 = vars[i];
        let s2 = TiStr.renderBy(str, vars2);
        re.push(s2);
      }
      return re;
    }
    // Looping
    let m;
    let ss = [];
    let last = 0;
    while ((m = regex.exec(str))) {
      let current = m.index;
      if (current > last) {
        ss.push(str.substring(last, current));
      }
      let varValue = iteratee({
        vars,
        matched: m[0],
        prefix: m[1],
        varName: m[2]
      });
      ss.push(varValue);
      last = regex.lastIndex;
    }
    // Add tail
    if (last < str.length) {
      ss.push(str.substring(last));
    }
    // Return
    return ss.join("");
  },
  /***
   * Replace the dangerous char in Object deeply.
   *
   * @param data{Array|Object|Any} : the value to be turn to safe
   * @param regex{RegExp} : which char should be removed
   *
   * @return data
   */
  safeDeep(data = {}, regex = /['"]/g) {
    // String to replace
    if (_.isString(data)) {
      return data.replace(regex, "");
    }
    // Array
    else if (_.isArray(data)) {
      return _.map(data, (v) => this.safeDeep(v, regex));
    }
    // Object
    else if (_.isPlainObject(data)) {
      return _.mapValues(data, (v) => this.safeDeep(v, regex));
    }
    // Others return
    return data;
  },
  /***
   * Join with iteratee
   */
  joinWithoutNil(sep = "", ...args) {
    let list2 = _.flattenDeep(args);
    let list3 = _.filter(list2, (li) => !Ti.Util.isNil(li));
    return list3.join(sep);
  },
  /***
   * Join with iteratee
   */
  join(list = [], sep = "", iteratee = null) {
    let list2 = _.flattenDeep(list);
    if (_.isFunction(iteratee)) {
      list2 = _.map(list2, iteratee);
    }
    return list2.join(sep);
  },
  /***
   * Join without `null/undefined`
   */
  joinAs(list = [], sep = "", key = null) {
    let iter = null;
    if (key) {
      iter = (li) => {
        if (_.isPlainObject(li)) return _.get(li, key);
        return key;
      };
    }
    return TiStr.join(list, sep, iter);
  },
  /***
   * Convert string to Js Object automatictly
   */
  toJsValue(
    v = "",
    {
      autoJson = true,
      autoDate = true,
      autoNil = false,
      trimed = true,
      context = {}
    } = {}
  ) {
    //...............................................
    // Array
    if (_.isArray(v)) {
      let re = [];
      let opt = { autoJson, autoDate, autoNil, trimed, context };
      for (let it of v) {
        let v2 = TiStr.toJsValue(it, opt);
        re.push(v2);
      }
      return re;
    }
    //...............................................
    // Object
    if (_.isPlainObject(v)) {
      let re = {};
      let opt = { autoJson, autoDate, autoNil, trimed, context };
      _.forEach(v, (it, key) => {
        let v2 = TiStr.toJsValue(it, opt);
        re[key] = v2;
      });
      return re;
    }
    //...............................................
    // Number
    // Boolean
    // Nil
    if (Ti.Util.isNil(v) || _.isBoolean(v) || _.isNumber(v)) {
      return v;
    }
    //...............................................
    // Must by string
    let str = trimed ? _.trim(v) : v;
    let dftAsNil = false;
    if (str.endsWith("?")) {
      dftAsNil = true;
      str = str.substring(0, str.length - 1).trim();
    }
    //...............................................
    // autoNil
    if (autoNil) {
      if ("undefined" == str) return undefined;
      if ("null" == str) return null;
    }
    //...............................................
    // The whole context
    if (".." == str) {
      return context;
    }
    //...............................................
    // Number
    if (/^-?[\d.]+$/.test(str)) {
      return str * 1;
    }
    //...............................................
    // Try to get from context
    let re = _.get(context, str);
    if (!_.isUndefined(re) || dftAsNil) {
      return re;
    }
    //...............................................
    // Boolean
    if (/^(true|false|yes|no|on|off)$/.test(str)) {
      return /^(true|yes|on)$/.test(str);
    }
    //...............................................
    // JS String
    let m = /^'([^']*)'$/.exec(str);
    if (m) {
      return m[1];
    }
    //...............................................
    // try JSON
    if (autoJson) {
      let re = Ti.Types.safeParseJson(v);
      if (!_.isUndefined(re)) {
        return re;
      }
    }
    //...............................................
    // try Date
    if (autoDate) {
      try {
        return Ti.Types.toDate(v);
      } catch (E) {}
    }
    // Then, it is a string
    return str;
  },
  /***
   * Join "a,b,c" like string to arguments
   */
  joinArgs(s, args = [], iteratee = TiStr.toJsValue) {
    // String to split
    if (_.isString(s)) {
      // Maybe a json object
      if (/^\{.*\}$/.test(s)) {
        try {
          return [eval(`(${s})`)];
        } catch (E) {}
      }

      // Take it as comma-sep list
      let list = s.split(",");
      for (let li of list) {
        let vs = _.trim(li);
        if (!vs) continue;
        let v = iteratee(vs);
        args.push(v);
      }
      return args;
    }
    // Array
    else if (_.isArray(s)) {
      for (let v of s) {
        let v2 = iteratee(v);
        args.push(v2);
      }
    }
    // Others
    else if (!_.isUndefined(s)) {
      args.push(s);
    }
    return args;
  },
  /***
   * @param s{String|Array}
   * @param sep{RegExp|String}
   * @param ignoreNil{Boolean}
   */
  toArray(s, { sep = /[:,;\t\n\/]+/g, ignoreNil = true } = {}) {
    // Nil
    if (Ti.Util.isNil(s)) {
      return [];
    }
    // Array
    if (_.isArray(s)) {
      return s;
    }
    // String to split
    if (_.isString(s) && sep) {
      let ss = _.map(s.split(sep), (v) => _.trim(v));
      if (ignoreNil) {
        return _.without(ss, "");
      }
      return ss;
    }
    // Others -> wrap
    return [s];
  },
  toArrayBy(s, sep = ",") {
    return TiStr.toArray(s, { sep, ignoreNil: true });
  },
  /***
   * Translate "XXX:A:im-pizza" or ["XXX","A","im-pizza"]
   *
   * ```
   * {text:"XXX",value:"A",icon:"im-pizza"}
   * ```
   *
   * @param s{String|Array}
   * @param sep{RegExp|String}
   * @param ignoreNil{Boolean}
   * @param keys{Array}
   */
  toObject(
    s,
    {
      sep = /[:,;\t\n\/]+/g,
      ignoreNil = true,
      keys = ["value", "text?value", "icon"]
    } = {}
  ) {
    // Already Object
    if (_.isPlainObject(s) || _.isNull(s) || _.isUndefined(s)) {
      return s;
    }
    // Split value to array
    let vs = TiStr.toArray(s, { sep, ignoreNil });

    // Make sure keys as array
    if (_.isString(keys)) {
      keys = TiStr.toArray(keys, {
        sep: /[:,;\s]+/g
      });
    }

    // Analyze the keys
    let a_ks = []; // assign key list
    let m_ks = []; // those keys must has value
    _.forEach(keys, (k) => {
      let ss = TiStr.toArray(k, { sep: "?" });
      if (ss.length > 1) {
        let k2 = ss[0];
        a_ks.push(k2);
        m_ks.push({
          name: k2,
          backup: ss[1]
        });
      } else {
        a_ks.push(k);
      }
    });

    // translate
    let re = {};
    _.forEach(a_ks, (k, i) => {
      let v = _.nth(vs, i);
      if (_.isUndefined(v) && ignoreNil) {
        return;
      }
      re[k] = v;
    });
    // Assign default
    for (let mk of m_ks) {
      if (_.isUndefined(re[mk.name])) {
        re[mk.name] = re[mk.backup];
      }
    }

    // done
    return re;
  },
  /***
   * String (multi-lines) to object list
   * Translate
   * ```
   * A : Xiaobai : im-pizza
   * B : Peter
   * C : Super Man
   * D
   * ```
   * To
   * ```
   * [
   *  {value:"A", text:"Xiaobai", icon:"im-pizza"},
   *  {value:"B", text:"Peter"},
   *  {value:"C", text:"Super Man"}
   *  {value:"D", text:"C"}
   * ]
   * ```
   *
   * @param s{String|Array}
   * @param sep{RegExp|String}
   * @param ignoreNil{Boolean}
   * @param keys{Array}
   */
  toObjList(
    s,
    {
      sepLine = /[,;\n]+/g,
      sepPair = /[:|\/\t]+/g,
      ignoreNil = true,
      keys = ["value", "text?value", "icon"]
    } = {}
  ) {
    //console.log("toObjList", s)
    let list = TiStr.toArray(s, { sep: sepLine, ignoreNil });
    return _.map(list, (v) =>
      TiStr.toObject(v, {
        sep: sepPair,
        ignoreNil,
        keys
      })
    );
  },
  /***
   * @param str{String} : Base64 input string
   * @return Uint8Array
   */
  base64ToU8Bytes(str) {
    let bytes = new Uint8Array();
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10ffff) {
        bytes.push(((c >> 18) & 0x07) | 0xf0);
        bytes.push(((c >> 12) & 0x3f) | 0x80);
        bytes.push(((c >> 6) & 0x3f) | 0x80);
        bytes.push((c & 0x3f) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00ffff) {
        bytes.push(((c >> 12) & 0x0f) | 0xe0);
        bytes.push(((c >> 6) & 0x3f) | 0x80);
        bytes.push((c & 0x3f) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007ff) {
        bytes.push(((c >> 6) & 0x1f) | 0xc0);
        bytes.push((c & 0x3f) | 0x80);
      } else {
        bytes.push(c & 0xff);
      }
    }
    return bytes;
  },
  /**
   * Auto lower and add prefix "^.*"
   *
   * @param input input keywords
   */
  autoPrefixSearchStr(input, caseMode = "lower", start = false) {
    let str = _.trim(input);
    if (!str) {
      return;
    }
    str = TiStr.toCase(str, caseMode);
    if (!str.startsWith("^")) {
      if (start) {
        return "^" + str;
      }
      return "^.*" + str;
    }
    return str;
  },
  /***
   * Get the display text for bytes
   */
  sizeText(
    byte = 0,
    {
      fixed = 2,
      M = 1024,
      bytes = false,
      units = ["Bytes", "KB", "MB", "GB", "PB", "TB"]
    } = {}
  ) {
    let nb = byte;
    let i = 0;
    for (; i < units.length; i++) {
      let nb2 = nb / M;
      if (nb2 < 1) {
        break;
      }
      nb = nb2;
    }
    let unit = units[i];
    let re;
    if (nb == parseInt(nb)) {
      re = nb + unit;
    } else {
      re = nb.toFixed(fixed) + unit;
    }

    if (bytes && i > 0) {
      return re + ` (${byte} bytes)`;
    }
    return re;
  },
  /***
   * Get the display percent text for a float number
   * @param n Float number
   * @param fixed fixed float position
   * @param auto Auto cut the ending zero '0.34000' => '0.34'
   */
  toPercent(n, { fixed = 2, auto = true } = {}) {
    if (!_.isNumber(n)) return "NaN";
    let nb = n * 100;
    // Round
    let str = fixed >= 0 ? nb.toFixed(fixed) : nb + "";
    if (auto) {
      let lastDot = str.lastIndexOf(".");
      let lastZero = str.lastIndexOf("0");
      if (lastDot >= 0 && lastZero > lastDot) {
        let last = str.length - 1;
        let pos = last;
        for (; pos >= lastDot; pos--) {
          if (str[pos] != "0") break;
        }
        if (pos == lastZero || pos == lastDot) {
          //pos --
        } else {
          pos++;
        }
        if (pos < str.length) str = str.substring(0, pos);
      }
    }
    return str + "%";
  },
  /***
   * switch given `str` to special case, the modes below would be supported:
   *
   * @param str{String} - give string
   * @param mode{String} - Method of key name transformer function:
   *  - `"upper"` : to upport case
   *  - `"lower"` : to lower case
   *  - `"camel"` : to camel case
   *  - `"snake"` : to snake case
   *  - `"kebab"` : to kebab case
   *  - `"start"` : to start case
   *  - `null`  : keep orignal
   *
   * @return string which applied the case mode
   */
  toCase(str, mode) {
    // Guard
    if (Ti.Util.isNil(str) || !mode) return str;
    // Find mode
    let fn = TiStr.getCaseFunc(mode);
    // Apply mode
    if (_.isFunction(fn)) {
      return fn(str);
    }
    return str;
  },
  getCaseFunc(mode) {
    return {
      upper: (s) => (s ? s.toUpperCase() : s),
      lower: (s) => (s ? s.toLowerCase() : s),
      camel: (s) => _.camelCase(s),
      snake: (s) => _.snakeCase(s),
      kebab: (s) => _.kebabCase(s),
      start: (s) => _.startCase(s)
    }[mode];
  },
  toComType(comType) {
    return _.upperFirst(_.camelCase(comType));
  },
  isValidCase(mode) {
    return _.isFunction(TiStr.getCaseFunc(mode));
  },
  /***
   * Check given string is phone number or not
   */
  isPhoneNumber(s = "") {
    return /^(\+\d{2})? *(\d{11})$/.test(s);
  }
};
//-----------------------------------
export const S = TiStr;
