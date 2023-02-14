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
  // merge each time data change
  "fixed": {
    type: Object,
    default: undefined
  },
  // Batch fields hint
  "batchHint": {
    type: Array,
    default: undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "readonly": {
    type: Boolean,
    default: false
  },
  "batchReadonly": {
    type: [Function, Array, Object]
  },
  // if call getData, which will return:
  // - `all` : all data will be taken and return
  // - `diff` : only changed field will be taken
  // - `auto` : `diff` if `notifyMode` is `confirm`, else as `all`
  "dataMode": {
    type: String,
    default: "auto",
    validator: v => /^(all|diff|auto)$/.test(v)
  },
  "onlyFields": {
    type: Boolean,
    default: true
  },
  "omitHiddenFields": {
    type: Boolean,
    default: false
  },
  // When field change, how to notify:
  // - `immediate` : notify immediately
  // - `confirm` : show confirm button, and to confirm change
  // - `none` : never notify
  // - `auto` : `none` if readonly, else as `immediate`
  "notifyMode": {
    type: String,
    default: "auto",
    validator: v => /^(immediate|confirm|none|auto)$/.test(v)
  },
  "batchNotifyMode": {
    type: String,
    default: "confirm",
    validator: v => /^(immediate|confirm|none)$/.test(v)
  },
  // If notifyMode=="immediate", when field change,
  // notify the data change 
  "notifyDataImmediate": {
    type: Boolean,
    default: true
  },
  // If current is readonly, try to gen display setting by comType
  "autoReadonlyDisplay": {
    type: Boolean,
    default: true
  },
  "ignoreAutoReadonly": {
    type: [String, Function]
  },
  "defaultFieldType": {
    type: String,
    default: "String"
  },
  "defaultComType": {
    type: String,
    default: "ti-label"
  },
  "defaultComConf": {
    type: Object,
    default: () => ({})
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
  //  - "form:edit"
  //  - "form:readonly"
  //  - "form:confirm"
  //  - "form:reset"
  "actionButtonSetup": {
    type: Array,
    default: () => []
  },
  "actionMenuItems": {
    type: Array,
    default: () => []
  },
  // If use form in GuiPanel, should delay a while 
  // for waiting the transision done
  "adjustDelay": {
    type: Number,
    default: 0
  },
  "tipAsPopIcon": {
    type: Boolean,
    default: false
  },
  /*
  true  => {text: "${title}: ${name}"}
  "xxx" => {text: "xxx"}
  {
    text: "${title}: ${name}",
    vars: {...},  // more vars, built-in:(title, name)
    mode: "V"
  }
  */
  "autoFieldNameTip": {
    type: [Boolean,String,Object],
    default: false
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
    default: "nowrap",
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
  "fieldValueVAlign": {
    type: String,
    default: "center",
    validator: (v) => /^(top|bottom|center)$/.test(v)
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
  //......................................
  // Setup Menu
  //......................................
  // If null, it will flat show setup/reset button
  "setupMoreIcon": {
    type: String,
    default: "fas-cog"
  },
  "setupFieldsAction": {
    type: Object
  },
  "setupFieldsCleanAction": {
    type: Object
  },
  "setupMenuAt": {
    type: String,
    default: "bottom-right",
    validator: (v) => /^(top|bottom)-(left|right)$/.test(v)
  },
  "setupMenuConf": {
    type: Object,
    default: () => {
      /*@see ti-actionbar */
    }
  },
  //......................................
  // Action button
  //......................................
  "submitButton": {
    type: Object
  },
  "editButton": {
    type: Object
  },
  "confirmButton": {
    type: Object
  },
  "resetButton": {
    type: Object
  },
  //......................................
  "actionButtonConf": {
    type: Object,
    default: () => {
      /*className, size, align ... @see ti-button*/
    }
  },
  //......................................
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