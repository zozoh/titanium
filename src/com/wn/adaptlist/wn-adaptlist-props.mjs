export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "meta" : {
    type : Object,
    default : null
  },
  // {list:[], pager:{..}}
  "data" : {
    type : [Object, Array],
    default : null
  },
  "currentId" : {
    type : String,
    default : null
  },
  "checkedIds" : {
    type : [Array, Object],
    default : undefined
  },
  "changedId" : {
    type : String,
    default : null
  },
  "status" : {
    type : Object,
    default : ()=>({
      reloading : false
    })
  },
  "itemTitleKey" : {
    type : String,
    default : "title"
  },
  // Fixed meta append after uploaded.
  "uploadMeta": {
    type: Object
  },
  // Define the upload target
  "uploadTarget": {
    type: [String, Function],
    default: "->id:${oDir.id}"
  },
  "uploadMode": {
    type: String,
    default: "a"
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  // Drop files to upload
  "droppable" : {
    type : Boolean,
    default : true
  },
  // multi-selectable
  // effected when selectable is true
  "multi" : {
    type : Boolean,
    default : true
  },
  "checkable" : {
    type : Boolean,
    default : true
  },
  "blurable" : {
    type : Boolean,
    default : true
  },
  "selectable" : {
    type : Boolean,
    default : true
  },
  // aspect: list item spacing
  // `xs|sm|md|lg|xl`
  "spacing" : {
    type : String,
    default : "sm"
  },
  "routers" : {
    type : Object,
    default : ()=>({
      "reload" : "dispatch:main/reload"
    })
  },
  "listConf" : {
    type : Object
  },
  "wallViewConf"  : {
    type : Object
  },
  "listViewConf"  : {
    type : Object
  },
  "tableViewConf" : {
    type : Object
  },
  "acceptUpload" : {
    type: [Array, String]
  },
  "exposeHidden" : {
    type : Boolean,
  },
  "viewType" : {
    type : String,
    default : "wall"
  },
  "avaViewTypes" : {
    type : Array,
    default : ()=>["wall", "table", "list"]
  },
  "listDisplay" : {
    type : [Array, String, Object],
    default: ()=>["@<thumb>", "title|nm::flex-auto", "nm::as-tip-block"]
  },
  "tableFields" : {
    type : Array,
    default : ()=>["title", "c", "g", "tp", "len", "lm"]
  },
  "moveToConf" : {
    type : Object
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "rowNumberBase": {
    type: Number,
    default: undefined
  },
  "itemClassName" : {
    type : String
  },
  "itemBadges" : {
    type : [Object, Function]
  },
  "viewTypeIcons" : {
    type : Object,
    default : ()=>({
      "wall"  : "zmdi-view-module",
      "table" : "zmdi-view-subtitles",
      "list"  : "zmdi-view-headline"
    })
  },
  //-----------------------------------
  // Callback
  //-----------------------------------
  "beforeUpload" : {
    type: Function
  },
  "onViewTypeChange" : {
    type: Function,
  }
}