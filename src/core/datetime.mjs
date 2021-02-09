///////////////////////////////////////////
const I_DAYS = ["sun","mon","tue", "wed", "thu", "fri", "sat"]
const I_WEEK = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday"
]
const WEEK_DAYS = {
  "sun":0,"mon":1,"tue":2, "wed":3, "thu":4, "fri":5, "sat":6,
  "sunday":0, "monday":1, "tuesday":2, "wednesday":3,
  "thursday":4, "friday":5, "saturday":6
}
const MONTH_ABBR = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
]
///////////////////////////////////////////
const P_DATE = new RegExp(
  "^((\\d{4})([/\\\\-])?(\\d{1,2})?([/\\\\-])?(\\d{1,2})?)?"
  + "(([ T])?"
  + "(\\d{1,2})(:)(\\d{1,2})((:)(\\d{1,2}))?"
  + "((\.)(\\d{1,3}))?)?"
  + "(([+-])(\\d{1,2})(:\\d{1,2})?)?"
  + "(Z(\\d*))?$"
)
///////////////////////////////////////////
const TiDateTime = {
  //---------------------------------------
  parseTime(val, options) {
    return Ti.Types.toTime(val, options)
  },
  //---------------------------------------
  parse(d) {
    //console.log("parseDate:", d)
    // Default return today
    if(_.isUndefined(d) || "today" === d || "now" === d){
      return new Date()
    }
    // keep null
    if(!d || (_.isArray(d) && _.isEmpty(d))) {
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
      // MS 
      if(/\d{13,}/.test(str)) {
        return new Date(str * 1)
      }
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
  },
  //---------------------------------------
  format(date, fmt="yyyy-MM-dd HH:mm:ss") {
    // Date Range or a group of date
    if(_.isArray(date)) {
      //console.log("formatDate", date, fmt)
      let list = []
      for(let d of date) {
        list.push(TiDateTime.format(d, fmt))
      }
      return list
    }

    if(!_.isDate(date)) {
      date = TiDateTime.parse(date)
    }
    // Guard it
    if(!date)
      return null
    
    // TODO here add another param
    // to format the datetime to "in 5min" like string
    // Maybe the param should named as "shorthand"
    /*
    E   :Mon
    EE  :Mon
    EEE :Mon
    EEEE:Monday
    M   :9
    MM  :09
    MMM :Sep
    MMMM:September
    */
    // Format by pattern
    let yyyy = date.getFullYear()
    let M = date.getMonth() + 1
    let d = date.getDate()
    let H = date.getHours()
    let m = date.getMinutes()
    let s = date.getSeconds()
    let S = date.getMilliseconds()

    let mkey = MONTH_ABBR[date.getMonth()]
    let MMM = Ti.I18n.get(`cal.abbr.${mkey}`)
    let MMMM = Ti.I18n.get(mkey)

    let day = date.getDay()
    let dayK0 = _.upperFirst(I_DAYS[day])
    let dayK1 = _.upperFirst(I_WEEK[day])
    let E = Ti.I18n.get(dayK0)
    let EEEE = Ti.I18n.get(dayK1)
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
      E, EE:E, EEE:E, EEEE,
      MMM, MMMM
    }
    let regex = /(y{2,4}|M{1,4}|dd?|HH?|mm?|ss?|S{1,3}|E{1,4}|'([^']+)')/g;
    let ma;
    let list = []
    let last = 0
    while(ma=regex.exec(fmt)) {
      if(last < ma.index) {
        list.push(fmt.substring(last, ma.index))
      }
      let it = Ti.Util.fallback(ma[2], _c[ma[1]], ma[1])
      list.push(it)
      last = regex.lastIndex
    }
    if(last < fmt.length) {
      list.push(fmt.substring(last))
    }
    return list.join("")
  },
  //---------------------------------------
  getWeekDayAbbr(day) {
    let i = _.clamp(day, 0, I_DAYS.length-1)
    return I_DAYS[i]
  },
  //---------------------------------------
  getWeekDayName(day) {
    let i = _.clamp(day, 0, I_WEEK.length-1)
    return I_WEEK[i]
  },
  //---------------------------------------
  getWeekDayValue(name, dft=-1) {
    let nm = _.trim(_.lowerCase(name))
    let re = WEEK_DAYS[nm]
    if(_.isNumber(re))
      return re
    return dft
  },
  //---------------------------------------
  /***
   * @param month{Number} - 0 base Month number
   * 
   * @return Month abbr like : "Jan" ... "Dec"
   */
  getMonthAbbr(month) {
    let m = _.clamp(month, 0, 11)
    return MONTH_ABBR[m]
  },
  //---------------------------------------
  setTime(d, 
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  ) {
    if(_.inRange(hours, 0, 24)) {
      d.setHours(hours)
    }
    if(_.inRange(minutes, 0, 60)) {
      d.setMinutes(minutes)
    }
    if(_.inRange(seconds, 0, 60)) {
      d.setSeconds(seconds)
    }
    if(_.inRange(milliseconds, 0, 1000)) {
      d.setMilliseconds(milliseconds)
    }
    return d
  },
  //---------------------------------------
  setDayLastTime(d) {
    return TiDateTime.setTime(d, 23,59,59,999)
  },
  //---------------------------------------
  moveYear(d, offset=0) {
    if(_.isDate(d)) {
      d.setFullYear(d.getFullYear + offset)
    }
    return d
  },
  //---------------------------------------
  moveMonth(d, offset=0) {
    if(_.isDate(d)) {
      d.setMonth(d.getMonth() + offset)
    }
    return d
  },
  //---------------------------------------
  moveDate(d, offset=0) {
    if(_.isDate(d)) {
      d.setDate(d.getDate() + offset)
    }
    return d
  },
  //---------------------------------------
  createDate(d, offset=0) {
    if(_.isDate(d)) {
      let d2 = new Date(d)
      d2.setDate(d2.getDate() + offset)
      return d2
    }
  },
  //---------------------------------------
  rangeStr({date, time="3h"}={}, tmpl='[${from},${to}]') {
    date = date || 'now'
    let context = {
      from : `${date}-${time}`, 
      to   : date
    }
    return Ti.S.renderBy(tmpl, context)
  },
  //---------------------------------------
  rangeFrom({from, to}={}, tmpl='[${from},${to}]') {
    let amss = []
    if(from) {
      amss[0] = TiDateTime.parse(from).getTime()
    }
    if(to) {
      amss[1] = TiDateTime.parse(to).getTime()
    }
    if(0 == amss.length) {
      amss[1] = Date.now()
    }
    if(!amss[0]) {
      amss[0] = amss[1] - 86400000;
    }
    if(!amss[1]) {
      amss[1] = amss[0] + 86400000;
    }
    let [ms0, ms1] = amss
    amss[0] = Math.min(ms0, ms1)
    amss[1] = Math.max(ms0, ms1)

    let context = {
      from : amss[0], 
      to   : amss[1]
    }
    return Ti.S.renderBy(tmpl, context)
  },
  //---------------------------------------
  /**
   * Given date time in range
   * 
   * @param d{Date|String|Number} input datetime
   * @param range{Number} range in ms
   * @param falsy{Any} return if not in range
   * @param trusy{Any} return if in range
   * 
   * @return falsy when given time not in range, 
   * else, trusy will be returned.
   */
  toBoolStr(d, range=60000,  falsy="No", trusy="Yes") {
    let ams = 0;
    if(d) {
      ams = TiDateTime.parse(d).getTime()
    }
    let du = Date.now() - ams
    if(du > range) {
      return falsy
    }
    return trusy
  },
  //---------------------------------------
  // - inMin   : just now   : < 10min
  // - inHour  : 56min      : < 1hour
  // - inDay   : 23hour     : < 1day
  // - inWeek  : 6day       : < 1week
  // - inYear  : Jun 19     : < This Year
  // - anyTime : 2020/12/32 : Any time
  timeText(d, {
    justNow=10,
    i18n=Ti.I18n.get("time")
  }={}) {
    d = TiDateTime.parse(d)
    let ams = d.getTime()
    let now = Date.now()
    let du_ms  = now - ams;
    //.....................................
    let prefix = du_ms > 0 ? "past-" : "future-"
    du_ms = Math.abs(du_ms)
    //.....................................
    // Just now
    let du_min = Math.round(du_ms / 60000)
    if(du_min < justNow) {
      return i18n[`${prefix}in-min`]
    }
    // in-hour
    if(du_min < 60) {
      return Ti.S.renderBy(i18n[`${prefix}in-hour`], {min:du_min})
    }
    //.....................................
    // in-day
    let du_hr  = Math.round(du_ms / 3600000)
    if(du_hr < 24) {
      return Ti.S.renderBy(i18n[`${prefix}in-day`], {
        min:du_min, hour:du_hr
      })
    }
    //.....................................
    // in-week
    let du_day  = Math.round(du_hr / 24)
    if(du_day < 7) {
      return Ti.S.renderBy(i18n[`${prefix}in-week`], {
        min:du_min, hour:du_hr, day: du_day
      })
    }
    //.....................................
    // in-year
    let year = d.getFullYear()
    let toYear = (new Date()).getFullYear()
    if(year == toYear) {
      return TiDateTime.format(d, i18n["in-year"])
    }
    //.....................................
    // any-time
    return TiDateTime.format(d, i18n["any-time"])
    //.....................................
  }
  //---------------------------------------
}
///////////////////////////////////////////
export const DateTime = TiDateTime