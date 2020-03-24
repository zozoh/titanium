export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date],
      default : null
    },
    "timeMode" : {
      type : String,
      default : "sec",
      /***
       * - `sec`  : "HH:mm:ss"
       * - `min`  : "HH:mm"
       * - `auto` : "HH:mm:ss"
       */
      validator : function(unit) {
        return /^(sec|min|auto)$/.test(unit)
      }
    },
    "monthFormat" : {
      type : String,
      default : "yyyy-MM" 
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.className
    },
    //------------------------------------------------
    theDate() {
      return Ti.Types.toDate(this.value, null)
    },
    //------------------------------------------------
    theTime() {
      return Ti.Types.toTime(this.theDate)
    },
    //------------------------------------------------
    theTimeFormat() {
      return ({
        "sec"  : "HH:mm:ss",
        "min"  : "HH:mm",
        "auto" : "auto"
      })[this.timeMode]
    },
    //------------------------------------------------
    theTimeText() {
      return this.getTimeText(this.theTime)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onDateChanged(dt) {
      let theDate = this.theDate || new Date()
      let tm = Ti.Types.toTime(this.theTime||0);
      dt = new Date(dt)
      dt.setHours(tm.hours)
      dt.setMinutes(tm.minutes)
      dt.setSeconds(tm.seconds)
      dt.setMilliseconds(tm.milliseconds)
      this.$notify("change", dt)
    },
    //------------------------------------------------
    onTimeChanged(tm) {
      let theDate = this.theDate || new Date()
      let dt = new Date(theDate)
      dt.setHours(tm.hours)
      dt.setMinutes(tm.minutes)
      dt.setSeconds(tm.seconds)
      dt.setMilliseconds(tm.milliseconds)
      this.$notify("change", dt)
    },
    //------------------------------------------------
    getTimeText(tm) {
      if(tm instanceof Ti.Types.Time) {
        return tm.toString(this.theTimeFormat)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}