export default {
  data : ()=>({
    "showDropdown" : true,
    "items" : []
  }),
  /////////////////////////////////////////
  props : {
    "empty" :{
      type : Object,
      default : ()=>({
        text  : "i18n:no-selected",
        value : undefined
      })
    },
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
    "defaultIcon" : null,
    "cached" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  watch : {
    "showDropdown" : function(newVal, oldVal) {
      // If show, make sure items loaded
      if(true === newVal) {
        this.tryReload()
      }
      // If hide, erase the un-cached data
      else {
        if(!this.cached) {
          this.items = []
        }
      }
    }
  },
  //////////////////////////////////////////
  computed : {
    isLoaded() {
      return !_.isEmpty(this.items)
    },
    //......................................
    droplist() {
      let reList = []
      console.log("droplist")
      if(!_.isEmpty(this.items)) {
        let mapping = _.defaults({...this.mapping}, {
          icon     : "icon",
          text     : "text",
          value    : "value",
          tip      : "tip",
          selected : "selected"
        })
        for(let it of this.items) {
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
          // Join to list
          reList.push(re)
        }
      }
      console.log(reList)
      return reList
    },
    //......................................
    hasSelecteds() {
      return this.selectedItems.length > 0
    },
    //......................................
    // For Single mode
    theItem() {
      if(this.hasSelecteds){
        return _.get(this.selectedItems, 0)
      }
      return this.empty
    },
    //......................................
    // For Multi mode
    selectedItems() {
      let selects = []
      for(let it of this.droplist) {
        if(this.isSelectedItem(it)) {
          selects.push(it)
          if(!this.multi)
            break
        }
      }
      return selects
    }
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    onChanged() {
      let val = this.$refs.input.value
      if(this.trimed) {
        val = _.trim(val)
      }
      this.$emit("changed", val)
    },
    //......................................
    isSelectedItem(it={}) {
      if(this.multi) {
        return _.indexOf(this.value, it.value)
      }
      return _.isEqual(this.value, it.value)
    },
    //......................................
    toggleShowDrop() {
      this.showDropdown = !this.showDropdown
    },
    //......................................
    async tryReload(){
      if(!this.isLoaded) {
        await this.reload()
      }
    },
    //......................................
    async reload() {
      // Dynamic value
      if(_.isFunction(this.data)) {
        this.items = await this.data(this.value)
      }
      // Static value
      else if(_.isArray(this.data)){
        this.items = [].concat(this.data)
      }
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.tryReload()
  }
}