export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "status"       : "collapse",
    "loading"      : false,
    "listData"     : [],
    "listLoaded"   : false,
    "listFocusIndex" : -1,
    "runtimeValue" : undefined, 
    "runtimeItem"  : null,
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
    theValue() {
      return this.value
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
        value   : this.runtimeValue,
        mapping : this.mapping,
        multi   : false,
        defaultIcon : this.itemIcon,
        defaultTipKey : this.defaultTipKey
      })
      //console.log("computed:theListData", list)
      return list
    },
    //------------------------------------------------
    theListValue() {
      return this.runtimeValue
    },
    //------------------------------------------------
    theBoxPrefixIcon() {
      return _.get(this.runtimeItem, "icon")
            || this.itemIcon
    },
    //------------------------------------------------
    theInputValue() {
      //console.log("!!<eval>:theBoxValue")
      //........................................
      // Inputing just return
      if(this.isExtended && !Ti.Util.isNil(this.inputing)) {
        return this.inputing
      }
      //........................................
      // Show value
      if(this.boxRawValue) {
        return this.runtimeValue
      }
      //........................................
      // Show Text
      return Ti.Util.fallback(
        _.get(this.runtimeItem, "text"),
        this.theValue
      )
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async onInputing(val) {
      //console.log(">> onInputing", val)
      //await this.setRuntimeBy(val ? [val] : [])
      this.inputing = val
      this.listFocusIndex = -1
      if(this.queryWhenInput) {
        await this.debounceReloadListData({val, force:true}, ()=>{
          this.doExtend()
        })
      }
    },
    //------------------------------------------------
    async onInputKeyPress({uniqueKey}={}) {
      //console.log(uniqueKey)
      //..................................
      let fnSet = {
        "ESCAPE" : ()=>{
          this.doCollapse()
        },
        "ENTER"  : async ()=>{
          await this.doEnter(this.inputing)
          this.doCollapse()
        }
      }
      //..................................
      //console.log("onInputKeyPress", uniqueKey)
      
      //................................
      // Get Selected Item Index
      let currentIndex = -1
      // Reuse before
      if(this.listFocusIndex>=0) {
        currentIndex = this.listFocusIndex
      }
      // Find in list
      else {
        for(let li of this.theListData) {
          if(li.selected) {
            currentIndex = li.index
            break
          }
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
          this.listFocusIndex = Ti.Num.scrollIndex(currentIndex - 1, len)
          let it = _.get(this.theListData, this.listFocusIndex)
          this.setRuntime(it)
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
          this.listFocusIndex = Ti.Num.scrollIndex(currentIndex + 1, len)
          let it = _.get(this.theListData, this.listFocusIndex)
          this.setRuntime(it)
        }
      }
      //..................................
      // Invoke mapping key processing
      await Ti.Util.invoke(fnSet, uniqueKey)
      //..................................
    },
    //------------------------------------------------
    async onInputChanged(val) {
      await this.doEnter(val)
    },
    //-----------------------------------------------
    async onListChanged(val) {
      //console.log("onListChanged", val)
      this.$emit("changed", val)
      this.inputing = null
      this.doCollapse()
    },
    //------------------------------------------------
    async onInputFocused() {
      if(this.autoFocusExtended) {
        await this.reloadListData({
          force : !this.cached,
          val   : undefined
        })
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
        await this.reloadListData({
          force : !this.cached,
          val   : undefined
        })
        this.doExtend()
      }
    },
    //-----------------------------------------------
    async doEnter(str="") {
      // User Focus One Item By Key Board
      if(this.listFocusIndex >= 0) {
        let li = _.nth(this.theListData, this.listFocusIndex)
        if(li) {
          this.$emit("changed", li.value)
        }
      }
      // Then it must from input value
      else if(!Ti.Util.isBlank(str)) {
        let val = await this.checkItemValue(str)
        if(_.isUndefined(val)) {
          this.$emit("changed", null)
        } else {
          this.$emit("changed", val)
        }
      }
      // Then Clearn the value
      else {
        this.$emit("changed", null)
      }
    },
    //-----------------------------------------------
    async doExtend() {
      this.status = "extended"
      // Watch Keyboard
      Ti.Shortcut.addWatch(this, [{
        "shortcut" : "ESCAPE",
        "action"   : ()=>this.doCollapse()
      }])
    },
    //-----------------------------------------------
    doCollapse() {
      this.status = "collapse"
      this.listFocusIndex = -1
      this.inputing = null
      // Unwatch
      Ti.Shortcut.removeWatch(this)
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : async function(){
      //console.log("<-> watch.value")
      await this.reloadRuntime()
    }
  },
  ////////////////////////////////////////////////////
  mounted : async function(){
    // Init the box
    // reload by static array
    await this.reloadRuntime()

    // Declare the value
    this.debounceReloadListData = _.debounce(async ({val, force}, callback)=>{
      await this.reloadListData({val, force})
      callback()
    },500)
  },
  ////////////////////////////////////////////////////
  beforeDestroy: function() {
    // Unwatch
    Ti.Shortcut.removeWatch(this)
  }
  ////////////////////////////////////////////////////
}