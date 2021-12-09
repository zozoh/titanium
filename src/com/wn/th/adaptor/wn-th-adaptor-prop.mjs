export default {
  "moduleName": {
    type: String,
    default: "main"
  },
  "thingSetId": {
    type: String
  },
  //-----------------------------------
  // Current Thing Meta/Content
  //-----------------------------------
  "meta": Object,
  "content": String,
  //-----------------------------------
  // Current Thing Data Files
  //-----------------------------------
  "dataHome": String,
  "dataHomeObj": Object,
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
        "count": 0
      }
    })
  },
  "dataDirCurrentId": {
    type: [String]
  },
  "dataDirCheckedIds": {
    type: Object,
    default: () => ({})
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
  "thingActions": {
    type: Array, default: () => []
  },
  "layout": {
    type: Object, default: () => ({})
  },
  "schema": {
    type: Object, default: () => ({})
  },
  "thingMethods": {
    type: Object, default: () => ({})
  }
}