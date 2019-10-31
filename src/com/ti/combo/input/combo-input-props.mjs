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
  "format" : {
    type : [String, Array, Object],
    default : undefined
  },
  "valueCase" : {
    type : String,
    default : null,
    validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
  },
  "defaultTipKey" : {
    type : String,
    default : null
  },
  "placeholder" : {
    type : [String, Number],
    default : null
  },
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
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
  "mapping" : {
    type : Object,
    default : ()=>({})
  },
  "prefixIcon" : {
    type : String,
    default : "zmdi-minus"
  },
  "prefixHoverIcon" : {
    type : String,
    default : undefined
  },
  "prefixIconForClean" : {
    type : Boolean,
    default : true
  },
  "itemIcon" : {
    type : String,
    default : null
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
    default : false
  },
  "boxRawValue" : {
    type : Boolean,
    default : false
  },
  "cached" : {
    type : Boolean,
    default : true
  },
  "autoFocusExtended" : {
    type : Boolean,
    default : true
  }
}