export default {
  "className" : {
    type : String,
    default : null
  },
  "canInput" : {
    type : Boolean,
    default : true
  },
  "value" : null,
  "valueCase" : {
    type : String,
    default : null,
    validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
  },
  // +1 from the begin
  // -1 from the last
  "maxValueLen" : {
    type : Number,
    default : 0
  },
  "valueUnique" : {
    type : Boolean,
    default : true
  },
  "defaultTipKey" : {
    type : String,
    default : null
  },
  //---------------------------------
  "placeholder" : undefined,
  "hideBorder"  : undefined,
  "width"       : undefined,
  //---------------------------------
  "inputWidth" : {
    type : [Number, String],
    default : null
  },
  "inputHeight" : {
    type : [Number, String],
    default : null
  },
  "dropWidth" : {
    type : [Number, String],
    default : "box"
  },
  "dropHeight" : {
    type : [Number, String],
    default : null
  },
  "getItemBy" : {
    type : Function,
    default : null
  },
  "options" : {
    type : [Array, Function],
    default : ()=>[]
  },
  "queryWhenInput" : {
    type : Boolean,
    default : false
  },
  "reloadWhenChanged" : {
    type : Number,
    default : 0
  },
  "mapping" : {
    type : Object,
    default : ()=>({})
  },
  "prefixIcon" : {
    type : String,
    default : "far-trash-alt"
  },
  "prefixHoverIcon" : {
    type : String,
    default : undefined
  },
  "itemIcon" : {
    type : String,
    default : null
  },
  "focusToOpen" : {
    type : Boolean,
    default : true
  },
  "loadingIcon" : {
    type : String,
    default : "zmdi-settings zmdi-hc-spin"
  },
  "statusIcons" : {
    type : Object,
    default : ()=>({
      collapse : "zmdi-chevron-down",
      extended : "zmdi-chevron-up"
    })
  },
  "matchText" : {
    type : String,
    default : "equal",
    validator : (mt)=>{
      return Ti.Util.isNil(mt)
      ||/^(off|equal|starts|contains)$/.test(mt)
    }
  },
  "matchValue" : {
    type : String,
    default : "equal",
    validator : (mt)=>{
      return Ti.Util.isNil(mt)
      ||/^(off|equal|starts|contains)$/.test(mt)
    }
  },
  "mustInList" : {
    type : Boolean,
    default : true
  },
  "cancelTagBubble" : {
    type : Boolean,
    default : false
  },
  "cached" : {
    type : Boolean,
    default : true
  },
  "collapseChanged" : {
    type : Boolean,
    default : true
  },
  "autoFocusExtended" : {
    type : Boolean,
    default : true
  }
}