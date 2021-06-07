export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": {
    type: String,
    default: undefined
  },
  "type": {
    type: String,
    default: "html",
    validator: v => /^(text|html|markdown|text\/(plain|html|markdown))$/.test(v)
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
  "downTmpl": {
    type: String,
    default: undefined
  },
  "fbAlbumApiTmpl": {
    type: String,
    default: undefined
  },
  "ytPlayerTmpl": {
    type: String,
    default: "https://www.youtube.com/watch?v=${id}"
  },
  "afterRedraw": {
    type: [String, Object, Function]
  },
  "redrawnNotifyName": {
    type: String,
    default: "content:redrawn"
  },
  "whenReady": {
    type: [String, Object, Function]
  },
  "readyNotifyName": {
    type: String,
    default: "content:ready"
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "theme": {
    type: String,
    default: "nice"
  },
  "loadingAs": {
    type: Object,
    default: () => ({
      className: "as-nil-mask as-big-mask",
      icon: "fas-spinner fa-spin",
      text: "i18n:loading"
    })
  },
  "blankAs": {
    type: Object,
    default: () => ({
      comType: "TiLoading",
      comConf: {
        className: "as-nil-mask as-big",
        icon: "fas-coffee",
        text: null
      }
    })
  }
}