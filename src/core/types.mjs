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
/////////////////////////////////////
// Time Object
export class TiTime {
  //--------------------------------
  constructor(input, unit) {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.milliseconds = 0;
    this.__cached = {};
    this.update(input, unit)
  }
  //--------------------------------
  clone() {
    return new TiTime(this)
  }
  //--------------------------------
  // If move attr into constructor, TBS will be supported
  // But the setter will be invoked infinitely 
  // set hours(hours=0) {
  //   this.__cached = {}
  //   this.hours = _.clamp(hours, 0, 23)
  // }
  // set minutes(minutes=0) {
  //   this.__cached = {}
  //   this.minutes = _.clamp(minutes, 0, 59)
  // }
  // set seconds(seconds=0) {
  //   this.__cached = {}
  //   this.seconds = _.clamp(seconds, 0, 59)
  // }
  // set milliseconds(ms=1) {
  //   this.__cached = {}
  //   this.milliseconds = _.clamp(ms, 0, 999)
  // }
  //--------------------------------
  setTimes({hours, minutes, seconds, milliseconds}={}) {
    this.__cached = {}
    this.hours = _.clamp(
      Ti.Util.fallback(hours, this.hours),
      0, 23)
    this.minutes = _.clamp(
      Ti.Util.fallback(minutes, this.minutes),
      0,59)
    this.seconds = _.clamp(
      Ti.Util.fallback(seconds, this.seconds),
      0,59)
    this.milliseconds = _.clamp(
      Ti.Util.fallback(milliseconds, this.milliseconds),
      0,999)
  }
  //--------------------------------
  update(input, unit="ms") {
    this.__cached = {}
    // Date
    if(_.isDate(input)) {
      this.hours = input.getHours()
      this.minutes = input.getMinutes()
      this.seconds = input.getSeconds()
      this.milliseconds = input.getMilliseconds()
    }
    // Time
    else if(input instanceof TiTime) {
      this.hours = input.hours
      this.minutes = input.minutes
      this.seconds = input.seconds
      this.milliseconds = input.milliseconds
    }
    // Number as Seconds
    else if(_.isNumber(input)) {
      let ms = ({
        "ms"  : (v)=>v,
        "s"   : (v)=>Math.round(v*1000),
        "min" : (v)=>Math.round(v*1000*60),
        "hr"  : (v)=>Math.round(v*1000*60*60)
      })[unit](input)
      ms = _.clamp(ms, 0, 86400000)
      let sec = parseInt(ms/1000)
      this.milliseconds = ms - sec*1000
      this.hours = parseInt(sec / 3600)

      sec -= this.hours * 3600
      this.minutes = parseInt(sec / 60)
      this.seconds = sec - this.minutes * 60
    }
    // String
    else if(_.isString(input)) {
      let m = /^([0-9]{1,2}):?([0-9]{1,2})(:?([0-9]{1,2})([.,]([0-9]{1,3}))?)?$/
                    .exec(input);
      if(m) {
        // Min: 23:59
        if (!m[3]) {
          this.hours   = _.clamp(parseInt(m[1]),0,23);
          this.minutes = _.clamp(parseInt(m[2]),0,59);
          this.seconds = 0;
          this.milliseconds = 0;
        }
        // Sec: 23:59:59
        else if (!m[5]) {
          this.hours   = _.clamp(parseInt(m[1]),0,23);
          this.minutes = _.clamp(parseInt(m[2]),0,59);
          this.seconds = _.clamp(parseInt(m[4]),0,59);
          this.milliseconds = 0;
        }
        // Ms: 23:59:59.234
        else {
          this.hours   = _.clamp(parseInt(m[1]),0,23);
          this.minutes = _.clamp(parseInt(m[2]),0,59);
          this.seconds = _.clamp(parseInt(m[4]),0,59);
          this.milliseconds = _.clamp(parseInt(m[6]),0,999);
        }
      } // if(m)
    } // _.isString(input)
    
    return this
    
  } // update(input, unit="ms")
  //--------------------------------
  get value() {
    if(!_.isNumber(this.__cached.value)) {
      let val = this.hours*3600 
                + this.minutes*60 
                + this.seconds
                + Math.round(this.milliseconds/1000)
      this.__cached.value = val
    }
    return this.__cached.value
  }
  //--------------------------------
  get valueInMilliseconds() {
    if(!_.isNumber(this.__cached.valueInMilliseconds)) {
      let val = this.hours*3600000
                + this.minutes*60000
                + this.seconds*1000
                + this.milliseconds
      this.__cached.valueInMilliseconds = val
    }
    return this.__cached.valueInMilliseconds
  }
  //--------------------------------
  toString(fmt="auto") {
    // Auto 
    if("auto" == fmt) {
      fmt = this.milliseconds>0 ? "HH:mm:ss.SSS"
              : (this.seconds>0 ? "HH:mm:ss" : "HH:mm")
    }
    // To Min
    else if("min" == fmt) {
      fmt = this.hours <=0 ? "mm:ss" : "HH:mm:ss"
    }
    // Formatting
    let sb  = "";
    let ptn = /a|HH?|KK?|hh?|kk?|mm?|ss?|S(SS)?/g;
    let pos = 0;
    let m;
    while (m = ptn.exec(fmt)) {
      let l = m.index
      // Join the prev part
      if(l > pos) {
        sb += fmt.substring(pos, l);
      }
      pos = ptn.lastIndex

      // Replace
      let s = m[0]
      sb += ({
        "a" : ()=>this.value>43200
                    ? "PM" : "AM",     // am|pm
        "H" : ()=>this.hours,          // Hour in day (0-23)
        "k" : ()=>this.hours + 1,      // Hour in day (1-24)
        "K" : ()=>this.hours % 12,     // Hour in am/pm (0-11)
        "h" : ()=>(this.hours%12)+1,   // Hour in am/pm (1-12)
        "m" : ()=>this.minutes,        // Minute in hour
        "s" : ()=>this.seconds,        // Second in minute
        "S" : ()=>this.milliseconds,   // Millisecond Number
        "HH"  : ()=>_.padStart(this.hours,        2, '0'),
        "kk"  : ()=>_.padStart(this.hours + 1,    2, '0'),
        "KK"  : ()=>_.padStart(this.hours % 12,   2, '0'),
        "hh"  : ()=>_.padStart((this.hours%12)+1, 2, '0'),
        "mm"  : ()=>_.padStart(this.minutes,      2, '0'),
        "ss"  : ()=>_.padStart(this.seconds,      2, '0'),
        "SSS" : ()=>_.padStart(this.milliseconds, 3, '0')
      })[s]()
    } // while (m = reg.exec(fmt))
    // Ending
    if (pos < fmt.length) {
      sb += fmt.substring(pos);
    }
    // Done
    return sb
  }
  //--------------------------------
}
/////////////////////////////////////
// Color Object
const QUICK_COLOR_TABLE = {
  "red"    : [255,0,0,1],
  "green"  : [0,255,0,1],
  "blue"   : [0,0,255,1],
  "yellow" : [255,255,0,1],
  "black"  : [0,0,0,1],
  "white"  : [255,255,255,1]
}
//----------------------------------
export class TiColor {
  // Default color is Black
  constructor(input) {
    this.red   = 0;
    this.green = 0;
    this.blue  = 0;
    this.alpha = 1;
    this.__cached = {};
    this.update(input)
  }
  clone() {
    return new TiColor([this.red, this.green, this.blue, this.alpha])
  }
  // If move attr into constructor, TBS will be supported
  // But the setter will be invoked infinitely 
  // set red(r=0) {
  //   this.__cached - {}
  //   this.red = _.clamp(r, 0, 255)
  // }
  // set green(g=0) {
  //   this.__cached - {}
  //   this.green = _.clamp(g, 0, 255)
  // }
  // set blue(b=0) {
  //   this.__cached - {}
  //   this.blue = _.clamp(b, 0, 255)
  // }
  // set alpha(a=1) {
  //   this.__cached = {}
  //   this.alpha = a
  // }
  setRGBA({r,g,b,a}={}) {
    this.__cached = {}
    if(_.isNumber(r)) {
      this.red = _.clamp(r, 0, 255)
    }
    if(_.isNumber(g)) {
      this.green = _.clamp(g, 0, 255)
    }
    if(_.isNumber(b)) {
      this.blue = _.clamp(b, 0, 255)
    }
    if(_.isNumber(a)) {
      this.alpha = _.clamp(a, 0, 1)
    }
  }
  /***
   * UPdate color by input
   * 
   * @param input{String|Number|Object} - input color:
   * - `String Expression`
   * - `Color`
   * - `Integer` : Gray
   * - `Quick Name` : See the quick name table
   * 
   * 
   */ 
  update(input) {
    this.__cached = {}
    // String
    if(_.isString(input)) {
      // Quick Table?
      let qct = QUICK_COLOR_TABLE[input.toLowerCase()]
      if(qct) {
        this.red   = qct[0]
        this.green = qct[1]
        this.blue  = qct[2]
        this.alpha = qct[3]
      }
      // Explain
      else {
        let str = input.replace(/[ \t\r\n]+/g, "").toUpperCase();
        let m
        // HEX: #FFF
        if(m=/^#?([0-9A-F])([0-9A-F])([0-9A-F]);?$/.exec(str)) {
          this.red   = parseInt(m[1] + m[1], 16);
          this.green = parseInt(m[2] + m[2], 16);
          this.blue  = parseInt(m[3] + m[3], 16);
        }
        // HEX2: #F0F0F0
        else if(m=/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(str)) {
          this.red   = parseInt(m[1], 16);
          this.green = parseInt(m[2], 16);
          this.blue  = parseInt(m[3], 16);
        }
        // RGB: rgb(255,33,89)
        else if(m=/^RGB\((\d+),(\d+),(\d+)\)$/.exec(str)) {
          this.red   = parseInt(m[1], 10);
          this.green = parseInt(m[2], 10);
          this.blue  = parseInt(m[3], 10);
        }
        // RGBA: rgba(6,6,6,0.9)
        else if(m=/^RGBA\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(str)) {
          this.red   = parseInt(m[1], 10);
          this.green = parseInt(m[2], 10);
          this.blue  = parseInt(m[3], 10);
          this.alpha = m[4] * 1;
        }
        // AARRGGBB : 0xFF000000
        else if(m=/^0[xX]([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(str)){
          this.alpha = parseInt(m[1], 16) / 255;
          this.red = parseInt(m[2], 16);
          this.green = parseInt(m[3], 16);
          this.blue = parseInt(m[4], 16);
        }
      }
    }
    // Number 
    else if(_.isNumber(input)) {
      // Must in 0-255
      let gray = _.clamp(Math.round(input), 0, 255)
      this.red   = gray
      this.green = gray
      this.blue  = gray
      this.alpha = 1
    }
    // Array [R,G,B,A?]
    else if(_.isArray(input) && input.length>=3) {
      this.red   = _.clamp(Math.round(input[0]), 0, 255)
      this.green = _.clamp(Math.round(input[1]), 0, 255)
      this.blue  = _.clamp(Math.round(input[2]), 0, 255)
      this.alpha = input.length>3?input[3]:1
    }
    // Color
    else if(input instanceof TiColor) {
      this.red   = input.red
      this.green = input.green
      this.blue  = input.blue
      this.alpha = input.alpha
    }
    // Invalid input, ignore it
    return this
  }
  /***
   * To `#FF0088`
   */
  get hex() {
    if(!this.__cached.hex) {
      let hex = ["#"]
      hex.push(_.padStart(this.red.toString(16).toUpperCase(),2,'0'))
      hex.push(_.padStart(this.green.toString(16).toUpperCase(),2,'0'))
      hex.push(_.padStart(this.blue.toString(16).toUpperCase(),2,'0'))
      this.__cached.hex = hex.join("")
    }
    return this.__cached.hex
  }
  /***
   * To `RGB(0,0,0)
   */
  get rgb() {
    if(!this.__cached.rgb) {
      let rgb = [this.red, this.green,this.blue]
      this.__cached.rgb = `RGB(${rgb.join(",")})`
    }
    return this.__cached.rgb
  }
  /***
   * To `RGBA(0,0,0,1)
   */
  get rgba() {
    if(!this.__cached.rgba) {
      let rgba = [this.red, this.green, this.blue, this.alpha]
      return `RGBA(${rgba.join(",")})`
    }
    return this.__cached.rgba
  }
  /***
   * Make color lightly
   * 
   * @param degree{Number} - 0-255
   */ 
  light(degree=10) {
    this.red   = _.clamp(this.red   + degree, 0, 255)
    this.green = _.clamp(this.green + degree, 0, 255)
    this.blue  = _.clamp(this.blue  + degree, 0, 255)
  }
  /***
   * Make color lightly
   * 
   * @param degree{Number} - 0-255
   */ 
  dark(degree=10) {
    this.red   = _.clamp(this.red   - degree, 0, 255)
    this.green = _.clamp(this.green - degree, 0, 255)
    this.blue  = _.clamp(this.blue  - degree, 0, 255)
  }
  /***
   * Create a new Color Object which between self and given color
   * 
   * @param otherColor{TiColor} - Given color
   * @param pos{Number} - position (0-1)
   * 
   * @return new TiColor
   */
  between(otherColor, pos=0.5, {

  }={}) {
    pos = _.clamp(pos, 0, 1)
    let r0 = otherColor.red   - this.red
    let g0 = otherColor.green - this.green
    let b0 = otherColor.blue  - this.blue
    let a0 = otherColor.alpha - this.alpha

    let r = this.red   + r0 * pos
    let g = this.green + g0 * pos
    let b = this.blue  + b0 * pos
    let a = this.alpha + a0 * pos
    return new TiColor([
      _.clamp(Math.round(r), 0, 255),
      _.clamp(Math.round(g), 0, 255),
      _.clamp(Math.round(b), 0, 255),
      _.clamp(a, 0, 1),
    ])
  }
  adjustByHSL({h=0, s=0, l=0}={}) {
    let hsl = this.toHSL()
    hsl.h = _.clamp(hsl.h + h, 0, 1)
    hsl.s = _.clamp(hsl.s + s, 0, 1)
    hsl.l = _.clamp(hsl.l + l, 0, 1)
    return this.fromHSL(hsl)
  }
  toHSL() {
		let r = this.red,
    g = this.green,
    b = this.blue;

    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b),
        min = Math.min(r, g, b),
    h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {h, s, l};
  }
  fromHSL({h, s, l}={}) {
    let r, g, b,

    hue2rgb = function (p, q, t){
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1/6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1/2) {
        return q;
      }
      if (t < 2/3) {
        return p + (q - p) * (2/3 - t) * 6;
      }
      return p;
    };

    if (s === 0) {
     r = g = b = l; // achromatic
    } else {
      let
        q = l < 0.5 ? l * (1 + s) : l + s - l * s,
        p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    this.red   = Math.round(r * 0xFF)
    this.green = Math.round(g * 0xFF)
    this.blue  = Math.round(b * 0xFF)

    return this
  }
  /***
   * String 
   */
  toString() {
    if(this.alpha == 1) {
      return this.hex
    }
    return this.rgba
  }
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
    if(val instanceof TiTime) {
      return val.toString(fmt)
    }
    if(val instanceof TiColor) {
      return val.toString()
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
      let y = Math.pow(10, precision);
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
  toDate(val, dft=new Date()) {
    if(_.isNull(val) || _.isUndefined(val)) {
      return dft
    }
    return parseDate(val)
  },
  //.......................................
  toTime(val, {dft,unit}={}) {
    if(_.isNull(val) || _.isUndefined(val)) {
      return dft
    }
    return new TiTime(val, unit)
  },
  //.......................................
  toColor(val, dft=new TiColor()) {
    if(_.isNull(val) || _.isUndefined(val)) {
      return dft
    }
    if(val instanceof TiColor) {
      return val
    }
    return new TiColor(val)
  },
  //.......................................
  toAMS(val) {
    return parseDate(val).getTime()
  },
  //.......................................
  formatTime(time, fmt="auto") {
    if(_.isUndefined(time) || _.isNull(time)) {
      return ""
    }
    if(!(time instanceof TiTime)) {
      time = new TiTime(time)
    }
    return time.toString(fmt)
  },
  //.......................................
  formatDate(date, fmt="yyyy-MM-dd") {
    return TiTypes.formatDateTime(date, fmt)
  },
  //.......................................
  formatDateTime(date, fmt="yyyy-MM-dd'T'HH:mm:ss.SSS") {
    // Date Range or a group of date
    if(_.isArray(date)) {
      //console.log("formatDate", date, fmt)
      let list = []
      for(let d of date) {
        list.push(TiTypes.formatDate(d, fmt))
      }
      return list
    }

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
  Time  : TiTime,
  Color : TiColor,
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
      'DateTime' : {transformer:"toDate",    serializer:"formatDateTime"},
      'AMS'      : {transformer:"toDate",    serializer:"toAMS"},
      'Time'     : {transformer:"toTime",    serializer:"formatTime"},
      'Date'     : {transformer:"toDate",    serializer:"formatDate"},
      'Color'    : {transformer:"toColor",   serializer:"toStr"},
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

