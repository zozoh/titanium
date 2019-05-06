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
    "data" : {
      type : [Array, Function],
      default : ()=>[]
    },
    "mapping" : {
      type : Object,
      default : ()=>({})
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
      let reList = []
      //console.log("droplist")
      if(!_.isEmpty(this.items)) {
        let mapping = _.defaults({...this.mapping}, {
          icon     : "icon",
          text     : "text",
          value    : "value",
          tip      : "tip",
          selected : "selected"
        })
        for(let i=0 ; i<this.items.length; i++) {
          let it = this.items[i]
          let re = Ti.Util.mapping(it, mapping)
          // Default Icon
          if(!re.icon)
            re.icon = this.defaultIcon
          // Uniq tip
          if(re.tip == re.text) {
            delete re.tip
          }
          // Mark highlight
          re.selected = this.multi
                ? _.indexOf(this.value, re.value) >= 0
                : _.isEqual(this.value, re.value)
          // Focused
          re.focused = (i == this.focusIndex)
          // Join to list
          reList.push(re)
        }
      }
      return reList
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
    async tryReload(){
      if(!this.isLoaded || !this.cached) {
        await this.reload()
      }
    },
    //......................................
    async reload() {
      // Dynamic value
      if(_.isFunction(this.data)) {
        this.loading = true
        this.items = await this.data(this.value)
        if(!_.isArray(this.items)){
          this.items = []
        }
        this.loading = false
      }
      // Static value
      else if(_.isArray(this.data)){
        this.items = [].concat(this.data)
      }
    },
    //......................................
    onMouseDown(index, eo) {
      this.focusIndex = index
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.tryReload()
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