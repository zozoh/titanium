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
  "status" : {
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
  "width" : {
    type : [String, Number],
    default : "stretch"
  },
  "undefinedAs" : {
    default : undefined
  },
  "nullAs" : {
    default : null
  },
  "nanAs" : {
    type : Number,
    default : -1
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