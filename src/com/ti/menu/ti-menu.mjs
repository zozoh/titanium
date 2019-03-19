function normalizeActionItem({
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
  it.comType = "mi-" + _.kebabCase(it.type)
  // If group, recur
  if(_.isArray(items) && items.length > 0) {
    let list = []
    _.forEach(items, (subIt, index)=>{
      let newSubIt = normalizeActionItem(subIt, it.key+"/item"+index)
      list.push(newSubIt)
    })
    it.items = list
  }
  // Return the normalized item
  return it
}
//--------------------------------------------
export default {
  props : {
    data :{
      type : Array,
      default : ()=>[]
    },
    align : {
      type : String,
      default : "left",
      validator : function(val) {
        return ["left","right","center"].indexOf(val)!=-1
      }
    },
    status : {
      type : Object,
      default : ()=>({})
    }
  },
  computed : {
    topUlClassName() {
      return "ti-ul-align-"+this.align
    },
    showList() {
      let list = []
      _.forEach(this.data, (it, index)=>{
        let newIt = normalizeActionItem(it, "/item"+index)
        list.push(newIt)
      })
      return list
    }
  }
}