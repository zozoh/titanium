export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  // option() -> all list
  // option(inputing) -> condition list
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
  "iconeBy" : {
    type : [String, Function],
    default : undefined
  },
  "value" : undefined,
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "canComType" : {
    type : String,
    default : undefined
  },
  "canComConf" : {
    type : Object,
    default : undefined
  },
  "selComType" : {
    type : String,
    default : undefined
  },
  "selComConf" : {
    type : Object,
    default : undefined
  },
  "filter" : {
    type : Boolean,
    default : true
  },
  "fltComType" : {
    type : String,
    default : "ti-input"
  },
  "fltComConf" : {
    type : Object,
    default : undefined
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "display" : {
    type : [Object, String, Array],
    default : undefined
  },
  "assignButtons" : {
    type : Object,
    default : ()=>({
      add    : "fas-angle-double-right",
      remove : "fas-angle-double-left"
    })
  },
  "canTitle" : {
    type : String,
    default : "i18n:candidate"
  },
  "selTitle" : {
    type : String,
    default : "i18n:checked"
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