export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "dropDate"   : null
  }),
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
      default : null
    },
    // true : can write time directly
    "editable" : {
      type : Boolean,
      default : true
    },
    // when "editable", it will render text by `input` element
    // This prop indicate if open drop when input was focused
    // `true` as default
    "focusToOpen" : {
      type : Boolean,
      default : true
    },
    "width" : {
      type : [Number, String],
      default : "1.4rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
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
    theDropDate() {
      return this.dropDate || this.theDate
    },
    //------------------------------------------------
    theDateValue() {
      return this.getDateText(this.theDate)
    },
    //------------------------------------------------
    theDateText() {
      return this.getDateText(this.theDate, this.format)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onCollapse() {
      if(this.dropDate) {
        let dt = this.dropDate
        this.dropDate = null
        let str = this.getDateText(dt)
        this.$emit("changed", str)
      }
    },
    //------------------------------------------------
    onChanged(val) {
      // Empty value as null
      if(_.isEmpty(val)) {
        this.$emit("changed", null);
      }
      // Parsed value
      else {
        let dt  = Ti.Types.toDate(val)
        let str = this.getDateText(dt)
        this.$emit("changed", str)
      }
    },
    //------------------------------------------------
    onMonthChanged(dt) {
      this.dropDate = dt
    },
    //------------------------------------------------
    getDateText(dt, fmt="yyyy-MM") {
      if(!_.isDate(dt)) {
        dt = Ti.Types.toDate(dt)
      }
      return Ti.Types.formatDate(dt, fmt)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}