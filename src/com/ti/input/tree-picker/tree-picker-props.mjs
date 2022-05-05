export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": {
    type: [String, Array, Number],
    default: undefined
  },
  // The given tree data
  "options": {
    type: [Object, Function, String]
  },
  "vars": {
    type: Object
  },
  "dict": {
    type: String
  },
  "format": {
    type: Function
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "onlyLeaf": {
    type: Boolean
  },
  "multi": {
    type: Boolean
  },
  "defaultOpenDepth": {
    type: Number,
    default: 5
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "dialog": {
    type: Object
  },
  "tree": {
    type: Object
  },
  "placeholder": {
    type: String
  },
  "prefixIcon": {
    type: String,
    default: "zmdi-minus"
  },
  "suffixIcon": {
    type: String,
    default: "fas-cog"
  }
}