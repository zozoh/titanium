export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  // pick value from options item for emit value changed
  "valueBy" : {
    type : [String, Function],
    default : undefined
  },
  // match options item object by key or customized function
  // `(it, str):Boolean`, true is matched
  "matchBy" : {
    type : [String, Array, Function],
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "canInput" : {
    type : Boolean,
    default : true
  },
  "mustInList" : {
    type : Boolean,
    default : false
  },
  "autoFocusExtended" : {
    type : Boolean,
    default : true
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
  "dropWidth" : {
    type : [Number, String],
    default : "box"
  },
  "dropHeight" : {
    type : [Number, String],
    default : null
  }
}