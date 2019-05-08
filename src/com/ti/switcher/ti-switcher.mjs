export default {
  data : ()=>({
    "loading" : false,
    "items" : [],
    "lastIndex"  : 0,
    "focusIndex" : -1
  }),
  /////////////////////////////////////////
  props : {
    "value" : null,
    "multi" : false,
    "options" : {
      type : [Array, Function],
      default : ()=>[]
    },
    "mapping" : {
      type : Object,
      default : ()=>({})
    },
    "defaultIcon" : {
      type : String,
      default : null
    },
    "cached" : {
      type : Boolean,
      default : true
    },
    "nullAs" : {
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    isLoaded() {
      return !_.isEmpty(this.items)
    },
    //......................................
    formedList() {
      return this.normalizeData(this.items, {
        multi   : this.multi,
        value   : this.value,
        mapping : this.mapping,
        defaultIcon : this.defaultIcon,
        iteratee : (it, index)=>{
          it.focused = (index == this.focusIndex)
        }
      })
    }
  },
  //////////////////////////////////////////
  methods : {
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
        // if can be null, click selected item will cancel it
        if(it.selected && !_.isUndefined(this.nullAs)) {
          this.$emit("changed", this.nullAs)
        }
        // Always keep selected
        else if(!it.selected) {
          this.$emit("changed", it.value)
        }
      }
      // remember the last
      this.lastIndex = index
    },
    //......................................
    itemClass(it) {
      return {
        "is-selected" : it.selected,
        "is-focused"  : it.focused
      }
    },
    //......................................
    async reload() {
      this.loading = true
      this.items = await this.doReload(this.options)
      this.loading = false
    },
    //......................................
    onMouseDown(index, eo) {
      this.focusIndex = index
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.tryReload({
      loaded : this.isLoaded,
      cached : this.cached
    })
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