export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": null,
  "options": {
    type: [Array, Function, String, Ti.Dict],
    default: () => []
  },
  "fixedOptions": {
    type: [Array, Function, String, Ti.Dict],
    default: () => []
  },
  "valueBy": {
    type: [String, Function],
    default: undefined
  },
  "textBy": {
    type: [String, Function],
    default: undefined
  },
  "iconeBy": {
    type: [String, Function],
    default: undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "readonly": {
    type: Boolean,
    default: false
  },
  "multi": {
    type: Boolean,
    default: false
  },
  "autoToggle": {
    type: Boolean,
    default: true
  },
  // In single mode, to keep at least one item selected,
  // you can set the prop to `false`
  "allowEmpty": {
    type: Boolean,
    default: true
  },
  "autoSplitValue": {
    type: [Boolean, String],
    default: true
  },
  "joinBy": {
    type: [String, Function],
    default: undefined
  },
  "autoValueTip": {
    type: Boolean,
    default: true
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "defaultIcon": {
    type: String,
    default: null
  },
  "emptyAs": {
    default: null
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width": {
    type: [Number, String],
    default: null
  },
  "height": {
    type: [Number, String],
    default: null
  }
};
