export const TiStr = {
  renderVars(vars={}, fmt="", {
    iteratee, regex=/\$\{([^}]+)\}/g
  }={}) {
    if(_.isString(vars) || _.isNumber(vars)) {
      vars = {val:vars}
    }
    if(!vars || _.isEmpty(vars)){
      return _.isArray(vars) ? [] : ""
    }
    return TiStr.renderBy(fmt, vars, iteratee, regex)
  },
  /***
   * Replace the placeholder
   */
  renderBy(str="", vars={}, {
    iteratee, 
    regex=/(\${1,2})\{([^}]+)\}/g
  }={}) {
    if(!str){
      return _.isArray(vars) ? [] : ""
    }
    // Make sure the `vars` empty-free
    vars = vars || {}
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
        return Ti.Util.fallback(vars[varName], matched)  
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
  toJsValue(v="") {
    let str = _.trim(v)
    // Number
    if (/^-?[\d.]+$/.test(str)) {
        return str * 1;
    }
    // Boolean
    if(/^(true|false|yes|no|on|off)$/i.test(str)) {
      return /^(true|yes|on)$/i.test(str)
    }
    // Date
    try {
      return Ti.Types.parseDate(v)
    } catch(E){}
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
    let str = fixed > 0 ? nb.toFixed(fixed) : (nb+"")
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
   * Check given string is phone number or not
   */
  isPhoneNumber(s="") {
    return /^(\+\d{2})? *(\d{11})$/.test(s)
  }
}
//-----------------------------------
export default TiStr
