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
  }
  //-----------------------------------
}
///////////////////////////////////////
export default TiValidate
