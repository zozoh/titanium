export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "dropTime" : null,
    "status"   : "collapse",
    "inputing" : null
  }),
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
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
      default : null
    },
    "width" : {
      type : [Number, String],
      default : "1.4rem"
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
      default : 200
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    },
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
      return this.dropTime || this.theTime
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
      return this.getTimeText(this.theTime)
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    __doCollapse() {
      if(this.dropTime) {
        let tm = this.dropTime
        this.dropTime = null
        let str = this.getTimeText(tm)
        this.$emit("changed", str)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
      // Watch Keyboard
      Ti.Shortcut.addWatch(this, [{
        "shortcut" : "ESCAPE",
        "action"   : ()=>this.doCollapse()
      }])
    },
    //-----------------------------------------------
    doCollapse() {
      this.status = "collapse"
      this.dropTime = null
      this.inputing = null
      // Unwatch
      Ti.Shortcut.removeWatch(this)
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        this.$emit("changed", null);
      }
      // Parsed value
      else {
        let tm  = Ti.Types.toTime(val)
        let str = this.getTimeText(tm)
        this.$emit("changed", str)
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
      this.dropTime = time
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