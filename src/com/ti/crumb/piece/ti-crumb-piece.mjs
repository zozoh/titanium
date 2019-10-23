export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "icon" : {
      type : String,
      default : null
    },
    "text" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Boolean, Object],
      default : null
    },
    "options" : {
      type : Array,
      default : null
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      if(this.className)
        return this.className
    },
    //------------------------------------------------
    hasOptions() {
      return _.isArray(this.options) && this.options.length > 0
    },
    //------------------------------------------------
    statusIcon() {
      return "zmdi-chevron-down"
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}