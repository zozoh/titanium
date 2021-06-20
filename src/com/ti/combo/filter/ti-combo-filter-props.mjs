const _M = {
  "major": {
    type: Object,
    default: undefined
  },
  "majorKey": {
    type: String,
    default: undefined
  },
  "form": {
    type: Object,
    default: undefined
  },
  "autoCollapse": {
    type: Boolean,
    default: false
  },
  "statusIcons": {
    type: Object,
    default: () => ({
      collapse: "zmdi-chevron-down",
      extended: "zmdi-chevron-up"
    })
  },
  "autoFocusExtended": {
    type: Boolean,
    default: true
  },
  "spacing": {
    type: String,
    default: "tiny",
    validator: v => /^(none|comfy|tiny)$/.test(v)
  },
  "dropWidth": {
    type: [Number, String],
    default: "box"
  },
  "dropHeight": {
    type: [Number, String],
    default: undefined
  }
}
export default _M;