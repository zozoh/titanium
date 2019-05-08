export default {
  data : ()=>({
    lastIndex  : 0,
    focusIndex : -1
  }),
  //////////////////////////////////////////
  props : {
    "empty" :{
      type : Object,
      default : null
    },
    "value" : null,
    // The list to be rendered
    "data" : {
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
    "defaultIcon" : {
      type : String,
      default : null
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
      return this.normalizeData(this.data, {
        multi   : this.multi,
        value   : this.value,
        mapping : this.mapping,
        emptyItem   : this.empty,
        defaultIcon : this.defaultIcon,
        iteratee : (it, index)=>{
          it.focused = (index == this.focusIndex)
        }
      })
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
      return {
        "is-selected" : it.selected,
        "is-focused"  : it.focused
      }
    },
    //......................................
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
    },
    //......................................
    onMouseDown(index, eo) {
      this.focusIndex = index
    }
  },
  //////////////////////////////////////////
  updated : function(){
    this.lastIndex = 0
  },
  //////////////////////////////////////////
  mounted : function() {
    let vm = this
    this.__on_mouseup = function(index){
      vm.focusIndex = -1
    }
    Ti.Dom.watchDocument("mouseup", this.__on_mouseup)
  },
  beforeDestroy : function(){
    Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
}