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
  // "extendFunctionSet" : {
  //   type : Object,
  //   default : undefined
  // },
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
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "defaultFieldType": {
    type: String,
    default: "String"
  },
  "linkFields": {
    type: Object,
    default: undefined
  },
  "keepTabIndexBy": {
    type: String,
    default: undefined
  },
  "defaultComType": {
    type: String,
    default: "ti-label"
  },
  "autoShowBlank": {
    type: Boolean,
    default: undefined
  },
  "currentTab": {
    type: Number,
    default: 0
  },
  "adjustDelay": {
    type: Number,
    default: 0
  },
  "autoColummGrid": {
    type: [Boolean, Array],
    default: true
  },
  "maxColumnHint": {
    type: Number,
    default: 3
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "bodyClass": {
    type: [String, Object, Array]
  },
  "bodyStyle": {
    type: Object
  },
  "defaultGroupClass": {
    type: [String, Object, Array]
  },
  "mode": {
    type: String,
    default: "all",
    validator: (val) => /^(all|tab)$/.test(val)
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
    default: "bottom",
    validator: (v) => /^(none|top|bottom)$/.test(v)
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
  "width": {
    type: [Number, String],
    default: undefined
  },
  "height": {
    type: [Number, String],
    default: undefined
  }
}