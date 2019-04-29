export default {
  data : ()=>({
    lastIndex : 0
  }),
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
    },
    onClick(index, eo) {
      // Multi mode
      if(this.multi) {
        let vals = []
        // Shift mode
        if(eo.shiftKey) {
          let minIndex = Math.min(index, this.lastIndex)
          let maxIndex = Math.max(index, this.lastIndex)
          _.forEach(this.formedList, (it, i)=>{
            if(i>=minIndex && i<=maxIndex) {
              vals.push(it.value)
            }
          })
        }
        // Toggle mode
        else {
          _.forEach(this.formedList, (it, i)=>{
            // The item which to be click, toggle
            if(index == i) {
              if(!it.selected) {
                vals.push(it.value)
              }
            }
            // Others
            else if(it.selected) {
              vals.push(it.value)
            }
          })
        }
        // Emit the value
        this.$emit("changed", vals)
      }
      // Single mode
      else {
        let it = this.formedList[index]
        this.$emit("changed", it.value)
      }
      // remember the last
      this.lastIndex = index
    }
  },
  //////////////////////////////////////////
  updated : function(){
    this.lastIndex = 0
  }
}