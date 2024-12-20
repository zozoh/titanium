const _M = {
  //...............................................
  // Data
  //...............................................
  "mediaBase": {
    type: String,
    default: undefined
  },
  "value": {
    type: String,
    default: undefined
  },
  "loading": {
    type: Boolean,
    default: false
  },
  "nilContent": {
    type: Boolean,
    default: false
  },
  //...............................................
  // Behavior
  //...............................................
  // Ext-toolbar item defination
  "toolbar": {
    type: [Boolean, Array, String],
    default: true
  },
  "plugins": {
    type: Array,
    default: () => []
  },
  "pluginUrl": {
    type: [String, Function],
    default: undefined
  },
  "readonly": {
    type: Boolean,
    default: false
  },
  "tinyConfig": {
    type: Object,
    default: () => ({})
  },
  "tinySetup": {
    type: Function,
    default: undefined
  },
  // Sometimes, put the editor in panel, the animation will cause
  // the editing area invalid. we need a delay a while, then rendering the editor.
  "delayInit": {
    type: Number,
    default: 0
  },
  //...............................................
  // Aspact
  //...............................................
  "lang": {
    type: String,
    default: "zh-cn"
  },
  "placeholder": {
    type: String,
    default: "i18n:blank"
  },
  "theme": {
    type: String,
    default: "light"
  },
  "loadingAs": {
    type: Object,
    default: () => ({
      className: "as-nil-mask as-big-mask",
      icon: undefined,
      text: undefined
    })
  },
  "blankAs": {
    type: Object,
    default: () => ({
      comType: "TiLoading",
      comConf: {
        className: "as-nil-mask as-big-mask",
        icon: "fas-coffee",
        text: null
      }
    })
  }
}
export default _M;