export default {
  "className" : {
    type : String,
    default : null
  },
  "mode" : {
    type : String,
    default : "input",
    validator : (md)=>/^(input|multi|droplist)$/.test(md)
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
  "query" : {
    type : Object,
    default : ()=>({})
  },
  "options" : {
    type : [Array, Function],
    default : ()=>[]
  },
  "mapping" : {
    type : Object,
    default : ()=>({})
  },
  "itemIcon" : {
    type : String,
    default : null
  },
  "focusToOpen" : {
    type : Boolean,
    default : true
  },
  "statusIcons" : {
    type : Object,
    default : ()=>({
      collapse : "zmdi-chevron-down",
      extended : "zmdi-chevron-up"
    })
  },
  "matchText" : {
    type : Boolean,
    default : true
  },
  "valueMustInList" : {
    type : Boolean,
    default : false
  },
  "inputEditValue" : {
    type : Boolean,
    default : false
  },
  "cached" : {
    type : Boolean,
    default : false
  },
  "autoFocusExtended" : {
    type : Boolean,
    default : true
  }
}