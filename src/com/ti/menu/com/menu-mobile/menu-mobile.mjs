function joinActionItem(list=[], {
  key, type, statusKey,
  icon, text, tip, 
  shortcut,
  enableBy, disableBy, 
  altDisplay,
  action, 
  items
}, dftKey){
  // Ignore the line
  if('line' == type)
    return
  let it = {
    key  : key  || dftKey,   // Action item must contains a key
    statusKey : statusKey || key || dftKey,
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
  else {
    list.push(it)
  }
}
//--------------------------------------------
export default {
  ///////////////////////////////////////
  data : ()=>({
    isOpened : false
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
    },
    cols : {
      type : Number,
      default : 4
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
    liStyle() {
      return {
        "width" : Ti.S.toPercent(Math.floor(1000/this.cols)/1000)
      }
    },
    items() {
      let list = []
      _.forEach(this.data, (it, index)=>{
        joinActionItem(list, it, "/item"+index)
      })
      return list
    },
    placeholders() {
      let n = this.cols - this.items.length % this.cols
      let list = []
      for(let i=0; i<n; i++) {
        list.push({})
      }
      return list
    }
  }
  ///////////////////////////////////////
}