export default {
  "moduleName": {
    type: String,
    default: "main"
  },
  "guiShown": Object,
  //-----------------------------------
  // The Dir Home
  //-----------------------------------
  "dirId": {
    type: String
  },
  "oDir": Object,
  //-----------------------------------
  // The search list
  //-----------------------------------
  "fixedMatch": Object,
  "filter": Object,
  "sorter": Object,
  "list": Array,
  "currentId": [String, Number],
  "checkedIds": Object,
  "pager": Object,
  //-----------------------------------
  // Current Thing Meta/Content
  //-----------------------------------
  "meta": Object,
  "content": String,
  //-----------------------------------
  // Gloable Status
  //-----------------------------------
  "status": {
    type: Object,
    default: () => ({
      "reloading": false,
      "doing": false,
      "saving": false,
      "deleting": false,
      "changed": false,
      "restoring": false,
      "inRecycleBin": false
    })
  },
  "fieldStatus": {
    type: Object,
    default: () => ({})
  },
  //-----------------------------------
  // Customized GUI
  //-----------------------------------
  "objActions": {
    type: Array, default: () => []
  },
  "layout": {
    type: Object, default: () => ({})
  },
  "schema": {
    type: Object, default: () => ({})
  },
  "objMethods": {
    type: Object, default: () => ({})
  },
  //-----------------------------------
  // Global View Setting
  //-----------------------------------
  "viewType": String,
  "exposeHidden": Boolean,
}