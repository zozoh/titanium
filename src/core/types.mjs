const P_DATE = new RegExp(
  "^((\\d{4})([/\\\\-])?(\\d{1,2})?([/\\\\-])?(\\d{1,2})?)?"
  + "(([ T])?"
  + "(\\d{1,2})(:)(\\d{1,2})((:)(\\d{1,2}))?"
  + "(([.])"
  + "(\\d{1,3}))?)?"
  + "(([+-])(\\d{1,2})(:\\d{1,2})?)?"
  + "$"
)
function parseDate(d) {
  //console.log("parseDate:", d)
  // Default return today
  if(_.isUndefined(d)){
    return new Date()
  }
  // keep null
  if(!d) {
    return null
  }
  // Date
  if(_.isDate(d)){
    return new Date(d)
  }
  // Number as AMS
  if(_.isNumber()) {
    return new Date(d)
  }
  // String 
  if(_.isString(d)) {
    let str = d
    // Try to tidy string 
    let m = P_DATE.exec(d)
    if(m) {
      let _int = (m, index, dft)=>{
        let s = m[index]
        if(s) {
          return parseInt(s)
        }
        return dft
      }
      let today = new Date()
      let yy = _int(m, 2, today.getFullYear());
      let MM = _int(m, 4, m[2] ? 1 : today.getMonth()+1);
      let dd = _int(m, 6, m[2] ? 1 : today.getDate());
      let HH = _int(m, 9, 0);
      let mm = _int(m, 11, 0);
      let ss = _int(m, 14, 0);
      let ms = _int(m, 17, 0);
      let list = [
        _.padStart(yy, 4, "0"),
        "-",
        _.padStart(MM, 2, "0"),
        "-",
        _.padStart(dd, 2, "0"),
        "T",
        _.padStart(HH, 2, "0"),
        ":",
        _.padStart(mm, 2, "0"),
        ":",
        _.padStart(ss, 2, "0"),
        ".",
        _.padStart(ms, 3, "0")
      ]
      if(m[18])
        list.push(m[18])
      let dateStr = list.join("")
      return new Date(dateStr)
    }
  }
  // Invalid date
  throw 'i18n:invalid-date'
}
//-----------------------------------------
const BUILTIN_TYPES = {
  'String'   : {transformer:"toStr",     serializer:"toStr"},
  'Number'   : {transformer:"toNumber",  serializer:"toNumber"},
  'Integer'  : {transformer:"toInteger", serializer:"toInteger"},
  'Boolean'  : {transformer:"toBoolean", serializer:"toBoolean"},
  'Object'   : {transformer:"toObject",  serializer:"toObject"},
  'Array'    : {transformer:"toArray",   serializer:"toArray"},
  'DateTime' : {transformer:"toDate",    serializer:"formatDate"},
  'AMS'      : {transformer:"toDate",    serializer:"toAMS"}
}
//-----------------------------------
export const TiTypes = {
  toStr(val) {
    if(_.isNull(val) || _.isUndefined(val) || _.isString(val)){
      return val
    }
    if(_.isNumber(val)){
      return ""+val
    }
    if(_.isArray(val)) {
      return val.join(",")
    }
    if(_.isDate(val)){
      return TiTypes.formatDate(val)
    }
    if(_.isPlainObject(val)){
      return JSON.stringify(val) 
    }
    return ""+val
  },
  //.......................................
  toNumber(val) {
    if(_.isDate(val)){
      return val.getTime()
    }
    let n = 1 * val
    if(isNaN(n)){
      // console.log("invalid number")
      // throw 'i18n:invalid-number'
      return NaN
    }
    return n
  },
  //.......................................
  toInteger(val) {
    if(_.isDate(val)){
      return val.getTime()
    }
    let n = parseInt(val)
    if(isNaN(n)){
      //throw 'i18n:invalid-integer'
      return NaN
    }
    return n
  },
  //.......................................
  toPercent(val, {fixed=2, auto=true}={}){
    return Ti.S.toPercent(val, {fixed, auto})
  },
  //.......................................
  toBoolean(val) {
    if(false ==  val)
      return false
    if(_.isNull(val) || _.isUndefined(val)) 
      return false
    if(/^(no|off|false)$/i.test(val))
      return false

    return true
  },
  //.......................................
  toObject(val) {
    if(_.isString(val)){
      if(/^\{.*\}$/.test(val)) {
        return JSON.parse(val)
      }
    }
    return val
  },
  //.......................................
  toArray(val, {sep=/[ ,;\/、，；]/}={}) {
    if(_.isArray(val)) {
      return val
    }
    if(_.isString(val)) {
      let ss = val.split(sep)
      for(let i=0; i<ss.length; i++){
        ss[i] = _.trim(ss[i])
      }
      return _.without(ss, undefined, null, "")
    }
  },
  //.......................................
  toDate(val) {
    return parseDate(val)
  },
  //.......................................
  toAMS(val) {
    return parseDate(val).getTime()
  },
  //.......................................
  formatDate(date, fmt="yyyy-MM-dd'T'HH:mm:ss.SSS") {
    //console.log("formatDate", date, fmt)
    if(!_.isDate(date)) {
      date = parseDate(date)
    }
    if(!date)
      return null
    let yyyy = date.getFullYear()
    let M = date.getMonth() + 1
    let d = date.getDate()
    let H = date.getHours()
    let m = date.getMinutes()
    let s = date.getSeconds()
    let S = date.getMilliseconds()
    let _c = {
      yyyy, M, d, H, m, s, S,
      yyy : yyyy,
      yy  : (""+yyyy).substring(2,4),
      MM  : _.padStart(M, 2, '0'),
      dd  : _.padStart(d, 2, '0'),
      HH  : _.padStart(H, 2, '0'),
      mm  : _.padStart(m, 2, '0'),
      ss  : _.padStart(s, 2, '0'),
      SS  : _.padStart(S, 3, '0'),
      SSS : _.padStart(S, 3, '0'),
    }
    let regex = /(y{2,4}|M{1,2}|d{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|'([^']+)')/g;
    let ma;
    let list = []
    let last = 0
    while(ma=regex.exec(fmt)) {
      if(last < ma.index) {
        list.push(fmt.substring(last, ma.index))
      }
      let it = ma[2] || _c[ma[1]] || ma[1]
      list.push(it)
      last = regex.lastIndex
    }
    if(last < fmt.length) {
      list.push(fmt.substring(last))
    }
    return list.join("")
  },
  //.......................................
  $FNAME(type, fnType) {
    return _.get(BUILTIN_TYPES, [type, fnType])
  },
  //.......................................
  $FN(type, fnType) {
    // let fn = _.get(config, [`${fnType}s`, fnName])
    // return fn || TiTypes[fnName]
    let fnName = TiTypes.$FNAME(type, fnType)
    return TiTypes[fnName]
  }
}
//---------------------------------------
export default TiTypes

