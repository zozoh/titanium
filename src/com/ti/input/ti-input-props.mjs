export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : undefined,
  "format" : undefined,
  "valueCase" : {
    type : String,
    default : undefined,
    validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
  },
  "trimed" : {
    type : Boolean,
    default : true
  },
  "autoJsValue" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "readonly" : {
    type: Boolean,
    default : false
  },
  "focused" : {
    type : Boolean,
    default : false
  },
  "hover" : {
    type : [Array, String],
    default : ()=>["prefixIcon", "suffixIcon"]
  },
  "autoSelect" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder" : {
    type : [String, Number],
    default : undefined
  },
  "autoI18n" : {
    type : Boolean,
    default : false
  },
  "hideBorder" : {
    type : Boolean,
    default : false
  },
  "prefixIcon" : {
    type : [String, Object],
    default : undefined
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
    default : undefined
  },
  "suffixIcon" : {
    type : [String, Object],
    default : undefined
  },
  "suffixText" : {
    type : String,
    default : undefined
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : undefined
  },
  "height" : {
    type : [Number, String],
    default : undefined
  }
}