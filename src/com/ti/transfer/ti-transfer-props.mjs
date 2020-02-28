export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : undefined,
  "idBy" : {
    type : [String, Function],
    default : "id"
  },
  "rawDataBy" : {
    type : [Object, String, Function],
    default : _.identity
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "display" : {
    type : [Object, String, Array],
    default : undefined
  },
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
  "assignButtons" : {
    type : Object,
    default : ()=>({
      add    : "fas-angle-double-right",
      remove : "fas-angle-double-left"
    })
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