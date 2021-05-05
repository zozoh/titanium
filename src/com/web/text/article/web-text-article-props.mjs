export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": {
    type: String,
    default: undefined
  },
  "type": {
    type : String,
    default : "html",
    validator : v => /^(html|markdown)$/.test(v)
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "apiTmpl": {
    type: String,
    default: undefined
  },
  "cdnTmpl": {
    type: String,
    default: undefined
  },
  "dftImgSrc": {
    type: String,
    default: undefined
  },
  "downTmpl" : {
    type: String,
    default: undefined
  },
  "afterRedraw": {
    type: [String, Object, Function]
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "theme": {
    type : String,
    default: "nice"
  },
  "loadingAs" : {
    type : Object,
    default : ()=>({
      className : "as-nil-mask as-big",
      icon : undefined,
      text : undefined
    })
  },
  "blankAs" : {
    type : Object,
    default : ()=>({
      comType : "TiLoading",
      comConf : {
        className : "as-nil-mask as-big",
        icon : "fas-coffee",
        text : null
      }
    })
  }
}