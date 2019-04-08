//-----------------------------------
const I18N = {}
//-----------------------------------
export const Ti18n = {
  put(msgs) {
    _.assign(I18N, msgs)
  },
  /***
   * @param key{String|Object}
   * @param dft{String}
   */
  get(key, dft) {
    // key as `{key, vars}`
    if(key && key.key && _.isPlainObject(key)) {
      return Ti18n.getf(key.key, key.vars)
    }
    // key as String
    let msg = I18N[key]
    if(_.isUndefined(msg)){
      if(_.isUndefined(dft))
        return key
      return dft
    }
    return msg
  },
  /***
   * @param key{String|Object}
   * @param dft{String}
   */
  text(str, dft) {
    // str as `{text, vars}`
    if(str && str.text && _.isPlainObject(str)) {
      return Ti18n.textf(str.text, str.vars)
    }
    // key as String
    let m = /^i18n:(.+)$/.exec(str)
    if(m) {
      return Ti18n.get(m[1], dft)
    }
    return Ti.Util.fallback(str, dft)
  },
  getf(key, vars={}){
    let msg = I18N[key] || key
    let regex = /\$\{([^}]+)\}/g
    let m
    let ss = []
    let last = 0
    while(m=regex.exec(msg)){
      let current = m.index
      if(current > last) {
        ss.push(msg.substring(last, current))
        last = regex.lastIndex
      }
      let varName  = m[1]
      let varValue = Ti.Util.fallback(vars[varName],m[0])
      ss.push(varValue)
    }
    if(last < msg.length) {
      ss.push(msg.substring(last))
    }
    return ss.join("")
  },
  textf(str, vars={}){
    let m = /^i18n:(.+)$/.exec(str)
    if(m) {
      return Ti18n.getf(m[1], vars)
    }
    return str
  }
}
//---------------------------------------
export default Ti18n

