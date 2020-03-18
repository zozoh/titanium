export default {
  "iconBy" : {
    type : [String, Function],
    default : null
  },
  "indentBy" : {
    type : [String, Function],
    default : null
  },
  "fields" : {
    type : Array,
    default : ()=>[]
  },
  "head" : {
    type : String,
    default : "frozen",
    validator : v =>
      Ti.Util.isNil(v) 
      || /^(frozen|none|normal)$/.test(v)
  },
  "border" : {
    type : String,
    default : "cell",
    validator : v => /^(row|column|cell|none)$/.test(v)
  },
  "autoScrollIntoView" : {
    type : Boolean,
    default : true
  }
}