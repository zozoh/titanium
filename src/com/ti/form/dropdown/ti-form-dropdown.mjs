export default {
  data : ()=>({
    "loading" : false,
    "showDropdown" : false,
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
    "options" : {
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
        this.tryReload().then(()=>{
          let $box   = this.$refs.box
          let $drop  = this.$refs.drop
          let r_box  = Ti.Rects.createBy($box)
          Ti.Dom.setStyle($drop, {width:r_box.width})
          Ti.Dom.dockTo($drop, $box, {space:{y:1}})
        })
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
      if(!this.multi) {
        reList.push(this.empty)
      }
      //console.log("droplist")
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
      //console.log(reList)
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
    onChanged(payload) {
      this.$emit("changed", payload)
      if(!this.multi) {
        this.showDropdown = false
      }
    },
    //......................................
    onRemoveItem(rmIt) {
      let payload = []
      for(let it of this.selectedItems){
        if(!_.isEqual(it.value, rmIt.value)){
          payload.push(it.value)
        }
      }
      this.$emit("changed", payload)
    },
    //......................................
    isSelectedItem(it={}) {
      if(this.multi) {
        return _.indexOf(this.value, it.value) >= 0
      }
      return _.isEqual(this.value, it.value)
    },
    //......................................
    toggleShowDrop() {
      this.showDropdown = !this.showDropdown
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
      if(_.isFunction(this.options)) {
        this.loading = true
        this.items = await this.options(this.value)
        if(!_.isArray(this.items)){
          this.items = []
        }
        this.loading = false
      }
      // Static value
      else if(_.isArray(this.options)){
        this.items = [].concat(this.options)
      }
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.tryReload()
  }
}