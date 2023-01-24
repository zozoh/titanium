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
  "ignoreBlank": {
    type: Boolean,
    default: false
  },
  // If <p> is blank text, find the empty span and insert `&nbsp;`
  "inflateBlankP": {
    type: Boolean,
    default: true
  },
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
  "whenAlbumBeforeClose": {
    type: Function
  },
  "albumBeforeCloseNotifyName": {
    type: String
  },
  "whenAlbumClosed": {
    type: Function
  },
  "albumClosedNotifyName": {
    type: String
  },
  "photoGalleryShowOpener": {
    type: Boolean,
    default: true
  },
  "deconTable": {
    type: Boolean,
    default: false
  },
  "mediaRawSize": {
    type: Boolean,
    default: false
  },
  "showImageGallery": {
    type: Boolean,
    default: true
  },
  // You can write js:alert() in @href, it will be 
  // translate to javascript:alert()
  "allowJsHref": {
    type: Boolean,
    default: false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "articleStyle": {
    type: Object
  },
  "theme": {
    type: String,
    default: "nice"
  },
  "loadingAs": {
    type: Object,
    default: () => ({
      className: "as-nil-mask as-big",
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