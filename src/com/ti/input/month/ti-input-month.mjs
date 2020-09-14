export default {
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Number, Date],
      default : undefined
    },
    "text" : {
      type : String,
      default : undefined
    },
    "icon" : {
      type : String,
      default : "far-calendar"
    },
    "format" : {
      type : String,
      default : "yyyy-MM"
    },
    "placeholder" : {
      type : [String, Number],
      default : "i18n:blank-month"
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
    // the height of drop list
    "dropHeight" : {
      type : [Number, String],
      default : 200
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
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
    theDate() {
      return Ti.Types.toDate(this.value, null)
    },
    //------------------------------------------------
    theDropDate() {
      return this.runtime || this.theDate
    },
    //------------------------------------------------
    theInputValue() {
      if(this.isExtended) {
        return this.getDateText(this.theDropDate, this.format)
      }
      return this.text || this.getDateText(this.theDropDate, this.format)
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
        let dt = this.runtime
        this.runtime = null
        let str = this.getDateText(dt)
        this.$notify("change", str)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
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
        let dt  = Ti.Types.toDate(val)
        let str = this.getDateText(dt)
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
    onMonthChanged(dt) {
      this.runtime = dt
    },
    //------------------------------------------------
    getDateText(dt, fmt="yyyy-MM") {
      let dt2 = Ti.Types.toDate(dt, null)
      return Ti.Types.formatDate(dt2, fmt)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}