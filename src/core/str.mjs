export const TiStr = {
  renderVars(vars={}, fmt="", {
    iteratee, 
    regex, 
    safe
  }={}) {
    if(_.isString(vars) || _.isNumber(vars)) {
      vars = {val:vars}
    }
    if(!vars || _.isEmpty(vars)){
      return _.isArray(vars) ? [] : ""
    }
    return TiStr.renderBy(fmt, vars, {
      iteratee, regex, safe
    })
  },
  /***
   * Replace the placeholder
   */
  renderBy(str="", vars={}, {
    iteratee, 
    regex=/(\${1,2})\{([^}]+)\}/g,
    safe=false
  }={}) {
    if(!str){
      return _.isArray(vars) ? [] : ""
    }
    // Make sure the `vars` empty-free
    vars = vars || {}
    if(safe) {
      let r2 = _.isRegExp(safe) ? safe : undefined
      vars = TiStr.safeDeep(vars, r2)
    }
    // Normlized args
    if(_.isRegExp(iteratee)) {
      regex = iteratee
      iteratee = undefined
    }
    // Default iteratee
    if(!iteratee) {
      iteratee = ({varName, vars, matched}={})=>{
        if(matched.startsWith("$$")) {
          return matched.substring(1)
        }
        return Ti.Util.fallback(
          Ti.Util.getOrPick(vars, varName),
          matched
        )
      }
    }
    // Array
    if(_.isArray(vars)) {
      let re = []
      for(let i=0; i<vars.length; i++) {
        let vars2 = vars[i]
        let s2 = TiStr.renderBy(str, vars2)
        re.push(s2)
      }
      return re
    }
    // Looping
    let m
    let ss = []
    let last = 0
    while(m=regex.exec(str)){
      let current = m.index
      if(current > last) {
        ss.push(str.substring(last, current))
      }
      let varValue = iteratee({
        vars,
        matched : m[0],
        prefix  : m[1], 
        varName : m[2]
      })
      ss.push(varValue)
      last = regex.lastIndex
    }
    // Add tail
    if(last < str.length) {
      ss.push(str.substring(last))
    }
    // Return
    return ss.join("")
  },
  /***
   * Replace the dangerous char in Object deeply.
   * 
   * @param data{Array|Object|Any} : the value to be turn to safe
   * @param regex{RegExp} : which char should be removed
   * 
   * @return data
   */
  safeDeep(data={}, regex=/['"]/g) {
    // String to replace
    if(_.isString(data)) {
      return data.replace(regex, "")
    }
    // Array
    else if(_.isArray(data)) {
      return _.map(data, (v)=>this.safeDeep(v, regex))
    }
    // Object
    else if(_.isPlainObject(data)) {
      return _.mapValues(data, (v)=>this.safeDeep(v, regex))
    }
    // Others return
    return data
  },
  /***
   * Join without `null/undefined`
   */
  join(sep="", ...ss){
    let list = []
    for(let s of ss) {
      if(_.isUndefined(s) || _.isNull(s))
        continue
      list.push(s)
    }
    return list.join(sep)
  },
  /***
   * Convert string to Js Object automatictly
   */
  toJsValue(v="", {
    autoJson=true,
    autoDate=true
  }={}) {
    let str = _.trim(v)
    // Number
    if (/^-?[\d.]+$/.test(str)) {
        return str * 1;
    }
    // Boolean
    if(/^(true|false|yes|no|on|off)$/i.test(str)) {
      return /^(true|yes|on)$/i.test(str)
    }
    // try JSON
    if(autoJson) {
      let re = Ti.Types.safeParseJson(v)
      if(!_.isUndefined(re)) {
        return re
      }
    }
    // try Date
    if(autoDate) {
      try {
        return Ti.Types.toDate(v)
      } catch(E){}
    }
    // Then, it is a string
    return str
  },
  /***
   * Get the display text for bytes
   */
  sizeText(byte=0, {
    fixed=2, M=1024, 
    units=["Bytes","KB","MB","GB","PB","TB"]}={}) {
    let nb = byte
    let i = 0;
    for(; i<units.length; i++) {
      let nb2 = nb / M
      if(nb2 < M) {
        break;
      }
      nb = nb2
    }
    let unit = units[i]
    if(nb == parseInt(nb)) {
      return nb + unit
    }
    return nb.toFixed(fixed)+unit
  },
  /***
   * Get the display percent text for a float number
   * @param n Float number
   */
  toPercent(n, {fixed=2, auto=true}={}){
    if(!_.isNumber(n))
      return "NaN"
    let nb = n * 100
    // Round
    let str = fixed >= 0 ? nb.toFixed(fixed) : (nb+"")
    if(auto) {
      let lastDot  = str.lastIndexOf('.')
      let lastZero = str.lastIndexOf('0')
      if(lastDot >=0 && lastZero>lastDot) {
        let last = str.length-1
        let pos  = last
        for(; pos>=lastDot; pos--){
          if(str[pos] != '0')
            break
        }
        if(pos==lastZero || pos==lastDot) {
          //pos --
        }
        else {
          pos ++
        }
        if(pos < str.length)
          str = str.substring(0, pos)
      }
    }
    return str + "%"
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
    if(Ti.Util.isNil(str))
      return str
    // Find mode
    let fn = TiStr.getCaseFunc(mode)
    // Apply mode
    if(_.isFunction(fn)) {
      return fn(str)
    }
    return str
  },
  getCaseFunc(mode) {
    return ({
      upper : (s)=>s ? s.toUpperCase() : s,
      lower : (s)=>s ? s.toLowerCase() : s,
      camel : (s)=>_.camelCase(s),
      snake : (s)=>_.snakeCase(s),
      kebab : (s)=>_.kebabCase(s),
      start : (s)=>_.startCase(s),
    })[mode]
  },
  isValidCase(mode) {
    return _.isFunction(TiStr.getCaseFunc(mode))
  },
  /***
   * Check given string is phone number or not
   */
  isPhoneNumber(s="") {
    return /^(\+\d{2})? *(\d{11})$/.test(s)
  }
}
//-----------------------------------
export default TiStr
