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
  // 用例判断 visiblity 的上下文变量
  // 会在 FormVars 里与 myData 融合
  "vars": {
    type: Object,
    default: undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "batchMode": {
    type: Boolean,
    default: false
  },
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
    validator: (v) => /^(all|diff|auto)$/.test(v)
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
  // - `immediate` : notify immediately both field and data
  // - `data` : notify immediately only data
  // - `field` : notify immediately only field
  // - `confirm` : show confirm button, and to confirm change
  // - `none` : never notify
  // - `auto` : `none` if readonly, else as `immediate`
  "notifyMode": {
    type: String,
    default: "auto",
    validator: (v) => /^(immediate|data|field|confirm|none|auto)$/.test(v)
  },
  "batchNotifyMode": {
    type: String,
    default: "confirm",
    validator: (v) => /^(immediate|data|field|confirm|none)$/.test(v)
  },
  // 启动这个选择，再批量编辑模式，启用一个字段强制编辑，会通知父控件，让父控件
  // 来决定哪些字段可以启用（通过 batchEnableFields）
  // 默认的会由表单自动决定
  "batchEnableWatch": {
    type: Boolean,
    default: false
  },
  "batchEnableFields": {
    type: Array
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
    type: Array
  },
  // Those fields will be ignore
  "blackFields": {
    type: Array
  },
  "canSubmit": {
    type: Boolean,
    default: false
  },
  // 当表单是 confirm 模式提交时，会自动检查 required 字段
  // 如果仍然有字段没填写，就会拒绝 confirm
  // 为本选项设置一个询问信息，那么控件会用这个信息提示用户
  // 如果用户选择 yes，则会强制 confirm
  "confirmWithConfirm": {
    type: String,
    default: undefined
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
    default: true
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
    type: [Boolean, String, Object],
    default: true
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
  "titleClass": {
    type: String,
    default: undefined
  },
  "statusIcons": {
    type: Object,
    default: () => ({
      spinning: "fas-spinner fa-spin",
      error: "zmdi-alert-polygon",
      warn: "zmdi-alert-triangle",
      ok: "zmdi-check-circle"
    })
  },
  "spacing": {
    type: String,
    default: "comfy",
    validator: (v) => /^(comfy|tiny)$/.test(v)
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
  "actionBarAt": {
    type: String,
    default: "bottom",
    validator: (v) => /^(top|bottom)$/.test(v)
  },
  "actionAlign": {
    type: String,
    default: "center",
    validator: (v) => /^(left|center|right)$/.test(v)
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
    type: [Number, String, Array]
  },
  "gridColumnHint": {
    type: [Number, String, Array],
    default: () => [[4, 1280], [3, 960], [2, 640], [1, 320], 0]
  }
};
