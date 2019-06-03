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
    it.items = []
    _.forEach(items, (subIt, index)=>{
      joinActionItem(it.items, subIt, it.key+"/item"+index)
    })
  }
  // Join the normalized item
  list.push(it)
}
//--------------------------------------------
export default {
  ///////////////////////////////////////
  props : {
    invokeAction : {
      type : Function,
      default : null
    },
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
    topUlClassName() {
      return "ti-ul-align-"+this.align
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