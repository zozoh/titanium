///////////////////////////////////////
const TiCss = {
  //-----------------------------------
  /**
   * @param scale{Float} : the rate of width/height
   * @param W{Integer} : width 
   * @param H{Integer} : height
   */
  scaleSize(scale = 1.0, W, H) {
    if (H && W) {
      return {
        width: W, height: H
      }
    }
    if (H) {
      return {
        width: scale * H,
        height: H
      }
    }
    if (W) {
      return {
        width: W,
        height: W / scale
      }
    }
  },
  //-----------------------------------
  toPixel(input, base = 100, dft = 0) {
    if (Ti.Util.isNil(input)) {
      return input
    }
    // Number may `.23` or `300`
    if (_.isNumber(input)) {
      // Take (-1, 1) as percent
      if (input > -1 && input < 1) {
        return input * base
      }
      // Fixed value
      return input
    }
    // String, may `45px` or `43%`
    let opt = {
      base, dft,
      remBase: Ti.Dom.getRemBase()
    }
    return TiCss.toAbsPixel(input, opt)
  },
  //-----------------------------------
  toAbsPixel(input, { base = 100, dft = 0, remBase = 100, emBase = 14 } = {}) {
    if (Ti.Util.isNil(input)) {
      return input
    }
    if (_.isNumber(input)) {
      return input
    }
    let m = /^(-?[\d.]+)(px|rem|em|%)?$/.exec(input);
    if (m) {
      let v = m[1] * 1
      let fn = ({
        px: v => v,
        rem: v => v * remBase,
        em: v => v * emBase,
        '%': v => v * base / 100
      })[m[2]]
      if (fn) {
        return fn(v)
      }
      return v
    }
    // Fallback to default
    return dft
  },
  //-----------------------------------
  toSize(sz, { autoPercent = true, remBase = 0 } = {}) {
    if (_.isNumber(sz) || /^[0-9]+$/.test(sz)) {
      if (0 == sz)
        return sz
      if (autoPercent && sz >= -1 && sz <= 1) {
        return sz * 100 + "%"
      }
      if (remBase > 0) {
        return (sz / remBase) + "rem"
      }
      return sz + "px"
    }
    return sz
  },
  //-----------------------------------
  toSize2(sz) {
    return TiCss.toSize(sz, { autoPercent: false })
  },
  //-----------------------------------
  toSizeRem100(sz, options) {
    let opt = _.assign({}, options, { remBase: 100 })
    return TiCss.toSize(sz, opt);
  },
  //-----------------------------------
  toStyle(obj, options) {
    return _.mapValues(obj, (val, key) => {
      let ck = _.kebabCase(key)
      if (/^(opacity|z-index|order)$/.test(ck)) {
        return val
      }
      return TiCss.toSize(val, options)
    })
  },
  //-----------------------------------
  toStyleRem100(obj, options) {
    let opt = _.assign({}, options, { remBase: 100 })
    return TiCss.toStyle(obj, opt);
  },
  //-----------------------------------
  toBackgroundUrl(src, base = "") {
    if (!src)
      return
    if (base)
      src = Ti.Util.appendPath(base, src)
    return `url("${src}")`
  },
  //-----------------------------------
  toBackgroundUrlBy(src, tmpl = "") {
    if (!src)
      return
    if (tmpl)
      src = Ti.S.renderBy(tmpl, src)
    return `url("${src}")`
  },
  //-----------------------------------
  toBackgroundUrlAsPreview(src, apiTmpl, cdnTmpl, dftSrc) {
    if (!src || _.isEmpty(src))
      return
    src = Ti.WWW.evalObjPreviewSrc(src, {
      apiTmpl, cdnTmpl, dftSrc
    })
    return `url("${src}")`
  },
  //-----------------------------------
  toNumStyle(obj) {
    return TiCss.toStyle(obj, false)
  },
  //-----------------------------------
  mergeClassName(...args) {
    return TiCss.mergeClassNameBy({}, ...args)
  },
  //-----------------------------------
  mergeClassNameBy(context = {}, ...args) {
    let klass = {}
    //.................................
    const __join_class = (kla) => {
      // Guard
      if (Ti.Util.isNil(kla))
        return
      // Function
      if (_.isFunction(kla)) {
        let re = kla(context)
        __join_class(re)
      }
      // String
      else if (_.isString(kla)) {
        let ss = _.without(_.split(kla, /\s+/g), "")
        for (let s of ss) {
          klass[s] = true
        }
      }
      // Array
      else if (_.isArray(kla)) {
        for (let a of kla) {
          __join_class(a)
        }
      }
      // Object
      else if (_.isPlainObject(kla)) {
        _.forEach(kla, (val, key) => {
          if (val) {
            let name = _.kebabCase(key)
            klass[name] = true
          }
        })
      }
    }
    //.................................
    __join_class(args)
    //.................................
    return klass
  },
  //-----------------------------------
  joinClassNames(...args) {
    let klass = TiCss.mergeClassName(...args)
    let names = []
    _.forEach(klass, (enabled, key) => {
      if (enabled)
        names.push(key)
    })
    return names.join(" ")
  },
  //----------------------------------------------------
  parseCssRule(rule = "", filter = true) {
    rule = _.trim(rule)
    if (Ti.S.isBlank(rule)) {
      return {}
    }
    filter = Ti.Dom.attrFilter(filter)
    let re = {}
    let ss = rule.split(";")
    for (let s of ss) {
      if (Ti.S.isBlank(s))
        continue
      let pos = s.indexOf(':')
      if (pos <= 0) {
        continue
      }
      let name = _.trim(s.substring(0, pos))
      let value = _.trim(s.substring(pos + 1))
      let key = filter(name, value)
      if (key) {
        if (_.isBoolean(key)) {
          key = _.camelCase(name)
        }
        re[key] = value
      }
    }
    return re
  },
  //----------------------------------------------------
  parseAndTidyCssRule(rule = {}, {
    filter, parseBackground = true, nameCase = "kebab",
    urlRewrite
  } = {}) {
    if (_.isString(rule)) {
      rule = TiCss.parseCssRule(rule, filter)
    }
    if (parseBackground) {
      let toNameCase = Ti.S.getCaseFunc(nameCase)
      if (rule.background) {
        let bg = TiCss.parseBackground(rule.background, { nameCase });
        delete rule.background
        _.assign(rule, bg)
      }

      // Rewruite url
      let bgImgKey = toNameCase("background-image")
      if (rule[bgImgKey] && _.isFunction(urlRewrite)) {
        rule[bgImgKey] = urlRewrite(rule[bgImgKey])
      }


      let bgPosKey = toNameCase("background-position")
      if (rule[bgPosKey]) {
        const toPosName = function (str, cans = []) {
          if (/^0(%|px|rem|em|pt)?$/.test(str)) {
            return cans[0]
          }
          if ("50%" == str) {
            return cans[1]
          }
          if ("100%" == str) {
            return cans[2]
          }
          return str
        }
        let poss = rule[bgPosKey].split(/\s+/)
        let posX = _.first(poss)
        let posY = _.last(poss)
        delete rule[bgPosKey]
        rule[toNameCase("background-position-x")] = toPosName(posX,
          ["left", "center", "right"])
        rule[toNameCase("background-position-y")] = toPosName(posY,
          ["top", "center", "bottom"])
      }
    }
    return rule
  },
  //----------------------------------------------------
  parseBackground(str = "", { nameCase = "kebab" } = {}) {
    let toNameCase = Ti.S.getCaseFunc(nameCase)
    // 首先整理字符串，去掉多余的空格，确保 backgroundPosition|backgroundSize 之间是没有空格的
    let s = (str || "")
      .replace(/[ ]{2,}/g, " ")
      .replace(/[ ]*([\/,])[ ]*/g, "$1")
      .replace(/[ ]\)/g, ")")
      .replace(/\([ ]/g, "(");

    // 正则表达式拼装
    // 1: backgroundColor
    let R = "(#[0-9a-f]{3,}|rgba?\\([\\d, .]+\\))";
    // 2: backgroundImage
    R += "|(url\\([^\\)]+\\))";
    // 3: 组合 backgroundPosition / backgroundSize 的组合
    R += "|(";
    // 4: backgroundPositionX
    R += "(left|right|center|\\d+(%|em|px|cm|ch))";
    // 6: backgroundPositionX
    R += " *(top|bottom|center|\\d+(%|em|px|cm|ch)?)";
    // 8: backgroundSize : 3 子表达式
    R += "/(auto|cover|contain|\\d+(%|em|px)( \\d+(%|em|px))?|auto( auto)?)";
    R += ")";
    // 13: backgroundRepeat
    R += "|(repeat|no-repeat)";
    // 14: backgroundOrigin : 1 子表达式
    R += "|((padding|border|content)-box)";
    // 16: backgroundAttachment
    R += "|(scroll|fixed)";
    let regex = new RegExp(R, "gi");

    // 准备赋值
    let indexes = {
      backgroundColor: 1,
      backgroundImage: 2,
      backgroundPositionX: 4,
      backgroundPositionY: 6,
      backgroundSize: 8,
      backgroundRepeat: 13,
      backgroundOrigin: 14,
      backgroundAttachment: 16
    };

    // 准备返回对象
    let bg = {};

    // 循环解析字符串
    let m;
    while ((m = regex.exec(s)) !== null) {
      //console.log(m)
      for (var key in indexes) {
        var index = indexes[key];
        if (m[index]) {
          let k2 = toNameCase(key)
          bg[k2] = m[index];
        }
      }
    }

    // 搞定收工
    return bg;
  },
  //----------------------------------------------------
  renderCssRule(css = {}) {
    if (_.isEmpty(css)) {
      return ""
    }
    if (_.isString(css)) {
      return css
    }
    let list = []
    _.forEach(css, (val, key) => {
      if (_.isNull(val) || _.isUndefined(val) || Ti.S.isBlank(val))
        return
      let pnm = _.kebabCase(key)
      if (/^(opacity|z-index|order)$/.test(pnm)) {
        list.push(`${pnm}:${val}`)
      }
      // Empty string to remove one propperty
      else if (_.isNumber(val)) {
        list.push(`${pnm}:${val}px`)
      }
      // Set the property
      else {
        list.push(`${pnm}:${val}`)
      }
    })
    return list.join(";")
  },
  //----------------------------------------------------
  /**
   * Render a full style sheet by object like:
   * 
   * ```js
   * [{
   *    selector: ["selector A", "selector B"],
   *    rules: {
   *       "background": "red"
   *    }
   * }]
   * ```
   * 
   * @param sheet{Array} : style selecor and rules
   */
  renderCssStyleSheet(sheet = []) {
    sheet = _.concat(sheet)
    let re = []
    for (let it of sheet) {
      let { selectors, rules } = it
      selectors = _.concat(selectors)
      if (_.isEmpty(selectors) || _.isEmpty(rules)) {
        continue;
      }
      re.push(selectors.join(",") + "{")
      re.push(TiCss.renderCssRule(rules))
      re.push("}")
    }
    return re.join("\n")
  }
  //-----------------------------------
}
///////////////////////////////////////
export const Css = TiCss

