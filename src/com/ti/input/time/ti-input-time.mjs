export default {
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"   : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Number, Ti.Types.Time],
      default : null
    },
    "icon" : {
      type : String,
      default : "far-clock"
    },
    /***
     * Value unit when value is Number
     */
    "valueUnit" : {
      type : String,
      default : "s",
      validator : function(unit) {
        return /^(ms|s|min|hr)$/.test(unit)
      }
    },
    // Display mode
    "mode" : {
      type : String,
      default : "auto",
      /***
       * - `sec`  : "HH:mm:ss"
       * - `min`  : "HH:mm"
       * - `auto` : "HH:mm" or "HH:mm:ss" if `ss` no zero
       */
      validator : function(unit) {
        return /^(sec|min|auto)$/.test(unit)
      }
    },
    "placeholder" : {
      type : [String, Number],
      default : "i18n:blank-time"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : "1.6rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    "dropHeight" : {
      type : [Number, String],
      default : 400
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    theTime() {
      //console.log("input value:", this.value)
      return Ti.Types.toTime(this.value, this.valueUnit)
    },
    //------------------------------------------------
    theDropTime() {
      return this.runtime || this.theTime
    },
    //------------------------------------------------
    theTimeFormat() {
      return ({
        "sec"  : "HH:mm:ss",
        "min"  : "HH:mm",
        "auto" : "auto"
      })[this.mode]
    },
    //------------------------------------------------
    theTimeText() {
      return this.getTimeText(this.theDropTime)
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    applyRuntime() {
      if(this.runtime) {
        let tm = this.runtime
        this.runtime = null
        let str = this.getTimeText(tm)
        this.$notify("change", str)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      //console.log("time doCollapse", {escaped})
      this.status = "collapse"
      // Drop runtime
      if(escaped) {
        this.runtime = null
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime()
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        this.$notify("change", null);
      }
      // Parsed value
      else {
        let tm  = Ti.Types.toTime(val)
        let str = this.getTimeText(tm)
        this.$notify("change", str)
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //------------------------------------------------
    onTimeChanged(time) {
      this.runtime = time
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