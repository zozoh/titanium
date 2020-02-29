export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : undefined,
  "valueBy" : {
    type : [String, Function],
    default : undefined
  },
  // "$emit:filter" : leave to parent
  // "text" : match the "text" fields in can-list
  // "text|value" : in can-list, the valued key will be matched
  // ["text", "value|name"] : in can-list, any valued key will be matched
  // F(val):Boolean : callback
  "filterBy" : {
    type : [String, Array, Function],
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "candidateComType" : {
    type : String,
    default : undefined
  },
  "candidateComConf" : {
    type : Object,
    default : undefined
  },
  "checkedComType" : {
    type : String,
    default : undefined
  },
  "checkedComConf" : {
    type : Object,
    default : undefined
  },
  "filterConf" : {
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
  "candidateTitle" : {
    type : String,
    default : "i18n:candidate"
  },
  "checkedTitle" : {
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