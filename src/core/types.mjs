///////////////////////////////////////////
// Time Object
export class TiMsRange {
  //--------------------------------
  // (1638861356185,1641798956185]
  // @return {left:{val:163.., open:true}, right:{val:163...,open:false}}
  // (1638861356185,]
  // @return {left:{val:163.., open:true}, right:{val:NaN,open:false}}
  constructor(input) {
    let vals;
    // Another msRange
    if (input instanceof TiMsRange) {
      if (input.invalid) {
        this.invalid = input.invalid;
      }
      if (input.left) {
        this.left = _.assign({}, input.left);
      }
      if (input.right) {
        this.right = _.assign({}, input.right);
      }
      return;
    }
    // String
    let m = [];
    if (_.isString(input)) {
      m = /^([(\[])([^\]]+)([)\]])$/.exec(input);
      let str = _.trim(m[2]);
      vals = str.split(/[,:;~]/g);
    }
    // Array
    else if (_.isArray(input)) {
      vals = input;
    }
    // Others not support
    else {
      vals = [];
      this.invalid = true;
    }
    let left = {
      val: _.trim(_.first(vals)),
      open: "(" == m[1]
    };
    let right = {
      val: vals.length > 1 ? _.trim(_.last(vals)) : NaN,
      open: ")" == m[3]
    };
    if (_.isString(left.val) && left.val) {
      left.val *= 1;
    } else {
      left.val = NaN;
    }
    if (_.isString(right.val) && right.val) {
      right.val *= 1;
    } else {
      right.val = NaN;
    }
    this.left = left;
    this.right = right;
  }
  //--------------------------------
  toString({
    format = (v) => v,
    separator = ",",
    leftOpen = "(",
    leftClose = "[",
    rightOpen = ")",
    rightClose = "]"
  } = {}) {
    if (this.invalid) {
      return "<!!!Invalid MsRange!!!>";
    }
    let ss = [];
    if (this.left) {
      ss.push(Ti.I18n.text(this.left.open ? leftOpen : leftClose));
      if (!isNaN(this.left.val)) {
        let v = format(this.left.val);
        ss.push(v);
      }
      if (this.right && separator) {
        ss.push(Ti.I18n.text(separator));
      }
    }
    if (this.right) {
      if (!isNaN(this.right.val)) {
        let v = format(this.right.val);
        ss.push(v);
      }
      ss.push(Ti.I18n.text(this.right.open ? rightOpen : rightClose));
    }
    return ss.join("");
  }
  //--------------------------------
  toDateString(
    fmt = "yyyy-MM-dd",
    separator = ",",
    leftOpen = "(",
    leftClose = "[",
    rightOpen = ")",
    rightClose = "]"
  ) {
    let dfmt = Ti.I18n.text(fmt);
    return this.toString({
      format: (v) => {
        return TiTypes.formatDate(v, dfmt);
      },
      separator,
      leftOpen,
      leftClose,
      rightOpen,
      rightClose
    });
  }
  //--------------------------------
  toDateTimeString(
    fmt = "yyyy-MM-dd HH:mm:ss",
    separator = ",",
    leftOpen = "(",
    leftClose = "[",
    rightOpen = ")",
    rightClose = "]"
  ) {
    let dfmt = Ti.I18n.text(fmt);
    return this.toString({
      format: (v) => {
        return TiTypes.formatDateTime(v, dfmt);
      },
      separator,
      leftOpen,
      leftClose,
      rightOpen,
      rightClose
    });
  }
  //--------------------------------
}
///////////////////////////////////////////
// Time Object
export class TiTime {
  //--------------------------------
  constructor(input, unit) {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.milliseconds = 0;
    this.__cached = {};
    this.update(input, unit);
  }
  //--------------------------------
  clone() {
    return new TiTime(this);
  }
  //--------------------------------
  // If move attr into constructor, TBS will be supported
  // But the setter will be invoked infinitely
  setHours(hours = 0) {
    this.__cached = {};
    this.hours = _.clamp(hours, 0, 23);
  }
  setMinutes(minutes = 0) {
    this.__cached = {};
    this.minutes = _.clamp(minutes, 0, 59);
  }
  setSeconds(seconds = 0) {
    this.__cached = {};
    this.seconds = _.clamp(seconds, 0, 59);
  }
  setMilliseconds(ms = 1) {
    this.__cached = {};
    this.milliseconds = _.clamp(ms, 0, 999);
  }
  //--------------------------------
  setTimes({ hours, minutes, seconds, milliseconds } = {}) {
    this.__cached = {};
    this.hours = _.clamp(Ti.Util.fallback(hours, this.hours), 0, 23);
    this.minutes = _.clamp(Ti.Util.fallback(minutes, this.minutes), 0, 59);
    this.seconds = _.clamp(Ti.Util.fallback(seconds, this.seconds), 0, 59);
    this.milliseconds = _.clamp(
      Ti.Util.fallback(milliseconds, this.milliseconds),
      0,
      999
    );
  }
  //--------------------------------
  update(input, unit = "ms") {
    this.__cached = {};
    // Date
    if (_.isDate(input)) {
      this.hours = input.getHours();
      this.minutes = input.getMinutes();
      this.seconds = input.getSeconds();
      this.milliseconds = input.getMilliseconds();
    }
    // Time
    else if (input instanceof TiTime) {
      this.hours = input.hours;
      this.minutes = input.minutes;
      this.seconds = input.seconds;
      this.milliseconds = input.milliseconds;
    }
    // Number as Seconds
    else if (_.isNumber(input)) {
      let ms = {
        "ms": (v) => Math.round(v),
        "s": (v) => Math.round(v * 1000),
        "min": (v) => Math.round(v * 1000 * 60),
        "hr": (v) => Math.round(v * 1000 * 60 * 60)
      }[unit](input);
      ms = _.clamp(ms, 0, 86400000);
      let sec = parseInt(ms / 1000);
      this.milliseconds = ms - sec * 1000;
      this.hours = parseInt(sec / 3600);

      sec -= this.hours * 3600;
      this.minutes = parseInt(sec / 60);
      this.seconds = sec - this.minutes * 60;
    }
    // String
    else if (_.isString(input)) {
      // ISO 8601 Time
      let m = /^PT((\d+)H)?((\d+)M)?((\d+)S)?$/.exec(input);
      if (m) {
        this.hours = m[2] ? m[2] * 1 : 0;
        this.minutes = m[4] ? m[4] * 1 : 0;
        this.seconds = m[6] ? m[6] * 1 : 0;
        this.milliseconds = 0;
        return this;
      }

      // Time string
      m =
        /^([0-9]{1,2}):?([0-9]{1,2})(:?([0-9]{1,2})([.,]([0-9]{1,3}))?)?$/.exec(
          input
        );
      if (m) {
        // Min: 23:59
        if (!m[3]) {
          this.hours = _.clamp(parseInt(m[1]), 0, 23);
          this.minutes = _.clamp(parseInt(m[2]), 0, 59);
          this.seconds = 0;
          this.milliseconds = 0;
        }
        // Sec: 23:59:59
        else if (!m[5]) {
          this.hours = _.clamp(parseInt(m[1]), 0, 23);
          this.minutes = _.clamp(parseInt(m[2]), 0, 59);
          this.seconds = _.clamp(parseInt(m[4]), 0, 59);
          this.milliseconds = 0;
        }
        // Ms: 23:59:59.234
        else {
          this.hours = _.clamp(parseInt(m[1]), 0, 23);
          this.minutes = _.clamp(parseInt(m[2]), 0, 59);
          this.seconds = _.clamp(parseInt(m[4]), 0, 59);
          this.milliseconds = _.clamp(parseInt(m[6]), 0, 999);
        }
      } // if(m)
    } // _.isString(input)

    return this;
  } // update(input, unit="ms")
  //--------------------------------
  get value() {
    if (!_.isNumber(this.__cached.value)) {
      let val =
        this.hours * 3600 +
        this.minutes * 60 +
        this.seconds +
        Math.round(this.milliseconds / 1000);
      this.__cached.value = val;
    }
    return this.__cached.value;
  }
  //--------------------------------
  get valueInMilliseconds() {
    if (!_.isNumber(this.__cached.valueInMilliseconds)) {
      let val =
        this.hours * 3600000 +
        this.minutes * 60000 +
        this.seconds * 1000 +
        this.milliseconds;
      this.__cached.valueInMilliseconds = val;
    }
    return this.__cached.valueInMilliseconds;
  }
  //--------------------------------
  toString(fmt = "auto") {
    // Auto
    if ("auto" == fmt) {
      fmt =
        this.milliseconds > 0
          ? "HH:mm:ss.SSS"
          : this.seconds > 0
          ? "HH:mm:ss"
          : "HH:mm";
    }
    // To Min
    else if ("min" == fmt) {
      fmt = this.hours <= 0 ? "mm:ss" : "HH:mm:ss";
    }
    // Formatting
    let sb = "";
    let ptn = /a|HH?|KK?|hh?|kk?|mm?|ss?|S(SS)?/g;
    let pos = 0;
    let m;
    while ((m = ptn.exec(fmt))) {
      let l = m.index;
      // Join the prev part
      if (l > pos) {
        sb += fmt.substring(pos, l);
      }
      pos = ptn.lastIndex;

      // Replace
      let s = m[0];
      sb += {
        "a": () => (this.value > 43200 ? "PM" : "AM"), // am|pm
        "H": () => this.hours, // Hour in day (0-23)
        "k": () => this.hours + 1, // Hour in day (1-24)
        "K": () => this.hours % 12, // Hour in am/pm (0-11)
        "h": () => (this.hours % 12) + 1, // Hour in am/pm (1-12)
        "m": () => this.minutes, // Minute in hour
        "s": () => this.seconds, // Second in minute
        "S": () => this.milliseconds, // Millisecond Number
        "HH": () => _.padStart(this.hours, 2, "0"),
        "kk": () => _.padStart(this.hours + 1, 2, "0"),
        "KK": () => _.padStart(this.hours % 12, 2, "0"),
        "hh": () => _.padStart((this.hours % 12) + 1, 2, "0"),
        "mm": () => _.padStart(this.minutes, 2, "0"),
        "ss": () => _.padStart(this.seconds, 2, "0"),
        "SSS": () => _.padStart(this.milliseconds, 3, "0")
      }[s]();
    } // while (m = reg.exec(fmt))
    // Ending
    if (pos < fmt.length) {
      sb += fmt.substring(pos);
    }
    // Done
    return sb;
  }
  //--------------------------------
}
/////////////////////////////////////
// Color Object
const QUICK_COLOR_TABLE = {
  "red": [255, 0, 0, 1],
  "green": [0, 255, 0, 1],
  "blue": [0, 0, 255, 1],
  "yellow": [255, 255, 0, 1],
  "black": [0, 0, 0, 1],
  "white": [255, 255, 255, 1]
};
//----------------------------------
export class TiColor {
  // Default color is Black
  constructor(input) {
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.alpha = 1;
    this.__cached = {};
    this.update(input);
  }
  clone() {
    return new TiColor([this.red, this.green, this.blue, this.alpha]);
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
  setRGBA({ r, g, b, a } = {}) {
    this.__cached = {};
    if (_.isNumber(r)) {
      this.red = _.clamp(r, 0, 255);
    }
    if (_.isNumber(g)) {
      this.green = _.clamp(g, 0, 255);
    }
    if (_.isNumber(b)) {
      this.blue = _.clamp(b, 0, 255);
    }
    if (_.isNumber(a)) {
      this.alpha = _.clamp(a, 0, 1);
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
    this.__cached = {};
    // String
    if (_.isString(input)) {
      // Quick Table?
      let qct = QUICK_COLOR_TABLE[input.toLowerCase()];
      if (qct) {
        this.red = qct[0];
        this.green = qct[1];
        this.blue = qct[2];
        this.alpha = qct[3];
      }
      // Explain
      else {
        let str = input.replace(/[ \t\r\n]+/g, "").toUpperCase();
        let m;
        // HEX: #FFF
        if ((m = /^#?([0-9A-F])([0-9A-F])([0-9A-F]);?$/.exec(str))) {
          this.red = parseInt(m[1] + m[1], 16);
          this.green = parseInt(m[2] + m[2], 16);
          this.blue = parseInt(m[3] + m[3], 16);
        }
        // HEX2: #F0F0F0
        else if (
          (m = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(str))
        ) {
          this.red = parseInt(m[1], 16);
          this.green = parseInt(m[2], 16);
          this.blue = parseInt(m[3], 16);
        }
        // RGB: rgb(255,33,89)
        else if ((m = /^RGB\((\d+),(\d+),(\d+)\)$/.exec(str))) {
          this.red = parseInt(m[1], 10);
          this.green = parseInt(m[2], 10);
          this.blue = parseInt(m[3], 10);
        }
        // RGBA: rgba(6,6,6,0.9)
        else if ((m = /^RGBA\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(str))) {
          this.red = parseInt(m[1], 10);
          this.green = parseInt(m[2], 10);
          this.blue = parseInt(m[3], 10);
          this.alpha = m[4] * 1;
        }
        // AARRGGBB : 0xFF000000
        else if (
          (m =
            /^0[xX]([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2});?$/.exec(
              str
            ))
        ) {
          this.alpha = parseInt(m[1], 16) / 255;
          this.red = parseInt(m[2], 16);
          this.green = parseInt(m[3], 16);
          this.blue = parseInt(m[4], 16);
        }
      }
    }
    // Number
    else if (_.isNumber(input)) {
      // Must in 0-255
      let gray = _.clamp(Math.round(input), 0, 255);
      this.red = gray;
      this.green = gray;
      this.blue = gray;
      this.alpha = 1;
    }
    // Array [R,G,B,A?]
    else if (_.isArray(input) && input.length >= 3) {
      this.red = _.clamp(Math.round(input[0]), 0, 255);
      this.green = _.clamp(Math.round(input[1]), 0, 255);
      this.blue = _.clamp(Math.round(input[2]), 0, 255);
      this.alpha = input.length > 3 ? input[3] : 1;
    }
    // Color
    else if (input instanceof TiColor) {
      this.red = input.red;
      this.green = input.green;
      this.blue = input.blue;
      this.alpha = input.alpha;
    }
    // Invalid input, ignore it
    return this;
  }
  /***
   * To `#FF0088`
   */
  get hex() {
    if (!this.__cached.hex) {
      let hex = ["#"];
      hex.push(_.padStart(this.red.toString(16).toUpperCase(), 2, "0"));
      hex.push(_.padStart(this.green.toString(16).toUpperCase(), 2, "0"));
      hex.push(_.padStart(this.blue.toString(16).toUpperCase(), 2, "0"));
      this.__cached.hex = hex.join("");
    }
    return this.__cached.hex;
  }
  /***
   * To `RGB(0,0,0)
   */
  get rgb() {
    if (!this.__cached.rgb) {
      let rgb = [this.red, this.green, this.blue];
      this.__cached.rgb = `RGB(${rgb.join(",")})`;
    }
    return this.__cached.rgb;
  }
  /***
   * To `RGBA(0,0,0,1)
   */
  get rgba() {
    if (!this.__cached.rgba) {
      let rgba = [this.red, this.green, this.blue, this.alpha];
      return `RGBA(${rgba.join(",")})`;
    }
    return this.__cached.rgba;
  }
  /***
   * Make color lightly
   *
   * @param degree{Number} - 0-255
   */
  light(degree = 10) {
    this.red = _.clamp(this.red + degree, 0, 255);
    this.green = _.clamp(this.green + degree, 0, 255);
    this.blue = _.clamp(this.blue + degree, 0, 255);
  }
  /***
   * Make color lightly
   *
   * @param degree{Number} - 0-255
   */
  dark(degree = 10) {
    this.red = _.clamp(this.red - degree, 0, 255);
    this.green = _.clamp(this.green - degree, 0, 255);
    this.blue = _.clamp(this.blue - degree, 0, 255);
  }
  /***
   * Create a new Color Object which between self and given color
   *
   * @param otherColor{TiColor} - Given color
   * @param pos{Number} - position (0-1)
   *
   * @return new TiColor
   */
  between(otherColor, pos = 0.5, {} = {}) {
    pos = _.clamp(pos, 0, 1);
    let r0 = otherColor.red - this.red;
    let g0 = otherColor.green - this.green;
    let b0 = otherColor.blue - this.blue;
    let a0 = otherColor.alpha - this.alpha;

    let r = this.red + r0 * pos;
    let g = this.green + g0 * pos;
    let b = this.blue + b0 * pos;
    let a = this.alpha + a0 * pos;
    return new TiColor([
      _.clamp(Math.round(r), 0, 255),
      _.clamp(Math.round(g), 0, 255),
      _.clamp(Math.round(b), 0, 255),
      _.clamp(a, 0, 1)
    ]);
  }
  updateByHSL({ h, s, l } = {}) {
    let hsl = this.toHSL();
    if (_.isNumber(h)) {
      hsl.h = _.clamp(h, 0, 1);
    }
    if (_.isNumber(s)) {
      hsl.s = _.clamp(s, 0, 1);
    }
    if (_.isNumber(l)) {
      hsl.l = _.clamp(l, 0, 1);
    }
    return this.fromHSL(hsl);
  }
  adjustByHSL({ h = 0, s = 0, l = 0 } = {}) {
    let hsl = this.toHSL();
    hsl.h = _.clamp(hsl.h + h, 0, 1);
    hsl.s = _.clamp(hsl.s + s, 0, 1);
    hsl.l = _.clamp(hsl.l + l, 0, 1);
    return this.fromHSL(hsl);
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
      h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h, s, l };
  }
  fromHSL({ h, s, l } = {}) {
    let r,
      g,
      b,
      hue2rgb = function (p, q, t) {
        if (t < 0) {
          t += 1;
        }
        if (t > 1) {
          t -= 1;
        }
        if (t < 1 / 6) {
          return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
          return q;
        }
        if (t < 2 / 3) {
          return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
      };

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s,
        p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    this.red = Math.round(r * 0xff);
    this.green = Math.round(g * 0xff);
    this.blue = Math.round(b * 0xff);

    return this;
  }
  /***
   * String
   */
  toString() {
    if (this.alpha == 1) {
      return this.hex;
    }
    return this.rgba;
  }
}
/////////////////////////////////////
const TiTypes = {
  toStr(val, fmt, dft) {
    // Dynamic function call
    if (_.isFunction(fmt)) {
      return fmt(val) || dft;
    }
    // Nil
    if (Ti.Util.isNil(val)) {
      return Ti.Util.fallback(dft, null);
    }
    // Number : translate by Array/Object or directly
    if (_.isNumber(val)) {
      if (_.isArray(fmt)) {
        return Ti.Util.fallback(_.nth(fmt, val), val);
      }
      if (_.isString(fmt)) {
        return Ti.S.renderVars(val, fmt);
      }
      let s = "" + val;
      if (_.isPlainObject(fmt)) {
        return fmt[s];
      }
      return s;
    }
    // String to translate
    if (_.isString(val)) {
      // Mapping
      if (_.isPlainObject(fmt)) {
        return Ti.Util.getOrPick(fmt, val);
      }
      // Render template val -> {val:val}
      else if (_.isString(fmt)) {
        return Ti.S.renderVars(val, fmt);
      }
      // TODO maybe here can do some auto-format for String/Number
      // Return directly
      return val;
    }
    // Array to concat
    if (_.isArray(val)) {
      return val.join(fmt || ",");
    }
    // Boolean to translate
    if (_.isBoolean(val)) {
      return (fmt || ["false", "true"])[val * 1];
    }
    // Date to human looking
    if (_.isDate(val)) {
      return TiTypes.formatDateTime(val, fmt);
    }
    // Time to human looking
    if (val instanceof TiTime) {
      return val.toString(fmt);
    }
    // Color to human looking
    if (val instanceof TiColor) {
      return val.toString();
    }
    // Object to render or translate or JSON
    if (_.isPlainObject(val)) {
      if (!Ti.S.isBlank(fmt)) {
        if (_.isString(fmt)) {
          return Ti.S.renderVars(val, fmt);
        }
        if (_.isPlainObject(fmt)) {
          val = Ti.Util.translate(val, fmt);
        }
      }
      return JSON.stringify(val, null, fmt);
    }
    // Directly translate
    return "" + val;
  },
  //.......................................
  toNumber(val) {
    if (_.isBoolean(val)) {
      return val ? 1 : 0;
    }
    if (_.isDate(val)) {
      return val.getTime();
    }
    if (Ti.S.isBlank(val)) {
      return NaN;
    }
    let n = 1 * val;
    if (isNaN(n)) {
      // console.log("invalid number")
      // throw 'i18n:invalid-number'
      return NaN;
    }
    return n;
  },
  //.......................................
  toInteger(
    val,
    { mode = "int", dft = NaN, range = [], border = [true, true] } = {}
  ) {
    if (_.isBoolean(val)) {
      return val ? 1 : 0;
    }
    if (_.isDate(val)) {
      return val.getTime();
    }
    let n = {
      round: (v) => Math.round(v),
      ceil: (v) => Math.ceil(v),
      floor: (v) => Math.floor(v),
      int: (v) => parseInt(v)
    }[mode](val);
    // Apply the default
    if (isNaN(n)) {
      //throw 'i18n:invalid-integer'
      n = dft;
    }
    // Apply Range
    if (_.isArray(range) && range.length == 2) {
      // Eval the border
      if (!_.isArray(border)) {
        border = [border, border];
      }
      let [b_left, b_right] = border;
      let [min_left, max_right] = range;
      // Guard the NaN
      if (isNaN(n)) {
        return Math.round((min_left + max_right) / 2);
      }
      // Left Range
      if (!_.isNull(min_left)) {
        if (b_left && n < min_left) return min_left;
        if (!b_left && n <= min_left) return min_left + 1;
      }
      // Right Range
      if (!_.isNull(max_right)) {
        if (b_right && n > max_right) return max_right;
        if (!b_right && n >= max_right) return max_right - 1;
      }
    }
    // Return Directly
    return n;
  },
  //.......................................
  // precision: if less then 0, keep original
  toFloat(val, { precision = 2, dft = NaN } = {}) {
    //console.log("toFloat", val, precision, dft)
    if (Ti.Util.isNil(val)) {
      return dft;
    }
    let n = val * 1;
    if (isNaN(n)) {
      return dft;
    }
    if (precision >= 0) {
      let y = Math.pow(10, precision);
      return Math.round(n * y) / y;
    }
    return n;
  },
  //.......................................
  toPercent(val, { fixed = 2, auto = true } = {}) {
    return Ti.S.toPercent(val, { fixed, auto });
  },
  //.......................................
  toBoolean(val) {
    if (false == val) return false;
    if (_.isNull(val) || _.isUndefined(val)) return false;
    if (/^(no|off|false)$/i.test(val)) return false;

    return true;
  },
  //.......................................
  toBoolStr(val, falsy = "No", trusy = "Yes") {
    console.log(val, falsy, trusy);
    return val ? trusy : falsy;
  },
  //.......................................
  toObject(val, fmt) {
    let obj = val;

    // Translate Object
    if (_.isPlainObject(val) && _.isPlainObject(fmt)) {
      return Ti.Util.translate(obj, fmt);
    }
    // Parse Array
    if (_.isArray(val)) {
      return Ti.S.toObject(val, fmt);
    }
    // For String
    if (_.isString(val)) {
      // Parse JSON
      if (/^\{.*\}$/.test(val) || /^\[.*\]$/.test(val)) {
        try {
          return JSON.parse(val);
        } catch (err) {
          return val;
        }
      }
      // Parse String
      return Ti.S.toObject(val, fmt);
    }

    return obj;
  },
  //.......................................
  toObjByPair(
    pair = {},
    { nameBy = "name", valueBy = "value", dft = {} } = {}
  ) {
    let name = pair[nameBy];
    // Guard
    if (!name) {
      return dft;
    }

    let data = _.assign({}, dft);
    let value = pair[valueBy];

    // It will remove from data
    let omitKeys = [];

    // Default the setter
    const _set_to_data = function (k, v) {
      // Remove
      if (_.isUndefined(v)) {
        omitKeys.push(k);
      }
      // .xxx
      else if (k.startsWith(".")) {
        data[k] = v;
      }
      // path.to.key
      else {
        _.set(data, k, v);
      }
    };

    // Normal field
    if (_.isString(name)) {
      // Whole data
      if (".." == name) {
        _.assign(data, value);
      }
      // Set by value
      else {
        _set_to_data(name, value);
      }
    }
    // Multi fields
    else if (_.isArray(name)) {
      for (let k of name) {
        let v = _.get(value, k);
        _set_to_data(k, v);
      }
    }

    // Omit keys
    if (omitKeys.length > 0) {
      data = _.omit(data, omitKeys);
    }

    return data;
  },
  //.......................................
  toArray(val, { sep = /[ ,;\/、，；\r\n]+/ } = {}) {
    if (Ti.Util.isNil(val)) {
      return val;
    }
    if (_.isArray(val)) {
      return val;
    }
    if (_.isString(val)) {
      if (_.isRegExp(sep)) {
        let ss = val.split(sep);
        for (let i = 0; i < ss.length; i++) {
          ss[i] = _.trim(ss[i]);
        }
        return _.without(ss, undefined, null, "");
      }
      return [val];
    }
    return [val];
  },
  //.......................................
  toDate(val, dft = null) {
    if (_.isNull(val) || _.isUndefined(val)) {
      return dft;
    }
    if (_.isArray(val)) {
      let re = [];
      _.forEach(val, (v) => {
        re.push(Ti.DateTime.parse(v));
      });
      return re;
    }
    return Ti.DateTime.parse(val);
  },
  //.......................................
  toDateSec(val, dft = null) {
    if (_.isNull(val) || _.isUndefined(val)) {
      return dft;
    }
    if (_.isArray(val)) {
      let re = [];
      _.forEach(val, (v) => {
        if (_.isNumber(v)) {
          v = v * 1000;
        }
        re.push(Ti.DateTime.parse(v));
      });
      return re;
    }
    if (_.isNumber(val)) {
      val = val * 1000;
    }
    return Ti.DateTime.parse(val);
  },
  //.......................................
  toTime(val, { dft, unit } = {}) {
    if (_.isNull(val) || _.isUndefined(val)) {
      return dft;
    }
    return new TiTime(val, unit);
  },
  //.......................................
  toMsRange(val) {
    if (_.isNull(val) || _.isUndefined(val)) {
      return null;
    }
    return new TiMsRange(val);
  },
  //.......................................
  toColor(val, dft = new TiColor()) {
    if (_.isNull(val) || _.isUndefined(val)) {
      return dft;
    }
    if (val instanceof TiColor) {
      return val;
    }
    return new TiColor(val);
  },
  //.......................................
  toAMS(val) {
    let dt = Ti.DateTime.parse(val);
    if (_.isDate(dt)) return dt.getTime();
    return null;
  },
  //.......................................
  toSec(val) {
    let dt = TiTypes.toDateSec(val);
    if (_.isDate(dt)) return Math.round(dt.getTime() / 1000);
    return null;
  },
  //.......................................
  toJson(obj, tabs = "  ") {
    return JSON.stringify(obj, null, tabs);
  },
  //.......................................
  // translate {keyword,majorKey,majorVlue,match} -> {...}
  toFilter(flt = {}, options = {}) {
    //console.log("toFilter", flt)
    let reo = {};
    let { keyword, match, majorKey, majorValue } = flt || {};
    let kwSetup = options.keyword || {
      "=id": "^[\\d\\w]{26}(:.+)?$",
      "=nm": "^[\\d\\w_.-]{3,}$",
      "title": "^.+"
    };
    //.....................................
    if (keyword) {
      let knm = "title";
      let keys = _.keys(kwSetup);
      for (let k of keys) {
        let val = kwSetup[k];
        if (new RegExp(val).test(keyword)) {
          knm = k;
          break;
        }
      }
      // Accurate equal
      if (knm.startsWith("=")) {
        reo[knm.substring(1).trim()] = keyword;
      }
      // Default is like
      else {
        reo[knm] = "^.*" + keyword;
      }
    }
    //.....................................
    // Eval Filter: match
    if (!_.isEmpty(match)) {
      _.assign(reo, match);
    }
    //.....................................
    // Eval Filter: major
    if (majorKey && !Ti.Util.isNil(majorValue)) {
      _.set(reo, majorKey, majorValue);
    }
    //.....................................
    return reo;
  },
  //.......................................
  /***
   * parse JSON safely. It will support un-quoted key like `{x:100}`.
   * Before eval, it will replace the key-word `function` to `Function`
   *
   * @param str{Any} - input json source to parse
   * @param dft - return value when parse failed
   *
   * @return JS object
   */
  safeParseJson(str, dft) {
    if (Ti.Util.isNil(str)) {
      return null;
    }
    if (!_.isString(str)) {
      return str;
    }
    try {
      return JSON.parse(str);
    } catch (E) {
      // Try eval
      let json = _.trim(str.replace(/(function|=>)/g, "Function"));
      if (/^\{.+\}$/.test(json) || /^\[.+\]$/.test(json)) {
        try {
          return eval("(" + json + ")");
        } catch (E2) {}
      }
    }
    // Return string directly
    return dft;
  },
  //.......................................
  formatTime(time, unit = "ms", fmt = "auto") {
    if (_.isUndefined(time) || _.isNull(time)) {
      return "";
    }
    // Array in deep
    if (_.isArray(time)) {
      //console.log("formatDate", date, fmt)
      let list = [];
      for (let t of time) {
        list.push(TiTypes.formatTime(t, fmt));
      }
      return list;
    }
    // Guard time
    if (!(time instanceof TiTime)) {
      time = new TiTime(time, unit);
    }
    // Format it
    return time.toString(fmt);
  },
  //.......................................
  formatDate(date, fmt = "yyyy-MM-dd") {
    if (!date) return;
    return Ti.DateTime.format(date, fmt);
  },
  //.......................................
  formatDateTime(date, fmt = "yyyy-MM-dd HH:mm:ss") {
    if (!date) return;
    return Ti.DateTime.format(date, fmt);
  },
  //.......................................
  getDateFormatValue(date, fmt = "yyyy-MM-dd") {
    if (!date) return;
    return Ti.DateTime.format(date, fmt);
  },
  //.......................................
  toAjaxReturn(val, dftData) {
    //console.log("toAjaxReturn", val)
    let reo = val;
    if (_.isString(val)) {
      try {
        reo = JSON.parse(val);
      } catch (E) {
        // Invalid JSON
        return {
          ok: false,
          errCode: "e.invalid.json_format",
          data: dftData
        };
      }
    }
    if (_.isBoolean(reo.ok)) {
      return reo;
    }
    return {
      ok: true,
      data: reo
    };
  },
  //.......................................
  Time: TiTime,
  Color: TiColor,
  //.......................................
  getFuncByType(type = "String", name = "transformer") {
    return _.get(
      {
        "String": { transformer: "toStr", serializer: "toStr" },
        "Number": { transformer: "toNumber", serializer: "toNumber" },
        "Integer": { transformer: "toInteger", serializer: "toInteger" },
        "Float": { transformer: "toFloat", serializer: "toFloat" },
        "Boolean": { transformer: "toBoolean", serializer: "toBoolean" },
        "Object": { transformer: "toObject", serializer: "toObject" },
        "Array": { transformer: "toArray", serializer: "toArray" },
        "DateTime": { transformer: "toDate", serializer: "formatDateTime" },
        "AMS": { transformer: "toDate", serializer: "toAMS" },
        "ASEC": { transformer: "toDateSec", serializer: "toSec" },
        "Time": { transformer: "toTime", serializer: "formatTime" },
        "Date": { transformer: "toDate", serializer: "formatDate" },
        "Color": { transformer: "toColor", serializer: "toStr" }
        // Date
        // Color
        // PhoneNumber
        // Address
        // Currency
        // ...
      },
      `${type}.${name}`
    );
  },
  //.......................................
  getFuncBy(fld = {}, name, fnSet = TiTypes) {
    //..................................
    // Eval the function
    let fn = TiTypes.evalFunc(fld[name], fnSet);
    //..................................
    // Function already
    if (_.isFunction(fn)) return fn;

    //..................................
    // If noexits, eval the function by `fld.type`
    if (!fn && fld.type) {
      fn = TiTypes.getFuncByType(fld.type, name);
    }

    //..................................
    // Is string
    if (_.isString(fn)) {
      return _.get(fnSet, fn);
    }
    //..................................
    // Plain Object
    if (_.isPlainObject(fn) && fn.name) {
      //console.log(fnType, fnName)
      let fn2 = _.get(fnSet, fn.name);
      // Invalid fn.name, ignore it
      if (!_.isFunction(fn2)) return;
      // Partical args ...
      if (_.isArray(fn.args) && fn.args.length > 0) {
        return _.partialRight(fn2, ...fn.args);
      }
      // Partical one arg
      if (!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
        return _.partialRight(fn2, fn.args);
      }
      // Just return
      return fn2;
    }
  },
  //.......................................
  getFunc(fld = {}, name) {
    return TiTypes.getFuncBy(fld, name);
  },
  //.......................................
  evalFunc(fn, fnSet = TiTypes) {
    //..................................
    // Function already
    if (_.isFunction(fn)) return fn;

    //..................................
    // Is string
    if (_.isString(fn)) {
      return _.get(fnSet, fn);
    }
    //..................................
    // Plain Object
    if (_.isPlainObject(fn) && fn.name) {
      //console.log(fnType, fnName)
      let fn2 = _.get(fnSet, fn.name);
      // Invalid fn.name, ignore it
      if (!_.isFunction(fn2)) return;
      // Partical args ...
      if (_.isArray(fn.args) && fn.args.length > 0) {
        return _.partialRight(fn2, ...fn.args);
      }
      // Partical one arg
      if (!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
        return _.partialRight(fn2, fn.args);
      }
      // Just return
      return fn2;
    }
  },
  //.......................................
  getJsType(val, dftType = "Object") {
    if (_.isUndefined(val)) {
      return dftType;
    }
    if (_.isNull(val)) {
      return "Object";
    }
    if (_.isNaN(val)) {
      return "Number";
    }
    if (_.isNumber(val)) {
      if (parseInt(val) == val) {
        return "Integer";
      }
      return "Number";
    }
    if (_.isBoolean(val)) {
      return "Boolean";
    }
    if (_.isString(val)) {
      return "String";
    }
    if (_.isArray(val)) {
      return "Array";
    }
    // Default is Object
    return "Object";
  },
  //.......................................
  parseTowStageID(str, sep = ":") {
    if (!_.isString(str)) {
      return {};
    }
    // Is simple ID ?
    let pos = str.indexOf(sep);
    if (pos < 0) {
      return {
        homeId: null,
        myId: _.trim(str)
      };
    }
    // Two stage ID
    return {
      homeId: _.trim(str.substring(0, pos)),
      myId: _.trim(str.substring(pos + 1))
    };
  },
  //.......................................
  getFormFieldVisibility(
    { hidden, visible, disabled, enabled } = {},
    data = {}
  ) {
    let is_hidden = false;
    // Supprot ["xxx", "!xxx"] quick mode
    const eval_cond = function (input) {
      if (_.isArray(input)) {
        let list = [];
        for (let it of input) {
          if (_.isString(it)) {
            list.push({
              [it]: (v) => (v ? true : false)
            });
          } else {
            list.push(it);
          }
        }
        return list;
      }
      return input;
    };
    // Hide or disabled
    if (!Ti.Util.isNil(hidden)) {
      let cond = eval_cond(hidden);
      is_hidden = Ti.AutoMatch.test(cond, data);
    }
    // Visiblity
    if (!Ti.Util.isNil(visible)) {
      let cond = eval_cond(visible);
      if (!_.isArray(cond) || !_.isEmpty(cond)) {
        is_hidden = !Ti.AutoMatch.test(cond, data);
      }
    }
    // Disable
    let is_disable = false;
    if (!Ti.Util.isNil(disabled)) {
      let cond = eval_cond(disabled);
      is_disable = Ti.AutoMatch.test(cond, data);
    }
    if (!Ti.Util.isNil(enabled)) {
      let cond = eval_cond(enabled);
      if (!_.isArray(cond) || !_.isEmpty(cond)) {
        is_disable = !Ti.AutoMatch.test(cond, data);
      }
    }
    return {
      hidden: is_hidden,
      visible: !is_hidden,
      disabled: is_disable,
      enabled: !is_disable
    };
  },
  //.......................................
  assertDataByForm(data = {}, fields = []) {
    if (!_.isEmpty(fields)) {
      for (let fld of fields) {
        // Not Required
        if (!fld.required) {
          continue;
        }

        // Visibility
        let { hidden, disabled } = Ti.Types.getFormFieldVisibility(fld, data);
        if (hidden || disabled) {
          continue;
        }

        // Do check value
        let v = _.get(data, fld.name);
        if (Ti.Util.isNil(v)) {
          // 准备错误消息
          throw Ti.Err.make("e.form.fldInNil", fld);
        } // isNil
      } // For
    }
  }
  //.......................................
};
//---------------------------------------
export const Types = TiTypes;
