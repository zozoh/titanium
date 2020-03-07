export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "fields" : {
    type : Array,
    default : ()=>[]
  },
  "data" : {
    type : Object,
    default : undefined
  },
  "fieldStatus" : {
    type : Object,
    default : ()=>({})
  },
  "extendFunctionSet" : {
    type : Object,
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "keepTabIndexBy" : {
    type : String,
    default : null
  },
  "defaultComType" : {
    type : String,
    default : "ti-label"
  },
  "autoShowBlank" : {
    type : Boolean,
    default : true
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "blankAs" : {
    type : Object,
    default : ()=>({
      icon : "zmdi-alert-circle-o",
      text : "i18n:empty-data"
    })
  },
  "icon" : {
    type : String,
    default : null
  },
  "title" : {
    type : String,
    default : null
  },
  "mode" : {
    type : String,
    default : "all",
    validator : (val)=>/^(all|tab)$/.test(val)
  },
  "currentTab" : {
    type : Number,
    default : 0
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
  "spacing" : {
    type : String,
    default : "comfy",
    validator : v => /^(comfy|tiny)$/.test(v)
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  }
}