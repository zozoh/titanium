///////////////////////////////////////////////////
function TmplStaticEle(s) {
  return (sb = []) => sb.push(s)
}
///////////////////////////////////////////////////
function TmplStringEle(s_token, key, fmt, dft) {
  // TODO should support fmt as converter
  //  - @trim,@replace, mapping
  return (sb = [], vars = {}, showKey = false) => {
    let s = _.get(vars, key) || dft
    // Join to output
    if (!Ti.Util.isNil(s)) {
      sb.push(s)
    }
    // Show Key
    else if (showKey) {
      sb.push(s_token)
    }
  }
}
///////////////////////////////////////////////////
function TmplIntEle(s_token, key, fmt, dft) {
  // TODO should support fmt as converter
  //  - %d
  return (sb = [], vars = {}, showKey = false) => {
    let s = _.get(vars, key) || dft
    // Join to output
    if (!Ti.Util.isNil(s)) {
      let n = parseInt(s)
      sb.push(n)
    }
    // Show Key
    else if (showKey) {
      sb.push(s_token)
    }
  }
}
///////////////////////////////////////////////////
function TmplBooleanEle(s_token, key, fmt = "false/true", dft) {
  let texts = fmt.split("\/")
  return (sb = [], vars = {}, showKey = false) => {
    let b = _.get(vars, key) || dft
    // Join to output
    if (!Ti.Util.isNil(b)) {
      sb.push(b ? texts[1] : texts[0])
    }
    // Show Key
    else if (showKey) {
      sb.push(s_token)
    }
  }
}
///////////////////////////////////////////////////
function TmplNumberEle(s_token, key, fmt, dft) {
  // TODO should support fmt as converter
  //  - %#.2f
  return (sb = [], vars = {}, showKey = false) => {
    let s = _.get(vars, key) || dft
    // Join to output
    if (!Ti.Util.isNil(s)) {
      let n = s * 1
      sb.push(n)
    }
    // Show Key
    else if (showKey) {
      sb.push(s_token)
    }
  }
}
///////////////////////////////////////////////////
function TmplDateEle(s_token, key, fmt = "yyyy-MM-dd'T'HH:mm:ss", dft) {
  return (sb = [], vars = {}, showKey = false) => {
    let d = _.get(vars, key) || dft
    // Join to output
    if (!Ti.Util.isNil(d)) {
      let ds = Ti.DateTime.format(d, fmt)
      sb.push(ds)
    }
    // Show Key
    else if (showKey) {
      sb.push(s_token)
    }
  }
}
///////////////////////////////////////////////////
function TmplJsonEle(s_token, key, fmt = "cn", dft) {
  // TODO support format "cn"
  let isCompact = fmt.indexOf('c') >= 0
  let ignoreNull = fmt.indexOf('n') < 0
  return (sb = [], vars = {}, showKey = false) => {
    let obj = _.get(vars, key) || dft
    // Join to output
    if (!Ti.Util.isNil(s)) {
      let json;
      // Default
      if ("-obj-" == obj) {
        json = "{}"
      }
      // Default Array
      else if ("-array-" == obj) {
        json = "[]"
      }
      // format json
      else {
        let replacer = function (k, v) {
          if (ignoreNull && Ti.Util.isNil(v)) {
            return
          }
          return v
        }
        let space = isCompact ? null : "   "
        json = JSON.stringify(obj, flt, space)
      }
      sb.push(json)
    }
    // Show Key
    else if (showKey) {
      sb.push(s_token)
    }
  }
}
///////////////////////////////////////////////////
///////////////////////////////////////////////////
const _P2 = /^([^<>()?]+)([<(](int|long|boolean|float|double|date|string|json)?(\s*:\s*([^>]*))?[>)])?([?]\s*(.*)\s*)?$/
///////////////////////////////////////////////////
class TiTmplPattern {
  constructor({
    regex,
    groupIndex = 2,
    escapeIndex = 3,
    getEscapeStr = () => "$"
  } = {}) {
    this.list = []
    this.keys = []

    this.groupIndex = groupIndex;
    this.escapeIndex = escapeIndex;
    this.getEscapeStr = getEscapeStr

    // 默认的模板占位符
    if (!regex) {
      // The Apple don't support (?<!) WTF
      this._P = /([$][{]([^}]+)[}])|([$][$])/g
    }
    // 直接给的就是正则
    else if (_.isRegExp(regex)) {
      this._P = regex
    }
    // 自定义的占位符
    else {
      this._P = new RegExp(regex, "g");

    }
  }
  //-----------------------------------------------
  parse(str) {
    let lastIndex = 0;
    let m;
    let regex = new RegExp(this._P, "g")
    while (m = regex.exec(str)) {
      let pos = m.index
      // 看看是否要生成静态对象
      if (pos > lastIndex) {
        let s = str.substring(lastIndex, pos)
        this.list.push(TmplStaticEle(s));
      }
      // 根据占位符语法解析一下
      // 看看是逃逸呢，还是匹配上了
      let s_escape = this.escapeIndex > 0 ? m[this.escapeIndex] : null;

      // 如果是逃逸
      if (!Ti.S.isBlank(s_escape)) {
        let esc_str = this.getEscapeStr(m);
        this.list.push(TmplStaticEle(esc_str));
      }
      // 否则分析键
      else {
        let s_token = m[0]
        let s_match = m[this.groupIndex];
        let m2 = _P2.exec(s_match);

        if (!m2) {
          throw `Fail to parse tmpl key '${s_match}'`
        }

        let key = m2[1];
        let type = m2[3] || "string";
        let fmt = m2[5];
        let dft = m2[7];

        // 记录键
        this.keys.push(key);

        // 增加元素
        ({
          "string": () => {
            this.list.push(TmplStringEle(s_token, key, fmt, dft))
          },
          "int": () => {
            this.list.push(TmplIntEle(s_token, key, fmt, dft));
          },
          // long
          "long": () => {
            this.list.push(TmplIntEle(s_token, key, fmt, dft));
          },
          // boolean
          "boolean": () => {
            this.list.push(TmplBooleanEle(s_token, key, fmt, dft));
          },
          // float
          "float": () => {
            this.list.push(TmplNumberEle(s_token, key, fmt, dft));
          },
          // double
          "double": () => {
            this.list.push(TmplNumberEle(s_token, key, fmt, dft));
          },
          // date
          "date": () => {
            this.list.push(TmplDateEle(s_token, key, fmt, dft));
          },
          // json
          "json": () => {
            this.list.push(TmplJsonEle(s_token, key, fmt, dft));
          }
        })[type]()
      }

      // 记录
      lastIndex = regex.lastIndex;
    }

    // 最后结尾是否要加入一个对象
    if (!(lastIndex >= str.length)) {
      let s = str.substring(lastIndex)
      this.list.push(TmplStaticEle(s));
    }

    // 返回自身
    return this
  }
  //-----------------------------------------------
  render(vars = {}, showKey = false) {
    let sb = []
    for (let eleJoin of this.list) {
      eleJoin(sb, vars, showKey)
    }
    return sb.join("")
  }
  //-----------------------------------------------
}
///////////////////////////////////////////////////
// From org.nutz.lang.tmpl.Tmpl
const TiTmpl = {
  //-----------------------------------------------
  parse(input, setup) {
    let tmpl = new TiTmplPattern(input, setup)
    tmpl.parse(input)
    return tmpl
  },
  //-----------------------------------------------
  parseAs(input, {
    startChar = "$",
    leftBrace = "{",
    rightBrace = "}"
  } = {}) {
    if (null == input)
      return null;

    // The Apple don't support (?<!) WTF
    let regex = "(["
      + startChar
      + "]["
      + ("[" == leftBrace ? "\\[" : leftBrace)
      + "]([^"
      + ("]" == rightBrace ? "\\]" : rightBrace)
      + "]+)["
      + rightBrace
      + "])|(["
      + startChar
      + "]["
      + startChar
      + "])";
    return TiTmpl.parse(input, {
      regex,
      groupIndex: 2,
      escapeIndex: 3,
      getEscapeStr: () => startChar
    });
  },
  //-----------------------------------------------
  exec(input, vars = {}, {
    regex, groupIndex, escapeIndex, getEscapeStr,
    startChar, leftBrace, rightBrace,
    showKey
  } = {}) {
    let tmpl = startChar
      ? TiTmpl.parseAs(input, { startChar, leftBrace, rightBrace })
      : TiTmpl.parse(input, { regex, groupIndex, escapeIndex, getEscapeStr })

    return tmpl.render(vars, showKey)
  },
  //-----------------------------------------------
  _test_100000_exec() {
    let vars = {
      name: "zozoh", age: 45, great: true, bir: new Date()
    };
    let input = "${name}[${age}] is ${great<boolean:no/yes>} since ${bir<date:yy年M月d日 HH点mm分ss秒.SSS毫秒>}"
    let TN = 100000
    let ms0 = Date.now()
    let re = []
    for (var i = 0; i < TN; i++) {
      let s = Ti.Tmpl.exec(input, vars)
      re.push(s)
    }
    let ms1 = Date.now()
    let duInMs = ms1 - ms0
    // for (var i = 0; i < TN; i++) {
    //   var s = re[i]
    //   console.log(`${i}. ${s}`)
    // }
    console.log(`in ${duInMs}ms`)
  },
  //-----------------------------------------------
  _test_100000_render() {
    let vars = {
      name: "zozoh", age: 45, great: true, bir: new Date()
    };
    let input = "${name}[${age}] is ${great<boolean:no/yes>} since ${bir<date:yy年M月d日 HH点mm分ss秒.SSS毫秒>}"
    let tmpl = Ti.Tmpl.parse(input)
    let TN = 100000
    let ms0 = Date.now()
    let re = []
    for (var i = 0; i < TN; i++) {
      let s = tmpl.render(vars)
      re.push(s)
    }
    let ms1 = Date.now()
    let duInMs = ms1 - ms0
    // for (var i = 0; i < TN; i++) {
    //   var s = re[i]
    //   console.log(`${i}. ${s}`)
    // }
    console.log(`in ${duInMs}ms`)
  },
  //-----------------------------------------------
  _test_100000_str_render() {
    let vars = {
      name: "zozoh", age: 45, great: true, bir: new Date()
    };
    let input = "${name}[${age}] is ${great} since ${bir}"
    let TN = 100000
    let ms0 = Date.now()
    let re = []
    for (var i = 0; i < TN; i++) {
      let s = Ti.S.renderVars(vars, input)
      re.push(s)
    }
    let ms1 = Date.now()
    let duInMs = ms1 - ms0
    // for (var i = 0; i < TN; i++) {
    //   var s = re[i]
    //   console.log(`${i}. ${s}`)
    // }
    console.log(`in ${duInMs}ms`)
  }
  //-----------------------------------------------
}
///////////////////////////////////////////////////
export const Tmpl = TiTmpl
