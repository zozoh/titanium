const _M = {
  //...............................................
  // Data
  //...............................................
  "mediaBase" : {
    type : String,
    default : undefined
  },
  "value" : {
    type : String,
    default : undefined
  },
  //...............................................
  // Behavior
  //...............................................
  // Ext-toolbar item defination
  "actions": {
    type: Object,
    default: ()=>({})
  },
  "toolbar" : {
    type : [Boolean, Array, String],
    default : true
  },
  "debugMode" : {
    type : Boolean,
    default : false
  },
  "readonly" : {
    type : Boolean,
    default : false
  },
  "tinymce" : {
    type : Object,
    default: ()=>({})
  },
  "tinymceSetup" : {
    type : Function,
    default : undefined
  },
  //...............................................
  // Aspact
  //...............................................
  "lang" : {
    type : String,
    default : "zh-cn"
  },
  "placeholder" : {
    type : String,
    default : "i18n:blank"
  },
  "theme" : {
    type : String,
    default : "nice"
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