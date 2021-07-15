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
    type : Array
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