async function tryReloadList(vm){
  if(!vm.isLoaded) {
    await vm.reloadList()
    vm.setValue(vm.value)
  }
}
//-----------------------------------------
export default {
  data : ()=>({
    showDropdown : false,
    _the_list : []
  }),
  /////////////////////////////////////////
  props : {
    "selects" : {
      type : Array,
      default : ()=>[]
    },
    "empty" :{
      type : Object,
      default : ()=>({
        text  : "i18n:no-selected",
        value : undefined
      })
    },
    "value" : null,
    "multi" : false,
    "list" : {
      type : Array,
      default : ()=>[]
    },
    "reload" : {
      type : Function,
      default : (val)=>[]
    },
    "mapping" : {
      type : Object,
      default : ()=>({
        icon  : "icon",
        text  : "text",
        value : "value",
        tip   : "tip"
      })
    },
    "cached" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  watch : {
    "showDropdown" : function(newVal, oldVal) {
      if(true === newVal) {
        tryReloadList(this)
      }
    }
  },
  //////////////////////////////////////////
  computed : {
    isLoaded() {
      return !_.isEmpty(this._the_list)
    },
    //......................................
    hasValue() {
      return this.selects.length > 0
    },
    //......................................
    droplist() {
      let reList = []
      console.log("droplist")
      if(!_.isEmpty(this._the_list)) {
        for(let it of this._the_list) {
          let re = Ti.Util.mapping(it, this.mapping)
          re.highlight = this.multi
                ? _.indexOf(this.value, re.value) >= 0
                : _.isEqual(this.value, re.value)
          reList.push(re)
        }
      }
      return reList
    },
    //......................................
    // For Single mode
    selectedItem() {
      if(this.hasValue){
        return _.get(this.selects, 0)
      }
      return this.empty
    },
    //......................................
    // For Multi mode
    selectedItems() {
      return this.selects
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
    toggleShowDrop() {
      this.showDropdown = !this.showDropdown
    },
    //......................................
    async reloadList() {
      this._the_list = await this.reload(this.value)
    },
    //......................................
    setValue(val) {
      this.value = val
      let selects = []
      // looking for text/icon/tip
      if(this.multi) {
        let vals = []
        for(let it of this._the_list) {
          if(_.indexOf(this.value, it.value)>=0) {
            vals.push(it.value)
            selects.push(it)
          }
        }
        this.value = vals
      }
      // Single value
      else {
        for(let it of this._the_list) {
          if(_.isEqual(it.value, this.value)) {
            selects.push(it)
            this.value = it.value
            break;
          }
        }
      }
      // Update selects
      this.selects = selects
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    this._the_list = [...this.list]
    console.log(this._the_list)
    await tryReloadList(this)
  }
}