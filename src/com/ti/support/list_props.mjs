export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data" : {
    type : Array,
    default : ()=>[]
  },
  "idBy" : {
    type : [String, Function],
    default : "id"
  },
  "rawDataBy" : {
    type : [Object, String, Function],
    default : _.identity
  },
  "currentId" : {
    type : String,
    default : null
  },
  "checkedIds" : {
    type : [Array, Object],
    default : ()=>[]
  },
  "changedId" : {
    type : String,
    default : null
  },
  "explainDict" : {
    type : Function,
    default : _.identity
  },
  "extendFunctionSet" : {
    type : Object,
    default : ()=>({})
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "multi" : {
    type : Boolean,
    default : false
  },
  // in selectRow(), auto check current and drop primary checked rows?
  "autoCheckCurrent" : {
    type : Boolean,
    default : true
  },
  // in multi mode, which key to toggle row checker?
  "rowToggleKey" : {
    type : [String, Array],
    default : ()=>["SPACE"]
  },
  "checkable" : {
    type : Boolean,
    default : false
  },
  "selectable" : {
    type : Boolean,
    default : true
  },
  "openable" : {
    type : Boolean,
    default : true
  },
  "cancelable" : {
    type : Boolean,
    default : true
  },
  "hoverable" : {
    type : Boolean,
    default : false
  },
  "puppetMode" : {
    type : Boolean,
    default : false
  },
  "scrollIndex" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "blankAs" : {
    type : Object,
    default : ()=>({
      icon : "zmdi-alert-circle-o",
      text : "empty-data"
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