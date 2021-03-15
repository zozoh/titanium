export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data" : {
    type : [Array, String],
    default : undefined
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
  "rowCheckable" : {
    type : [Object, Function],
    default : undefined
  },
  "rowSelectable" : {
    type : [Object, Function],
    default : undefined
  },
  "rowOpenable" : {
    type : [Object, Function],
    default : undefined
  },
  "rowCancelable" : {
    type : [Object, Function],
    default : undefined
  },
  "rowHoverable" : {
    type : [Object, Function],
    default : undefined
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
      icon : "far-list-alt",
      text : "i18n:empty-data"
    })
  },
  "blankClass": {
    type: String,
    default: "as-big-mask",
    validator: v=>/^as-(big|hug|big-mask|mid-tip)$/.test(v)
  },
  "loadingAs" : {
    type : Object,
    default : ()=>({
      className : "as-nil-mask as-big-mask",
      icon : undefined,
      text : undefined
    })
  },
  "rowNumberBase" : {
    type : Number,
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