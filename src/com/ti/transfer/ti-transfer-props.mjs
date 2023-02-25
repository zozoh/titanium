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
  // Value format
  // If declare the valueType
  // It will transform the WnObj
  // to relaitve value mode
  "valueType": {
    type: String,
    default: "id",
    validator: v => /^(id|obj|item)$/.test(v)
  },
  // for valueType=="obj", which key is id => value
  // The key is for the primary obj, not the result
  // of mapping translate if you declare the mapping option.
  "idBy": {
    type: String,
    default: "id"
  },
  // for valueType=="obj|item", translate the value
  "mapping": {
    type: Object,
    default: undefined
  },
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
  "changeEventName":{
    type : String,
    default : "change"
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