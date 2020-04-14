export default {
  "type" : {
    type : String,
    default : "String"
  },
  "disabled" : {
    type : Boolean,
    default : false
  },
  "hidden" : {
    type : Boolean,
    default : false
  },
  "name" : {
    type : [String, Array],
    default : null
  },
  "icon" : {
    type : String,
    default : null
  },
  "fieldStatus" : {
    type : Object,
    default : ()=>({})
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
  "width" : {
    type : [String, Number],
    default : "stretch"
  },
  "height" : {
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
  "funcSet" : {
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
  "statusIcons" : {
    type : Object,
    default : ()=>({
      spinning : 'fas-spinner fa-spin',
      error    : 'zmdi-alert-polygon',
      warn     : 'zmdi-alert-triangle',
      ok       : 'zmdi-check-circle',
    })
  }
}