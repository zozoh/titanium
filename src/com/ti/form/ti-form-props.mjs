export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data" : {
    type : Object,
    default : undefined
  },
  "fields" : {
    type : Array,
    default : ()=>[]
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
    default : undefined
  },
  "currentTab" : {
    type : Number,
    default : 0
  },
  "adjustDelay" : {
    type : Number,
    default : 0
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "mode" : {
    type : String,
    default : "all",
    validator : (val)=>/^(all|tab)$/.test(val)
  },
  "tabAt" : {
    type : String,
    default : "top-center",
    validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
  },
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