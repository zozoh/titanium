export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"  : "collapse"
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
      type : [String, Number, Date, Array],
      default : null
    },
    "icon" : {
      type : String,
      default : "fas-calendar-alt"
    },
    "format" : {
      type : String,
      default : "yyyy-MM-dd"
    },
    "placeholder" : {
      type : String,
      default : "i18n:blank-date-range"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : "3rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "matrixCount" : {
      type : Number,
      default : 2
    },
    "monthFormat" : {
      type : String,
      default : "yyyy-MM-dd" 
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
    //--------------------------------------
    theDate() {
      if(_.isArray(this.value) && !_.isEmpty(this.value)) {
        return Ti.Types.toDate(this.value[0])
      }
      if(this.value) {
        return Ti.Types.toDate(this.value)
      }
    },
    //--------------------------------------
    theRangeInMs() {
      if(!this.theDate) {
        return []
      }
      // Move to 00:00:00
      let dt0 = new Date(this.theDate)
      // Define the dt1
      let dt1;
      if(_.isArray(this.value) && this.value.length > 1) {
        dt1 = Ti.Types.toDate(this.value[1])
      }
      // The End of the Day
      else {
        dt1 = new Date(dt0)
      }
      // Make the range
      let msRange = [dt0.getTime(), dt1.getTime()].sort()

      // dt0 start of the day
      dt0 = Ti.DateTime.setTime(new Date(msRange[0]))
      // dt1 end of the day
      dt1 = Ti.DateTime.setTime(new Date(msRange[1]), [23,59,59,999])

      // rebuild the range
      return [dt0.getTime(), dt1.getTime()]
    },
    //------------------------------------------------
    theRange() {
      if(_.isEmpty(this.theRangeInMs)) {
        return []
      }
      return [
        new Date(this.theRangeInMs[0]), 
        new Date(this.theRangeInMs[1])]
    },
    //------------------------------------------------
    theDropRange() {
      return this.runtime || this.theRange
    },
    //------------------------------------------------
    theRangeValue() {
      return this.formatRangeValue(this.theRange).join(",")
    },
    //------------------------------------------------
    theRangeText() {
      if(!_.isEmpty(this.theRange)) {
        let dt0 = this.theRange[0]
        let dt1 = this.theRange[1]
        let yy0 = dt0.getFullYear()
        let MM0 = dt0.getMonth()
        let dd0 = dt0.getDate()
        let yy1 = dt1.getFullYear()
        let MM1 = dt1.getMonth()
        let dd1 = dt1.getDate()
        let MA0 = Ti.DateTime.getMonthAbbr(MM0)
        let MA1 = Ti.DateTime.getMonthAbbr(MM1)
        let MT0 = Ti.I18n.get(MA0)
        let MT1 = Ti.I18n.get(MA1)

        MM0++;  MM1++;  // Month change to 1 base

        let vars = {
          yy0, yy1,
          MM0, MM1,
          dd0, dd1,
          MA0, MA1,
          MT0, MT1
        }
        // Beyond year
        if(yy0 != yy1) {
          return Ti.I18n.getf("cal.d-range-beyond-years", vars)
        }
        // Beyond month
        if(MM0 != MM1) {
          return Ti.I18n.getf("cal.d-range-beyond-months", vars)
        }
        // Beyond day
        if(dd0 != dd1) {
          return Ti.I18n.getf("cal.d-range-beyond-days", vars)
        }
        // Same day
        return Ti.I18n.getf("cal.d-range-in-same-day", vars)
      }
    },
    //------------------------------------------------
    theInputValue() {
      if(this.isExtended) {
        return this.theRangeValue
      }
      return this.theRangeText
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
        let rg = this.runtime
        this.runtime = null
        let rg2 = this.formatRangeValue(rg)
        this.$emit("changed", rg2)
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
      console.log("haha")
      let rg = this.parseDateRange(val)
      // Empty Range
      if(_.isEmpty(rg)) {
        this.$emit("changed", null);
      }
      // Format the Range
      else {
        let rg2 = this.formatRangeValue(rg)
        this.$emit("changed", rg2);
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
    onDateRangeChanged(rg) {
      this.runtime = rg
    },
    //------------------------------------------------
    parseDateRange(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        return []
      }
      // Parsed value
      let ss = val.split(",")
      // Empty
      if(_.isEmpty(ss)) {
        return []
      }
      // One date
      if(ss.length == 1) {
        let dt = Ti.Types.toDate(ss[0])
        return [dt]
      }
      // range
      let dt0 = Ti.Types.toDate(ss[0])
      let dt1 = Ti.Types.toDate(ss[1])
      return [dt0, dt1].sort((dt0,dt1)=>{
        return dt0.getTime()-dt1.getTime()
      })
    },
    //------------------------------------------------
    formatRangeValue(range) {
      return Ti.Types.formatDate(range, this.format)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}