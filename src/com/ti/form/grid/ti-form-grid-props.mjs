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
  "currentTab": {
    type: Number,
    default: 0
  },
  "keepTabIndexBy": {
    type: String,
    default: undefined
  },
  "autoShowBlank": {
    type: Boolean,
    default: undefined
  },
  "canCustomizedFields": {
    type: Boolean,
    default: false
  },
  "keepCustomizedTo": {
    type: String,
    default: undefined
  },
  // Only those fields will be shown
  "whiteFields": {
    type: Array,
  },
  // Those fields will be ignore
  "blackFields": {
    type: Array,
  },
  "canSubmit": {
    type: Boolean,
    default: false
  },
  // More customized actions
  // TiButton.setup 
  // <BuiltIn actions>
  //  - "form:setup:open"
  //  - "form:setup:clean"
  //  - "form:submit"
  //  - "form:reset"
  //  - "form:edit"
  //  - "form:readonly"
  "actionButtonSetup": {
    type: Array,
    default: () => []
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "mode": {
    type: String,
    default: "group", // compated with old form.mode == all
    validator: (val) => /^(flat|group|tab|all)$/.test(val)
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
  "tabBodyStyle": {
    type: Object
  },
  "fieldBorder": {
    type: String,
    default: "dashed",
    validator: (v) => /^(none|dashed|solid|dotted)$/.test(v)
  },
  "fieldNameAlign": {
    type: String,
    default: "auto",
    validator: (v) => /^(auto|left|right|center|justify)$/.test(v)
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
    default: "wrap",
    validator: (v) => /^(wrap|nowrap)$/.test(v)
  },
  "fieldValueClass": {
    type: [Array, String, Object],
    default: undefined
  },
  "fieldValueStyle": {
    type: Object,
    default: () => ({})
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
  // TiButton.className
  "actionClassName": {
    type: [String, Array, Object],
  },
  // TiButton.size
  "actionSize": {
    type: String,
  },
  // TiButton.align
  "actionAlign": {
    type: String,
  },
  "submitButton": {
    type: Object,
    default: () => ({
      text: "i18n:submit",
    })
  },
  "setupButton": {
    type: Object,
    default: () => ({
      icon: "fas-cog",
      text: "i18n:setup-fields"
    })
  },
  "setupCleanButton": {
    type: Object,
    default: () => ({
      text: "i18n:setup-reset"
    })
  },
  "customizeDialog": {
    type: Object,
    default: () => ({
      title: "i18n:choose-fields",
      width: "6.4rem",
      height: "90%",
      position: "bottom"
    })
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "fieldNameMaxWidth": {
    type: [Number, String, Array],
  },
  "gridColumnHint": {
    type: [Number, String, Array],
    default: () => [
      [4, 1280],
      [3, 960],
      [2, 640],
      [1, 320],
      0
    ]
  }
}