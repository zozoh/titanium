export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "dict": {
    type: [String, Ti.Dict],
    default: null
  },
  "inputValue": null,
  // +1 from the begin
  // -1 from the last
  "maxValueLen": {
    type: Number,
    default: 0
  },
  "valueUnique": {
    type: Boolean,
    default: true
  },
  "tagOptions": {
    type: [Array, Function],
    default: () => []
  },
  "tagMapping": {
    type: Object,
    default: undefined
  },
  "tagExplainMapping": {
    type: Boolean,
    default: false
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "canInput": {
    type: Boolean,
    default: true
  },
  "cancelTagBubble": {
    type: Boolean,
    default: false
  },
  "tagKeyBy": {
    type: [String, Function],
    default: "value"
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "tagItemIconBy": {
    type: [String, Function],
    default: undefined
  },
  "tagItemDefaultIcon": {
    type: String,
    default: null
  },
  "tagOptionDefaultIcon": {
    type: String,
    default: undefined
  },
  "tagItemMaxWidth": {
    type: [String, Number],
    default: undefined
  },
};
