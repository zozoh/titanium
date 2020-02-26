export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : null,
  "format" : undefined,
  "valueCase" : {
    type : String,
    default : null,
    validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
  },
  "trimed" : {
    type : Boolean,
    default : true
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "readonly" : {
    type: Boolean,
    default : false
  },
  "focus" : {
    type : Boolean,
    default : false
  },
  "hover" : {
    type : [Array, String],
    default : ()=>["prefixIcon", "suffixIcon"]
  },
  "autoSelect" : {
    type : Boolean,
    default : true
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder" : {
    type : [String, Number],
    default : null
  },
  "hideBorder" : {
    type : Boolean,
    default : false
  },
  "prefixIcon" : {
    type : [String, Object],
    default : null
  },
  "prefixHoverIcon" : {
    type : String,
    default : "zmdi-close-circle"
  },
  "prefixIconForClean" : {
    type : Boolean,
    default : true
  },
  "prefixText" : {
    type : String,
    default : null
  },
  "suffixIcon" : {
    type : [String, Object],
    default : null
  },
  "suffixText" : {
    type : String,
    default : null
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  }
}