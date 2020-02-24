export default {
  "idBy" : {
    type : [String, Function],
    default : "id"
  },
  "rawDataBy" : {
    type : [Object, String, Function],
    default : _.identity
  },
  "explainDict" : {
    type : Function,
    default : _.identity
  },
  "extendFunctionSet" : {
    type : Object,
    default : ()=>({})
  },
  "data" : {
    type : Array,
    default : ()=>[]
  },
  "changedId" : {
    type : String,
    default : null
  },
  "currentId" : {
    type : String,
    default : null
  },
  "checkedIds" : {
    type : [Array, Object],
    default : ()=>[]
  },
  "multi" : {
    type : Boolean,
    default : false
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
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  },
  "scrollIndex" : {
    type : Boolean,
    default : false
  },
  "blankAs" : {
    type : Object,
    default : ()=>({
      icon : "zmdi-alert-circle-o",
      text : "empty-data"
    })
  }
}