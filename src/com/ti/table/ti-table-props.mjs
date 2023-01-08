export default {
  "iconBy": {
    type: [String, Function],
    default: null
  },
  "indentBy": {
    type: [String, Function],
    default: null
  },
  "fields": {
    type: Array,
    default: () => []
  },
  "head": {
    type: String,
    default: "frozen",
    validator: v =>
      Ti.Util.isNil(v)
      || /^(frozen|none|normal)$/.test(v)
  },
  "border": {
    type: String,
    default: "cell",
    validator: v => /^(row|column|cell|none)$/.test(v)
  },
  "autoScrollIntoView": {
    type: Boolean,
    default: true
  },
  // Virtual render neccessary rows (subset of the larget list)
  // we need a hint of row height
  "virtualRowHeight": {
    type: Number,
    default: 40
  },
  "headDisplay": {
    type: [String, Object, Array],
    default: undefined
  },
  "columnResizable": {
    type: Boolean,
    default: false
  },
  "canCustomizedFields": {
    type: Boolean,
    default: false
  },
  "keepCustomizedTo": {
    type: String,
    default: undefined
  },
  "checkIcons": {
    type: Object,
    default: () => ({
      on: "fas-check-square",
      off: "far-square"
    })
  }
}