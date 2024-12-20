export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": {
    type: [Array, String],
    default: () => []
  },
  "valueType": {
    type: String,
    default: "Array",
    validator: (v) => /^(Array|String)$/.test(v)
  },
  "vars": {
    type: Object,
    default: () => ({})
  },
  "newItemData": {
    type: Object
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "form": {
    type: [Object, Array],
    default: () => ({})
  },
  "formType": {
    type: String,
    default: "TiForm"
  },
  "quickTable": {
    type: [Boolean, String, Function, Object, Array],
    default: false
  },
  "list": {
    type: [Object, Array],
    default: () => ({})
  },
  "dialog": {
    type: [Object, Array],
    default: () => ({
      title: "i18n:edit",
      width: 500,
      height: 500
    })
  },
  "newItemIdBy": {
    type: [String, Object, Function]
  },
  "newItemIdKey": {
    type: String,
    default: "id"
  },
  "onAddNewItem": {
    type: [String, Function]
  },
  "moreActions": {
    type: Array
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "blankAs": {
    type: Object
  },
  "actionAlign": {
    type: String,
    default: undefined
  },
  "newItemIcon": {
    type: String,
    default: "fas-plus"
  },
  "newItemText": {
    type: String,
    default: "i18n:new-item"
  },
  "itemEditable": {
    type: Boolean,
    default: true
  },
  "fitField": {
    type: Boolean,
    default: true
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
