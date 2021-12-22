export default {
  "iconBy": {
    type: [String, Function],
    default: null
  },
  "indentBy": {
    type: [String, Function],
    default: null
  },
  "itemClassName": undefined,
  "display": {
    type: [Object, String, Array],
    default: () => ({
      key: "..",
      comType: "ti-label"
    })
  },
  "border": {
    type: Boolean,
    default: true
  },
  "autoScrollIntoView": {
    type: Boolean,
    default: true
  }
}