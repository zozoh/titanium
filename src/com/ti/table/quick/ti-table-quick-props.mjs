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
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "fields" : {
    type : Array,
    default : ()=>[]
  },
  "multi" : {
    type : Boolean,
    default : false
  },
  "autoCheckCurrent" : {
    type : Boolean,
    default : true
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
  "autoCheckCurrent" : {
    type : Boolean,
    default : true
  },
  "onSelect": {
    type : Function,
    default: undefined
  },
  "onOpen": {
    type : Function,
    default: undefined
  },
  "notifySelectName": {
    type : String,
    default: "select"
  },
  "notifyOpenName": {
    type : String,
    default: "open"
  },
  //-----------------------------------
  // Callback
  //-----------------------------------
  "onSelect": {
    type : Function,
    default: undefined
  },
  "onOpen": {
    type : Function,
    default: undefined
  },
  "onBeforeChangeSelect" : {
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
      text : "empty-data"
    })
  },
  "blankClass": {
    type: String,
    default: "as-big-mask",
    validator: v=>/^as-(big|hug|big-mask|mid-tip)$/.test(v)
  },
  "rowNumberBase" : {
    type : Number,
    default : undefined
  },
  "border" : {
    type : String,
    default : "cell",
    validator : v => /^(row|column|cell|none)$/.test(v)
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