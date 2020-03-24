export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  provide : function(){
    return {
      "$menu" : this
    }
  },
  ///////////////////////////////////////////
  props : {
    "data" :{
      type : Array,
      default : ()=>[]
    },
    "align" : {
      type : String,
      default : "center",
      validator : function(val) {
        return ["left","right","center"].indexOf(val)!=-1
      }
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //---------------------------------------
    ConClass() {
      if(this.align) {
        return `align-${this.align}`
      }
    },
    //---------------------------------------
    MenuItems() {
      let list = []
      _.forEach(this.data, (it, index)=>{
        this.joinMenuItem(list, it, "/item"+index)
      })
      return list
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //---------------------------------------
    joinMenuItem(list=[], {
      key, type, statusKey,
      icon, text, tip, 
      shortcut,
      enableBy, disableBy, 
      altDisplay,
      action, 
      items,
      wait
    }, dftKey){
      let it = {
        key  : key  || dftKey,   // Action item must contains a key
        statusKey : statusKey || key || dftKey,
        type : type || "action", // default as normal action
        shortcut,
        icon, text, tip,
        enableBy, disableBy, 
        action, wait
      }
      // mark altDisplay
      if(_.isPlainObject(altDisplay)) {
        it.altDisplay = {...altDisplay}
      }
      // set sub comType by type
      let itType = _.lowerCase(it.type)
      it.comType = `menu-item-${itType}`
      // If group, recur
      if(_.isArray(items) && items.length > 0) {
        it.items = []
        _.forEach(items, (subIt, index)=>{
          this.joinMenuItem(it.items, subIt, it.key+"/item"+index)
        })
      }
      // Join the normalized item
      list.push(it)
    }
    //---------------------------------------
  }
  ///////////////////////////////////////////
}