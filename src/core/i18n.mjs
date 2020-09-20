//-----------------------------------
const I18N = {}
//-----------------------------------
function __MSG(key) {
  let re = _.get(I18N, key)
  if(re)
    return re
  if(_.isString(key)) {
    let k2 = key.replace(/\./g,"-")
    return I18N[k2]
  }
  return key
}
//-----------------------------------
const Ti18n = {
  put(msgs) {
    // Multi set
    if(_.isArray(msgs)) {
      for(let ms of msgs) {
        Ti18n.put(ms)
      }
    }
    // Single set
    else if(_.isPlainObject(msgs)) {
      if(_.isBoolean(msgs.ok)) {
        console.warn("invalid msgs", msgs)
        return
      }
      _.assign(I18N, msgs)
    }
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
    // Error Object
    if(key instanceof Error) {
      if(key.code) {
        return Ti.S.join([Ti18n.get(key.code), key.data], " : ")
      }
      return key.message
    }
    // key as String
    let msg = __MSG(key)
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
    // Error Object
    if(str instanceof Error) {
      return Ti18n.get(str)
    }
    // key as String
    let m = /^i18n:(.+)$/.exec(str)
    if(m) {
      return Ti18n.get(m[1], dft)
    }
    return Ti.Util.fallback(str, dft)
  },
  getf(key, vars={}){
    if(_.isString(key)) {
      let msg = __MSG(key) || key
      return Ti.S.renderBy(msg, vars)
    }
    return key
  },
  textf(str, vars={}){
    let m = /^i18n:(.+)$/.exec(str)
    if(m) {
      return Ti18n.getf(m[1], vars)
    }
    return Ti.S.renderBy(str, vars)
  },
  render(vars={}, str) {
    return Ti18n.textf(str, vars)
  }
}
//---------------------------------------
export const I18n = Ti18n

