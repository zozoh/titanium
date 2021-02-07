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
  toSize(sz, {autoPercent=true, remBase=0}={}) {
    if(_.isNumber(sz) || /^[0-9]+$/.test(sz)) {
      if(0 == sz)
        return sz
      if(autoPercent && sz>=-1 && sz<=1) {
        return sz*100 + "%"
      }
      if(remBase>0) {
        return (sz/remBase) + "rem"
      }
      return sz + "px"
    }
    return sz
  },
  //-----------------------------------
  toSizeRem100(sz, options) {
    let opt = _.assign({}, options, {remBase:100})
    return TiCss.toSize(sz, opt);
  },
  //-----------------------------------
  toStyle(obj, options) {
    return _.mapValues(obj, (val, key)=>{
      let ck = _.kebabCase(key)
      if(/^(opacity|z-index|order)$/.test(ck)){
        return val
      }
      return TiCss.toSize(val, options)
    })
  },
  //-----------------------------------
  toStyleRem100(obj, options) {
    let opt = _.assign({}, options, {remBase:100})
    return TiCss.toStyle(obj, opt);
  },
  //-----------------------------------
  toBackgroundUrl(src, base="") {
    if(!src)
      return
    if(base)
      src = Ti.Util.appendPath(base, src)
    return `url("${src}")`
  },
  //-----------------------------------
  toNumStyle(obj) {
    return TiCss.toStyle(obj, false)
  },
  //-----------------------------------
  mergeClassName(...args) {
    let klass = {}
    //.................................
    const __join_class = (kla) => {
      // Guard
      if(Ti.Util.isNil(kla))
        return
      // Function
      if(_.isFunction(kla)) {
        let re = kla()
        __join_class(re)
      }
      // String
      else if(_.isString(kla)) {
        let ss = _.without(_.split(kla, / +/g), "")
        for(let s of ss) {
          klass[s] = true
        }
      }
      // Array
      else if(_.isArray(kla)) {
        for(let a of kla) {
          __join_class(a)
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
    //.................................
    __join_class(args)
    //.................................
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
export const Css = TiCss

