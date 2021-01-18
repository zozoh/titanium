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
  "keeyHiddenBy" : {
    type : String,
    default : "wn-list-adaptview-expose-hidden"
  },
  "routers" : {
    type : Object,
    default : ()=>({
      "reload" : "dispatch:current/reload"
    })
  },
  "listConf" : {
    type : Object,
    default : undefined
  },
  "acceptUpload" : {
    type : Array,
    default : undefined
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "itemClassName" : {
    type : String,
    default : null
  },
  //-----------------------------------
  // Callback
  //-----------------------------------
  "beforeUpload" : {
    type: Function,
    default: undefined
  }
}