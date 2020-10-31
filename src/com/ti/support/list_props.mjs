export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data" : {
    type : [Array, String],
    default : ()=>[]
  },
  // If input the value(ID) Array
  // it can translate by this Dict
  "dict" : {
    type : [String, Ti.Dict],
    default : null
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
    type : [String, Number],
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
  // "extendFunctionSet" : {
  //   type : Object,
  //   default : ()=>({})
  // },
  "vars" : {
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
  "onBeforeChangeSelect": {
    type : Function,
    default: undefined
  },
  "onSelect": {
    type : Function,
    default: undefined
  },
  "onOpen": {
    type : Function,
    default: undefined
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "blankAs" : {
    type : Object,
    default : ()=>({
      icon : "fas-disease",
      text : "empty-data"
    })
  },
  "blankClass": {
    type: String,
    default: "as-big-mask",
    validator: v=>/^as-(big|hug|big-mask|mid-tip)$/.test(v)
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