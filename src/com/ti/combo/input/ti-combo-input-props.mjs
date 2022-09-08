export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "options": {
    type: [String, Array, Function, Ti.Dict],
    default: () => []
  },
  "optionVars": {
    type : Object,
    default: ()=>({})
  },
  "optionFilter": {
    type : [Function, Object, Array],
    default: undefined
  },
  // If dynamic dictionary: options = '#DickName(=varName)'
  // it will use Ti.DictFactory.CheckDynamicDict,
  // The key of the instance name, should explain for the vars set
  "dictVars": {
    type: Object,
    default: ()=>({})
  },
  "valueBy": {
    type: [String, Function],
    default: undefined
  },
  "textBy": {
    type: [String, Function],
    default: undefined
  },
  "iconBy": {
    type: [String, Function],
    default: undefined
  },
  "childrenBy": {
    type: [String, Function],
    default: undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "dropComType": {
    type: String,
    default: undefined
  },
  "dropComConf": {
    type: Object,
    default: undefined
  },
  "mustInList": {
    type: Boolean,
    default: false
  },
  "autoFocusExtended": {
    type: Boolean,
    default: true
  },
  "filter": {
    type: Boolean,
    default: true
  },
  "delay": {
    type: Number,
    default: 500
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "autoI18n": {
    type: Boolean,
    default: true
  },
  "statusIcons": {
    type: Object,
    default: () => ({
      collapse: "zmdi-chevron-down",
      extended: "zmdi-chevron-up"
    })
  },
  "inputValueDisplay": {
    type: [Object, String, Function],
    default: undefined
  },
  "inputPrefixTextDisplay": {
    type: [Object, String, Function],
    default: undefined
  },
  "inputSuffixTextDisplay": {
    type: [Object, String, Function],
    default: undefined
  },
  "dropDisplay": {
    type: [Object, String, Array],
    default: undefined
  },
  "dropItemBorder": {
    type: Boolean,
    default: true
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "keepWidthWhenDrop": {
    type: Boolean,
    default: undefined
  },
  "dropWidth": {
    type: [Number, String],
    default: "box"
  },
  "dropHeight": {
    type: [Number, String],
    default: null
  }
}