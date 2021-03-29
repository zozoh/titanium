const _M = {
  //...............................................
  // Data
  //...............................................
  "value" : {
    type : String,
    default : undefined
  },
  //...............................................
  // Behavior
  //...............................................
  // Ext-toolbar item defination
  //...............................................
  // Aspact
  //...............................................
  "placeholder" : {
    type : String,
    default : "i18n:blank"
  },
  "theme" : {
    type : String,
    default : "light"
  },
  "loadingAs" : {
    type : Object,
    default : ()=>({
      className : "as-nil-mask as-big-mask",
      icon : undefined,
      text : undefined
    })
  },
  "blankAs" : {
    type : Object,
    default : ()=>({
      comType : "TiLoading",
      comConf : {
        className : "as-nil-mask as-big-mask",
        icon : "fas-coffee",
        text : null
      }
    })
  }
}
export default _M;