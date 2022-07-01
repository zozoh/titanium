export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data": {
    type: Object,
    default: undefined
  },
  "fields": {
    type: Array,
    default: () => []
  },
  "fieldStatus": {
    type: Object,
    default: () => ({})
  },
  "onlyFields": {
    type: Boolean,
    default: true
  },
  "omitHiddenFields": {
    type: Boolean,
    default: false
  },
  // merge each time data change
  "fixed": {
    type: Object,
    default: undefined
  },
  "lang": {
    type: String,
    default: "auto" // zh-cn | zh-hk | en-us | en-uk
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "defaultFieldType": {
    type: String,
    default: "String"
  },
  "defaultComType": {
    type: String,
    default: "ti-label"
  },
  "linkFields": {
    type: Object,
    default: undefined
  },
  "keepTabIndexBy": {
    type: String,
    default: undefined
  },
  "autoShowBlank": {
    type: Boolean,
    default: undefined
  },
  "currentTab": {
    type: Number,
    default: 0
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "mode": {
    type: String,
    default: "group",
    validator: (val) => /^(flat|group|tab)$/.test(val)
  },
  "screenMode": {
    type: String,
    default: "auto",
    validator: (val) => /^(auto|desktop|tablet|phone)$/.test(val)
  },
  "tabAt": {
    type: String,
    default: "top-center",
    validator: (v) => /^(top|bottom)-(left|center|right)$/.test(v)
  },
  "fieldBorder": {
    type: String,
    default: "none",
    validator: (v) => /^(none|dashed|solid|dotted)$/.test(v)
  },
  "fieldNameAlign": {
    type: String,
    default: "right",
    validator: (v) => /^(left|right|center)$/.test(v)
  },
  "fieldNameVAlign": {
    type: String,
    default: "center",
    validator: (v) => /^(top|bottom|center)$/.test(v)
  },
  "fieldNameClass": {
    type: [Array, String, Object],
    default: undefined
  },
  "fieldNameStyle": {
    type: Object,
    default: () => ({})
  },
  "fieldNameWrap": {
    type: String,
    default: "auto",
    validator: (v) => /^(auto|wrap|nowrap)$/.test(v)
  },
  "fieldValueWrap": {
    type: String,
    default: "auto",
    validator: (v) => /^(auto|wrap|nowrap)$/.test(v)
  },
  "blankAs": {
    type: Object,
    default: () => ({
      icon: "fab-deezer",
      text: "i18n:empty"
    })
  },
  "icon": {
    type: String,
    default: undefined
  },
  "title": {
    type: String,
    default: undefined
  },
  "statusIcons": {
    type: Object,
    default: () => ({
      spinning: 'fas-spinner fa-spin',
      error: 'zmdi-alert-polygon',
      warn: 'zmdi-alert-triangle',
      ok: 'zmdi-check-circle',
    })
  },
  "spacing": {
    type: String,
    default: "comfy",
    validator: v => /^(comfy|tiny)$/.test(v)
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "fieldNameWidth": {
    type: [Number, String, Array],
    default: () => [
      ["1.5rem", "en-us"],
      ["1.2rem"]
    ]
  },
  "gridColumnHint": {
    type: Array,
    default: () => [
      [4, 1200],
      [3, 1000],
      [2, 720],
      [1]
    ]
  }
}