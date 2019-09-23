/////////////////////////////////////
const P_DATE = new RegExp(
  "^((\\d{4})([/\\\\-])?(\\d{1,2})?([/\\\\-])?(\\d{1,2})?)?"
  + "(([ T])?"
  + "(\\d{1,2})(:)(\\d{1,2})((:)(\\d{1,2}))?"
  + "(([.])"
  + "(\\d{1,3}))?)?"
  + "(([+-])(\\d{1,2})(:\\d{1,2})?)?"
  + "$"
)
//-----------------------------------
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
  if(_.isNumber(d)) {
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
//-----------------------------------
function parseTime(input, dft) {
  if(_.isNull(input) || _.isUndefined(input)) {
    return null;
  }
  // 接受日期对象
  if(_.isDate(input)) {
    var str = input.format('HH:MM:ss');
    input = str;
  }
  // 准备对齐方法
  var _pad = function (v, width) {
    width = width || 2;
    if (3 == width) {
      return v > 99 ? v : (v > 9 ? "0" + v : "00" + v);
    }
    return v > 9 ? v : "0" + v;
  };
  input = (typeof input) == "number" ? input : input || dft;
  var inType = (typeof input);
  var ms = 0;
  var ti = {};
  // 字符串
  if ("string" == inType) {
    var m = /^([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2})([.,]([0-9]{1,3}))?)?$/
        .exec(input);
    if (!m) {
      throw "Not a Time: '" + input + "'!!";
    }
    // 仅仅到分钟
    if (!m[3]) {
      ti.hour = parseInt(m[1]);
      ti.minute = parseInt(m[2]);
      ti.second = 0;
      ti.millisecond = 0;
    }
    // 到秒
    else if (!m[5]) {
      ti.hour = parseInt(m[1]);
      ti.minute = parseInt(m[2]);
      ti.second = parseInt(m[4]);
      ti.millisecond = 0;
    }
    // 到毫秒
    else {
      ti.hour = parseInt(m[1]);
      ti.minute = parseInt(m[2]);
      ti.second = parseInt(m[4]);
      ti.millisecond = parseInt(m[6]);
    }
  }
  // 数字
  else if ("number" == inType) {
    var sec;
    if ("ms" == dft) {
      sec = parseInt(input / 1000);
      ms = Math.round(input - sec * 1000);
    } else {
      sec = parseInt(input);
      ms = Math.round(input * 1000 - sec * 1000);
    }
    ti.hour = Math.min(23, parseInt(sec / 3600));
    ti.minute = Math.min(59, parseInt((sec - ti.hour * 3600) / 60));
    ti.second = Math.min(59, sec - ti.hour * 3600 - ti.minute * 60);
    ti.millisecond = ms;
  }
  // 其他
  else {
    throw "Not a Time: " + input;
  }
  // 计算其他的值
  ti.value = ti.hour * 3600 + ti.minute * 60 + ti.second;
  ti.valueInMillisecond = ti.value * 1000 + ti.millisecond;
  // 增加一个函数
  ti.toString = function (fmt) {
    // 默认的格式化方式
    if (!fmt) {
      fmt = "HH:mm";
      // 到毫秒
      if (0 != this.millisecond) {
        fmt += ":ss.SSS";
      }
      // 到秒
      else if (0 != this.second) {
        fmt += ":ss";
      }
    }
    // 自动格式化
    else if ("min" == fmt) {
      // 精确到分
      if (this.hour <= 0) {
        fmt = "mm:ss";
      }
      // 否则精确到小时
      else {
        fmt = "HH:mm:ss";
      }
    }

    // 进行格式化
    var sb = "";
    var reg = /a|[HhKkms]{1,2}|S(SS)?/g;
    var pos = 0;
    var m;
    while (m = reg.exec(fmt)) {
      //console.log(reg.lastIndex, m.index, m.input)
      var l = m.index;
      // 记录之前
      if (l > pos) {
        sb += fmt.substring(pos, l);
      }
      // 偏移
      pos = reg.lastIndex;

      // 替换
      var s = m[0];
      if ("a" == s) {
        sb += this.value > 43200 ? "PM" : "AM";
      }
      // H Hour in day (0-23)
      else if ("H" == s) {
        sb += this.hour;
      }
      // k Hour in day (1-24)
      else if ("k" == s) {
        sb += (this.hour + 1);
      }
      // K Hour in am/pm (0-11)
      else if ("K" == s) {
        sb += (this.hour % 12);
      }
      // h Hour in am/pm (1-12)
      else if ("h" == s) {
        sb += ((this.hour % 12) + 1);
      }
      // m Minute in hour
      else if ("m" == s) {
        sb += this.minute;
      }
      // s Second in minute
      else if ("s" == s) {
        sb += this.second;
      }
      // S Millisecond Number
      else if ("S" == s) {
        sb += this.millisecond;
      }
      // HH 补零的小时(0-23)
      else if ("HH" == s) {
        sb += _pad(this.hour);
      }
      // kk 补零的小时(1-24)
      else if ("kk" == s) {
        sb += _pad(this.hour + 1);
      }
      // KK 补零的半天小时(0-11)
      else if ("KK" == s) {
        sb += _pad(this.hour % 12);
      }
      // hh 补零的半天小时(1-12)
      else if ("hh" == s) {
        sb += _pad((this.hour % 12) + 1);
      }
      // mm 补零的分钟
      else if ("mm" == s) {
        sb += _pad(this.minute);
      }
      // ss 补零的秒
      else if ("ss" == s) {
        sb += _pad(this.second);
      }
      // SSS 补零的毫秒
      else if ("SSS" == s) {
        sb += _pad(this.millisecond, 3);
      }
      // 不认识
      else {
          sb.append(s);
      }
    }
    // 结尾
    if (pos < fmt.length) {
      sb.append(fmt.substring(pos));
    }

    // 返回
    return sb.toString();
  };
  ti.valueOf = ti.toString;
  // 嗯，返回吧
  return ti;
}
/////////////////////////////////////
const TiTypes = {
  toStr(val, fmt, dft) {
    if(_.isNull(val) || _.isUndefined(val)){
      return Ti.Util.fallback(dft, null)
    }
    if(_.isString(val) || _.isNumber(val)){
      if(fmt) {
        return Ti.S.renderVars(val, fmt)
      }
      return val
    }
    if(_.isArray(val)) {
      return val.join(fmt || ",")
    }
    if(_.isBoolean(val)) {
      return (fmt || ["false", "true"])[val*1]
    }
    if(_.isDate(val)){
      return TiTypes.formatDate(val, fmt)
    }
    if(_.isPlainObject(val)){
      if(fmt) {
        if(_.isString(fmt)) {
          return Ti.S.renderVars(val, fmt)
        }
        if(_.isPlainObject(fmt)) {
          val = Ti.Util.mapping(val, fmt)
        }
      }
      return JSON.stringify(val, null, fmt) 
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
  toInteger(val, {mode="int", dft=NaN, range=[], border=[true,true]}={}) {
    if(_.isDate(val)){
      return val.getTime()
    }
    let n = ({
      round : v => Math.round(v),
      ceil  : v => Math.ceil(v),
      floor : v => Math.floor(v),
      int   : v => parseInt(v)
    })[mode](val)
    // Apply the default
    if(isNaN(n)){
      //throw 'i18n:invalid-integer'
      n = dft
    }
    // Apply Range
    if(_.isArray(range) && range.length==2) {
      // Eval the border
      if(!_.isArray(border)) {
        border = [border, border]
      }
      let [b_left, b_right] = border
      let [min_left, max_right] = range
      // Guard the NaN
      if(isNaN(n)) {
        return Math.round((min_left+max_right)/2)
      }
      // Left Range
      if(!_.isNull(min_left)) {
        if(b_left && n < min_left)
          return min_left
        if(!b_left && n <= min_left)
          return min_left + 1
      }
      // Right Range
      if(!_.isNull(max_right)) {
        if(b_right && n > max_right)
          return max_right
        if(!b_right && n >= max_right)
          return max_right - 1
      }
    }
    // Return Directly
    return n
  },
  //.......................................
  // precision: if less then 0, keep original
  toFloat(val, {precision=2, dft=NaN}={}) {
    let n = val * 1
    if(isNaN(n)){
      return dft
    }
    if(precision >= 0) {
      var y = Math.pow(10, precision);
      return Math.round(n * y) / y;
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
  toObject(val, fmt) {
    let obj = val
    if(_.isString(val)){
      if(/^\{.*\}$/.test(val)) {
        obj = JSON.parse(val)
      }
    }
    if(_.isPlainObject(fmt)) {
      obj = Ti.Util.mapping(obj, fmt)
    }
    return obj
  },
  //.......................................
  toObjByPair(pair={}, {keyBy="name", valueBy="value", dft={}}={}){
    let key = pair[keyBy]
    if(key) {
      return {[key] : pair[valueBy]}
    }
    return dft
  },
  //.......................................
  toArray(val, {sep=/[ ,;\/、，；\r\n]+/}={}) {
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
  toTime(val, dft) {
    return parseTime(val, dft)
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
    // Guard it
    if(!date)
      return null
    
    // TODO here add another param
    // to format the datetime to "in 5min" like string
    // Maybe the param should named as "shorthand"
    
    // Format by pattern
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
  toAjaxReturn(val, dftData) {
    //console.log("toAjaxReturn", val)
    let reo = val
    if(_.isString(val)) {
      try {
        reo = JSON.parse(val)
      }
      // Invalid JSON
      catch(E) {
        return {
          ok : false,
          errCode : "e.invalid.json_format",
          data : dftData
        }
      }
    }
    if(_.isBoolean(reo.ok)) {
      return reo
    }
    return  {
      ok : true,
      data : reo
    }
  },
  //.......................................
  getFuncByType(type="String", name="transformer") {
    return _.get({
      'String'   : {transformer:"toStr",     serializer:"toStr"},
      'Number'   : {transformer:"toNumber",  serializer:"toNumber"},
      'Integer'  : {transformer:"toInteger", serializer:"toInteger"},
      'Float'    : {transformer:"toFloat",   serializer:"toFloat"},
      'Boolean'  : {transformer:"toBoolean", serializer:"toBoolean"},
      'Object'   : {transformer:"toObject",  serializer:"toObject"},
      'Array'    : {transformer:"toArray",   serializer:"toArray"},
      'DateTime' : {transformer:"toDate",    serializer:"formatDate"},
      'AMS'      : {transformer:"toDate",    serializer:"toAMS"},
      // Time
      // Date
      // Color
      // PhoneNumber
      // Address
      // Currency
      // ...
    }, `${type}.${name}`)
  },
  //.......................................
  getFuncBy(fld={}, name, fnSet=TiTypes) {
    //..................................
    // Eval the function
    let fn = TiTypes.evalFunc(fld[name], fnSet)
    //..................................
    // Function already
    if(_.isFunction(fn))
      return fn
    
    //..................................
    // If noexits, eval the function by `fld.type`
    if(!fn && fld.type) {
      fn = TiTypes.getFuncByType(fld.type, name)
    }

    //..................................
    // Is string
    if(_.isString(fn)) {
      return _.get(fnSet, fn)
    }
    //..................................
    // Plain Object 
    if(_.isPlainObject(fn) && fn.name) {
      //console.log(fnType, fnName)
      let fn2 = _.get(fnSet, fn.name)
      // Invalid fn.name, ignore it
      if(!_.isFunction(fn2))
        return
      // Partical args ...
      if(_.isArray(fn.args) && fn.args.length > 0) {
        return _.partialRight(fn2, ...fn.args)
      }
      // Partical one arg
      if(!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
        return _.partialRight(fn2, fn.args)
      }
      // Just return
      return fn2
    }
  },
  //.......................................
  getFunc(fld={}, name) {
    return TiTypes.getFuncBy(fld, name)
  },
  //.......................................
  evalFunc(fn, fnSet=TiTypes) {
    //..................................
    // Function already
    if(_.isFunction(fn))
      return fn

    //..................................
    // Is string
    if(_.isString(fn)) {
      return _.get(fnSet, fn)
    }
    //..................................
    // Plain Object 
    if(_.isPlainObject(fn) && fn.name) {
      //console.log(fnType, fnName)
      let fn2 = _.get(fnSet, fn.name)
      // Invalid fn.name, ignore it
      if(!_.isFunction(fn2))
        return
      // Partical args ...
      if(_.isArray(fn.args) && fn.args.length > 0) {
        return _.partialRight(fn2, ...fn.args)
      }
      // Partical one arg
      if(!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
        return _.partialRight(fn2, fn.args)
      }
      // Just return
      return fn2
    }
  },
  //.......................................
  getJsType(val, dftType="Object") {
    if(_.isUndefined(val)) {
      return dftType
    }
    if(_.isNull(val)) {
      return "Object"
    }
    if(_.isNaN(val)) {
      return "Number"
    }
    if(_.isNumber(val)) {
      if(parseInt(val) == val) {
        return "Integer"
      }
      return "Number"
    }
    if(_.isBoolean(val)) {
      return "Boolean"
    }
    if(_.isString(val)) {
      return "String"
    }
    if(_.isArray(val)) {
      return "Array"
    }
    // Default is Object
    return "Object"
  }
  //.......................................
}
//---------------------------------------
export default TiTypes

