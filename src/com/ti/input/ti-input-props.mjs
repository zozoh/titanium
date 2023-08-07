const COM_TYPE = "TiInput";
export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": undefined,
  "format": undefined,
  "tidyBy": Function,
  "valueCase": {
    type: String,
    default: undefined,
    validator: (cs) => Ti.Util.isNil(cs) || Ti.S.isValidCase(cs)
  },
  "trimed": {
    type: Boolean,
    default: true
  },
  "autoJsValue": {
    type: Boolean,
    default: false
  },
  /* {test:AutoMatch, message} */
  "validator": {
    type: Object
  },
  "valueTip": {
    type: [String, Object]
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "emptyAsNull": {
    type: Boolean,
    default: Ti.Config.getComProp(COM_TYPE, "emptyAsNull", true)
  },
  "readonly": {
    type: Boolean,
    default: false
  },
  "focused": {
    type: Boolean,
    default: false
  },
  "hover": {
    type: [Array, String],
    default: () => ["prefixIcon", "suffixIcon"]
  },
  "prefixIconForClean": {
    type: Boolean,
    default: true
  },
  "autoSelect": {
    type: Boolean,
    default: undefined
  },
  "prefixIconNotifyName": {
    type: String,
    default: "prefix:icon"
  },
  "prefixTextNotifyName": {
    type: String,
    default: "prefix:text"
  },
  "suffixIconNotifyName": {
    type: String,
    default: "suffix:icon"
  },
  "suffixTextNotifyName": {
    type: String,
    default: "suffix:text"
  },
  "enterKeyNotifyName": {
    type: String,
    default: "key:enter:fired"
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder": {
    type: [String, Number],
    default: undefined
  },
  "autoI18n": {
    type: Boolean,
    default: false
  },
  "hideBorder": {
    type: Boolean,
    default: false
  },
  "prefixIcon": {
    type: [String, Object, Boolean],
    default: undefined
  },
  "prefixHoverIcon": {
    type: String,
    default: "zmdi-close-circle"
  },
  "prefixText": {
    type: [String, Number],
    default: undefined
  },
  "suffixIcon": {
    type: [String, Object],
    default: undefined
  },
  "suffixText": {
    type: [String, Number],
    default: undefined
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
};
