///////////////////////////////////////
const FnSet = {
  "NoEmpty"       : (val)=>!_.isEmpty(val),
  "HasValue"      : (val)=>(
                      !_.isUndefined(val) 
                      && !_.isNull(val)),
  "isPlainObject" : (val)=>_.isPlainObject(val),
  "isBoolean"     : (val)=>_.isBoolean(val),
  "isNumber"      : (val)=>_.isNumber(val),
  "isString"      : (val)=>_.isString(val),
  "isDate"        : (val)=>_.isDate(val),
  "inRange" : (val, ...args)=>{
    return _.inRange(val, ...args)
  },
  "isMatch" : (val, src)=> {
    return _.isMatch(val, src)
  },
  "isEqual" : (val, oth)=> {
    return _.isEqual(val, oth)
  },
  "isOf" : (val, ...args) => {
    for(let a of args) {
      if(_.isEqual(a, val))
        return true
    }
    return false
  },
  "matchRegex" : (val, regex)=>{
    if(_.isRegExp(regex)){
      return regex.test(val)
    }
    return new RegExp(regex).test(val)
  }
}
///////////////////////////////////////
const TiValidate = {
  //-----------------------------------
  get(name, args=[]) {
    let fn = _.get(FnSet, name)
    if(_.isEmpty(args)) {
      return fn
    }
    if(_.isFunction(fn)) {
      return _.partialRight(fn, ...args)
    }
  },
  //-----------------------------------
  getBy(fn) {
    if(_.isFunction(fn)) {
      return fn
    }
    if(_.isString(fn)) {
      return TiValidate.get(fn)
    }
    if(_.isPlainObject(fn)) {
      let name = fn.name
      let args = _.isUndefined(fn.args) ? [] : [].concat(fn.args)
      return TiValidate.get(name, args)
    }
    if(_.isArray(fn) && fn.length>0) {
      let name = fn[0]
      let args = fn.slice(1, fn.length)
      return TiValidate.get(name, args)
    }
  },
  //-----------------------------------
  checkBy(fn, val) {
    let f = TiValidate.getBy(fn)
    if(_.isFunction(f)) {
      return f(val) ? true : false
    }
    return false
  },
  //-----------------------------------
  match(obj={}, validates={}) {
    // Static value
    if(!_.isPlainObject(validates)) {
      return validates ? true : false
    }
    // Customized
    if(_.isFunction(validates)) {
      return validates(obj) ? true : false
    }
    // Check
    let keys = _.keys(validates)
    for(let key of keys) {
      let fn  = _.get(validates, key)
      let val = _.get(obj, key)
      if(!TiValidate.checkBy(fn, val)) {
        return false
      }
    }
    return true
  }
  //-----------------------------------
}
///////////////////////////////////////
export default TiValidate
