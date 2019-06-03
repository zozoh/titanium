function joinActionItem(list=[], {
  key, type, 
  icon, text, tip, 
  shortcut,
  enableBy, disableBy, 
  altDisplay,
  action, 
  items
}, dftKey){
  let it = {
    key  : key  || dftKey,   // Action item must contains a key
    type : type || "action", // default as normal action
    shortcut,
    icon, text, tip,
    enableBy, disableBy, 
    action
  }
  // mark altDisplay
  if(_.isPlainObject(altDisplay)) {
    it.altDisplay = {...altDisplay}
  }
  // set sub comType by type
  it.comType = "md-" + _.kebabCase(it.type)
  // If group, recur
  if(_.isArray(items) && items.length > 0) {
    _.forEach(items, (subIt, index)=>{
      joinActionItem(list, subIt, it.key+"/item"+index)
    })
  }
  // Join the normalized item
  list.push(it)
}
//--------------------------------------------
export default {
  ///////////////////////////////////////
  data : ()=>({
    isOpened : true
  }),
  ///////////////////////////////////////
  props : {
    data :{
      type : Array,
      default : ()=>[]
    },
    align : {
      type : String,
      default : "left"
    },
    status : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////
  computed : {
    topClassName() {
      let klass = ["align-is-"+this.align]
      if(this.isOpened) {
        klass.push("is-opened")
      }
      return klass.join(" ")
    },
    items() {
      let list = []
      _.forEach(this.data, (it, index)=>{
        joinActionItem(list, it, "/item"+index)
      })
      return list
    }
  }
  ///////////////////////////////////////
}