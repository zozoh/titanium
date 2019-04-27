export default {
  "type" : {
    type : String,
    default : "Group"
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
  "undefinedAs" : {
    default : undefined
  },
  "nullAs" : {
    default : null
  },
  "comType" : {
    type : String,
    default : "ti-form-input"
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
    spinning : 'fas-spinner fa-spin',
    error    : 'zmdi-alert-polygon',
    warn     : 'zmdi-alert-triangle',
    ok       : 'zmdi-check-circle',
  }
}