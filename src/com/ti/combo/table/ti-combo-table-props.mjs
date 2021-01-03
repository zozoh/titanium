export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : {
    type : [Array],
    default : ()=>[]
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