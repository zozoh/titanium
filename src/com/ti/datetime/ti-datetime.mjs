export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Date],
      default : null
    },
    "timeMode" : {
      type : String,
      default : "auto",
      /***
       * - `sec`  : "HH:mm:ss"
       * - `min`  : "HH:mm"
       * - `auto` : "HH:mm:ss"
       */
      validator : function(unit) {
        return /^(sec|min|auto)$/.test(unit)
      }
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
      if(this.value)
        return Ti.Types.toDate(this.value)
      return new Date()
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
      let tm = Ti.Types.toTime(this.theDate);
      dt = new Date(dt)
      dt.setHours(tm.hours)
      dt.setMinutes(tm.minutes)
      dt.setSeconds(tm.seconds)
      dt.setMilliseconds(tm.milliseconds)
      this.$emit("changed", dt)
    },
    //------------------------------------------------
    onTimeChanged(tm) {
      let dt = new Date(this.theDate)
      dt.setHours(tm.hours)
      dt.setMinutes(tm.minutes)
      dt.setSeconds(tm.seconds)
      dt.setMilliseconds(tm.milliseconds)
      this.$emit("changed", dt)
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