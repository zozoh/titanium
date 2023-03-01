export default {
  "moduleName": {
    type: String,
    default: "main",
  },
  "guiShown": Object,
  "rootState": Object,
  //-----------------------------------
  // The Thingset
  //-----------------------------------
  "thingSetId": {
    type: String,
  },
  "oTs": Object,
  "load": Object,
  //-----------------------------------
  // The search list
  //-----------------------------------
  "aggQuery": String,
  "agg": Object,
  "aggResult": Object,
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
  "contentData": undefined,
  //-----------------------------------
  // Current Thing Data Files
  //-----------------------------------
  "dataHome": String,
  "dataDirName": String,
  /*
  Current DataDir File List with pager
  */
  "dataDirFiles": {
    type: Object,
    default: () => ({
      "list": [],
      "pager": {
        "pn": 1,
        "pgsz": 50,
        "pgc": 0,
        "sum": 0,
        "skip": 0,
        "count": 0,
      },
    }),
  },
  "dataDirCurrentId": {
    type: [String],
  },
  "dataDirCheckedIds": {
    type: Object,
    default: () => ({}),
  },
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
      "inRecycleBin": false,
    }),
  },
  "fieldStatus": {
    type: Object,
    default: () => ({}),
  },
  //-----------------------------------
  // Customized GUI
  //-----------------------------------
  "thingActions": {
    type: Array,
    default: () => [],
  },
  "layout": {
    type: Object,
    default: () => ({}),
  },
  "schema": {
    type: Object,
    default: () => ({}),
  },
  "thingMethods": {
    type: Object,
    default: () => ({}),
  },
  //-----------------------------------
  // Getters
  //-----------------------------------
  "getters": {
    type: Object,
    default: () => ({}),
  },
  //-----------------------------------
  // Global View Setting
  //-----------------------------------
  "viewType": String,
  "exposeHidden": Boolean,
};
