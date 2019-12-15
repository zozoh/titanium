///////////////////////////////////////
const TiCss = {
  //-----------------------------------
  toSize(sz) {
    if(_.isNumber(sz) || /^[0-9]+$/.test(sz)) {
      if(sz>-1 && sz<1)
        return sz*100 + "%"
      return sz + "px"
    }
    return sz
  },
  //-----------------------------------
  toStyle(obj) {
    return _.mapValues(obj, (val, key)=>{
      let ck = _.kebabCase(key)
      if(/^(opacity|z-index|order)$/.test(ck)){
        return val
      }
      return TiCss.toSize(val)
    })
  },
  //-----------------------------------
  mergeClassName(...args) {
    let klass = {}
    for(let arg of args) {
      let kla = arg
      if(Ti.Util.isNil(kla))
        continue
      // Function
      if(_.isFunction(arg)) {
        kla = arg()
      }
      // String
      if(_.isString(kla)) {
        if(kla) {
          let ss = _.without(_.split(kla, / +/g), "")
          for(let s of ss) {
            klass[s] = true
          }
        }
      }
      // Array
      else if(_.isArray(kla)) {
        for(let a of kla) {
          klass[a] = true
        }
      }
      // Object
      else if(_.isPlainObject(kla)) {
        _.forEach(kla, (val, key)=>{
          if(val) {
            klass[key] = true
          }
        })
      }
    }
    return klass
  },
  //-----------------------------------
  joinClassNames(...args) {
    let klass = TiCss.mergeClassName(...args)
    let names = []
    _.forEach(klass, (enabled, key)=>{
      if(enabled)
        names.push(key)
    })
    return names.join(" ")
  }
  //-----------------------------------
}
///////////////////////////////////////
export default TiCss

