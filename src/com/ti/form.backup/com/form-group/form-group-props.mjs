export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "type" : {
    type : String,
    default : "Group"
  },
  "icon" : {
    type : String,
    default : null
  },
  "title" : {
    type : String,
    default : null
  },
  "fields" : {
    type : Array,
    default : ()=>[]
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
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "screenMode" : {
    type : String,
    default : "auto",
    validator : (val)=>/^(auto|desktop|tablet|phone)$/.test(val)
  },
  "statusIcons" : {
    spinning : 'fas-spinner fa-spin',
    error    : 'zmdi-alert-polygon',
    warn     : 'zmdi-alert-triangle',
    ok       : 'zmdi-check-circle',
  }
}