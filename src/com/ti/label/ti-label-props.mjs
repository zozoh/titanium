export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": null,
  "dict": {
    type: [String, Ti.Dict],
    default: undefined
  },
  // @see TiComboInputProp#dictVars
  "dictVars": {
    type: Object,
    default: () => ({})
  },
  "valueMustInDict": {
    type: Boolean,
    default: true
  },
  "valueCase": {
    type: String,
    default: undefined,
    validator: (cs) => Ti.Util.isNil(cs) || Ti.S.isValidCase(cs)
  },
  "trimed": {
    type: Boolean,
    default: true
  },
  // Context vars for prop format
  "vars": {
    type: Object
  },
  "format": {
    type: [String, Function, Object],
    default: undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "href": {
    type: [String, Function],
    default: undefined
  },
  "newTab": {
    type: Boolean,
    default: false
  },
  "editable": {
    type: Boolean,
    default: false
  },
  "navigable": {
    type: Boolean,
    default: false
  },
  "hover": {
    type: [Array, String],
    default: () => ["suffixIcon"]
  },
  "suffixIconForCopy": {
    type: Boolean,
    default: false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder": {
    type: [String, Number],
    default: "i18n:nil"
  },
  "valueTip": {
    type: [Boolean, String, Object]
  },
  "autoI18n": {
    type: Boolean,
    default: true
  },
  "prefixIcon": {
    type: String,
    default: undefined
  },
  "prefixText": {
    type: [String, Number],
    default: undefined
  },
  "suffixText": {
    type: [String, Number],
    default: undefined
  },
  "suffixIcon": {
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
  },
  "valueMaxWidth": {
    type: [Number, String],
    default: undefined
  }
};
