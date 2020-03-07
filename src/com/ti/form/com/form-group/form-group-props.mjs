export default {
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
  "fieldStatus" : {
    type : Object,
    default : ()=>({})
  },
  "statusIcons" : {
    spinning : 'fas-spinner fa-spin',
    error    : 'zmdi-alert-polygon',
    warn     : 'zmdi-alert-triangle',
    ok       : 'zmdi-check-circle',
  }
}