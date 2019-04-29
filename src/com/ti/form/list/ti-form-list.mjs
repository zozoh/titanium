export default {
  //////////////////////////////////////////
  props : {
    // The list to be rendered
    "list" : {
      type : Array,
      default : ()=>[]
    },
    // multi-selectable
    // effected when selectable is true
    "multi" : {
      type : Boolean,
      default : false
    },
    // How to mapping the list to formed value
    "mapping" : {
      type : Object,
      default : ()=>({})
    },
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    },
    // rename items, it will pass on to slot.default
    "renameable" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  computed : {
    formedList() {
      let mapping = _.defaults({...this.mapping}, {
        icon     : "icon",
        text     : "text",
        value    : "value",
        tip      : "tip",
        selected : "selected"
      })
      return Ti.Util.mapping(this.list, this.mapping)
    },
    //......................................
    hasIcon() {
      for(let it of this.formedList) {
        if(it.icon)
          return true
      }
      return false
    }
  },
  //////////////////////////////////////////
  methods : {
    itemClass(it) {
      if(it.selected) {
        return "is-selected"
      }
    }
  }
  //////////////////////////////////////////
}