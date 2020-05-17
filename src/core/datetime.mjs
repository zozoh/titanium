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
const TiDateTime = {
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
  setTime(d, [
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  ]=[]) {
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
  }
  //---------------------------------------
}
///////////////////////////////////////////
export const DateTime = TiDateTime