export default {
  //-----------------------------------
  // Data
  //-----------------------------------
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
  "childrenBy" : {
    type : [String, Function],
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "dropComType" : {
    type : String,
    default : undefined
  },
  "dropComConf" : {
    type : Object,
    default : undefined
  },
  "mustInList" : {
    type : Boolean,
    default : false
  },
  "autoFocusExtended" : {
    type : Boolean,
    default : true
  },
  "filter" : {
    type : Boolean,
    default : true
  },
  "delay" : {
    type : Number,
    default : 800
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "statusIcons" : {
    type : Object,
    default : ()=>({
      collapse : "zmdi-chevron-down",
      extended : "zmdi-chevron-up"
    })
  },
  "dropDisplay" : {
    type : [Object, String, Array],
    default : undefined
  },
  "dropItemBorder" : {
    type : Boolean,
    default : true
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "keepWidthWhenDrop" : {
    type : Boolean, 
    default : undefined
  },
  "dropWidth" : {
    type : [Number, String],
    default : "box"
  },
  "dropHeight" : {
    type : [Number, String],
    default : null
  }
}