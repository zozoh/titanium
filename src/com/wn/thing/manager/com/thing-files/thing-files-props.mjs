export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "dirName" : {
    type : String,
    default : "media"
  },
  "dataHome" : {
    type : String,
    default : null
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "files" : {
    type: Object,
    default: undefined
  },
  "preview" : {
    type : Object,
    default: undefined
  },
  "previewEdit" : {
    type : Object,
    default: undefined
  },
  "actions" : {
    type : Array,
    default : ()=>[{
        "name" : "reloading",
        "type" : "action",
        "icon" : "zmdi-refresh",
        "tip" : "i18n:refresh",
        "altDisplay" : {
          "icon" : "zmdi-refresh zmdi-hc-spin"
        },
        "action" : "$parent:reloadData"
      },{
        "type" : "line"
      }, {
        "name" : "deleting",
        "type" : "action",
        "icon" : "zmdi-delete",
        "text" : "i18n:del",
        "altDisplay" : {
          "icon" : "zmdi-refresh zmdi-hc-spin",
          "text" : "i18n:del-ing"
        },
        "action" : "$parent:doDeleteSelected"
      },{
        "type" : "line"
      },{
        "name" : "upload",
        "type" : "action",
        "icon" : "zmdi-cloud-upload",
        "text" : "i18n:upload",
        //"action" : "commit:main/files/showUploadFilePicker"
        "action" : "$parent:doUploadFiles"
      }]
  },
  "stateLocalKey" : {
    type : String,
    default : null
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "dirNameTip" : {
    type : String,
    default : undefined
    //default : "i18n:thing-files"
  },
  "dirNameComType" : {
    type : String,
    default : "ti-droplist"
  },
  "dirNameOptions" : {
    type : Array,
    default : ()=>[{
      icon  :"zmdi-collection-image",
      text  :"i18n:media",
      value : "media"
    }, {
      icon  :"zmdi-attachment-alt",
      text  :"i18n:attachment",
      value : "attachment"
    }]
  },
  "nilIcon": {
    type: String,
    default: "fas-braille"
  },
  "nilText": {
    type: String,
    default: null
  }
  //-----------------------------------
  // Measure
  //-----------------------------------
}