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
  get(name, args=[], not) {
    let fn = _.get(FnSet, name)
    if(!_.isFunction(fn)) {
      throw `Invalid Validate: ${name}`
    }
    let f2;
    if(_.isEmpty(args)) {
      f2 = fn
    }
    else {
      f2 = _.partialRight(fn, ...args)
    }

    if(not) {
      return v => {
        return !f2(v)
      }
    }
    return f2
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
      let not = fn.not
      return TiValidate.get(name, args, not)
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
  match(obj={}, validates={}, allowEmpty=false) {
    if(!obj || _.isEmpty(obj)) {
      return allowEmpty
    }
    // Customized
    if(_.isFunction(validates)) {
      return validates(obj) ? true : false
    }
    // Static value
    if(_.isBoolean(validates)) {
      return validates ? true : false
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
