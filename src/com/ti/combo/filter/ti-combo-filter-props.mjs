const _M  = {
  "form" : {
    type : Object,
    default : null
  },
  "autoCollapse" : {
    type : Boolean,
    default : false
  },
  "statusIcons" : {
    type : Object,
    default : ()=>({
      collapse : "zmdi-chevron-down",
      extended : "zmdi-chevron-up"
    })
  },
  "autoFocusExtended": {
    type: Boolean,
    default: true
  },
  "spacing" : {
    type : String,
    default : "tiny",
    validator : v => /^(none|comfy|tiny)$/.test(v)
  },
  "dropWidth" : {
    type : [Number, String],
    default : "box"
  },
  "dropHeight" : {
    type : [Number, String],
    default : null
  }
}
export default _M;