//-----------------------------------
const TiCss = {
  toSize(sz) {
    if(_.isNumber(sz) || /^[0-9]+$/.test(sz)) {
      if(sz>-1 && sz<1)
        return sz*100 + "%"
      return sz + "px"
    }
    return sz
  },
  toStyle(obj) {
    return _.mapValues(obj, (val, key)=>{
      let ck = _.kebabCase(key)
      if(/^(opacity|z-index|order)$/.test(ck)){
        return val
      }
      return TiCss.toSize(val)
    })
  },
  mergeClassName(...args) {
    let klass = {}
    for(let arg of args) {
      if(Ti.Util.isNil(arg))
        continue
      // String
      if(_.isString(arg)) {
        let ss = _.without(_.split(arg, / +/g), "")
        for(let s of ss) {
          klass[s] = true
        }
      }
      // Array
      else if(_.isArray(arg)) {
        for(let a of arg) {
          klass[a] = true
        }
      }
      // Object
      else if(_.isPlainObject(arg)) {
        _.forEach(arg, (val, key)=>{
          if(val) {
            klass[key] = true
          }
        })
      }
    }
    return klass
  }
}
//---------------------------------------
export default TiCss

