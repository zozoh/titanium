export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "status"       : "collapse",
    "loading"      : false,
    "listData"     : [],
    "listLoaded"   : false,
    "listFocusIndex" : -1,
    "runtimeValue" : [],   /*[V0,V1,V2,V3...]*/
    "runtimeItems" : [],   /*[{icon,text,value,tip}...]*/
    "inputing" : null
  }),
  ////////////////////////////////////////////////////
  // props @see ./input-props.mjs
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    isDynamicOptions() {return _.isFunction(this.options)},
    hasOptions() {return !Ti.Util.isNil(this.options)},
    //------------------------------------------------
    valueInArray() {
      console.log("computed:valueInArray")
      // [] -> []
      if(_.isArray(this.value)) {
        return this.value
      }
      // Blank -> []
      if(Ti.Util.isBlank(this.value)) {
        return []
      }
      // Any -> [Any]
      return [this.value]
    },
    //------------------------------------------------
    // multi->[{..}] , single->{..}
    theValue() {
      console.log("computed:theValue")
      return this.normalizeValueByArray(this.valueInArray)
    },
    //------------------------------------------------
    theStatusIcon() {
      if(this.loading) {
        return this.loadingIcon
      }
      return this.statusIcons[this.status]
    },
    //------------------------------------------------
    theListData() {
      let list = this.normalizeData(this.listData, {
        value   : this.value,
        mapping : this.mapping,
        multi   : this.multi,
        defaultIcon : this.itemIcon
      })
      console.log("computed:theListData", list)
      return list
    },
    //------------------------------------------------
    theListValue() {
      if(this.multi) {
        return this.runtimeValue
      }
      return _.first(this.runtimeValue)
    },
    //------------------------------------------------
    theBoxPrefixIcon() {
      let it = _.first(this.runtimeItems)
      if(it) {
        return it.icon
      }
      return this.itemIcon
    },
    //------------------------------------------------
    theBoxValue() {
      console.log("!!<eval>:theBoxValue")
      //........................................
      // Inputing just return
      if(this.isExtended && !Ti.Util.isNil(this.inputing)) {
        return this.inputing
      }
      //........................................
      // Multi force to value Array
      if(this.multi) {
        if(this.boxRawValue) {
          return this.runtimeValue
        }
        return this.runtimeItems
      }      
      //........................................
      // Show value
      if(this.boxRawValue) {
        return this.runtimeValue.join("")
      }
      //........................................
      // Show Text
      let texts = []
      for(let it of this.runtimeItems) {
        texts.push(it.text)
      }
      return texts.join("")
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async onInputing(val) {
      console.log("I am inputing", val)
      //await this.setRuntimeBy(val ? [val] : [])
      this.inputing = val
      this.listFocusIndex = -1
      await this.debounceReloadListData({val, force:true})
      this.doExtend()
    },
    //------------------------------------------------
    async onInputKeyPress({uniqueKey}={}) {
      //..................................
      let fnSet = {
        "ESCAPE" : ()=>{
          this.doCollapse()
        },
        "ENTER"  : ()=>{
          this.doEnter(this.inputing)
          if(!this.multi) {
            this.doCollapse()
          }
        }
      }
      //..................................
      //console.log("onInputKeyPress", uniqueKey)
      
      //................................
      // Get All Selected Index
      let indexes = []
      for(let li of this.theListData) {
        if(li.selected) {
          indexes.push(li.index)
        }
      }
      let len = this.theListData.length
      //................................
      fnSet["ARROWUP"] = async ()=>{
        // Just Extended Drop
        if(this.isCollapse) {
          await this.doExtend()
        }
        // Select Prev
        else {
          let index = this.listFocusIndex >= 0
                ? this.listFocusIndex
                : (_.first(indexes) || 0)
          this.listFocusIndex = Ti.Num.scrollIndex(index-1, len)
        }
      }
      //................................
      fnSet["ARROWDOWN"] = async ()=>{
        // Just Extended Drop
        if(this.isCollapse) {
          await this.doExtend()
        }
        // Select Prev
        else {
          let index = this.listFocusIndex >= 0
                ? this.listFocusIndex
                : (_.last(indexes) || -1)
          this.listFocusIndex = Ti.Num.scrollIndex(index+1, len)
        }
      }
      //................................
      
      //..................................
      await Ti.Util.invoke(fnSet, uniqueKey)
    },
    //------------------------------------------------
    onInputChanged(val) {
      if(!_.isEqual(val, this.theBoxValue)) {
        console.log("!!!! onInputChanged::", val)
        this.doEnter(val)
      }
    },
    //-----------------------------------------------
    onListChanged(val) {
      this.$emit("changed", val)
      // Single Mode: auto collapse the drop
      if(!this.multi) {
        this.doCollapse()
      }
    },
    //------------------------------------------------
    async onInputFocused() {
      if(this.autoFocusExtended) {
        await this.reloadListData()
        this.doExtend()
      }
    },
    //------------------------------------------------
    onInputBlurred() {
      this.inputing = null
    },
    //------------------------------------------------
    async onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        await this.reloadListData()
        this.doExtend()
      }
    },
    //-----------------------------------------------
    doAddValue(val) {
      if(this.multi) {
        let theValue = _.concat(this.runtimeValue, val)
        this.$emit("changed", theValue)
      }
      // Single Mode, replace
      else {
        this.$emit("changed", val)
      }
    },
    //-----------------------------------------------
    doRemoveValue(val) {
      if(this.multi) {
        let theValue = _.without(this.runtimeValue, val)
        this.$emit("changed", theValue)
      }
      // Single Mode, replace
      else {
        this.$emit("changed", null)
      }
    },
    //-----------------------------------------------
    doEnter(str="") {
      // User Focus One Item By Key Board
      if(this.listFocusIndex >= 0) {
        let li = _.nth(this.theListData, this.listFocusIndex)
        if(li) {
          if(li.selected) {
            this.doRemoveValue(li.value)
          } else {
            this.doAddValue(li.value)
          }
        }
      }
      // Then it must from input value
      else if(!Ti.Util.isBlank(str)) {
        // Try to found the item in loaded listData
        let li = this.findItemInList(this.inputing,{
          matchText : this.matchText
        })
        // If found, apply the value
        if(li) {
          this.doAddValue(li.value)
        }
        // Free value
        else if(!this.mustInList) {
          this.doAddValue(this.inputing)
        }
      }
      // Then Clearn the value
      else if("" === str){
        this.doAddValue(null)
      }
    },
    //-----------------------------------------------
    async doExtend({force=false, val}={}) {
      //await this.reloadRuntime()
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse() {
      this.status = "collapse"
      this.listFocusIndex = -1
      this.inputing = null
      // _.assign(this.runtime, {
      //   value : [],
      //   items : []
      // })
      // this.inputing = ""
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : async function(){
      console.log("<-> watch.value")
      await this.reloadRuntime()
    }
  },
  ////////////////////////////////////////////////////
  mounted : async function(){
    // Init the box
    // reload by static array
    await this.reloadRuntime()

    // Declare the value
    this.debounceReloadListData = _.debounce(async (val)=>{
      await this.reloadListData(val)
    }, 500)
  }
  ////////////////////////////////////////////////////
}