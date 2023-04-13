const _M = {
  //...............................................
  // Data
  //...............................................
  "value": {
    type: String,
    default: undefined
  },
  "blank": {
    type: Boolean,
    default: undefined
  },
  //...............................................
  // Behavior
  //...............................................
  "mode": {
    type: String
  },
  "mime": {
    type: String
  },
  "readonly": {
    type: Boolean,
    defaula: false
  },
  //...............................................
  // Aspact
  //...............................................
  "theme": {
    type: String,
    default: "auto"
    //default : "monokai"
  },
  "options": {
    type: Object,
    default: () => ({
      fontFamily: "Consolas, 'Courier New', monospace",
      lineHeight: "1.5em",
      fontSize: "14px"
    })
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
      className: "as-nil-mask as-big-mask",
      icon: "far-keyboard",
      text: "i18n:empty"
    })
  }
};
export default _M;
