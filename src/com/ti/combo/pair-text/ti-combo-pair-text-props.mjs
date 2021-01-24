export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": {
    type: Object,
    default: undefined
  },
  "options" : {
    type : [String, Array, Function, Ti.Dict],
    default : ()=>[]
  },
  "valueBy" : {
    type : [String, Function],
    default : undefined
  },
  "textBy" : {
    type : [String, Function],
    default : undefined
  },
  "iconBy" : {
    type : [String, Function],
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "trimed" : {
    type : Boolean,
    default : true
  },
  "readonly" : {
    type: Boolean,
    default : false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder" : {
    type : String,
    default : undefined
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "textWidth" : {
    type : [Number, String],
    default : undefined
  },
  "textHeight" : {
    type : [Number, String],
    default : undefined
  }
}