export const TiStr = {
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
