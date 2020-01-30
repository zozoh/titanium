///////////////////////////////////////
const TiCss = {
  //-----------------------------------
  toPixel(str, base=100, dft=0) {
    // Number may `.23` or `300`
    if(_.isNumber(str)) {
      // Take (-1, 1) as percent
      if(str>-1 && str < 1) {
        return str * base
      }
      // Fixed value
      return str
    }
    // String, may `45px` or `43%`
    let m = /^([\d.]+)(px)?(%)?$/.exec(str);
    if(m) {
      // percent
      if(m[3]) {
        return m[1] * base / 100
      }
      // fixed value
      return m[1] * 1
    }
    // Fallback to default
    return dft
  },
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

