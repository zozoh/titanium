export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "type" : {
    type : String,
    default : "String"
  },
  "required" : {
    type : Boolean,
    default : false
  },
  "disabled" : {
    type : Boolean,
    default : false
  },
  "uniqKey" : {
    type : String,
    default : null
  },
  "name" : {
    type : [String, Array],
    default : null
  },
  "icon" : {
    type : String,
    default : null
  },
  "message" : {
    type : String,
    default : null
  },
  "title" : {
    type : String,
    default : null
  },
  "tip" : {
    type : String,
    default : null
  },
  "fieldWidth" : {
    type : [String, Number],
    default : undefined
  },
  "checkEquals" : {
    type : Boolean,
    default : true
  },
  "undefinedAs" : {
    default : undefined
  },
  "nullAs" : {
    default : undefined
  },
  "nanAs" : {
    type : Number,
    default : undefined
  },
  "emptyAs" : {
    type : String,
    default : undefined
  },
  "defaultAs" : {
    default : undefined
  },
  "display" : {
    type : [String, Object, Boolean],
    default : false
  },
  "autoValue" : {
    type : String,
    default : "value"
  },
  "serializer" : {
    type : Function,
    default : _.identity
  },
  "transformer" : {
    type : Function,
    default : _.identity
  },
  "data" : {
    type : Object,
    default : null
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "fieldStatus" : {
    type : Object,
    default : ()=>({})
  },
  "comType" : {
    type : String,
    default : "ti-label"
  },
  "comConf" : {
    type : Object,
    default : ()=>({})
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "screenMode" : {
    type : String,
    default : "auto",
    validator : (val)=>/^(auto|desktop|tablet|phone)$/.test(val)
  },
  "statusIcons" : {
    type : Object,
    default : ()=>({
      spinning : 'fas-spinner fa-spin',
      error    : 'zmdi-alert-polygon',
      warn     : 'zmdi-alert-triangle',
      ok       : 'zmdi-check-circle',
    })
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [String, Number],
    default : "stretch"
  },
  "height" : {
    type : [String, Number],
    default : undefined
  }
}