export const TiStr = {
  /***
   * Replace the placeholder
   */
  renderBy(str="", vars={}, iteratee, regex=/\$\{([^}]+)\}/g) {
    if(!str || _.isEmpty(vars)){
      return _.isArray(vars) ? [] : ""
    }
    // Normlized args
    if(_.isRegExp(iteratee)) {
      regex = iteratee
      iteratee = undefined
    }
    // Default iteratee
    if(!iteratee) {
      iteratee = (varName, vars, placeholder)=>{
        return Ti.Util.fallback(vars[varName], placeholder)  
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
        last = regex.lastIndex
      }
      let varName  = m[1]
      let varValue = iteratee(varName, vars, m[0])
      ss.push(varValue)
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
  }
}
//-----------------------------------
export default TiStr
