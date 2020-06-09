///////////////////////////////////////
const VALIDATORS = {
  "notNil"        : (val)=>!Ti.Util.isNil(val),
  "notEmpty"      : (val)=>!_.isEmpty(val),
  "notBlank"      : (val)=>!Ti.S.isBlank(val),
  "isNil"         : (val)=>Ti.Util.isNil(val),
  "isEmpty"       : (val)=>_.isEmpty(val),
  "isBlank"       : (val)=>Ti.S.isBlank(val),
  "isPlainObject" : (val)=>_.isPlainObject(val),
  "isBoolean"     : (val)=>_.isBoolean(val),
  "isTrue"        : (val)=>(val === true),
  "isFalse"       : (val)=>(val === false),
  "isTruthy"      : (val)=>(val ? true  : false),
  "isFalsy"       : (val)=>(val ? false : true),
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
    // Dynamic name
    if(_.isFunction(name)) {
      name = name()
    }

    // Try get the func
    let fn = _.get(VALIDATORS, name)
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
      return v => !f2(v)
    }
    return f2
  },
  //-----------------------------------
  evalBy(str, context={}) {
    let not = false
    if(str.startsWith("!")) {
      not = true
      str = _.trim(str.substring(1))
    }
    let fv = Ti.Util.genInvoking(str, {
      context,
      funcSet: VALIDATORS,
      partialRight: true
    })
    if(!_.isFunction(fv)) {
      throw `Invalid TiValidator: "${str}"`
    }
    if(not) {
      return v => !fv(v)
    }
    return fv
  },
  //-----------------------------------
  getBy(fn) {
    if(_.isFunction(fn)) {
      return fn
    }
    if(_.isString(fn)) {
      return TiValidate.evalBy(fn)
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
    // Array mean or
    if(_.isArray(validates)) {
      for(let vali of validates) {
        if(Ti.Validate.match(obj, vali, allowEmpty)) {
          return true
        }
      }
      return false
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
export const Validate = TiValidate;
