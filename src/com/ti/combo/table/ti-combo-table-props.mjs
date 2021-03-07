export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : {
    type : [Array, String],
    default : ()=>[]
  },
  "valueType" : {
    type : String,
    default : "Array",
    validator : v => /^(Array|String)$/.test(v)
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "form" : {
    type : Object,
    default : ()=>({})
  },
  "list" : {
    type : Object,
    default : ()=>({})
  },
  "dialog" : {
    type : Object,
    default : ()=>({
      title  : "i18n:edit",
      width  : 500,
      height : 500
    })
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "blankAs" : {
    type : Object,
    default : ()=>({
      icon : "fab-deezer",
      text : "empty-data"
    })
  },
  "blankClass" : {
    type : String,
    default : "as-mid-tip"
  },
  "actionAlign" : {
    type : String,
    default : undefined
  },
  "newItemIcon" : {
    type : String,
    default : "fas-plus"
  },
  "newItemText" : {
    type : String,
    default : "i18n:new-item"
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